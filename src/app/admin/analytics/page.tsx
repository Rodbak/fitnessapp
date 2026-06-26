"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Member, Subscription, Trainer } from "@/lib/db";
import { useLang } from "@/lib/lang-context";

export default function AnalyticsPage() {
  const { t } = useLang();
  const [members, setMembers] = useState<Member[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/subscriptions").then((r) => r.json()),
      fetch("/api/trainers").then((r) => r.json()),
    ]).then(([m, s, t]: [Member[], Subscription[], Trainer[]]) => {
      setMembers(m);
      setSubs(s);
      setTrainers(t);
    });
  }, []);

  const membersByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const mon = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    const count = members.filter((m) => {
      const j = new Date(m.joinDate);
      return j.getMonth() === d.getMonth() && j.getFullYear() === year;
    }).length;
    return { month: mon, members: count };
  });

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const mon = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    const revenue = subs.filter((s) => {
      if (!s.paidDate) return false;
      const pd = new Date(s.paidDate);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === year;
    }).reduce((acc, s) => acc + s.amount, 0);
    return { month: mon, revenue };
  });

  const statusData = [
    { name: "Active", value: members.filter((m) => m.status === "active").length },
    { name: "Inactive", value: members.filter((m) => m.status === "inactive").length },
    { name: "Suspended", value: members.filter((m) => m.status === "suspended").length },
  ].filter((d) => d.value > 0);

  const planData = ["monthly", "quarterly", "annual"].map((plan) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: subs.filter((s) => s.plan === plan && s.status === "active").length,
  })).filter((d) => d.value > 0);

  const trainerData = trainers.map((t) => ({
    name: t.name.split(" ")[0],
    members: members.filter((m) => m.trainerId === t.id).length,
  }));

  const COLORS = ["#000000", "#555555", "#aaaaaa", "#dddddd"];

  return (
    <div className="space-y-5">
      <div className="fade-up">
        <h2 className="text-xl font-black">{t("analytics_title")}</h2>
        <p className="text-gray-500 text-sm">{t("analytics_subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Member Growth */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm fade-up delay-1">
          <h3 className="font-black text-sm mb-4">{t("analytics_members_growth")}</h3>
          {membersByMonth.every((d) => d.members === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">{t("no_data")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={membersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="members" fill="#000000" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm fade-up delay-2">
          <h3 className="font-black text-sm mb-4">{t("analytics_revenue")}</h3>
          {revenueByMonth.every((d) => d.revenue === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">{t("no_data")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2.5} dot={{ fill: "#000", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Member Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm fade-up delay-3">
          <h3 className="font-black text-sm mb-4">{t("analytics_status_dist")}</h3>
          {statusData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">{t("no_data")}</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={160} className="max-w-[200px]">
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 w-full sm:w-auto">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2.5 text-sm">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-black ml-auto pl-6">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trainer Workload */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm fade-up delay-4">
          <h3 className="font-black text-sm mb-4">{t("analytics_trainer_load")}</h3>
          {trainerData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">{t("analytics_no_trainers")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="members" fill="#000000" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Plan Distribution */}
        {planData.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2 fade-up delay-5">
            <h3 className="font-black text-sm mb-5">{t("analytics_plans")}</h3>
            <div className="grid grid-cols-3 gap-3">
              {planData.map((p, i) => (
                <div key={p.name} className="text-center bg-gray-50 rounded-2xl p-4">
                  <div className="text-3xl sm:text-4xl font-black">{p.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1.5 font-semibold capitalize">{p.name}</div>
                  <div className="mt-3 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
