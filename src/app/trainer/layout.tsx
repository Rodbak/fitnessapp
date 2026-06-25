"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut } from "lucide-react";

const NAV = [
  { href: "/trainer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainer/members", label: "My Members", icon: Users },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "trainer") router.push("/");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "trainer") return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-black text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">CF</span>
          </div>
          <span className="font-bold tracking-tight">Trainer Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm hidden sm:block">{user.name}</span>
          <button onClick={() => { logout(); router.push("/login"); }} className="text-white/60 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-40">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/trainer" && pathname.startsWith(href));
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
