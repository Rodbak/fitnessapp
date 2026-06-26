"use client";
import { useEffect, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import type { Member, Subscription } from "@/lib/db";
import { AnimatedNumber } from "@/components/animated-number";
import { useLang } from "@/lib/lang-context";
import { Toast } from "@/components/toast";

const PLANS = { monthly: { label: "Monthly", amount: 50, months: 1 }, quarterly: { label: "Quarterly", amount: 130, months: 3 }, annual: { label: "Annual", amount: 480, months: 12 } };

export default function PaymentsPage() {
  const { t } = useLang();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: "", plan: "monthly", amount: "50", status: "active", startDate: new Date().toISOString().split("T")[0], paidDate: "", notes: "" });
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/subscriptions").then((r) => r.json()), fetch("/api/members").then((r) => r.json())]).then(([s, m]: [Subscription[], Member[]]) => { setSubs(s); setMembers(m); });
  }, []);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name || "Unknown";
  const totalRevenue = subs.filter((s) => s.status === "active").reduce((acc, s) => acc + s.amount, 0);
  const expiring = subs.filter((s) => { if (s.status !== "active") return false; return (new Date(s.endDate).getTime() - Date.now()) / 86400000 <= 30; }).length;

  const filtered = subs.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const name = memberName(s.memberId).toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function openAdd() { setEditSub(null); setForm({ memberId: members[0]?.id || "", plan: "monthly", amount: "50", status: "active", startDate: new Date().toISOString().split("T")[0], paidDate: new Date().toISOString().split("T")[0], notes: "" }); setShowModal(true); }
  function openEdit(s: Subscription) { setEditSub(s); setForm({ memberId: s.memberId, plan: s.plan, amount: String(s.amount), status: s.status, startDate: s.startDate, paidDate: s.paidDate || "", notes: s.notes || "" }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editSub) {
      const res = await fetch(`/api/subscriptions/${editSub.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const updated = await res.json();
      setSubs((prev) => prev.map((s) => (s.id === editSub.id ? updated : s)));
      setToast(t("sub_updated"));
    } else {
      const res = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const created = await res.json();
      setSubs((prev) => [...prev, created]);
      setToast(t("sub_created"));
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("delete") + "?")) return;
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    setSubs((prev) => prev.filter((s) => s.id !== id));
    setToast(t("sub_deleted"));
  }

  const statusColor = (s: string) => s === "active" ? "bg-black text-white" : s === "expired" ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-600";
  const statusLabel = (s: string) => s === "active" ? t("status_active") : s === "expired" ? t("status_expired") : t("status_pending");

  const filters = [
    { key: "all", label: t("filter_all") },
    { key: "active", label: t("filter_active") },
    { key: "expired", label: t("filter_expired") },
    { key: "pending", label: t("filter_pending") },
  ];

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={() => setToast("")} />}

      <div className="flex items-center justify-between fade-up">
        <div>
          <h2 className="text-xl font-black">{t("payments_title")}</h2>
          <p className="text-gray-500 text-sm">{t("payments_subtitle")}</p>
        </div>
        <button onClick={openAdd} className="press flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-900 transition-colors">
          <Plus size={15} /> {t("payments_new")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 fade-up delay-1">
        {[
          { label: t("payments_revenue"), value: totalRevenue, prefix: "$" },
          { label: t("payments_active"), value: subs.filter((s) => s.status === "active").length, prefix: "" },
          { label: t("payments_expiring"), value: expiring, prefix: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl font-black tracking-tight"><AnimatedNumber value={s.value} prefix={s.prefix} /></div>
            <div className="text-xs text-gray-500 mt-1 font-medium leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 fade-up delay-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("payments_search")} className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-black focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`press px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f.key ? "bg-black text-white shadow-sm" : "border border-gray-200 hover:border-gray-400"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm fade-up delay-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_member")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_plan")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_amount")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">{t("col_period")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_status")}</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center text-gray-300">{t("payments_none")}</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 font-bold">{memberName(s.memberId)}</td>
                  <td className="px-5 py-4 capitalize text-gray-600">{s.plan}</td>
                  <td className="px-5 py-4 font-black">${s.amount}</td>
                  <td className="px-5 py-4 text-gray-400 hidden md:table-cell text-xs">{s.startDate} → {s.endDate}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColor(s.status)}`}>{statusLabel(s.status)}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(s)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-black transition-colors font-medium">{t("edit")}</button>
                      <button onClick={() => handleDelete(s.id)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors font-medium">{t("delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
              <h3 className="font-black">{editSub ? t("payments_edit") : t("payments_new")}</h3>
              <button onClick={() => setShowModal(false)} className="press p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_member")}</label>
                <select value={form.memberId} onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" required>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_plan")}</label>
                <select value={form.plan} onChange={(e) => { const p = e.target.value as keyof typeof PLANS; setForm((f) => ({ ...f, plan: p, amount: String(PLANS[p].amount) })); }} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
                  {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label} — ${v.amount}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_amount")}</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_start_date")}</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_paid_date")}</label>
                <input type="date" value={form.paidDate} onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_status")}</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
                  <option value="active">{t("status_active")}</option>
                  <option value="pending">{t("status_pending")}</option>
                  <option value="expired">{t("status_expired")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_notes")}</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none resize-none transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="press flex-1 border border-gray-200 rounded-2xl py-2.5 text-sm hover:border-black transition-colors font-semibold">{t("cancel")}</button>
                <button type="submit" className="press flex-1 bg-black text-white rounded-2xl py-2.5 text-sm font-black">{editSub ? t("save") : t("create")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
