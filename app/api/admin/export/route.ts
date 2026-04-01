import { NextRequest, NextResponse } from "next/server";
import { getVisits } from "@/lib/kv";

function isAuthed(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visits = await getVisits();
  const headers = ["timestamp","ip","country","city","isp","browser","os","device","refererPlatform","utmSource","utmCampaign","visitorId","isReturning","captchaPassed","timeOnPage","fingerprint"];
  const rows = visits.map((v) =>
    headers.map((h) => JSON.stringify((v as Record<string,unknown>)[h] ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visits-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
