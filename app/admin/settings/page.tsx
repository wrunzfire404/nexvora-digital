"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Package, Users, Store, Database, Code, Settings as SettingsIcon, Image as ImageIcon } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi platform Nexvora Digital</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Informasi Platform</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Platform</label>
              <input
                type="text"
                defaultValue="Nexvora Digital"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Telegram Bot URL</label>
              <input
                type="text"
                defaultValue={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/NexvoraBot"}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Untuk mengubah konfigurasi, edit file <code className="text-blue-600 font-mono font-medium">.env</code> di root project.
            </p>
          </div>
        </motion.div>

        {/* Integration Settings (ImgBB) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Integrasi API</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">ImgBB API Key (Penyimpanan Gambar)</label>
              <input
                type="password"
                defaultValue={process.env.NEXT_PUBLIC_IMGBB_API_KEY || "************************"}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm font-mono tracking-widest"
              />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vercel menggunakan sistem file Read-Only. Nexvora menggunakan ImgBB API untuk mengunggah dan menyimpan gambar produk secara eksternal. Ubah <code className="text-indigo-600 font-mono font-medium">IMGBB_API_KEY</code> di <code className="text-indigo-600 font-mono font-medium">.env</code> Anda.
            </p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-5">Navigasi Cepat</h2>
          <div className="space-y-3">
            {[
              { label: "Kelola Produk", href: "/admin/products", icon: Package, desc: "Tambah, edit, hapus produk", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Kelola User", href: "/admin/users", icon: Users, desc: "Manajemen akun pengguna", color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Lihat Toko", href: "/products", icon: Store, desc: "Tampilan toko seperti pelanggan", color: "text-orange-600", bg: "bg-orange-50" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold group-hover:text-blue-600 transition-colors">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Database Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Sistem & Database</h2>
          </div>
          
          <div className="space-y-3 text-sm mb-8">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Provider</span>
              <span className="text-gray-900 font-bold">SQLite (via Prisma)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">File Path</span>
              <code className="text-emerald-600 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded">prisma/dev.db</code>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 font-medium">ORM</span>
              <span className="text-gray-900 font-bold">Prisma v7</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tech Stack</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4",
                "Prisma ORM", "NextAuth v5", "SQLite", "Lucide React"
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
