import { NextRequest, NextResponse } from "next/server";
import { db, Trainer } from "@/lib/db";

function genId() { return Math.random().toString(36).slice(2, 10); }

export async function GET() {
  return NextResponse.json(db.trainers.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const trainers = db.trainers.getAll();
  const userId = genId();
  const trainer: Trainer = {
    id: genId(),
    userId,
    name: body.name,
    phone: body.phone,
    email: body.email,
    specialization: body.specialization,
    status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    memberCount: 0,
  };
  trainers.push(trainer);
  db.trainers.save(trainers);

  const users = db.users.getAll();
  users.push({ id: userId, phone: body.phone, password: body.password || "trainer123", name: body.name, role: "trainer", createdAt: trainer.joinDate });
  db.users.save(users);

  return NextResponse.json(trainer, { status: 201 });
}
