"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Member, Trainer, ProgressEntry } from "@/lib/db";

export default function TrainerMembersPage() {
  const { user } = useAuth();
  const [myMembers, setMyMembers] = useState<Member[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/trainers").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.json()),
    ]).then(([trainers, members, prog]: [Trainer[], Member[], ProgressEntry[]]) => {
      const t = trainers.find((tr) => tr.userId === user.id);
      if (t) {
        const mine = members.filter((m) => m.trainerId === t.id);
        setMyMembers(mine);
        const mineIds = new Set(mine.map((m) => m.id));
        setProgress(prog.filter((p) => mineIds.has(p.memberId)));
      }
    });
  }, [user]);

  function memberProgress(memberId: string) {
    return progress.filter((p) => p.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black">My Members</h2>

      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-black flex items-center gap-1">← Back</button>

          <div className="bg-black text-white rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black font-black text-xl">{selected.name.charAt(0)}</div>
            <div>
              <div className="font-bold text-lg">{selected.name}</div>
              <div className="text-white/60 text-sm">{selected.phone}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${selected.status === "active" ? "bg-white text-black" : "bg-white/20 text-white"}`}>{selected.status}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-sm">Progress History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {memberProgress(selected.id).map((p) => (
                <div key={p.id} className="px-5 py-3">
                  <div className="font-medium text-sm mb-1">{p.date}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {p.weight && <span>Weight: {p.weight}lbs</span>}
                    {p.bodyFat && <span>BF: {p.bodyFat}%</span>}
                    {p.waist && <span>Waist: {p.waist}"</span>}
                    {p.benchPress && <span>Bench: {p.benchPress}lbs</span>}
                    {p.squat && <span>Squat: {p.squat}lbs</span>}
                    {p.deadlift && <span>DL: {p.deadlift}lbs</span>}
                  </div>
                  {p.notes && <p className="text-xs text-gray-400 mt-1 italic">{p.notes}</p>}
                </div>
              ))}
              {memberProgress(selected.id).length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">No progress logged yet</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {myMembers.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl p-10 text-center text-gray-400 text-sm">No members assigned to you yet</div>
          ) : myMembers.map((m) => {
            const latest = memberProgress(m.id)[0];
            return (
              <button key={m.id} onClick={() => setSelected(m)} className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-black transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{m.name}</div>
                    <div className="text-sm text-gray-500">{m.phone}</div>
                    {latest && <div className="text-xs text-gray-400 mt-0.5">Last check-in: {latest.date}</div>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium flex-shrink-0 ${m.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>{m.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
