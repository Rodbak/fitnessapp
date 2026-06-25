"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import type { Member, ProgressEntry } from "@/lib/db";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, X } from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [member, setMember] = useState<Member | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], weight: "", bodyFat: "", chest: "", waist: "", hips: "", biceps: "", benchPress: "", squat: "", deadlift: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    fetch("/api/members").then((r) => r.json()).then((members: Member[]) => {
      const m = members.find((mem) => mem.userId === user.id);
      setMember(m || null);
      if (m) {
        fetch(`/api/progress?memberId=${m.id}`).then((r) => r.json()).then((data: ProgressEntry[]) => {
          setEntries(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        });
      }
    });
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    const payload = { memberId: member.id, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? undefined : isNaN(Number(v)) ? v : Number(v)])) };
    const res = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const entry = await res.json();
    setEntries((prev) => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setShowModal(false);
  }

  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  function delta(key: keyof ProgressEntry) {
    if (!latest || !prev) return null;
    const l = latest[key] as number | undefined;
    const p = prev[key] as number | undefined;
    if (!l || !p) return null;
    return (l - p).toFixed(1);
  }

  const metrics = [
    { label: t("metric_weight"), key: "weight" as const, unit: "lbs" },
    { label: t("metric_bodyfat"), key: "bodyFat" as const, unit: "%" },
    { label: t("metric_waist"), key: "waist" as const, unit: "in" },
    { label: t("metric_bench"), key: "benchPress" as const, unit: "lbs" },
    { label: t("metric_squat"), key: "squat" as const, unit: "lbs" },
    { label: t("metric_deadlift"), key: "deadlift" as const, unit: "lbs" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between fade-up">
        <div>
          <h2 className="text-xl font-black">{t("progress_title")}</h2>
          <p className="text-gray-500 text-sm">{entries.length} {t("progress_checkins")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="press flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm"
        >
          <Plus size={15} /> {t("progress_log")}
        </button>
      </div>

      {/* Current stats */}
      {latest && (
        <div className="grid grid-cols-3 gap-2.5 fade-up delay-1">
          {metrics.filter((m) => latest[m.key]).map((m, i) => {
            const d = delta(m.key);
            const isGood = m.key === "bodyFat" || m.key === "waist" ? Number(d) <= 0 : Number(d) >= 0;
            return (
              <div key={m.key} className={`bg-white border border-gray-100 rounded-3xl p-3 text-center shadow-sm fade-up delay-${i + 1}`}>
                <div className="text-xl font-black leading-none">{latest[m.key]}<span className="text-xs font-normal text-gray-400">{m.unit}</span></div>
                <div className="text-[10px] text-gray-500 mt-1 font-semibold">{m.label}</div>
                {d && (
                  <div className={`text-[10px] mt-1 font-bold ${isGood ? "text-black" : "text-gray-300"}`}>
                    {Number(d) > 0 ? "+" : ""}{d}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Weight chart */}
      {entries.length >= 2 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm fade-up delay-2">
          <h3 className="font-black text-sm mb-4">{t("chart_weight")}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={entries.filter((e) => e.weight)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip labelFormatter={(l) => `Date: ${l}`} formatter={(v) => [`${v} lbs`, t("metric_weight")]} />
              <Line type="monotone" dataKey="weight" stroke="#000" strokeWidth={2.5} dot={{ fill: "#000", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strength chart */}
      {entries.length >= 2 && entries.some((e) => e.benchPress || e.squat) && (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm fade-up delay-3">
          <h3 className="font-black text-sm mb-4">{t("chart_strength")}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="benchPress" stroke="#000" strokeWidth={2} dot={{ fill: "#000", r: 3 }} name={t("metric_bench")} />
              <Line type="monotone" dataKey="squat" stroke="#888" strokeWidth={2} dot={{ fill: "#888", r: 3 }} name={t("metric_squat")} />
              <Line type="monotone" dataKey="deadlift" stroke="#ccc" strokeWidth={2} dot={{ fill: "#ccc", r: 3 }} name={t("metric_deadlift")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {entries.length === 0 && !showModal && (
        <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-300 text-sm fade-up delay-1">
          <p className="text-base font-black mb-1.5 text-gray-400">{t("progress_none")}</p>
          {t("progress_none_sub")}
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm fade-up delay-4">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-sm">{t("progress_history")}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[...entries].reverse().map((e) => (
              <div key={e.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{e.date}</span>
                  {e.weight && <span className="text-sm text-gray-500 font-semibold">{e.weight} lbs</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {e.bodyFat && <span>BF: {e.bodyFat}%</span>}
                  {e.waist && <span>{t("metric_waist")}: {e.waist}&quot;</span>}
                  {e.benchPress && <span>{t("metric_bench")}: {e.benchPress}</span>}
                  {e.squat && <span>{t("metric_squat")}: {e.squat}</span>}
                  {e.deadlift && <span>{t("metric_deadlift")}: {e.deadlift}</span>}
                </div>
                {e.notes && <p className="text-xs text-gray-400 mt-1 italic leading-relaxed">{e.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-3xl">
              <h3 className="font-black">{t("modal_log")}</h3>
              <button onClick={() => setShowModal(false)} className="press p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("modal_date")}</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none transition-colors" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">{t("modal_body")}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: t("field_weight_lbs"), key: "weight" },
                    { label: t("field_bodyfat_pct"), key: "bodyFat" },
                    { label: t("field_chest_in"), key: "chest" },
                    { label: t("field_waist_in"), key: "waist" },
                    { label: t("field_hips_in"), key: "hips" },
                    { label: t("field_biceps_in"), key: "biceps" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input type="number" step="0.1" value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder="—" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2.5">{t("modal_strength")}</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: t("field_bench"), key: "benchPress" },
                    { label: t("field_squat"), key: "squat" },
                    { label: t("field_deadlift"), key: "deadlift" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input type="number" value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder="—" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("modal_notes")}</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder={t("modal_placeholder_notes")} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:border-black focus:outline-none resize-none transition-colors" />
              </div>

              <button type="submit" className="press w-full bg-black text-white rounded-2xl py-3.5 font-black text-sm shadow-sm">{t("modal_save")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
