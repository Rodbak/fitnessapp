"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import type { Member, Subscription, Notification, Trainer } from "@/lib/db";
import { Bell, CheckCircle } from "lucide-react";

export default function MemberHome() {
  const { user } = useAuth();
  const { t } = useLang();
  const [member, setMember] = useState<Member | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/subscriptions").then((r) => r.json()),
      fetch("/api/trainers").then((r) => r.json()),
      fetch(`/api/notifications?userId=${user.id}`).then((r) => r.json()),
    ]).then(([members, subs, trainers, notifData]: [Member[], Subscription[], Trainer[], Notification[]]) => {
      const m = members.find((mem: Member) => mem.userId === user.id) || null;
      setMember(m);
      if (m) {
        const activeSub = subs.filter((s: Subscription) => s.memberId === m.id).sort((a: Subscription, b: Subscription) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] || null;
        setSub(activeSub);
        if (m.trainerId) setTrainer(trainers.find((tr: Trainer) => tr.id === m.trainerId) || null);
      }
      setNotifs(notifData.filter((n: Notification) => !n.read));
    });
  }, [user]);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  const daysLeft = sub ? Math.max(0, Math.floor((new Date(sub.endDate).getTime() - Date.now()) / 86400000)) : null;
  const planDays = sub ? (sub.plan === "annual" ? 365 : sub.plan === "quarterly" ? 90 : 30) : 30;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="bg-black text-white rounded-3xl p-5 shadow-xl fade-up">
        <p className="text-white/50 text-sm">{t("welcome_back")}</p>
        <h1 className="text-2xl font-black mt-1">{user?.name.split(" ")[0]} 👋</h1>
        {member && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${member.status === "active" ? "bg-white text-black" : "bg-white/15 text-white"}`}>
              {member.status === "active" ? t("status_active") : member.status === "inactive" ? t("status_inactive") : t("status_suspended")}
            </span>
            <span className="text-white/30 text-xs">{t("since")} {member.joinDate}</span>
          </div>
        )}
      </div>

      {/* Subscription */}
      {sub && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-1">
          <div className="bg-gray-50 px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm text-gray-500 uppercase tracking-wider">{t("subscription")}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${sub.status === "active" ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                {sub.status === "active" ? t("status_active") : sub.status === "expired" ? t("status_expired") : t("status_pending")}
              </span>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <div className="text-4xl font-black capitalize tracking-tight">{sub.plan}</div>
              <div className="text-2xl font-black text-gray-300 mb-0.5">${sub.amount}</div>
            </div>
          </div>
          {daysLeft !== null && (
            <div className="px-5 py-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className="font-black text-black">{daysLeft} {t("days_left")}</span>
                <span className="font-medium">{sub.endDate}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${daysLeft <= 7 ? "bg-red-400" : daysLeft <= 14 ? "bg-yellow-400" : "bg-black"}`}
                  style={{ width: `${Math.min(100, (daysLeft / planDays) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trainer */}
      {trainer && (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm fade-up delay-2">
          <h3 className="font-black text-sm mb-4">{t("your_trainer")}</h3>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0">
              {trainer.name.charAt(0)}
            </div>
            <div>
              <div className="font-black">{trainer.name}</div>
              <div className="text-sm text-gray-500">{trainer.specialization}</div>
              <div className="text-sm text-gray-400">{trainer.phone}</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifs.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-3">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={15} />
            <h3 className="font-black text-sm">{t("notifications")}</h3>
            <span className="ml-auto text-xs bg-black text-white rounded-full w-5 h-5 flex items-center justify-center font-black">{notifs.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {notifs.map((n) => (
              <div key={n.id} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-black" : n.type === "warning" ? "bg-gray-400" : "bg-gray-200"}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</div>
                </div>
                <button onClick={() => markRead(n.id)} className="press text-gray-200 hover:text-black transition-colors flex-shrink-0">
                  <CheckCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!member && (
        <div className="bg-gray-100 rounded-3xl p-10 text-center text-gray-300 text-sm fade-up">
          {t("profile_not_linked")}
        </div>
      )}
    </div>
  );
}
