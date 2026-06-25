import { NextRequest, NextResponse } from "next/server";
import { db, Member } from "@/lib/db";

function genId() { return Math.random().toString(36).slice(2, 10); }

export async function GET() {
  return NextResponse.json(db.members.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const members = db.members.getAll();
  const newMember: Member = {
    id: genId(),
    userId: genId(),
    name: body.name,
    phone: body.phone,
    email: body.email,
    status: body.status || "active",
    joinDate: new Date().toISOString().split("T")[0],
    trainerId: body.trainerId,
    emergencyContact: body.emergencyContact,
  };
  members.push(newMember);
  db.members.save(members);

  // Create user account for member
  const users = db.users.getAll();
  users.push({ id: newMember.userId, phone: body.phone, password: body.password || "member123", name: body.name, role: "member", createdAt: newMember.joinDate });
  db.users.save(users);

  return NextResponse.json(newMember, { status: 201 });
}
