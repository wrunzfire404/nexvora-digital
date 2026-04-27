"use client";

/**
 * components/OtpButton.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tombol "Minta Kode Verifikasi" untuk halaman Invoice/Order Detail web.
 *
 * Kondisi render:
 *   - isOtpEnabled === true (dari produk)
 *   - deliveredAccount mengandung email @booplink.xyz
 *
 * Saat diklik:
 *   1. Hit POST /api/otp dengan { merchantRef }
 *   2. Tampilkan hasilnya dalam Modal atau Toast Notification
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, X, Copy, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OtpButtonProps {
  merchantRef:      string;
  isOtpEnabled:     boolean;
  deliveredAccount?: string | null;  // Untuk cek apakah @booplink.xyz
}

interface OtpModalData {
  otp:        string | null;
  subject:    string | null;
  from:       string | null;
  rawMessage: string | null;
  email:      string | null;
  product:    string | null;
  error?:     string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function hasBooployEmail(account: string | null | undefined): boolean {
  if (!account) return false;
  return /@booplink\.xyz/i.test(account);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OtpButton({ merchantRef, isOtpEnabled, deliveredAccount }: OtpButtonProps) {
  const [loading,   setLoading]   = useState(false);
  const [modal,     setModal]     = useState<OtpModalData | null>(null);
  const [copied,    setCopied]    = useState(false);

  // Kondisi: hanya render jika isOtpEnabled dan email @booplink.xyz
  if (!isOtpEnabled || !hasBooployEmail(deliveredAccount)) return null;

  // ── Handler ─────────────────────────────────────────────────────────────────
  const handleRequestOtp = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res  = await fetch("/api/otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ merchantRef }),
      });

      const data = await res.json();

      if (data.success) {
        setModal({
          otp:        data.otp,
          subject:    data.subject,
          from:       data.from,
          rawMessage: data.rawMessage,
          email:      data.email,
          product:    data.product,
        });
      } else {
        setModal({
          otp:        null,
          subject:    null,
          from:       null,
          rawMessage: null,
          email:      null,
          product:    null,
          error:      data.error ?? "Gagal mengambil kode OTP.",
        });
      }
    } catch {
      setModal({
        otp:        null,
        subject:    null,
        from:       null,
        rawMessage: null,
        email:      null,
        product:    null,
        error:      "Koneksi ke server gagal. Coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!modal?.otp) return;
    navigator.clipboard.writeText(modal.otp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Tombol OTP ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleRequestOtp}
        disabled={loading}
        id="otp-request-btn"
        className="
          w-full flex items-center justify-center gap-2.5
          px-5 py-3.5 rounded-2xl
          bg-gradient-to-r from-blue-600/20 to-cyan-600/20
          border border-blue-500/30
          text-blue-300 hover:text-blue-200
          hover:from-blue-600/30 hover:to-cyan-600/30
          hover:border-blue-400/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm font-medium
        "
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mencari kode OTP...</span>
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            <span>📥 Minta Kode Verifikasi</span>
          </>
        )}
      </button>

      {/* ── Modal Hasil OTP ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              {/* Close */}
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {modal.error ? (
                /* ── Error State ────────────────────────────────────────────── */
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">Tidak Ada Pesan</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{modal.error}</p>
                  <button
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="mt-5 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl transition-colors"
                  >
                    {loading ? "Mencari..." : "🔄 Coba Lagi"}
                  </button>
                </div>
              ) : (
                /* ── Success State ──────────────────────────────────────────── */
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Pesan Ditemukan!</h3>
                      <p className="text-neutral-500 text-xs">{modal.product ?? "Produk Digital"}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4 text-xs">
                    {modal.from && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Dari:</span>
                        <span className="text-neutral-300 font-medium truncate max-w-[200px]">{modal.from}</span>
                      </div>
                    )}
                    {modal.subject && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Subjek:</span>
                        <span className="text-neutral-300 truncate max-w-[200px]">{modal.subject}</span>
                      </div>
                    )}
                  </div>

                  {/* OTP Code Box */}
                  {modal.otp ? (
                    <div
                      onClick={handleCopy}
                      className="cursor-pointer group flex items-center justify-between bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-2xl p-4 mb-4 transition-all"
                      title="Klik untuk menyalin"
                    >
                      <div>
                        <p className="text-[11px] text-neutral-500 mb-1 font-medium uppercase tracking-wider">Kode Verifikasi / OTP</p>
                        <p className="text-3xl font-bold text-white font-mono tracking-[0.3em]">
                          {modal.otp}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        {copied
                          ? <Check className="w-4 h-4 text-green-400" />
                          : <Copy className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
                      <p className="text-amber-300 text-xs font-medium">
                        ⚠️ Pesan ditemukan tapi kode OTP tidak terdeteksi. Baca isi pesan di bawah.
                      </p>
                    </div>
                  )}

                  {/* Raw Message */}
                  {modal.rawMessage && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
                      <p className="text-[11px] text-neutral-500 mb-1.5 font-medium uppercase tracking-wider">Isi Pesan</p>
                      <p className="text-neutral-300 text-xs leading-relaxed whitespace-pre-line">
                        {modal.rawMessage}
                      </p>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-xl transition-colors"
                    >
                      {loading ? "Mencari..." : "🔄 Refresh"}
                    </button>
                    {modal.otp && (
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-2.5 bg-white text-black text-sm font-semibold rounded-xl transition-colors hover:bg-neutral-200 flex items-center justify-center gap-1.5"
                      >
                        {copied ? <><Check className="w-4 h-4" /> Tersalin!</> : <><Copy className="w-4 h-4" /> Salin OTP</>}
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
