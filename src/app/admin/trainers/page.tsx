"use client";
import { useEffect, useState } from "react";
import { Plus, X, Mail, Phone, UserCheck } from "lucide-react";
import type { Trainer } from "@/lib/db";
import { useLang } from "@/lib/lang-context";
import { Toast } from "@/components/toast";

export default function TrainersPage() {
  const { t } = useLang();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", specialization: "", password: "", status: "active" });

  useEffect(() => {
    fetch("/api/trainers").then((r) => r.json()).then((tr: Trainer[]) => { setTrainers(tr); setLoading(false); });
  }, []);

  function openAdd() { setEditTrainer(null); setForm({ name: "", phone: "", email: "", specialization: "", password: "", status: "active" }); setShowModal(true); }
  function openEdit(tr: Trainer) { setEditTrainer(tr); setForm({ name: tr.name, phone: tr.phone, email: tr.email || "", specialization: tr.specialization, password: "", status: tr.status }); setShowModal(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editTrainer) {
      const res = await fetch(`/api/trainers/${editTrainer.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const updated = await res.json();
      setTrainers((prev) => prev.map((tr) => (tr.id === editTrainer.id ? updated : tr)));
      setToast(t("trainer_updated"));
    } else {
      const res = await fetch("/api/trainers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setTrainers((prev) => [...prev, created]);
      setToast(t("trainer_added"));
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("delete") + "?")) return;
    await fetch(`/api/trainers/${id}`, { method: "DELETE" });
    setTrainers((prev) => prev.filter((tr) => tr.id !== id));
    setToast(t("trainer_removed"));
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={() => setToast("")} />}

      <div className="flex items-center justify-between fade-up">
        <div>
          <h2 className="text-xl font-black">{t("trainers_title")}</h2>
          <p className="text-gray-500 text-sm">{trainers.length} {t("trainers_staff")}</p>
        </div>
        <button onClick={openAdd} className="press flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-900 transition-colors">
          <Plus size={15} /> {t("trainers_add")}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-52 animate-pulse shadow-sm" />)
        ) : trainers.length === 0 ? (
          <div className="col-span-3 bg-gray-50 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3"><UserCheck size={32} className="text-gray-200" />{t("trainers_none")}</div>
        ) : trainers.map((tr, i) => (
          <div key={tr.id} className={`bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-lg transition-all shadow-sm fade-up delay-${Math.min(i + 1, 6)}`}>
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm">
                {tr.name.charAt(0)}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${tr.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                {tr.status === "active" ? t("status_active") : t("status_inactive")}
              </span>
            </div>
            <h3 className="font-black text-base">{tr.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{tr.specialization}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone size={11} /> {tr.phone}
              </div>
              {tr.email && <div className="flex items-center gap-2 text-xs text-gray-400"><Mail size={11} /> {tr.email}</div>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg">{tr.memberCount} {t("trainers_members")}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(tr)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-black transition-colors font-medium">{t("edit")}</button>
                <button onClick={() => handleDelete(tr.id)} className="press text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors font-medium">{t("delete")}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black">{editTrainer ? t("trainers_edit") : t("trainers_add")}</h3>
              <button onClick={() => setShowModal(false)} className="press p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              {[
                { label: t("field_full_name"), key: "name", type: "text", required: true },
                { label: t("field_phone"), key: "phone", type: "tel", required: true },
                { label: t("field_email"), key: "email", type: "email", required: false },
                { label: t("field_specialization"), key: "specialization", type: "text", required: true },
                { label: t("field_password"), key: "password", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} required={required} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("field_status")}</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors">
                  <option value="active">{t("status_active")}</option>
                  <option value="inactive">{t("status_inactive")}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="press flex-1 border border-gray-200 rounded-2xl py-2.5 text-sm hover:border-black transition-colors font-semibold">{t("cancel")}</button>
                <button type="submit" className="press flex-1 bg-black text-white rounded-2xl py-2.5 text-sm font-black">{editTrainer ? t("save") : t("trainers_add")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
