import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, ArrowRight, Store, AlertCircle, RefreshCw } from "lucide-react";

// Halaman ini bersifat dinamis
export const dynamic = "force-dynamic";

/**
 * Return URL dari Tripay mengandung parameter:
 *   ?tripay_reference=T49696...&tripay_merchant_ref=NVD-...
 *
 * Halaman ini membaca SEMUA kombinasi parameter yang mungkin dikirim Tripay.
 */
export default async function GlobalCheckoutStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Tripay mengirim: tripay_merchant_ref ATAU merchant_ref ATAU reference ATAU tripay_reference
  const merchantRef =
    (params.tripay_merchant_ref as string) ||
    (params.merchant_ref as string) ||
    null;

  const tripayRef =
    (params.tripay_reference as string) ||
    (params.reference as string) ||
    null;

  // Jika tidak ada parameter sama sekali → halaman kosong biasa
  if (!merchantRef && !tripayRef) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 font-sans selection:bg-white/20">
        <div className="w-16 h-16 bg-[#111111] border border-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-white/5">
          <Store className="w-8 h-8 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Halaman Pembayaran</h1>
        <p className="text-neutral-400 mb-8 max-w-sm text-center text-sm leading-relaxed">
          Silakan pilih produk dari katalog kami untuk memulai transaksi baru.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-sm"
        >
          Lihat Katalog Produk
        </Link>
      </div>
    );
  }

  // ── Cari order: coba merchantRef dulu, lalu tripayRef ────────────────────────
  let order = null;

  if (merchantRef) {
    order = await prisma.order.findFirst({
      where: { merchantRef },
      include: { product: true },
    });
  }

  if (!order && tripayRef) {
    order = await prisma.order.findFirst({
      where: { reference: tripayRef },
      include: { product: true },
    });
  }

  // ── Order tidak ditemukan ─────────────────────────────────────────────────────
  if (!order) {
    const displayRef = merchantRef || tripayRef || "-";
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-neutral-500 mb-2 text-center text-sm">
          Pesanan mungkin masih diproses atau referensi tidak valid.
        </p>
        <p className="text-neutral-600 mb-8 text-center text-xs font-mono">{displayRef}</p>
        <Link
          href="/products"
          className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 border border-neutral-800 transition-colors text-sm"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return <OrderStatusCard order={order} />;
}

// ─── Komponen Status Card ─────────────────────────────────────────────────────

function OrderStatusCard({ order }: { order: any }) {
  const isPending = order.status === "PENDING" || order.status === "UNPAID";
  const isPaid    = order.status === "PAID";
  const isFailed  = order.status === "FAILED" || order.status === "EXPIRED" || order.status === "REFUND";

  // Ambil akun dari order product jika sudah delivered
  // CATATAN: accountStock tidak di-expose langsung — kita tampilkan info dari order.delivered
  const isDelivered  = order.delivered;
  const deliveryMode = order.product?.deliveryMode ?? "INSTANT";

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans selection:bg-white/20">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
        <div className={`w-[600px] h-[400px] rounded-full blur-[120px] opacity-15 transition-colors duration-1000 ${
          isPaid ? "bg-emerald-600" : isFailed ? "bg-red-600" : "bg-blue-600"
        }`} />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Main Card */}
        <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-2xl">

          {/* Status Header */}
          <div className="flex flex-col items-center text-center border-b border-neutral-800/80 pb-6 mb-6">
            {isPending && (
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            )}
            {isPaid && (
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            )}
            {isFailed && (
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            )}

            <h1 className="text-xl font-semibold text-white mb-1">
              {isPending ? "Menunggu Pembayaran" : isPaid ? "Pembayaran Berhasil! 🎉" : "Pembayaran Gagal"}
            </h1>
            <p className="text-xs text-neutral-500 font-mono mt-1 break-all">{order.merchantRef}</p>
          </div>

          {/* Order Info */}
          <div className="space-y-3 mb-6">
            <div className="bg-[#111111] border border-neutral-800/50 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
                {order.product?.category}
              </p>
              <p className="text-sm font-medium text-white">{order.product?.title}</p>
            </div>

            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-neutral-500">Metode</span>
              <span className="text-neutral-200 font-medium">
                {order.paymentName ?? order.paymentMethod ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-neutral-500">Total</span>
              <span className="text-white font-semibold">
                Rp {order.amount?.toLocaleString("id-ID")}
              </span>
            </div>
            {isPaid && order.paidAt && (
              <div className="flex justify-between items-center text-sm px-1">
                <span className="text-neutral-500">Dibayar</span>
                <span className="text-emerald-400 text-xs font-medium">
                  {new Date(order.paidAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}WIB
                </span>
              </div>
            )}
          </div>

          {/* ── PAID State ─────────────────────────────────────────────── */}
          {isPaid && (
            <div className="space-y-4">
              {isDelivered ? (
                <>{
                  /* ─── STATUS BANNER ─── */
                }
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <p className="text-emerald-400 font-semibold text-sm">
                    ✅ Akun Berhasil Dikirim!
                  </p>
                  <p className="text-emerald-500/70 text-xs mt-1 leading-relaxed">
                    Tersimpan juga di inbox{" "}
                    <span className="font-mono text-emerald-400">{order.payerEmail}</span>
                  </p>
                </div>

                {/* ─── ACCOUNT DATA BOX ─── */}
                {order.deliveredAccount && (
                  <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-purple-950/40 border border-blue-500/25 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-blue-500/15">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🔑</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Detail Akun Digital</p>
                        <p className="text-blue-500/60 text-[10px] mt-0.5">{order.product?.title}</p>
                      </div>
                    </div>

                    {/* Account Lines */}
                    <div className="p-4 space-y-2">
                      {order.deliveredAccount.split("\n").filter((l: string) => l.trim()).map((line: string, i: number) => (
                        <div
                          key={i}
                          className="bg-black/40 border border-white/5 rounded-xl px-4 py-3"
                        >
                          <code className="text-blue-100 text-sm font-mono break-all leading-relaxed block">
                            {line}
                          </code>
                        </div>
                      ))}
                    </div>

                    {/* Warning */}
                    <div className="px-5 pb-4">
                      <p className="text-[10px] text-blue-500/50 leading-relaxed">
                        ⚠️ Jangan bagikan detail akun ini kepada siapapun. Segera ganti password setelah login.
                      </p>
                    </div>
                  </div>
                )}

                </>
              ) : deliveryMode === "INSTANT" ? (
                // INSTANT tapi belum delivered (webhook miss) — arahkan cek status
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center">
                  <p className="text-amber-400 font-semibold text-sm mb-1">⏳ Mengirim Akun...</p>
                  <p className="text-amber-500/70 text-xs leading-relaxed mb-3">
                    Sistem sedang memproses pengiriman akun ke email Anda. Biasanya hanya beberapa detik.
                  </p>
                  {/* Tombol refresh untuk cek ulang */}
                  <a
                    href={`?tripay_merchant_ref=${order.merchantRef}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Cek Ulang Status
                  </a>
                </div>
              ) : deliveryMode === "MANUAL" ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center">
                  <p className="text-blue-400 font-semibold text-sm mb-1">📎 Diproses Admin</p>
                  <p className="text-blue-500/70 text-xs leading-relaxed">
                    Pesanan Anda sedang diproses oleh admin. Akun akan dikirim ke email Anda dalam waktu singkat.
                    Butuh bantuan? Hubungi <span className="font-semibold text-blue-400">@wrunzfire</span>.
                  </p>
                </div>
              ) : deliveryMode === "PO" ? (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center">
                  <p className="text-purple-400 font-semibold text-sm mb-1">📅 Pre-Order Dikonfirmasi</p>
                  <p className="text-purple-500/70 text-xs leading-relaxed">
                    Terima kasih! Pesanan Pre-Order Anda telah dikonfirmasi. Akun akan dikirim sesuai estimasi yang telah diinformasikan.
                  </p>
                </div>
              ) : null}

              {/* Info email — hanya tampil jika sudah delivered */}
              {isDelivered && (
                <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">📧</span>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Salinan invoice & akun juga dikirim ke{" "}
                    <span className="text-neutral-200 font-mono">{order.payerEmail}</span>.
                    Jika tidak ada, cek folder Spam.
                  </p>
                </div>
              )}

              <Link
                href="/products"
                className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-800 transition-colors text-sm border border-neutral-800"
              >
                Belanja Lagi
              </Link>
            </div>
          )}

          {/* ── PENDING State ───────────────────────────────────────────── */}
          {isPending && (
            <div className="space-y-3">
              <a
                href={order.checkoutUrl}
                className="w-full py-3.5 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors text-sm"
              >
                Lanjutkan Pembayaran <ArrowRight className="w-4 h-4" />
              </a>
              {order.expiredAt && (
                <p className="text-center text-[11px] text-neutral-500">
                  Berlaku hingga:{" "}
                  {new Date(order.expiredAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}WIB
                </p>
              )}
            </div>
          )}

          {/* ── FAILED / EXPIRED State ─────────────────────────────────── */}
          {isFailed && (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 text-xs">
                  {order.status === "EXPIRED"
                    ? "Transaksi ini sudah kadaluwarsa."
                    : "Pembayaran gagal atau dibatalkan."}
                  {" "}Silakan buat pesanan baru.
                </p>
              </div>
              <Link
                href={`/products`}
                className="w-full py-3.5 bg-white text-black font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors text-sm"
              >
                Buat Pesanan Baru
              </Link>
            </div>
          )}

        </div>

        {/* Nomor Resi */}
        {order.reference && (
          <p className="text-center text-[11px] text-neutral-600 font-mono mt-4">
            Resi Tripay: {order.reference}
          </p>
        )}

      </div>
    </div>
  );
}
