export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { updateVisitCaptcha } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { token, visitorId } = await req.json();
  if (!token) return NextResponse.json({ success: false, error: "No token" }, { status: 400 });

  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await verifyRes.json();
  if (!data.success) return NextResponse.json({ success: false, error: "Captcha invalide" }, { status: 403 });

  if (visitorId) await updateVisitCaptcha(visitorId);
  return NextResponse.json({ success: true });
}
