"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import type { Member } from "@/lib/db";
import { Toast } from "@/components/toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [member, setMember] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", emergencyContact: "" });
  const [toast, setToast] = useState("");

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
    setToast(t("profile_updated"));
  }

  if (!member) return (
    <div className="py-16 text-center text-gray-300 text-sm fade-up">{t("loading_profile")}</div>
  );

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
      {/* Avatar card */}
      <div className="bg-black text-white rounded-3xl p-6 flex items-center gap-4 shadow-xl fade-up">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-sm flex-shrink-0">
          {member.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg leading-tight truncate">{member.name}</div>
          <div className="text-white/50 text-sm mt-0.5">{member.phone}</div>
          <div className="mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${member.status === "active" ? "bg-white text-black" : "bg-white/15 text-white"}`}>
              {member.status === "active" ? t("status_active") : member.status === "inactive" ? t("status_inactive") : t("status_suspended")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-1">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-sm">{t("personal_info")}</h3>
          <button
            onClick={() => setEditing((e) => !e)}
            className="press text-xs border border-gray-200 px-3.5 py-1.5 rounded-xl hover:border-black hover:bg-black hover:text-white transition-all font-bold"
          >
            {editing ? t("cancel") : t("edit")}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
            {[
              { label: t("field_full_name"), key: "name", type: "text" },
              { label: t("field_phone"), key: "phone", type: "tel" },
              { label: t("field_email"), key: "email", type: "email" },
              { label: t("field_emergency"), key: "emergencyContact", type: "tel" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors"
                />
              </div>
            ))}
            <button type="submit" className="press w-full bg-black text-white rounded-2xl py-3.5 text-sm font-black mt-2 shadow-sm">
              {t("save_changes")}
            </button>
          </form>
        ) : (
          <div className="divide-y divide-gray-50">
            {[
              { label: t("field_full_name"), value: member.name },
              { label: t("field_phone"), value: member.phone },
              { label: t("field_email"), value: member.email || "—" },
              { label: t("field_member_since"), value: member.joinDate },
              { label: t("field_emergency"), value: member.emergencyContact || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">{label}</span>
                <span className="text-sm font-bold text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
