"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Member, Subscription, Notification, Trainer } from "@/lib/db";
import { Bell, CheckCircle } from "lucide-react";

export default function MemberHome() {
  const { user } = useAuth();
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
        if (m.trainerId) setTrainer(trainers.find((t: Trainer) => t.id === m.trainerId) || null);
      }
      setNotifs(notifData.filter((n: Notification) => !n.read));
    });
  }, [user]);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  const daysLeft = sub ? Math.max(0, Math.floor((new Date(sub.endDate).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="bg-black text-white rounded-2xl p-5">
        <p className="text-white/60 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-black mt-1">{user?.name.split(" ")[0]} 👋</h1>
        {member && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.status === "active" ? "bg-white text-black" : "bg-white/20 text-white"}`}>
              {member.status}
            </span>
            <span className="text-white/40 text-xs">Member since {member.joinDate}</span>
          </div>
        )}
      </div>

      {/* Subscription */}
      {sub && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Subscription</h3>
            <span className={`text-xs px-2 py-1 rounded font-medium ${sub.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>{sub.status}</span>
          </div>
          <div className="text-3xl font-black capitalize">{sub.plan}</div>
          <div className="text-gray-500 text-sm mt-1">${sub.amount} · Expires {sub.endDate}</div>
          {daysLeft !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{daysLeft} days left</span>
                <span>{sub.endDate}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full transition-all" style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trainer */}
      {trainer && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Your Trainer</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
              {trainer.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold">{trainer.name}</div>
              <div className="text-sm text-gray-500">{trainer.specialization}</div>
              <div className="text-sm text-gray-400">{trainer.phone}</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={16} />
            <h3 className="font-bold text-sm">Notifications</h3>
            <span className="ml-auto text-xs bg-black text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">{notifs.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {notifs.map((n) => (
              <div key={n.id} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-black" : n.type === "warning" ? "bg-gray-400" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                </div>
                <button onClick={() => markRead(n.id)} className="text-gray-300 hover:text-black transition-colors flex-shrink-0">
                  <CheckCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!member && (
        <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
          Profile not linked. Contact your gym administrator.
        </div>
      )}
    </div>
  );
}
