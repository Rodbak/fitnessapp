import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const subs = db.subscriptions.getAll();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  subs[idx] = { ...subs[idx], ...body };
  db.subscriptions.save(subs);
  return NextResponse.json(subs[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.subscriptions.save(db.subscriptions.getAll().filter((s) => s.id !== id));
  return NextResponse.json({ ok: true });
}
