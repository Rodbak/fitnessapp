"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Member, Subscription, Trainer } from "@/lib/db";

export default function AnalyticsPage() {
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

  // Members by month
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

  // Revenue by month
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

  // Status distribution
  const statusData = [
    { name: "Active", value: members.filter((m) => m.status === "active").length },
    { name: "Inactive", value: members.filter((m) => m.status === "inactive").length },
    { name: "Suspended", value: members.filter((m) => m.status === "suspended").length },
  ].filter((d) => d.value > 0);

  // Plan distribution
  const planData = ["monthly", "quarterly", "annual"].map((plan) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: subs.filter((s) => s.plan === plan && s.status === "active").length,
  })).filter((d) => d.value > 0);

  // Trainer workload
  const trainerData = trainers.map((t) => ({
    name: t.name.split(" ")[0],
    members: members.filter((m) => m.trainerId === t.id).length,
  }));

  const COLORS = ["#000000", "#555555", "#aaaaaa", "#dddddd"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black">Analytics</h2>
        <p className="text-gray-500 text-sm">Gym performance overview</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold mb-4 text-sm">New Members (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={membersByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="members" fill="#000000" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold mb-4 text-sm">Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} dot={{ fill: "#000", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Member Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold mb-4 text-sm">Member Status Distribution</h3>
          {statusData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-bold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trainer Workload */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold mb-4 text-sm">Members per Trainer</h3>
          {trainerData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No trainers</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="members" fill="#000000" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Plan Distribution */}
        {planData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4 text-sm">Active Subscriptions by Plan</h3>
            <div className="flex gap-6">
              {planData.map((p, i) => (
                <div key={p.name} className="flex-1 text-center">
                  <div className="text-3xl font-black">{p.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{p.name}</div>
                  <div className="mt-2 h-1 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
