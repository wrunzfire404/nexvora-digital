"use client";

/**
 * app/cek-pesanan/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Halaman publik "Cek Pesanan" — pintu masuk bagi user yang lupa link invoice.
 * Input: Invoice ID (NVD-XXXXX) + Nama Pembeli → redirect ke /orders/[ref]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, AlertCircle, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";

export default function CekPesananPage() {
  const router = useRouter();
  const [merchantRef, setMerchantRef] = useState("");
  const [name,        setName]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch("/api/orders/track", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ merchantRef: merchantRef.trim(), name: name.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/orders/${data.merchantRef}`);
      } else {
        setError(data.error ?? "Data tidak ditemukan.");
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-950/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-950/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* Back */}
        <Link href="/" className="absolute top-6 left-4 sm:left-8 flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Cek Status Pesanan</h1>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
              Masukkan ID Invoice dan nama yang kamu gunakan saat checkout untuk melihat detail pesananmu.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Invoice ID */}
              <div>
                <label htmlFor="merchantRef" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  ID Invoice
                </label>
                <input
                  id="merchantRef"
                  type="text"
                  required
                  placeholder="Contoh: NVD-MOGM60KN-D1CO"
                  value={merchantRef}
                  onChange={e => setMerchantRef(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 font-mono text-sm transition-all"
                />
                <p className="text-[11px] text-neutral-600 mt-1.5">
                  ID Invoice ada di pesan Telegram atau email konfirmasi kamu.
                </p>
              </div>

              {/* Nama Pembeli */}
              <div>
                <label htmlFor="buyerName" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Nama Pembeli
                </label>
                <input
                  id="buyerName"
                  type="text"
                  required
                  minLength={3}
                  placeholder="Nama yang digunakan saat checkout"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-sm transition-all"
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mencari pesanan...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Cari Pesanan
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-600 text-xs">atau</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            {/* Help */}
            <p className="text-center text-neutral-500 text-sm">
              Tidak punya ID Invoice?{" "}
              <a
                href="https://t.me/wrunzfire"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Hubungi @wrunzfire
              </a>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-neutral-900/50 border border-neutral-800/60 rounded-2xl p-4">
            <p className="text-xs text-neutral-500 leading-relaxed">
              💡 <span className="text-neutral-400 font-medium">Tips:</span> ID Invoice selalu dimulai dengan{" "}
              <code className="text-blue-400 bg-blue-950/30 px-1 rounded">NVD-</code>. Kamu bisa temukan di:
            </p>
            <ul className="mt-2 space-y-1">
              {[
                "Pesan Telegram dari @nexvoradigital_bot",
                "Email konfirmasi dari noreply@nexvoradigital.store",
                "Riwayat pembayaran e-wallet / m-banking kamu",
              ].map((tip, i) => (
                <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                  <span className="text-neutral-700 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
