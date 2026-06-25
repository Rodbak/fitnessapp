"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Member, Trainer, ProgressEntry } from "@/lib/db";
import Link from "next/link";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [myMembers, setMyMembers] = useState<Member[]>([]);
  const [recentProgress, setRecentProgress] = useState<(ProgressEntry & { memberName: string })[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/trainers").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.json()),
    ]).then(([trainers, members, progress]: [Trainer[], Member[], ProgressEntry[]]) => {
      const t = trainers.find((tr) => tr.userId === user.id);
      setTrainer(t || null);
      if (t) {
        const mine = members.filter((m) => m.trainerId === t.id);
        setMyMembers(mine);
        const mineIds = new Set(mine.map((m) => m.id));
        const recentEntries = progress
          .filter((p) => mineIds.has(p.memberId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((p) => ({ ...p, memberName: members.find((m) => m.id === p.memberId)?.name || "?" }));
        setRecentProgress(recentEntries);
      }
    });
  }, [user]);

  return (
    <div className="space-y-5">
      <div className="bg-black text-white rounded-2xl p-5">
        <p className="text-white/60 text-sm">Welcome,</p>
        <h1 className="text-2xl font-black mt-1">{user?.name.split(" ")[0]}</h1>
        {trainer && <p className="text-white/50 text-sm mt-1">{trainer.specialization}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
          <div className="text-3xl font-black">{myMembers.length}</div>
          <div className="text-xs text-gray-500 mt-1">My Members</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
          <div className="text-3xl font-black">{myMembers.filter((m) => m.status === "active").length}</div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm">My Members</h3>
          <Link href="/trainer/members" className="text-xs text-gray-500 hover:text-black">View all →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {myMembers.slice(0, 4).map((m) => (
            <div key={m.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.phone}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${m.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>{m.status}</span>
            </div>
          ))}
          {myMembers.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No members assigned yet</div>}
        </div>
      </div>

      {recentProgress.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm">Recent Check-ins</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProgress.map((p) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{p.memberName}</span>
                  <span className="text-xs text-gray-400">{p.date}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {p.weight && <span>Weight: {p.weight}lbs</span>}
                  {p.benchPress && <span>Bench: {p.benchPress}</span>}
                  {p.squat && <span>Squat: {p.squat}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
