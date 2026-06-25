"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Member, ProgressEntry } from "@/lib/db";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, X } from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuth();
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
    { label: "Weight", key: "weight" as const, unit: "lbs" },
    { label: "Body Fat", key: "bodyFat" as const, unit: "%" },
    { label: "Waist", key: "waist" as const, unit: "in" },
    { label: "Bench", key: "benchPress" as const, unit: "lbs" },
    { label: "Squat", key: "squat" as const, unit: "lbs" },
    { label: "Deadlift", key: "deadlift" as const, unit: "lbs" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Progress</h2>
          <p className="text-gray-500 text-sm">{entries.length} check-ins logged</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
          <Plus size={16} /> Log
        </button>
      </div>

      {/* Current stats */}
      {latest && (
        <div className="grid grid-cols-3 gap-3">
          {metrics.filter((m) => latest[m.key]).map((m) => {
            const d = delta(m.key);
            const isGood = m.key === "bodyFat" || m.key === "waist" ? Number(d) <= 0 : Number(d) >= 0;
            return (
              <div key={m.key} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-lg font-black">{latest[m.key]}<span className="text-xs font-normal text-gray-400">{m.unit}</span></div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                {d && (
                  <div className={`text-xs mt-1 font-medium ${isGood ? "text-black" : "text-gray-400"}`}>
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={entries.filter((e) => e.weight)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip labelFormatter={(l) => `Date: ${l}`} formatter={(v) => [`${v} lbs`, "Weight"]} />
              <Line type="monotone" dataKey="weight" stroke="#000" strokeWidth={2} dot={{ fill: "#000", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strength chart */}
      {entries.length >= 2 && entries.some((e) => e.benchPress || e.squat) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Strength Progress</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="benchPress" stroke="#000" strokeWidth={2} dot={{ fill: "#000", r: 3 }} name="Bench" />
              <Line type="monotone" dataKey="squat" stroke="#888" strokeWidth={2} dot={{ fill: "#888", r: 3 }} name="Squat" />
              <Line type="monotone" dataKey="deadlift" stroke="#ccc" strokeWidth={2} dot={{ fill: "#ccc", r: 3 }} name="Deadlift" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {entries.length === 0 && !showModal && (
        <div className="bg-gray-100 rounded-2xl p-10 text-center text-gray-400 text-sm">
          <p className="text-lg font-bold mb-2 text-gray-600">No check-ins yet</p>
          Log your first session to start tracking
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm">History</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[...entries].reverse().map((e) => (
              <div key={e.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{e.date}</span>
                  {e.weight && <span className="text-sm text-gray-500">{e.weight} lbs</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {e.bodyFat && <span>BF: {e.bodyFat}%</span>}
                  {e.waist && <span>Waist: {e.waist}"</span>}
                  {e.benchPress && <span>Bench: {e.benchPress}</span>}
                  {e.squat && <span>Squat: {e.squat}</span>}
                  {e.deadlift && <span>DL: {e.deadlift}</span>}
                </div>
                {e.notes && <p className="text-xs text-gray-400 mt-1 italic">{e.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold">Log Progress</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Body Measurements</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Weight (lbs)", key: "weight" },
                    { label: "Body Fat (%)", key: "bodyFat" },
                    { label: "Chest (in)", key: "chest" },
                    { label: "Waist (in)", key: "waist" },
                    { label: "Hips (in)", key: "hips" },
                    { label: "Biceps (in)", key: "biceps" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input type="number" step="0.1" value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder="—" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Strength (lbs)</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Bench", key: "benchPress" },
                    { label: "Squat", key: "squat" },
                    { label: "Deadlift", key: "deadlift" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input type="number" value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder="—" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="How did you feel today?" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-black resize-none" />
              </div>

              <button type="submit" className="w-full bg-black text-white rounded-xl py-3 font-bold text-sm">Save Check-in</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
