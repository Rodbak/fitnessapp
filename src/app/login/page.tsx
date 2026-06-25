"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const stored = localStorage.getItem("cf_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.role === "owner") router.push("/admin");
      else if (u.role === "trainer") router.push("/trainer");
      else router.push("/member");
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="flex items-center px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-sm">CF</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">City&apos;s Fitness</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-white text-3xl font-black mb-2">Sign In</h1>
          <p className="text-white/50 text-sm mb-8">Enter your phone number and password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0000000000"
                className="w-full bg-white/5 border border-white/20 text-white rounded px-4 py-3 text-sm placeholder:text-white/30 focus:border-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/20 text-white rounded px-4 py-3 text-sm placeholder:text-white/30 focus:border-white transition-colors"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 border border-white/10 rounded p-4 space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Demo Accounts</p>
            {[
              { label: "Owner", phone: "1111111111", pass: "admin123" },
              { label: "Trainer", phone: "2222222222", pass: "train123" },
              { label: "Member", phone: "4444444444", pass: "mem123" },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => { setPhone(d.phone); setPassword(d.pass); }}
                className="w-full text-left flex justify-between items-center text-sm py-1.5 text-white/60 hover:text-white transition-colors"
              >
                <span>{d.label}</span>
                <span className="font-mono text-xs">{d.phone}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
