import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

function isAuthed(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = req.nextUrl.searchParams.get("url") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
  return NextResponse.json({ dataUrl });
}
