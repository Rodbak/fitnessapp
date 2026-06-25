import { NextRequest, NextResponse } from "next/server";
import { db, ProgressEntry } from "@/lib/db";

function genId() { return Math.random().toString(36).slice(2, 10); }

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("memberId");
  const all = db.progress.getAll();
  return NextResponse.json(memberId ? all.filter((p) => p.memberId === memberId) : all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entries = db.progress.getAll();
  const entry: ProgressEntry = {
    id: genId(),
    memberId: body.memberId,
    date: body.date || new Date().toISOString().split("T")[0],
    weight: body.weight,
    bodyFat: body.bodyFat,
    chest: body.chest,
    waist: body.waist,
    hips: body.hips,
    biceps: body.biceps,
    benchPress: body.benchPress,
    squat: body.squat,
    deadlift: body.deadlift,
    notes: body.notes,
  };
  entries.push(entry);
  db.progress.save(entries);
  return NextResponse.json(entry, { status: 201 });
}
