"use client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LangToggle } from "@/components/lang-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "owner") router.replace("/admin");
      else if (user.role === "trainer") router.replace("/trainer");
      else router.replace("/member");
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-white/10 fade-up">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-black font-black text-sm">CF</span>
          </div>
          <span className="font-black text-lg tracking-tight">City&apos;s Fitness</span>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle dark />
          <Link href="/login" className="press text-sm font-bold border border-white/20 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all duration-200 shadow-sm">
            {t("sign_in")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
        <div className="fade-up delay-1 inline-block border border-white/15 text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 text-white/50 bg-white/5">
          {t("landing_tagline")}
        </div>
        <h1 className="fade-up delay-2 text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[0.95] uppercase">
          {t("landing_hero1")}<br />
          <span className="text-white/25">{t("landing_hero2")}</span>
        </h1>
        <p className="fade-up delay-3 text-white/50 text-base sm:text-lg max-w-sm mb-10 leading-relaxed">
          {t("landing_desc")}
        </p>
        <Link
          href="/login"
          className="press fade-up delay-4 bg-white text-black font-black px-8 py-4 rounded-2xl text-base sm:text-lg hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          {t("landing_cta")}
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 fade-up delay-5">
        {[
          { label: t("landing_feat_members"), desc: t("landing_feat_members_desc") },
          { label: t("landing_feat_trainers"), desc: t("landing_feat_trainers_desc") },
          { label: t("landing_feat_payments"), desc: t("landing_feat_payments_desc") },
          { label: t("landing_feat_progress"), desc: t("landing_feat_progress_desc") },
        ].map((f, i) => (
          <div key={f.label} className={`p-5 sm:p-7 border-r border-white/10 last:border-r-0 ${i >= 2 ? "border-t md:border-t-0 border-white/10" : ""}`}>
            <div className="font-black text-sm mb-1">{f.label}</div>
            <div className="text-white/40 text-xs leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Demo credentials */}
      <section className="border-t border-white/10 px-5 py-7 fade-up delay-6">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4 text-center">{t("landing_demo")}</p>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center text-xs">
          {[
            { role: "Owner", phone: "1111111111", pass: "admin123" },
            { role: "Trainer", phone: "2222222222", pass: "train123" },
            { role: "Member", phone: "4444444444", pass: "mem123" },
          ].map((d) => (
            <div key={d.role} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-white/40">{d.role}:</span>
              <span className="font-mono text-white font-bold">{d.phone}</span>
              <span className="text-white/20">/</span>
              <span className="font-mono text-white/60">{d.pass}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
