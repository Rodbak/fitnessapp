"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Member, Subscription } from "@/lib/db";

const PLANS = { monthly: { label: "Monthly", amount: 50, months: 1 }, quarterly: { label: "Quarterly", amount: 130, months: 3 }, annual: { label: "Annual", amount: 480, months: 12 } };

export default function PaymentsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: "", plan: "monthly", amount: "50", status: "active", startDate: new Date().toISOString().split("T")[0], paidDate: "", notes: "" });
  const [editSub, setEditSub] = useState<Subscription | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/subscriptions").then((r) => r.json()), fetch("/api/members").then((r) => r.json())]).then(([s, m]: [Subscription[], Member[]]) => { setSubs(s); setMembers(m); });
  }, []);

  const filtered = subs.filter((s) => filter === "all" || s.status === filter);
  const memberName = (id: string) => members.find((m) => m.id === id)?.name || "Unknown";

  const totalRevenue = subs.filter((s) => s.status === "active").reduce((acc, s) => acc + s.amount, 0);
  const expiring = subs.filter((s) => {
    if (s.status !== "active") return false;
    const days = (new Date(s.endDate).getTime() - Date.now()) / 86400000;
    return days <= 30;
  }).length;

  function openAdd() {
    setEditSub(null);
    setForm({ memberId: members[0]?.id || "", plan: "monthly", amount: "50", status: "active", startDate: new Date().toISOString().split("T")[0], paidDate: new Date().toISOString().split("T")[0], notes: "" });
    setShowModal(true);
  }

  function openEdit(s: Subscription) {
    setEditSub(s);
    setForm({ memberId: s.memberId, plan: s.plan, amount: String(s.amount), status: s.status, startDate: s.startDate, paidDate: s.paidDate || "", notes: s.notes || "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editSub) {
      const res = await fetch(`/api/subscriptions/${editSub.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const updated = await res.json();
      setSubs((prev) => prev.map((s) => (s.id === editSub.id ? updated : s)));
    } else {
      const res = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const created = await res.json();
      setSubs((prev) => [...prev, created]);
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscription?")) return;
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  const statusColor = (s: string) => s === "active" ? "bg-black text-white" : s === "expired" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Payments</h2>
          <p className="text-gray-500 text-sm">Subscription tracking</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={16} /> New Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Revenue", value: `$${totalRevenue.toLocaleString()}` },
          { label: "Active Subs", value: subs.filter((s) => s.status === "active").length },
          { label: "Expiring (30d)", value: expiring },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "active", "expired", "pending"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${filter === f ? "bg-black text-white" : "border border-gray-200 hover:border-black"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Member</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Plan</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Period</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No subscriptions found</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium">{memberName(s.memberId)}</td>
                  <td className="px-5 py-3 capitalize text-gray-600">{s.plan}</td>
                  <td className="px-5 py-3 font-bold">${s.amount}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell text-xs">{s.startDate} → {s.endDate}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor(s.status)}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(s)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-black transition-colors">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-red-400 hover:text-red-500 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold">{editSub ? "Edit Subscription" : "New Subscription"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Member</label>
                <select value={form.memberId} onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" required>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Plan</label>
                <select value={form.plan} onChange={(e) => {
                  const p = e.target.value as keyof typeof PLANS;
                  setForm((f) => ({ ...f, plan: p, amount: String(PLANS[p].amount) }));
                }} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
                  {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label} — ${v.amount}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Amount ($)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" required />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Paid Date</label>
                <input type="date" value={form.paidDate} onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded py-2 text-sm hover:border-black transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white rounded py-2 text-sm font-medium">{editSub ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
