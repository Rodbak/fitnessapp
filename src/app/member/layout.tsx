"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, User, LogOut } from "lucide-react";

const NAV = [
  { href: "/member", label: "Home", icon: LayoutDashboard },
  { href: "/member/progress", label: "Progress", icon: TrendingUp },
  { href: "/member/profile", label: "Profile", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "member") router.push("/");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "member") return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top bar */}
      <header className="bg-black text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">CF</span>
          </div>
          <span className="font-bold tracking-tight">City&apos;s Fitness</span>
        </div>
        <button onClick={() => { logout(); router.push("/login"); }} className="text-white/60 hover:text-white">
          <LogOut size={18} />
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-40">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/member" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${active ? "text-black" : "text-gray-400"}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
