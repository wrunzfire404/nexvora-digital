"use client";

/**
 * app/orders/[merchantRef]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Halaman Invoice / Order Detail setelah pembayaran.
 *
 * - Return URL dari Tripay mengarah ke sini: /orders/NVD-XXXXX
 * - Polling status setiap 3 detik sampai PAID atau EXPIRED
 * - Menampilkan detail akun jika PAID dan delivered
 * - Menampilkan tombol "Minta Kode Verifikasi" jika isOtpEnabled=true + email @booplink.xyz
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, XCircle, Loader2, Copy, Check,
  Package, RefreshCw, ShoppingBag, ExternalLink,
} from "lucide-react";
import { getBrandInfo } from "@/components/BrandLogos";
import OtpButton from "@/components/OtpButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUND";

type OrderData = {
  id:               string;
  merchantRef:      string;
  reference:        string | null;
  status:           OrderStatus;
  amount:           number;
  payerName:        string | null;
  paymentMethod:    string | null;
  paymentName:      string | null;
  checkoutUrl:      string | null;
  paidAt:           string | null;
  expiredAt:        string | null;
  createdAt:        string;
  delivered:        boolean;
  deliveredAccount: string | null;
  product: {
    title:        string;
    category:     string;
    imageUrl:     string | null;
    price:        number;
    isOtpEnabled: boolean;
  };
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}

function formatDate(s: string | null) {
  if (!s) return "-";
  return new Date(s).toLocaleString("id-ID", {
    timeZone:  "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  }) + " WIB";
}

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, {
  icon:    React.ReactNode;
  label:   string;
  color:   string;
  bgColor: string;
  border:  string;
  desc:    string;
}> = {
  PAID: {
    icon:    <CheckCircle2 className="w-8 h-8 text-green-400" />,
    label:   "Pembayaran Berhasil",
    color:   "text-green-400",
    bgColor: "bg-green-500/10",
    border:  "border-green-500/20",
    desc:    "Pesanan Anda sedang diproses.",
  },
  PENDING: {
    icon:    <Clock className="w-8 h-8 text-amber-400" />,
    label:   "Menunggu Pembayaran",
    color:   "text-amber-400",
    bgColor: "bg-amber-500/10",
    border:  "border-amber-500/20",
    desc:    "Selesaikan pembayaran Anda sebelum batas waktu.",
  },
  FAILED: {
    icon:    <XCircle className="w-8 h-8 text-red-400" />,
    label:   "Pembayaran Gagal",
    color:   "text-red-400",
    bgColor: "bg-red-500/10",
    border:  "border-red-500/20",
    desc:    "Transaksi gagal. Silakan coba kembali.",
  },
  EXPIRED: {
    icon:    <XCircle className="w-8 h-8 text-neutral-400" />,
    label:   "Transaksi Kedaluwarsa",
    color:   "text-neutral-400",
    bgColor: "bg-neutral-500/10",
    border:  "border-neutral-700",
    desc:    "Batas waktu pembayaran telah habis.",
  },
  REFUND: {
    icon:    <RefreshCw className="w-8 h-8 text-purple-400" />,
    label:   "Refund Diproses",
    color:   "text-purple-400",
    bgColor: "bg-purple-500/10",
    border:  "border-purple-500/20",
    desc:    "Dana Anda sedang dikembalikan.",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const merchantRef = params.merchantRef as string;

  const [order,    setOrder]    = useState<OrderData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied,   setCopied]   = useState(false);

  // ── Fetch Order ─────────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    try {
      const res  = await fetch(`/api/orders/${merchantRef}`);
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      setOrder(data);
      setLoading(false);
    } catch {
      setNotFound(true);
      setLoading(false);
    }
  }, [merchantRef]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ── Polling setiap 3 detik jika masih PENDING ───────────────────────────────
  useEffect(() => {
    if (!order || order.status !== "PENDING") return;

    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  const handleCopyAccount = () => {
    if (!order?.deliveredAccount) return;
    navigator.clipboard.writeText(order.deliveredAccount).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
      <p className="text-neutral-500 text-sm">Memuat detail pesanan...</p>
    </div>
  );

  if (notFound || !order) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4 gap-6">
      <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-neutral-500" />
      </div>
      <h1 className="text-2xl font-semibold text-white">Order Tidak Ditemukan</h1>
      <p className="text-neutral-400 text-sm text-center max-w-sm">
        Order dengan referensi <code className="text-white bg-neutral-800 px-1.5 py-0.5 rounded">{merchantRef}</code> tidak ditemukan di sistem kami.
      </p>
      <Link href="/products">
        <button className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl font-medium text-sm transition-colors">
          Belanja Lagi
        </button>
      </Link>
    </div>
  );

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const brandInfo = getBrandInfo(order.product.category);
  const BrandLogo = brandInfo.Logo;

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 selection:bg-white/20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neutral-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 sm:py-20">
        
        {/* ── Status Card ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${statusCfg.bgColor} border ${statusCfg.border} rounded-3xl p-6 text-center mb-6`}
        >
          <div className="flex justify-center mb-3">
            {statusCfg.icon}
          </div>
          <h1 className={`text-xl font-bold ${statusCfg.color} mb-1`}>{statusCfg.label}</h1>
          <p className="text-neutral-400 text-sm">{statusCfg.desc}</p>
          
          {/* Polling indicator */}
          {order.status === "PENDING" && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-400/70 text-xs">Memeriksa status otomatis...</span>
            </div>
          )}

          {/* CTA untuk PENDING */}
          {order.status === "PENDING" && order.checkoutUrl && (
            <a
              href={order.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Bayar Sekarang <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </motion.div>

        {/* ── Produk Info ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] border border-neutral-800/80 rounded-3xl p-6 mb-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Detail Pesanan
          </h2>

          {/* Product */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-neutral-800">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: brandInfo.bg, border: `1px solid ${brandInfo.border}` }}
            >
              <BrandLogo className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: brandInfo.color }}>
                {order.product.category}
              </p>
              <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
                {order.product.title}
              </p>
            </div>
          </div>

          {/* Detail Rows */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Merchant Ref</span>
              <span className="text-neutral-200 font-mono text-xs">{order.merchantRef}</span>
            </div>
            {order.reference && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Tripay Ref</span>
                <span className="text-neutral-200 font-mono text-xs">{order.reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Nominal</span>
              <span className="text-white font-bold">{formatRupiah(order.amount)}</span>
            </div>
            {order.paymentName && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode</span>
                <span className="text-neutral-300">{order.paymentName}</span>
              </div>
            )}
            {order.payerName && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Pembeli</span>
                <span className="text-neutral-300">{order.payerName}</span>
              </div>
            )}
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Dibayar</span>
                <span className="text-green-400 text-xs">{formatDate(order.paidAt)}</span>
              </div>
            )}
            {order.expiredAt && order.status === "PENDING" && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Batas Bayar</span>
                <span className="text-amber-400 text-xs">{formatDate(order.expiredAt)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Akun Digital (hanya jika PAID + delivered) ───────────────────── */}
        <AnimatePresence>
          {order.status === "PAID" && order.delivered && order.deliveredAccount && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0a0a] border border-green-500/20 rounded-3xl p-6 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-400" />
                  <h2 className="text-sm font-semibold text-green-400">Akun Digital Anda</h2>
                </div>
                <button
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium transition-colors"
                >
                  {copied
                    ? <><Check className="w-3 h-3" /> Tersalin!</>
                    : <><Copy className="w-3 h-3" /> Salin</>
                  }
                </button>
              </div>

              <div className="bg-black/40 border border-neutral-800 rounded-xl p-4">
                <pre className="text-neutral-200 text-sm font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {order.deliveredAccount}
                </pre>
              </div>

              <p className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
                ⚠️ Jangan bagikan detail akun ini kepada siapa pun.
              </p>

              {/* ── Tombol OTP ───────────────────────────────────────────── */}
              <div className="mt-4">
                <OtpButton
                  merchantRef={order.merchantRef}
                  isOtpEnabled={order.product.isOtpEnabled}
                  deliveredAccount={order.deliveredAccount}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PAID belum terkirim ─────────────────────────────────────────── */}
        {order.status === "PAID" && !order.delivered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4 text-center"
          >
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-amber-300 text-sm font-medium">Memproses pengiriman akun...</p>
            <p className="text-amber-400/60 text-xs mt-1">Cek juga Telegram kamu ya!</p>
          </motion.div>
        )}

        {/* ── Footer Actions ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/products" className="flex-1">
            <button className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-sm font-medium rounded-2xl transition-colors">
              Belanja Lagi
            </button>
          </Link>
          <button
            onClick={fetchOrder}
            className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

      </div>
    </div>
  );
}
