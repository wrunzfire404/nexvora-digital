"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Users, CheckCircle, AlertTriangle, Receipt, CircleDollarSign, Hourglass, AlertCircle, ShoppingBag, Plus, Store, Lightbulb } from "lucide-react";

type Stats = {
  totalProducts:    number;
  totalUsers:       number;
  availableProducts: number;
  outOfStock:       number;
  totalOrders:      number;
  paidOrders:       number;
  pendingDelivery:  number;
  pendingOrders:    number;
};

const STAT_CARDS = [
  { key: "totalProducts",    label: "Total Produk",    icon: Package, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { key: "totalUsers",       label: "Total User",      icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  { key: "availableProducts",label: "Produk Tersedia", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { key: "outOfStock",       label: "Stok Habis",      icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-100" },
  { key: "totalOrders",      label: "Total Orders",    icon: Receipt, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { key: "paidOrders",       label: "Orders Dibayar",  icon: CircleDollarSign, color: "text-green-600 bg-green-50 border-green-100" },
  { key: "pendingOrders",    label: "Menunggu Bayar",  icon: Hourglass, color: "text-amber-600 bg-amber-50 border-amber-100" },
  { key: "pendingDelivery",  label: "Belum Terkirim",  icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-100" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Selamat datang kembali di Admin Panel Nexvora Digital</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                  {loading ? (
                    <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 leading-none">
                      {stats ? stats[card.key as keyof Stats] : "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Kelola Orders",    href: "/admin/orders",   icon: ShoppingBag, desc: "Lihat & proses pesanan", color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
            { label: "Tambah Produk",    href: "/admin/products", icon: Plus,        desc: "Tambah produk ke katalog", color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" },
            { label: "Kelola User",      href: "/admin/users",    icon: Users,       desc: "Lihat dan kelola pengguna", color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100" },
            { label: "Lihat Toko",       href: "/products",       icon: Store,       desc: "Tampilan seperti pembeli", color: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className={`p-5 rounded-xl cursor-pointer border transition-colors group ${action.color}`}>
                  <Icon className="w-6 h-6 mb-3" />
                  <p className="font-bold text-sm mb-1">{action.label}</p>
                  <p className="text-xs opacity-80">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold mb-1">Tips Admin</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Pastikan stok produk selalu diperbarui. Produk dengan stok 0 akan otomatis ditandai "Habis" dan tombol beli akan dinonaktifkan untuk pelanggan. Untuk produk "Manual" atau "Pre-Order", perhatikan badge peringatan pada menu Orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
