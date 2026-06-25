"use client";
import { useEffect, useState } from "react";
import { Users, UserCheck, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import type { Member, Trainer, Subscription, Notification } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  monthlyRevenue: number;
  expiringSoon: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
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
        totalTrainers: trainers.filter((t) => t.status === "active").length,
        monthlyRevenue: revenue,
        expiringSoon: expiring,
      });
      setRecentMembers(members.slice(-5).reverse());
      setNotifications(notifs.filter((n) => !n.read).slice(0, 4));
    });
  }, [user]);

  const statCards = stats
    ? [
        { label: "Total Members", value: stats.totalMembers, sub: `${stats.activeMembers} active`, icon: Users, href: "/admin/members" },
        { label: "Active Trainers", value: stats.totalTrainers, sub: "On staff", icon: UserCheck, href: "/admin/trainers" },
        { label: "Revenue (Active)", value: `$${stats.monthlyRevenue.toLocaleString()}`, sub: "Current subscriptions", icon: CreditCard, href: "/admin/payments" },
        { label: "Expiring Soon", value: stats.expiringSoon, sub: "Within 30 days", icon: AlertCircle, href: "/admin/payments" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Good morning, {user?.name.split(" ")[0]}.</h2>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening at City&apos;s Fitness.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats ? statCards.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-black transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="text-gray-400"><s.icon size={20} /></div>
            </div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </Link>
        )) : Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse h-28" />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Members</h3>
            <Link href="/admin/members" className="text-xs text-gray-500 hover:text-black">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMembers.map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.phone}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                  {m.status}
                </span>
              </div>
            ))}
            {recentMembers.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No members yet</div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "warning" ? "bg-gray-400" : n.type === "success" ? "bg-black" : "bg-gray-300"}`} />
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No new notifications</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
