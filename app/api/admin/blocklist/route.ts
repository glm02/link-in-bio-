export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getBlocklist, addToBlocklist, removeFromBlocklist } from "@/lib/kv";

function isAuthed(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getBlocklist());
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ip } = await req.json();
  await addToBlocklist(ip);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ip } = await req.json();
  await removeFromBlocklist(ip);
  return NextResponse.json({ ok: true });
}
