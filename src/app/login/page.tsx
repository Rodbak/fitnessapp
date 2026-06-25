"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LangToggle } from "@/components/lang-toggle";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(phone, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      const stored = localStorage.getItem("cf_user");
      if (stored) {
        const u = JSON.parse(stored);
        window.dispatchEvent(new Event("cf:login"));
        setTimeout(() => {
          if (u.role === "owner") router.push("/admin");
          else if (u.role === "trainer") router.push("/trainer");
          else router.push("/member");
        }, 900);
      }
    } catch (err) {
      setError(t("auth_error_server"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10 fade-up">
        <Link href="/" className="press flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-black font-black text-xs">CF</span>
          </div>
          <span className="font-black text-white tracking-tight">City&apos;s Fitness</span>
        </Link>
        <LangToggle dark />
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="fade-up delay-1">
            <h1 className="text-white text-3xl font-black mb-1.5">{t("sign_in")}</h1>
            <p className="text-white/40 text-sm mb-8">{t("sign_in_subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 fade-up delay-2">
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-2">{t("phone_number")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0000000000"
                className="w-full bg-white/5 border border-white/15 text-white rounded-2xl px-4 py-3.5 text-sm placeholder:text-white/20 focus:border-white/60 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-2">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/15 text-white rounded-2xl px-4 py-3.5 text-sm placeholder:text-white/20 focus:border-white/60 focus:outline-none transition-colors"
                required
              />
            </div>
            {error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="press w-full bg-white text-black font-black py-4 rounded-2xl text-sm hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-40 mt-2"
            >
              {loading ? t("signing_in") : t("sign_in_cta")}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 border border-white/10 rounded-3xl p-4 space-y-1 fade-up delay-3">
            <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-3">{t("demo_accounts")}</p>
            {[
              { label: "Owner", phone: "1111111111", pass: "admin123" },
              { label: "Trainer", phone: "2222222222", pass: "train123" },
              { label: "Member", phone: "4444444444", pass: "mem123" },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => { setPhone(d.phone); setPassword(d.pass); }}
                className="press w-full text-left flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <span className="text-white/40 text-xs font-semibold group-hover:text-white/60 transition-colors">{d.label}</span>
                <span className="font-mono text-xs text-white/50 group-hover:text-white/80 transition-colors">{d.phone}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
