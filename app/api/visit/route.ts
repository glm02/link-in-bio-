export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveVisit, isBlocked, getVisits } from "@/lib/kv";
import { getGeoData, truncateIp, detectPlatform } from "@/lib/geo";
import { sendTelegramNotification, sendSpikeAlert } from "@/lib/telegram";

function parseUserAgent(ua: string) {
  const browser =
    /Edg/.test(ua) ? "Edge" :
    /OPR|Opera/.test(ua) ? "Opera" :
    /Chrome/.test(ua) ? "Chrome" :
    /Firefox/.test(ua) ? "Firefox" :
    /Safari/.test(ua) ? "Safari" : "Unknown";

  const os =
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Mac/.test(ua) ? "macOS" :
    /Linux/.test(ua) ? "Linux" : "Unknown";

  const device =
    /iPhone|Android.*Mobile|Mobile/.test(ua) ? "mobile" :
    /iPad|Tablet/.test(ua) ? "tablet" : "desktop";

  return { browser, os, device };
}

function getFingerprint(ua: string, acceptLang: string, timezone: string): string {
  const raw = `${ua}|${acceptLang}|${timezone}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export async function POST(req: NextRequest) {
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const blocked = await isBlocked(rawIp);
  if (blocked) return NextResponse.json({ blocked: true }, { status: 403 });

  const ip = truncateIp(rawIp);
  const ua = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || "";
  const acceptLang = req.headers.get("accept-language") || "";
  const existingId = req.cookies.get("vid")?.value;
  const visitorId = existingId || uuidv4();
  const isReturning = !!existingId;

  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { body = {}; }
  const { utmSource = "", utmCampaign = "", utmMedium = "", timezone = "" } = body;

  const [geo, parsed] = await Promise.all([
    getGeoData(rawIp),
    Promise.resolve(parseUserAgent(ua)),
  ]);

  const visit = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ip,
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    isp: geo.isp,
    userAgent: ua,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    referer,
    refererPlatform: detectPlatform(referer),
    utmSource,
    utmCampaign,
    utmMedium,
    visitorId,
    isReturning,
    captchaPassed: false,
    timeOnPage: 0,
    fingerprint: getFingerprint(ua, acceptLang, timezone),
    blocked: false,
  };

  await saveVisit(visit);

  const threshold = parseInt(process.env.SPIKE_THRESHOLD || "20");
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = await getVisits();
  const recentCount = recent.filter((v) => v.timestamp > tenMinAgo).length;
  if (recentCount === threshold) sendSpikeAlert(recentCount).catch(() => {});

  sendTelegramNotification(visit).catch(() => {});

  const res = NextResponse.json({ ok: true, visitorId });
  if (!isReturning) {
    res.cookies.set("vid", visitorId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
