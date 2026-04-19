"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Kelola Produk", href: "/admin/products", icon: "📦" },
    { name: "Kelola User", href: "/admin/users", icon: "👥" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <div>
              <p className="text-white font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-slate-500">Nexvora Digital</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{session.user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{session.user?.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="block w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1.5 rounded-lg hover:bg-slate-800 mb-1"
          >
            ← Lihat Toko
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-xs text-red-400 hover:text-red-300 py-1.5 rounded-lg hover:bg-red-900/20"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
