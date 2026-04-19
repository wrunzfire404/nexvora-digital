"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Stats = {
  totalProducts: number;
  totalUsers: number;
  availableProducts: number;
  outOfStock: number;
};

const STAT_CARDS = [
  { key: "totalProducts", label: "Total Produk", icon: "📦", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { key: "totalUsers", label: "Total User", icon: "👥", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { key: "availableProducts", label: "Produk Tersedia", icon: "✅", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { key: "outOfStock", label: "Stok Habis", icon: "⚠️", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
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
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400">Selamat datang kembali di Admin Panel Nexvora Digital</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl border ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{card.label}</p>
                {loading ? (
                  <div className="h-7 w-12 bg-slate-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {stats ? stats[card.key as keyof Stats] : "—"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8"
      >
        <h2 className="text-lg font-bold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Tambah Produk Baru", href: "/admin/products", icon: "➕", desc: "Tambah produk ke katalog", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "Kelola User", href: "/admin/users", icon: "👥", desc: "Lihat dan kelola pengguna", color: "bg-purple-600 hover:bg-purple-700" },
            { label: "Lihat Toko", href: "/products", icon: "🛍️", desc: "Tampilan seperti pembeli", color: "bg-slate-700 hover:bg-slate-600" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`${action.color} p-5 rounded-xl cursor-pointer group`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="text-white font-bold text-sm">{action.label}</p>
                <p className="text-white/60 text-xs mt-1">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 p-6 rounded-2xl border border-blue-800/30"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-white font-bold mb-1">Tips Admin</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pastikan stok produk selalu diperbarui. Produk dengan stok 0 akan otomatis ditandai "Habis" dan tombol beli akan dinonaktifkan untuk pelanggan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
