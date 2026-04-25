"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const [pendingDelivery, setPendingDelivery] = useState(0);

  useEffect(() => {
    // Fetch jumlah order PAID belum delivered untuk badge warning
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setPendingDelivery(d.pendingDelivery ?? 0))
      .catch(() => {});
  }, []);

  const navItems = [
    { name: "Dashboard",     href: "/admin",          icon: LayoutDashboard, badge: null },
    { name: "Orders",        href: "/admin/orders",    icon: ShoppingBag,     badge: pendingDelivery > 0 ? pendingDelivery : null },
    { name: "Kelola Produk", href: "/admin/products",  icon: Package,         badge: null },
    { name: "Kelola User",   href: "/admin/users",     icon: Users,           badge: null },
    { name: "Settings",      href: "/admin/settings",  icon: Settings,        badge: null },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-gray-500">Nexvora Digital</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-gray-900 text-xs font-bold truncate">{session.user?.name}</p>
              <p className="text-gray-500 text-[10px] truncate">{session.user?.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 w-full text-left text-xs font-medium text-gray-600 hover:text-gray-900 py-2 px-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Lihat Toko
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 w-full text-left text-xs font-medium text-red-600 hover:text-red-700 py-2 px-2 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
