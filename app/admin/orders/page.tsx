"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Hand, Clock, RefreshCw, Send, CheckCircle2, AlertCircle, XCircle, Search, Mailbox } from "lucide-react";

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
  PAID:    "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  FAILED:  "bg-red-100 text-red-700 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-700 border-gray-200",
  REFUND:  "bg-purple-100 text-purple-700 border-purple-200",
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Total <span className="text-gray-900 font-bold">{total}</span> order ditemukan</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["", "PAID", "PENDING", "FAILED", "EXPIRED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {s || "Semua Status"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mailbox className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Tidak ada order dengan filter ini</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                <th className="px-4 py-3 font-bold">Produk</th>
                <th className="px-4 py-3 font-bold">Pembeli</th>
                <th className="px-4 py-3 font-bold">Nominal</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Mode</th>
                <th className="px-4 py-3 font-bold">Terkirim</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const needsAction = order.status === "PAID" && !order.delivered;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 transition-colors ${needsAction ? "bg-orange-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-bold truncate max-w-[160px] line-clamp-1">{order.product.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{order.product.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium">{order.payerName ?? "-"}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[140px]">{order.payerEmail ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-bold whitespace-nowrap">
                      {formatRupiah(order.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {order.product.deliveryMode === "INSTANT" && <Zap className="w-3.5 h-3.5 text-orange-500" />}
                        {order.product.deliveryMode === "MANUAL" && <Hand className="w-3.5 h-3.5 text-blue-500" />}
                        {order.product.deliveryMode === "PO" && <Clock className="w-3.5 h-3.5 text-purple-500" />}
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                          {order.product.deliveryMode === "INSTANT" ? "Instan" : order.product.deliveryMode === "MANUAL" ? "Manual" : "PO"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "PAID" ? (
                        order.delivered ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ya
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Belum
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap font-medium">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.status === "PAID" && !order.delivered ? (
                        <button
                          onClick={() => { setModal(order); setAccountInput(""); setSendResult(null); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs font-bold rounded-lg transition-colors border border-orange-200"
                        >
                          <Send className="w-3.5 h-3.5" /> Kirim
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) { setModal(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">Kirim Akun Manual</h2>
                  <p className="text-gray-500 text-xs">
                    Order: <code className="text-blue-600 font-mono font-medium">{modal.merchantRef}</code>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
                <p><span className="text-gray-500 font-medium inline-block w-20">Produk:</span> <span className="text-gray-900 font-bold">{modal.product.title}</span></p>
                <p><span className="text-gray-500 font-medium inline-block w-20">Pembeli:</span> <span className="text-gray-900">{modal.payerName ?? "-"}</span></p>
                <p><span className="text-gray-500 font-medium inline-block w-20">Kontak:</span> <span className="text-blue-600 font-mono text-xs font-medium">{modal.payerEmail ?? "-"}</span></p>
                <p><span className="text-gray-500 font-medium inline-block w-20">Nominal:</span> <span className="text-gray-900 font-bold">{formatRupiah(modal.amount)}</span></p>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Detail Akun / Lisensi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder={"Contoh:\nemail@example.com:password123\n\nAtau format apapun yang dibutuhkan produk ini."}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Akun ini akan dikirim langsung ke Telegram pembeli.
              </p>

              {sendResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    sendResult.ok
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {sendResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {sendResult.msg}
                </motion.div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setModal(null); setSendResult(null); setAccountInput(""); }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                  disabled={sending}
                >
                  Batal
                </button>
                <button
                  onClick={handleManualDeliver}
                  disabled={sending || !accountInput.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Mengirim...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Kirim Sekarang</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
