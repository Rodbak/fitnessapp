import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const trainers = db.trainers.getAll();
  const idx = trainers.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  trainers[idx] = { ...trainers[idx], ...body };
  db.trainers.save(trainers);
  return NextResponse.json(trainers[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.trainers.save(db.trainers.getAll().filter((t) => t.id !== id));
  return NextResponse.json({ ok: true });
}
