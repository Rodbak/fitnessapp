"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import type { Member, Trainer, ProgressEntry } from "@/lib/db";
import { ChevronLeft } from "lucide-react";

export default function TrainerMembersPage() {
  const { user } = useAuth();
  const { t } = useLang();
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
      const tr = trainers.find((x) => x.userId === user.id);
      if (tr) {
        const mine = members.filter((m) => m.trainerId === tr.id);
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
      {selected ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelected(null)}
            className="press flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition-colors fade-up"
          >
            <ChevronLeft size={16} /> {t("back")}
          </button>

          <div className="bg-black text-white rounded-3xl p-5 flex items-center gap-4 shadow-xl fade-up delay-1">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-sm flex-shrink-0">
              {selected.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-lg leading-tight">{selected.name}</div>
              <div className="text-white/50 text-sm mt-0.5">{selected.phone}</div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold mt-2 inline-block ${selected.status === "active" ? "bg-white text-black" : "bg-white/15 text-white"}`}>
                {selected.status === "active" ? t("status_active") : t("status_inactive")}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-2">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-black text-sm">{t("progress_history_title")}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {memberProgress(selected.id).map((p) => (
                <div key={p.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="font-bold text-sm mb-1">{p.date}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {p.weight && <span>{t("metric_weight")}: {p.weight}lbs</span>}
                    {p.bodyFat && <span>BF: {p.bodyFat}%</span>}
                    {p.waist && <span>{t("metric_waist")}: {p.waist}&quot;</span>}
                    {p.benchPress && <span>{t("metric_bench")}: {p.benchPress}lbs</span>}
                    {p.squat && <span>{t("metric_squat")}: {p.squat}lbs</span>}
                    {p.deadlift && <span>{t("metric_deadlift")}: {p.deadlift}lbs</span>}
                  </div>
                  {p.notes && <p className="text-xs text-gray-400 mt-1 italic leading-relaxed">{p.notes}</p>}
                </div>
              ))}
              {memberProgress(selected.id).length === 0 && (
                <div className="px-5 py-10 text-center text-gray-300 text-sm">{t("no_progress")}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="fade-up">
            <h2 className="text-xl font-black">{t("my_members")}</h2>
            <p className="text-gray-500 text-sm">{myMembers.length} {t("assigned")}</p>
          </div>

          <div className="space-y-3">
            {myMembers.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-300 text-sm fade-up">
                {t("no_members_assigned_yet")}
              </div>
            ) : myMembers.map((m, i) => {
              const latest = memberProgress(m.id)[0];
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`press w-full bg-white border border-gray-100 rounded-3xl p-4 text-left hover:border-gray-300 hover:shadow-md transition-all shadow-sm fade-up delay-${Math.min(i + 1, 6)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black truncate">{m.name}</div>
                      <div className="text-sm text-gray-500">{m.phone}</div>
                      {latest && <div className="text-xs text-gray-400 mt-0.5">Last: {latest.date}</div>}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${m.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                      {m.status === "active" ? t("status_active") : t("status_inactive")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
