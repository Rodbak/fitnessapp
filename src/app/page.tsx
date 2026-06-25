"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "owner") router.push("/admin");
      else if (user.role === "trainer") router.push("/trainer");
      else router.push("/member");
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-sm">CF</span>
          </div>
          <span className="font-bold text-lg tracking-tight">City&apos;s Fitness</span>
        </div>
        <Link href="/login" className="text-sm font-medium border border-white/30 px-4 py-2 rounded hover:bg-white hover:text-black transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block border border-white/20 text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-6 text-white/60">
          Gym Management Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          YOUR GYM.<br />
          <span className="text-white/40">YOUR CITY.</span>
        </h1>
        <p className="text-white/60 text-lg max-w-md mb-10">
          Complete gym management — members, trainers, payments, and progress tracking all in one place.
        </p>
        <Link href="/login" className="bg-white text-black font-bold px-8 py-4 rounded text-lg hover:bg-white/90 transition-colors">
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
        {[
          { label: "Members", desc: "Sign-up, profiles & status" },
          { label: "Trainers", desc: "Staff management & assignments" },
          { label: "Payments", desc: "Subscription tracking" },
          { label: "Progress", desc: "Body & strength metrics" },
        ].map((f) => (
          <div key={f.label} className="p-6">
            <div className="font-bold mb-1">{f.label}</div>
            <div className="text-white/50 text-sm">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Demo credentials */}
      <section className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-white/40 text-sm mb-3">Demo Login Credentials</p>
        <div className="inline-flex flex-col sm:flex-row gap-4 text-sm">
          <span className="text-white/70"><span className="text-white font-mono">1111111111</span> / <span className="font-mono">admin123</span> — Owner</span>
          <span className="text-white/70"><span className="text-white font-mono">2222222222</span> / <span className="font-mono">train123</span> — Trainer</span>
          <span className="text-white/70"><span className="text-white font-mono">4444444444</span> / <span className="font-mono">mem123</span> — Member</span>
        </div>
      </section>
    </main>
  );
}
