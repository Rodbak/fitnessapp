"use client";
import { useEffect, useState } from "react";
import { Users, UserCheck, CreditCard, AlertCircle, TrendingUp } from "lucide-react";
import type { Member, Trainer, Subscription, Notification } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import Link from "next/link";
import { AnimatedNumber } from "@/components/animated-number";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  monthlyRevenue: number;
  expiringSoon: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/trainers").then((r) => r.json()),
      fetch("/api/subscriptions").then((r) => r.json()),
      user ? fetch(`/api/notifications?userId=${user.id}`).then((r) => r.json()) : Promise.resolve([]),
    ]).then(([members, trainers, subs, notifs]: [Member[], Trainer[], Subscription[], Notification[]]) => {
      const today = new Date();
      const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiring = subs.filter((s) => s.status === "active" && new Date(s.endDate) <= in30).length;
      const revenue = subs.filter((s) => s.status === "active" && s.paidDate).reduce((sum, s) => sum + s.amount, 0);
      setStats({
        totalMembers: members.length,
        activeMembers: members.filter((m) => m.status === "active").length,
        totalTrainers: trainers.filter((tr) => tr.status === "active").length,
        monthlyRevenue: revenue,
        expiringSoon: expiring,
      });
      setRecentMembers(members.slice(-6).reverse());
      setNotifications(notifs.filter((n: Notification) => !n.read).slice(0, 5));
    });
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <div className="space-y-5">
      <div className="fade-up">
        <p className="text-gray-400 text-sm font-medium">{greeting}</p>
        <h2 className="text-2xl sm:text-3xl font-black mt-0.5">{user?.name.split(" ")[0]}.</h2>
        <p className="text-gray-400 text-sm mt-1">{t("admin_subtitle")}</p>
      </div>

      {stats ? (
        <div className="bg-black text-white rounded-3xl p-6 shadow-xl fade-up delay-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">{t("admin_active_revenue")}</p>
                <div className="text-4xl sm:text-5xl font-black mt-1 tracking-tight">
                  <AnimatedNumber value={stats.monthlyRevenue} prefix="$" />
                </div>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <CreditCard size={24} className="text-white" />
              </div>
            </div>
            <div className="flex gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="text-2xl font-black"><AnimatedNumber value={stats.totalMembers} /></div>
                <div className="text-white/40 text-xs mt-0.5 font-medium">{t("admin_total_members")}</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-2xl font-black"><AnimatedNumber value={stats.activeMembers} /></div>
                <div className="text-white/40 text-xs mt-0.5 font-medium">{t("admin_active_sub")}</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-2xl font-black"><AnimatedNumber value={stats.totalTrainers} /></div>
                <div className="text-white/40 text-xs mt-0.5 font-medium">{t("admin_active_trainers")}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-3xl h-44 animate-pulse fade-up delay-1" />
      )}

      {stats && stats.expiringSoon > 0 && (
        <Link href="/admin/payments" className="press flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 hover:border-black transition-all fade-up delay-2">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-black text-sm">{stats.expiringSoon} subscription{stats.expiringSoon > 1 ? "s" : ""} expiring soon</div>
            <div className="text-xs text-gray-400 mt-0.5">{t("admin_within_30")} — click to review</div>
          </div>
          <span className="text-xs text-gray-400 font-bold">→</span>
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden fade-up delay-3">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-sm">{t("admin_recent_members")}</h3>
            <Link href="/admin/members" className="text-xs text-gray-400 hover:text-black transition-colors font-semibold">{t("view_all")}</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMembers.map((m) => (
              <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">{m.name.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-bold">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.joinDate}</div>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${m.status === "active" ? "bg-black text-white" : m.status === "suspended" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {m.status === "active" ? t("status_active") : m.status === "inactive" ? t("status_inactive") : t("status_suspended")}
                </span>
              </div>
            ))}
            {recentMembers.length === 0 && <div className="px-5 py-10 text-center text-gray-300 text-sm">{t("admin_no_members")}</div>}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden fade-up delay-4">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-sm">{t("admin_notifications")}</h3>
            <TrendingUp size={15} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-black" : n.type === "warning" ? "bg-gray-400" : "bg-gray-200"}`} />
                  <div>
                    <div className="text-sm font-bold">{n.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</div>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <div className="px-5 py-10 text-center text-gray-300 text-sm">{t("admin_no_notifs")}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 fade-up delay-5">
        {stats ? [
          { label: t("nav_members"), value: stats.totalMembers, icon: Users, href: "/admin/members" },
          { label: t("nav_trainers"), value: stats.totalTrainers, icon: UserCheck, href: "/admin/trainers" },
          { label: t("admin_expiring"), value: stats.expiringSoon, icon: AlertCircle, href: "/admin/payments" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="press bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 hover:shadow-md transition-all shadow-sm text-center">
            <div className="text-2xl font-black"><AnimatedNumber value={s.value} /></div>
            <div className="text-xs text-gray-400 mt-1 font-semibold">{s.label}</div>
          </Link>
        )) : null}
      </div>
    </div>
  );
}
