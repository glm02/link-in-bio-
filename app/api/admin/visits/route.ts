export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getVisits, clearVisits, updateTimeOnPage } from "@/lib/kv";

function isAuthed(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getVisits());
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearVisits();
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { visitorId, timeOnPage } = await req.json();
  await updateTimeOnPage(visitorId, timeOnPage);
  return NextResponse.json({ ok: true });
}
