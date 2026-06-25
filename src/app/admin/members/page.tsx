"use client";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import type { Member, Trainer } from "@/lib/db";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", phone: "", email: "", status: "active", trainerId: "", emergencyContact: "", password: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/trainers").then((r) => r.json()),
    ]).then(([m, t]: [Member[], Trainer[]]) => {
      setMembers(m);
      setTrainers(t);
      setLoading(false);
    });
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() {
    setEditMember(null);
    setForm({ name: "", phone: "", email: "", status: "active", trainerId: "", emergencyContact: "", password: "" });
    setShowModal(true);
  }

  function openEdit(m: Member) {
    setEditMember(m);
    setForm({ name: m.name, phone: m.phone, email: m.email || "", status: m.status, trainerId: m.trainerId || "", emergencyContact: m.emergencyContact || "", password: "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editMember) {
      const res = await fetch(`/api/members/${editMember.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === editMember.id ? updated : m)));
    } else {
      const res = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setMembers((prev) => [...prev, created]);
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this member?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const trainerName = (tid?: string) => trainers.find((t) => t.id === tid)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Members</h2>
          <p className="text-gray-500 text-sm">{members.length} total members</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..." className="w-full border border-gray-200 rounded pl-9 pr-4 py-2 text-sm focus:border-black" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Trainer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No members found</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-gray-400 sm:hidden">{m.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 hidden sm:table-cell">{m.phone}</td>
                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{trainerName(m.trainerId)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${m.status === "active" ? "bg-black text-white" : m.status === "suspended" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{m.joinDate}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-black transition-colors">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs border border-gray-200 px-3 py-1 rounded hover:border-red-400 hover:text-red-500 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold">{editMember ? "Edit Member" : "Add Member"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              {[
                { label: "Full Name", key: "name", type: "text", required: true },
                { label: "Phone Number", key: "phone", type: "tel", required: true },
                { label: "Email", key: "email", type: "email", required: false },
                { label: "Emergency Contact", key: "emergencyContact", type: "tel", required: false },
                { label: "Password (for login)", key: "password", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-600 block mb-1">Trainer</label>
                <select value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
                  <option value="">No trainer</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded py-2 text-sm hover:border-black transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white rounded py-2 text-sm font-medium hover:bg-gray-800 transition-colors">{editMember ? "Save" : "Add Member"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
