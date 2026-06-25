"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { LayoutDashboard, Users, UserCheck, CreditCard, BarChart3, Bell, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/trainers", label: "Trainers", icon: UserCheck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "owner") router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((r) => r.json())
        .then((data) => setNotifCount(data.filter((n: { read: boolean }) => !n.read).length))
        .catch(() => {});
    }
  }, [user]);

  if (loading || !user || user.role !== "owner") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-sm">CF</span>
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">City&apos;s Fitness</div>
            <div className="text-white/40 text-xs">Admin Dashboard</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${active ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <div className="text-xs text-white/50">Logged in as</div>
            <div className="text-sm font-medium truncate">{user.name}</div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors w-full"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu size={22} />
          </button>
          <h1 className="font-semibold text-gray-900">
            {NAV.find((n) => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded hover:bg-gray-100 transition-colors">
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {notifCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
