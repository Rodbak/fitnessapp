"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Member } from "@/lib/db";

export default function ProfilePage() {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", emergencyContact: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/members").then((r) => r.json()).then((members: Member[]) => {
      const m = members.find((mem) => mem.userId === user.id);
      if (m) {
        setMember(m);
        setForm({ name: m.name, phone: m.phone, email: m.email || "", emergencyContact: m.emergencyContact || "" });
      }
    });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    const res = await fetch(`/api/members/${member.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const updated = await res.json();
    setMember(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!member) return <div className="py-10 text-center text-gray-400 text-sm">Loading profile...</div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-black">Profile</h2>

      {/* Avatar card */}
      <div className="bg-black text-white rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-black text-2xl">
          {member.name.charAt(0)}
        </div>
        <div>
          <div className="font-bold text-lg">{member.name}</div>
          <div className="text-white/60 text-sm">{member.phone}</div>
          <div className="mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.status === "active" ? "bg-white text-black" : "bg-white/20 text-white"}`}>
              {member.status}
            </span>
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-black text-white text-sm px-4 py-3 rounded-xl font-medium text-center">
          Profile updated!
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm">Personal Info</h3>
          <button onClick={() => setEditing((e) => !e)} className="text-xs border border-gray-200 px-3 py-1.5 rounded hover:border-black transition-colors">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Email", key: "email", type: "email" },
              { label: "Emergency Contact", key: "emergencyContact", type: "tel" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
              </div>
            ))}
            <button type="submit" className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-bold mt-2">Save Changes</button>
          </form>
        ) : (
          <div className="divide-y divide-gray-50">
            {[
              { label: "Full Name", value: member.name },
              { label: "Phone", value: member.phone },
              { label: "Email", value: member.email || "—" },
              { label: "Member Since", value: member.joinDate },
              { label: "Emergency Contact", value: member.emergencyContact || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
