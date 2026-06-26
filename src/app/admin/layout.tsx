"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LangToggle } from "@/components/lang-toggle";
import Link from "next/link";
import { LayoutDashboard, Users, UserCheck, CreditCard, BarChart3, Bell, LogOut, Menu, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Notification } from "@/lib/db";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const NAV = [
    { href: "/admin", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/admin/members", label: t("nav_members"), icon: Users },
    { href: "/admin/trainers", label: t("nav_trainers"), icon: UserCheck },
    { href: "/admin/payments", label: t("nav_payments"), icon: CreditCard },
    { href: "/admin/analytics", label: t("nav_analytics"), icon: BarChart3 },
  ];

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "owner") router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((r) => r.json())
        .then((data: Notification[]) => {
          setNotifications(data);
          setNotifCount(data.filter((n) => !n.read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setNotifCount((prev) => Math.max(0, prev - 1));
  }

  if (loading || !user || user.role !== "owner") return null;

  const activeLabel = NAV.find((n) => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || t("nav_dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex lg:shadow-none`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-black font-black text-sm">CF</span>
          </div>
          <div>
            <div className="font-black text-sm leading-tight tracking-tight">City&apos;s Fitness</div>
            <div className="text-white/40 text-xs">{t("admin_owner_label")}</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`press flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active ? "bg-white text-black shadow-sm" : "text-white/65 hover:text-white hover:bg-white/10"}`}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="px-3 py-2">
            <div className="text-xs text-white/40">{t("logged_in_as")}</div>
            <div className="text-sm font-semibold truncate">{user.name}</div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="press flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <LogOut size={17} />
            {t("sign_out")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="press lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-black text-base sm:text-lg tracking-tight">{activeLabel}</h1>
          <div className="ml-auto flex items-center gap-2.5">
            <LangToggle />
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="press relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell size={19} />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-black leading-none">
                    {notifCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-black text-sm">{t("admin_notifications")}</span>
                      {notifCount > 0 && <span className="text-xs bg-black text-white rounded-full px-2 py-0.5 font-black">{notifCount}</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-300 text-sm">{t("admin_no_notifs")}</div>
                      ) : notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 flex items-start gap-3 transition-colors ${n.read ? "opacity-50" : "hover:bg-gray-50"}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-black" : n.type === "warning" ? "bg-gray-400" : "bg-gray-200"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{n.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</div>
                          </div>
                          {!n.read && (
                            <button onClick={() => markRead(n.id)} className="press text-gray-200 hover:text-black transition-colors flex-shrink-0">
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
          <div className="flex px-1 py-1.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`press flex-1 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all duration-200 relative
                    ${active ? "text-black" : "text-gray-400"}`}
                >
                  {active && (
                    <motion.div
                      layoutId="admin-pill"
                      className="absolute inset-x-0.5 top-0.5 h-[calc(100%-4px)] bg-gray-100 rounded-xl -z-10"
                    />
                  )}
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[9px] font-bold leading-none truncate w-full text-center">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="lg:hidden h-[60px]" />
      </div>
    </div>
  );
}
