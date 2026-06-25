"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LangToggle } from "@/components/lang-toggle";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();

  const NAV = [
    { href: "/member", label: t("nav_home"), icon: LayoutDashboard },
    { href: "/member/progress", label: t("nav_progress"), icon: TrendingUp },
    { href: "/member/profile", label: t("nav_profile"), icon: User },
  ];

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "member") router.push("/");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "member") return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-black text-white px-5 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-black font-black text-xs">CF</span>
          </div>
          <span className="font-black tracking-tight">City&apos;s Fitness</span>
        </div>
        <div className="flex items-center gap-2.5">
          <LangToggle dark />
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="press p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">{children}</main>

      {/* Native-feel bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]" />
        <div className="relative flex px-4 py-2 pb-safe">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/member" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="press flex-1 flex flex-col items-center gap-1 py-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="member-pill"
                    className="absolute -inset-x-2 -inset-y-1 bg-black rounded-2xl"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  <Icon size={21} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-white" : "text-gray-400"} />
                </span>
                <span className={`relative z-10 text-[10px] font-bold transition-colors ${active ? "text-white" : "text-gray-400"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
