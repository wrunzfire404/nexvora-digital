"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Check, Loader2, ChevronRight, QrCode, Store } from "lucide-react";
import { getBrandInfo } from "@/components/BrandLogos";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
};

type FormData = {
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [product,    setProduct]    = useState<Product | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  // State form
  const [form, setForm] = useState<FormData>({
    customerName:  "",
    customerEmail: "",
    customerPhone: "",
    paymentMethod: "QRIS", // default: QRIS
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ─── Fetch Produk ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/products/${params.id}`)
      .then(r => {
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) setProduct(d);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [params.id]);

  // ─── Update Field Form ──────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setErrorMsg(null);
    },
    []
  );

  // ─── Validasi Form ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      newErrors.customerName = "Nama minimal 2 karakter.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.customerEmail || !emailRegex.test(form.customerEmail)) {
      newErrors.customerEmail = "Masukkan alamat email yang valid.";
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!form.customerPhone || !phoneRegex.test(form.customerPhone.replace(/\s/g, ""))) {
      newErrors.customerPhone = "Nomor WhatsApp tidak valid (contoh: 08123...).";
    }

    if (!form.paymentMethod) {
      newErrors.paymentMethod = "Pilih metode pembayaran.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !product) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId:     product.id,
          paymentMethod: form.paymentMethod,
          customerName:  form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error ?? data.detail ?? "Gagal memproses pembayaran.");
        setSubmitting(false);
        return;
      }

      // Redirect to Tripay
      router.push(data.checkoutUrl);

    } catch (err) {
      console.error("[Checkout] Fetch error:", err);
      setErrorMsg("Koneksi bermasalah. Periksa jaringan Anda.");
      setSubmitting(false);
    }
  };

  // ─── Loading & Not Found Views ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
      <p className="text-neutral-500 text-sm font-medium">Menyiapkan checkout...</p>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-6">
        <Store className="w-8 h-8 text-neutral-500" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Produk Tidak Ditemukan</h1>
      <p className="text-neutral-400 mb-8 text-center max-w-sm">
        Produk yang Anda cari mungkin sudah dihapus atau tidak tersedia saat ini.
      </p>
      <Link href="/products">
        <button className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl font-medium transition-colors">
          Kembali ke Katalog
        </button>
      </Link>
    </div>
  );

  const brandInfo = getBrandInfo(product.category);
  const BrandLogo = brandInfo.Logo;
  const totalPrice = product.price;

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 font-sans selection:bg-white/20">
      {/* Subtle Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center">
        <div className="absolute top-[-20%] w-[800px] h-[500px] bg-neutral-800/20 rounded-full blur-[120px]" />
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="bg-[#111111] border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)] rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-sm">✕</span>
              </div>
              <div className="flex-1">
                <p className="text-neutral-100 font-medium text-sm mb-1">Terjadi Kesalahan</p>
                <p className="text-neutral-400 text-xs leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-neutral-500 hover:text-neutral-300">
                <span className="sr-only">Tutup</span>
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Header / Nav */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-6">
            <Link href="/products" className="hover:text-neutral-300 transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-300 line-clamp-1 max-w-[200px]">{product.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Checkout</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Secure Checkout</h1>
          <p className="text-neutral-400 text-sm mt-2">Selesaikan pembayaran Anda untuk mendapatkan akses instan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ─── LEFT COLUMN: Form & Payment ─── */}
          <div className="lg:col-span-7 space-y-10">
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Customer Details */}
              <section>
                <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-xs border border-neutral-700">1</span>
                  Informasi Kontak
                </h2>
                
                <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-xs font-medium text-neutral-400 mb-1.5">Nama Lengkap</label>
                      <input
                        id="name"
                        type="text"
                        value={form.customerName}
                        onChange={e => handleChange("customerName", e.target.value)}
                        placeholder="John Doe"
                        className={`w-full bg-[#111] border ${errors.customerName ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-neutral-600'} rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all`}
                      />
                      {errors.customerName && <p className="text-red-400 text-[11px] mt-1.5">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-neutral-400 mb-1.5">Alamat Email</label>
                      <input
                        id="email"
                        type="email"
                        value={form.customerEmail}
                        onChange={e => handleChange("customerEmail", e.target.value)}
                        placeholder="john@example.com"
                        className={`w-full bg-[#111] border ${errors.customerEmail ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-neutral-600'} rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all`}
                      />
                      {errors.customerEmail && <p className="text-red-400 text-[11px] mt-1.5">{errors.customerEmail}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-neutral-400 mb-1.5">WhatsApp</label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.customerPhone}
                        onChange={e => handleChange("customerPhone", e.target.value)}
                        placeholder="08123456789"
                        className={`w-full bg-[#111] border ${errors.customerPhone ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-neutral-600'} rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all`}
                      />
                      {errors.customerPhone && <p className="text-red-400 text-[11px] mt-1.5">{errors.customerPhone}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-xs border border-neutral-700">2</span>
                    Metode Pembayaran
                  </h2>
                </div>

                <div className="space-y-3">
                  
                  {/* QRIS (Highlighted) */}
                  <div
                    onClick={() => handleChange("paymentMethod", "QRIS")}
                    className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                      form.paymentMethod === "QRIS"
                        ? "bg-[#111111] border-white ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.03)]"
                        : "bg-[#0a0a0a] border-neutral-800/80 hover:border-neutral-700"
                    }`}
                  >
                    {/* Active Indicator */}
                    <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      form.paymentMethod === "QRIS" ? "bg-white border-white" : "border-neutral-600"
                    }`}>
                      {form.paymentMethod === "QRIS" && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 flex items-center justify-center flex-shrink-0">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div className="pr-8">
                        <h3 className="text-sm font-semibold text-white mb-1">QRIS (Semua E-Wallet)</h3>
                        <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                          Bayar instan menggunakan aplikasi E-Wallet atau Mobile Banking pilihan Anda.
                        </p>
                        {/* E-Wallet Pills */}
                        <div className="flex flex-wrap gap-2">
                          {["DANA", "OVO", "GoPay", "ShopeePay", "LinkAja"].map(wallet => (
                            <span key={wallet} className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[10px] font-medium text-neutral-300">
                              {wallet}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Minimart Options (2 Columns) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Alfamart */}
                    <div
                      onClick={() => handleChange("paymentMethod", "ALFAMART")}
                      className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                        form.paymentMethod === "ALFAMART"
                          ? "bg-[#111111] border-white ring-1 ring-white/20"
                          : "bg-[#0a0a0a] border-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        form.paymentMethod === "ALFAMART" ? "bg-white border-white" : "border-neutral-600"
                      }`}>
                        {form.paymentMethod === "ALFAMART" && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                          🏪
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Alfamart</h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Bayar di kasir</p>
                        </div>
                      </div>
                    </div>

                    {/* Indomaret */}
                    <div
                      onClick={() => handleChange("paymentMethod", "INDOMARET")}
                      className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                        form.paymentMethod === "INDOMARET"
                          ? "bg-[#111111] border-white ring-1 ring-white/20"
                          : "bg-[#0a0a0a] border-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        form.paymentMethod === "INDOMARET" ? "bg-white border-white" : "border-neutral-600"
                      }`}>
                        {form.paymentMethod === "INDOMARET" && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                          🏬
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Indomaret</h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Bayar di kasir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.paymentMethod && <p className="text-red-400 text-xs mt-2">{errors.paymentMethod}</p>}

                </div>
              </section>

            </form>
          </div>

          {/* ─── RIGHT COLUMN: Order Summary (Sticky) ─── */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-3xl p-6 relative overflow-hidden">
                {/* Decorative background glow for the card */}
                <div 
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: brandInfo.color }}
                />

                <h2 className="text-base font-semibold text-white mb-6">Ringkasan Pesanan</h2>
                
                {/* Product Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-800/80">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: brandInfo.bg, border: `1px solid ${brandInfo.border}` }}
                  >
                    <BrandLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider uppercase mb-1" style={{ color: brandInfo.color }}>
                      {product.category}
                    </p>
                    <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </div>
                </div>

                {/* Calculation */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-neutral-200">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Biaya Layanan</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs font-medium border border-white/10">Gratis</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-5 border-t border-neutral-800/80 flex justify-between items-center mb-8">
                  <span className="text-sm font-medium text-neutral-300">Total Pembayaran</span>
                  <span className="text-2xl font-semibold text-white tracking-tight">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full relative group overflow-hidden rounded-2xl p-[1px] transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white text-black font-medium text-sm w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-neutral-200">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                        <span className="text-neutral-600">Memproses aman...</span>
                      </>
                    ) : (
                      <>
                        <span>Bayar Sekarang</span>
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </>
                    )}
                  </div>
                </button>
                
                <p className="text-center text-[11px] text-neutral-500 mt-4 px-4">
                  Dengan mengklik tombol di atas, Anda menyetujui <Link href="/syarat-ketentuan" className="text-neutral-400 hover:text-white underline decoration-neutral-700 underline-offset-2">Syarat & Ketentuan</Link> yang berlaku.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-2">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-200">Enkripsi 256-bit</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Pembayaran 100% aman</p>
                  </div>
                </div>
                <div className="bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-200">Instan Delivery</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Produk dikirim otomatis</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
