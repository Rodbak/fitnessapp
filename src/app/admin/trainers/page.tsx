"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Trainer } from "@/lib/db";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "", specialization: "", password: "", status: "active" });

  useEffect(() => {
    fetch("/api/trainers").then((r) => r.json()).then((t: Trainer[]) => { setTrainers(t); setLoading(false); });
  }, []);

  function openAdd() {
    setEditTrainer(null);
    setForm({ name: "", phone: "", email: "", specialization: "", password: "", status: "active" });
    setShowModal(true);
  }

  function openEdit(t: Trainer) {
    setEditTrainer(t);
    setForm({ name: t.name, phone: t.phone, email: t.email || "", specialization: t.specialization, password: "", status: t.status });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editTrainer) {
      const res = await fetch(`/api/trainers/${editTrainer.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const updated = await res.json();
      setTrainers((prev) => prev.map((t) => (t.id === editTrainer.id ? updated : t)));
    } else {
      const res = await fetch("/api/trainers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setTrainers((prev) => [...prev, created]);
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this trainer?")) return;
    await fetch(`/api/trainers/${id}`, { method: "DELETE" });
    setTrainers((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Trainers</h2>
          <p className="text-gray-500 text-sm">{trainers.length} staff members</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 h-40 animate-pulse" />)
        ) : trainers.length === 0 ? (
          <div className="col-span-3 bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400">No trainers yet</div>
        ) : trainers.map((t) => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-black transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
                {t.name.charAt(0)}
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${t.status === "active" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                {t.status}
              </span>
            </div>
            <h3 className="font-bold">{t.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{t.specialization}</p>
            <p className="text-sm text-gray-400">{t.phone}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">{t.memberCount} members</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-black transition-colors">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-red-400 hover:text-red-500 transition-colors">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold">{editTrainer ? "Edit Trainer" : "Add Trainer"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              {[
                { label: "Full Name", key: "name", type: "text", required: true },
                { label: "Phone", key: "phone", type: "tel", required: true },
                { label: "Email", key: "email", type: "email", required: false },
                { label: "Specialization", key: "specialization", type: "text", required: true },
                { label: "Password (for login)", key: "password", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 block mb-1">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} required={required} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-600 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded py-2 text-sm hover:border-black transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white rounded py-2 text-sm font-medium">{editTrainer ? "Save" : "Add Trainer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
