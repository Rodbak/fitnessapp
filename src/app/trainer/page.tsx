"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import type { Member, Trainer, ProgressEntry } from "@/lib/db";
import Link from "next/link";
import { Users, Activity } from "lucide-react";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
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
      const tr = trainers.find((x) => x.userId === user.id);
      setTrainer(tr || null);
      if (tr) {
        const mine = members.filter((m) => m.trainerId === tr.id);
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
    <div className="space-y-4">
      {/* Greeting */}
      <div className="bg-black text-white rounded-3xl p-5 shadow-xl fade-up">
        <p className="text-white/50 text-sm">{t("welcome_back")}</p>
        <h1 className="text-2xl font-black mt-1">{user?.name.split(" ")[0]} 👋</h1>
        {trainer && <p className="text-white/40 text-sm mt-1.5">{trainer.specialization}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 fade-up delay-1">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center mb-3">
            <Users size={16} className="text-white" />
          </div>
          <div className="text-3xl font-black">{myMembers.length}</div>
          <div className="text-xs text-gray-500 mt-1 font-semibold">{t("my_members")}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center mb-3">
            <Activity size={16} className="text-white" />
          </div>
          <div className="text-3xl font-black">{myMembers.filter((m) => m.status === "active").length}</div>
          <div className="text-xs text-gray-500 mt-1 font-semibold">{t("active_count")}</div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-2">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-sm">{t("my_members")}</h3>
          <Link href="/trainer/members" className="press text-xs text-gray-400 hover:text-black transition-colors font-medium">{t("view_all")}</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {myMembers.slice(0, 4).map((m) => (
            <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.phone}</div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${m.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                {m.status === "active" ? t("status_active") : t("status_inactive")}
              </span>
            </div>
          ))}
          {myMembers.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-300 text-sm">{t("no_members_assigned")}</div>
          )}
        </div>
      </div>

      {/* Recent check-ins */}
      {recentProgress.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-3">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-sm">{t("recent_checkins")}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProgress.map((p) => (
              <div key={p.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{p.memberName}</span>
                  <span className="text-xs text-gray-400">{p.date}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {p.weight && <span>{t("metric_weight")}: {p.weight}lbs</span>}
                  {p.benchPress && <span>{t("metric_bench")}: {p.benchPress}</span>}
                  {p.squat && <span>{t("metric_squat")}: {p.squat}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
