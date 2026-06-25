import { NextRequest, NextResponse } from "next/server";
import { db, Subscription } from "@/lib/db";

function genId() { return Math.random().toString(36).slice(2, 10); }

const PLAN_AMOUNTS: Record<string, number> = { monthly: 50, quarterly: 130, annual: 480 };
const PLAN_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, annual: 12 };

export async function GET() {
  return NextResponse.json(db.subscriptions.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const subs = db.subscriptions.getAll();
  const start = new Date(body.startDate || new Date());
  const months = PLAN_MONTHS[body.plan] || 1;
  const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());

  const sub: Subscription = {
    id: genId(),
    memberId: body.memberId,
    plan: body.plan,
    amount: body.amount ?? PLAN_AMOUNTS[body.plan] ?? 50,
    status: body.status || "pending",
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    paidDate: body.paidDate,
    notes: body.notes,
  };
  subs.push(sub);
  db.subscriptions.save(subs);
  return NextResponse.json(sub, { status: 201 });
}
