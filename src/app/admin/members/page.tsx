"use client";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import type { Member, Trainer } from "@/lib/db";
import { useLang } from "@/lib/lang-context";
import { Toast } from "@/components/toast";

export default function MembersPage() {
  const { t } = useLang();
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", status: "active", trainerId: "", emergencyContact: "", password: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/trainers").then((r) => r.json()),
    ]).then(([m, tr]: [Member[], Trainer[]]) => { setMembers(m); setTrainers(tr); setLoading(false); });
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() { setEditMember(null); setForm({ name: "", phone: "", email: "", status: "active", trainerId: "", emergencyContact: "", password: "" }); setShowModal(true); }
  function openEdit(m: Member) { setEditMember(m); setForm({ name: m.name, phone: m.phone, email: m.email || "", status: m.status, trainerId: m.trainerId || "", emergencyContact: m.emergencyContact || "", password: "" }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editMember) {
      const res = await fetch(`/api/members/${editMember.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === editMember.id ? updated : m)));
      setToast(t("member_updated"));
    } else {
      const res = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setMembers((prev) => [...prev, created]);
      setToast(t("member_added"));
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("delete") + "?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setToast(t("member_removed"));
  }

  const trainerName = (tid?: string) => trainers.find((tr) => tr.id === tid)?.name || "—";
  const statusLabel = (s: string) => s === "active" ? t("status_active") : s === "inactive" ? t("status_inactive") : t("status_suspended");

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={() => setToast("")} />}

      <div className="flex items-center justify-between fade-up">
        <div>
          <h2 className="text-xl font-black">{t("members_title")}</h2>
          <p className="text-gray-500 text-sm">{members.length} {t("members_total")}</p>
        </div>
        <button onClick={openAdd} className="press flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-900 transition-colors">
          <Plus size={15} /> {t("members_add")}
        </button>
      </div>

      <div className="flex gap-3 flex-wrap fade-up delay-1">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("members_search")} className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
          <option value="all">{t("status_all")}</option>
          <option value="active">{t("status_active")}</option>
          <option value="inactive">{t("status_inactive")}</option>
          <option value="suspended">{t("status_suspended")}</option>
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm fade-up delay-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_name")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide hidden sm:table-cell">{t("col_phone")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">{t("col_trainer")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide">{t("col_status")}</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">{t("col_joined")}</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3.5"><div className="h-8 bg-gray-100 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center text-gray-300">{t("members_none")}</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm">{m.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-xs text-gray-400 sm:hidden">{m.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{m.phone}</td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{trainerName(m.trainerId)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${m.status === "active" ? "bg-black text-white" : m.status === "suspended" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 hidden lg:table-cell text-xs">{m.joinDate}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-black transition-colors font-medium">{t("edit")}</button>
                      <button onClick={() => handleDelete(m.id)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors font-medium">{t("delete")}</button>
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black">{editMember ? t("members_edit") : t("members_add")}</h3>
              <button onClick={() => setShowModal(false)} className="press p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {[
                { label: t("field_full_name"), key: "name", type: "text", required: true },
                { label: t("field_phone"), key: "phone", type: "tel", required: true },
                { label: t("field_email"), key: "email", type: "email", required: false },
                { label: t("field_emergency"), key: "emergencyContact", type: "tel", required: false },
                { label: t("field_password"), key: "password", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} required={required} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_trainer")}</label>
                <select value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
                  <option value="">{t("members_no_trainer")}</option>
                  {trainers.map((tr) => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_status")}</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
                  <option value="active">{t("status_active")}</option>
                  <option value="inactive">{t("status_inactive")}</option>
                  <option value="suspended">{t("status_suspended")}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="press flex-1 border border-gray-200 rounded-2xl py-2.5 text-sm hover:border-black transition-colors font-semibold">{t("cancel")}</button>
                <button type="submit" className="press flex-1 bg-black text-white rounded-2xl py-2.5 text-sm font-bold hover:bg-gray-900 transition-colors">{editMember ? t("save") : t("members_add")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
