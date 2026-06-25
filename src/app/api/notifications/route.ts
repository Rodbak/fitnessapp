import { NextRequest, NextResponse } from "next/server";
import { db, Notification } from "@/lib/db";

function genId() { return Math.random().toString(36).slice(2, 10); }

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const all = db.notifications.getAll();
  return NextResponse.json(userId ? all.filter((n) => n.userId === userId) : all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const notifs = db.notifications.getAll();
  const n: Notification = {
    id: genId(),
    userId: body.userId,
    title: body.title,
    message: body.message,
    type: body.type || "info",
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifs.push(n);
  db.notifications.save(notifs);
  return NextResponse.json(n, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const notifs = db.notifications.getAll();
  const updated = notifs.map((n) => (n.id === body.id ? { ...n, read: true } : n));
  db.notifications.save(updated);
  return NextResponse.json({ ok: true });
}
