"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pengaturan</h1>
        <p className="text-slate-400">Konfigurasi platform Nexvora Digital</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Informasi Platform</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nama Platform</label>
              <input
                type="text"
                defaultValue="Nexvora Digital"
                readOnly
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Telegram Bot URL</label>
              <input
                type="text"
                defaultValue={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/NexvoraBot"}
                readOnly
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500">
              Untuk mengubah konfigurasi, edit file <code className="text-blue-400">.env</code> di root project.
            </p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Navigasi Cepat</h2>
          <div className="space-y-3">
            {[
              { label: "Kelola Produk", href: "/admin/products", icon: "📦", desc: "Tambah, edit, hapus produk" },
              { label: "Kelola User", href: "/admin/users", icon: "👥", desc: "Manajemen akun pengguna" },
              { label: "Lihat Toko", href: "/products", icon: "🛍️", desc: "Tampilan toko seperti pelanggan" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 hover:bg-slate-700/50 border border-slate-700 transition-colors group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Database Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Database</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Provider</span>
              <span className="text-white font-medium">SQLite (via Prisma)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">File</span>
              <code className="text-blue-400 text-xs">prisma/dev.db</code>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">ORM</span>
              <span className="text-white font-medium">Prisma v7</span>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4",
              "Prisma ORM", "NextAuth v5", "SQLite", "Framer Motion"
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
