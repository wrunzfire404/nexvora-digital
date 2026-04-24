"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Order = {
  id: string;
  merchantRef: string;
  reference: string | null;
  status: string;
  amount: number;
  payerName: string | null;
  payerEmail: string | null;
  paymentMethod: string | null;
  paymentName: string | null;
  delivered: boolean;
  createdAt: string;
  paidAt: string | null;
  product: {
    title: string;
    category: string;
    imageUrl: string | null;
    deliveryMode: string;
  };
};

const STATUS_COLORS: Record<string, string> = {
  PAID:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  FAILED:  "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  REFUND:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const DELIVERY_MODE_LABELS: Record<string, { label: string; color: string }> = {
  INSTANT: { label: "⚡ Instant",  color: "text-cyan-400" },
  MANUAL:  { label: "✋ Manual",   color: "text-orange-400" },
  PO:      { label: "📅 PO",       color: "text-purple-400" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Modal kirim manual
  const [modal, setModal]             = useState<Order | null>(null);
  const [accountInput, setAccountInput] = useState("");
  const [sending, setSending]         = useState(false);
  const [sendResult, setSendResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res  = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Kirim manual dari modal
  const handleManualDeliver = async () => {
    if (!modal || !accountInput.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantRef: modal.merchantRef,
          accountData: accountInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({ ok: true, msg: data.message });
        // Refresh list setelah kirim
        setTimeout(() => {
          setModal(null);
          setSendResult(null);
          setAccountInput("");
          fetchOrders();
        }, 1800);
      } else {
        setSendResult({ ok: false, msg: data.error || "Gagal mengirim akun" });
      }
    } catch {
      setSendResult({ ok: false, msg: "Koneksi error, coba lagi" });
    } finally {
      setSending(false);
    }
  };

  const formatRupiah = (n: number) =>
    n.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" }) : "-";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manajemen Orders</h1>
          <p className="text-slate-400 mt-1">Total <span className="text-white font-semibold">{total}</span> order ditemukan</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["", "PAID", "PENDING", "FAILED", "EXPIRED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statusFilter === s
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {s || "Semua"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">📭</p>
          <p>Tidak ada order dengan filter ini</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Pembeli</th>
                <th className="px-4 py-3 text-left">Nominal</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Terkirim</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orders.map((order) => {
                const mode = DELIVERY_MODE_LABELS[order.product.deliveryMode] ?? { label: order.product.deliveryMode, color: "text-slate-400" };
                const needsAction = order.status === "PAID" && !order.delivered;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`bg-slate-900/40 hover:bg-slate-800/60 transition-colors ${needsAction ? "ring-1 ring-inset ring-orange-500/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-[160px]">{order.product.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{order.product.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300">{order.payerName ?? "-"}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[140px]">{order.payerEmail ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                      {formatRupiah(order.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${mode.color}`}>{mode.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "PAID" ? (
                        order.delivered ? (
                          <span className="text-emerald-400 text-xs font-semibold">✅ Terkirim</span>
                        ) : (
                          <span className="text-orange-400 text-xs font-semibold animate-pulse">⏳ Belum Kirim</span>
                        )
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.status === "PAID" && !order.delivered ? (
                        <button
                          onClick={() => { setModal(order); setAccountInput(""); setSendResult(null); }}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          📤 Kirim Manual
                        </button>
                      ) : order.status === "PAID" ? (
                        <span className="text-slate-600 text-xs">—</span>
                      ) : (
                        <span className="text-slate-700 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal Kirim Manual */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setModal(null); } }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-1">📤 Kirim Akun Manual</h2>
              <p className="text-slate-400 text-sm mb-5">
                Order: <code className="text-blue-400">{modal.merchantRef}</code>
                {" | "}{modal.product.title}
              </p>

              <div className="bg-slate-800/60 rounded-xl p-4 mb-4 space-y-1.5 text-sm">
                <p><span className="text-slate-400">Pembeli:</span> <span className="text-white">{modal.payerName ?? "-"}</span></p>
                <p><span className="text-slate-400">Email/Chat:</span> <span className="text-blue-300 font-mono text-xs">{modal.payerEmail ?? "-"}</span></p>
                <p><span className="text-slate-400">Nominal:</span> <span className="text-white font-semibold">{formatRupiah(modal.amount)}</span></p>
              </div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Detail Akun <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder="Contoh:\nemail@example.com:password123\n\nAtau format apapun yang dibutuhkan produk ini."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Akun ini akan dikirim langsung ke Telegram pembeli.
              </p>

              {sendResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    sendResult.ok
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {sendResult.ok ? "✅ " : "❌ "}{sendResult.msg}
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setModal(null); setSendResult(null); setAccountInput(""); }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                  disabled={sending}
                >
                  Batal
                </button>
                <button
                  onClick={handleManualDeliver}
                  disabled={sending || !accountInput.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {sending ? "Mengirim..." : "📤 Kirim ke Pembeli"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
