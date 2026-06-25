import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = db.members.findById(id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const members = db.members.getAll();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  members[idx] = { ...members[idx], ...body };
  db.members.save(members);
  return NextResponse.json(members[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = db.members.getAll().filter((m) => m.id !== id);
  db.members.save(members);
  return NextResponse.json({ ok: true });
}
