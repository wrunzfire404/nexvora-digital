"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string; category: string;
};

const SERVICE_MAP: Record<string, { Logo: React.ComponentType<{ className?: string }>; accent: string; bg: string; border: string }> = {
  "netflix":  { Logo: NetflixLogo,  accent: "#E50914", bg: "from-[#1a0000] to-[#050a14]", border: "border-[#E50914]/20" },
  "spotify":  { Logo: SpotifyLogo,  accent: "#1DB954", bg: "from-[#001a07] to-[#050a14]", border: "border-[#1DB954]/20" },
  "youtube":  { Logo: YouTubeLogo,  accent: "#FF0000", bg: "from-[#1a0000] to-[#050a14]", border: "border-[#FF0000]/20" },
  "disney+":  { Logo: DisneyLogo,   accent: "#0063E5", bg: "from-[#000b1e] to-[#050a14]", border: "border-[#0063E5]/20" },
  "chatgpt":  { Logo: ChatGPTLogo,  accent: "#74AA9C", bg: "from-[#0a1410] to-[#050a14]", border: "border-[#74AA9C]/20" },
  "canva":    { Logo: CanvaLogo,    accent: "#7D2AE7", bg: "from-[#0d0014] to-[#050a14]", border: "border-[#7D2AE7]/20" },
};

export default function CheckoutPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; whatsapp?: string }>({});

  // Toast state
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/products/${params.id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => { if (d) setProduct(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.id]);

  const validate = () => {
    const newErrors: { email?: string; whatsapp?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Masukkan alamat email yang valid.";
    }
    if (!whatsapp || !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(whatsapp.replace(/\s/g, ""))) {
      newErrors.whatsapp = "Masukkan nomor WhatsApp Indonesia yang valid (contoh: 08123456789).";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowToast(true);
    setTimeout(() => setShowToast(false), 6000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Memuat halaman checkout...</p>
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-black text-white mb-3">Produk Tidak Ditemukan</h1>
      <p className="text-slate-400 mb-8">Produk tidak tersedia atau sudah tidak aktif.</p>
      <Link href="/products">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">← Kembali ke Katalog</button>
      </Link>
    </div>
  );

  const svc = SERVICE_MAP[product.category.toLowerCase()];
  const totalPrice = product.price;

  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[130px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -80, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-24 left-1/2 z-[100] w-[90vw] max-w-md"
          >
            <div className="bg-[#0f1a2e] border border-yellow-500/30 rounded-2xl p-5 shadow-[0_0_60px_rgba(234,179,8,0.15)] backdrop-blur-xl flex gap-4 items-start">
              <div className="text-2xl flex-shrink-0 mt-0.5">🔧</div>
              <div>
                <p className="text-yellow-400 font-bold text-sm mb-1">Sistem Pembayaran Tidak Tersedia</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Mohon maaf, sistem pembayaran sedang dalam tahap pemeliharaan/integrasi Tripay.
                  Silakan coba beberapa saat lagi.
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/products" className="hover:text-white transition-colors">Katalog</Link>
          <span>/</span>
          <Link href={`/products/${product.id}`} className="hover:text-white transition-colors line-clamp-1 max-w-[160px]">{product.title}</Link>
          <span>/</span>
          <span className="text-slate-400">Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Konfirmasi Pesanan</h1>
        <p className="text-slate-500 text-sm mb-10">Isi data pembeli Anda untuk melanjutkan proses pembayaran.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ─── LEFT: Buyer Form ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/3 border border-white/8 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <p className="text-white font-bold text-base mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">1</span>
                Data Pembeli
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="checkout-email" className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    Alamat Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                    placeholder="contoh@email.com"
                    className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/50 ${
                      errors.email ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-blue-500/60"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                  <p className="text-slate-600 text-xs mt-1.5">
                    Konfirmasi produk digital akan dikirim ke email ini.
                  </p>
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="checkout-wa" className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    Nomor WhatsApp
                  </label>
                  <input
                    id="checkout-wa"
                    type="tel"
                    value={whatsapp}
                    onChange={e => { setWhatsapp(e.target.value); setErrors(prev => ({ ...prev, whatsapp: undefined })); }}
                    placeholder="08123456789"
                    className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/50 ${
                      errors.whatsapp ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-blue-500/60"
                    }`}
                  />
                  {errors.whatsapp && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.whatsapp}
                    </p>
                  )}
                  <p className="text-slate-600 text-xs mt-1.5">
                    Untuk notifikasi status pesanan via WhatsApp.
                  </p>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <span className="text-blue-400 text-base mt-0.5">🔒</span>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Data Anda dilindungi enkripsi SSL dan tidak akan dibagikan kepada pihak ketiga.
                    Baca <Link href="/kebijakan-privasi" className="text-blue-400 hover:underline">Kebijakan Privasi</Link> kami.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 mt-2"
                  style={{
                    background: "linear-gradient(135deg, #1a6cff, #0041cc)",
                    boxShadow: "0 0 30px rgba(26,108,255,0.4)",
                  }}
                >
                  🔐 Lanjut ke Pembayaran
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* ─── RIGHT: Order Summary ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 lg:sticky lg:top-24"
          >
            <div className={`bg-gradient-to-br ${svc?.bg || "from-slate-800 to-[#050a14]"} border ${svc?.border || "border-white/10"} rounded-3xl p-6 backdrop-blur-sm`}>
              <p className="text-white font-bold text-base mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-xs">📋</span>
                Ringkasan Pesanan
              </p>

              {/* Product card */}
              <div className="bg-black/20 rounded-2xl p-4 mb-5 flex items-start gap-4">
                <div className="w-14 h-9 flex-shrink-0 flex items-center justify-center">
                  {svc ? <svc.Logo className="w-full h-full" /> : <div className="text-2xl">{product.category}</div>}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: svc?.accent || "#94a3b8" }}>
                    {product.category}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2">{product.title}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Harga produk</span>
                  <span className="text-white">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Biaya transaksi</span>
                  <span className="text-emerald-400 font-semibold">Gratis</span>
                </div>
                <div className="border-t border-white/10 pt-2.5 flex justify-between items-center">
                  <span className="text-white font-bold">Total Pembayaran</span>
                  <span className="text-white font-black text-lg">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2.5 p-4 rounded-xl bg-black/20">
                {[
                  { icon: "⚡", label: "Pengiriman Instan", desc: "Otomatis setelah pembayaran" },
                  { icon: "🛡️", label: "Garansi Produk", desc: "Dilindungi kebijakan refund kami" },
                  { icon: "🔒", label: "Transaksi Aman", desc: "Diproses oleh Tripay" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <p className="text-white text-xs font-semibold">{item.label}</p>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-slate-600 text-xs text-center mt-4 leading-relaxed">
                Dengan melanjutkan, Anda menyetujui{" "}
                <Link href="/syarat-ketentuan" className="text-blue-400 hover:underline">Syarat & Ketentuan</Link>{" "}
                Nexvora Digital.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
