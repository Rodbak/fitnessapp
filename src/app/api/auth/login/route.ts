import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export async function POST(req: NextRequest) {
  seedIfEmpty();
  const { phone, password } = await req.json();
  const user = db.users.find(phone);
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
  }
  const { password: _, ...safe } = user;
  return NextResponse.json({ user: safe });
}
