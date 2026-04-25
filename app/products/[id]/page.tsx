"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";
import { ArrowLeft, ShoppingCart, ShieldCheck, Zap, Lock, MessageCircle, Clock } from "lucide-react";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string; category: string;
  deliveryMode: string;
};

const SERVICE_MAP: Record<string, { Logo: React.ComponentType<{className?:string}>; color: string }> = {
  "netflix":  { Logo:NetflixLogo,  color: "#E50914" },
  "spotify":  { Logo:SpotifyLogo,  color: "#1DB954" },
  "youtube":  { Logo:YouTubeLogo,  color: "#FF0000" },
  "disney+":  { Logo:DisneyLogo,   color: "#0063E5" },
  "chatgpt":  { Logo:ChatGPTLogo,  color: "#10A37F" },
  "canva":    { Logo:CanvaLogo,    color: "#00C4CC" },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/products/${params.id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(d => { if (d) setProduct(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"/>
        <p className="text-gray-500 text-sm font-medium">Memuat data produk...</p>
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pt-20">
      <div className="w-16 h-16 relative mb-6 opacity-20"><Image src="/nexlogo.png" alt="" fill sizes="64px" className="object-contain" style={{ filter: "brightness(0)" }}/></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h1>
      <p className="text-gray-500 mb-8 text-center max-w-sm">Produk yang Anda cari tidak tersedia atau tautan sudah tidak aktif.</p>
      <Link href="/products" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
      </Link>
    </div>
  );

  const svc = SERVICE_MAP[product.category.toLowerCase()];

  const handleBuy = () => {
    router.push(`/checkout/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-20">
      {/* Back Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">

            {/* Left: Image/Logo Panel */}
            <div className="md:col-span-2 relative flex items-center justify-center p-12 min-h-[300px] border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 opacity-50" />
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.title} fill className="object-cover opacity-10"/>
              ) : null}
              <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 drop-shadow-sm">
                {svc ? <svc.Logo className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">{product.category}</div>}
              </div>
            </div>

            {/* Right: Details Panel */}
            <div className="md:col-span-3 p-6 md:p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.title}</h1>

              <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gray-100">
                <span className="text-3xl md:text-4xl font-black text-blue-600">Rp {product.price.toLocaleString("id-ID")}</span>
                <div className="mb-1">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {product.stock >= 999000 ? "Stok Unlimited" : product.stock > 0 ? `Sisa ${product.stock} Stok` : "Stok Habis"}
                  </span>
                </div>
              </div>

              {/* Delivery Mode Info */}
              <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  {product.deliveryMode === "INSTANT" ? <Zap className="w-6 h-6 text-orange-500" /> : product.deliveryMode === "MANUAL" ? <MessageCircle className="w-6 h-6 text-blue-500" /> : <Clock className="w-6 h-6 text-purple-500" />}
                </div>
                <div>
                  <h4 className="text-blue-900 font-bold text-sm mb-1">
                    {product.deliveryMode === "INSTANT" ? "Pengiriman Instan Otomatis" : product.deliveryMode === "MANUAL" ? "Diproses Manual oleh Admin" : "Sistem Pre-Order"}
                  </h4>
                  <p className="text-blue-700/80 text-xs leading-relaxed">
                    {product.deliveryMode === "INSTANT" 
                      ? "Akun akan langsung dikirim ke email Anda detik itu juga setelah pembayaran berhasil. Tanpa menunggu." 
                      : product.deliveryMode === "MANUAL"
                      ? "Setelah pembayaran berhasil, pesanan Anda akan segera diproses oleh admin. Hubungi CS jika butuh bantuan."
                      : "Produk ini bersifat pre-order dan akan dikirimkan sesuai dengan estimasi waktu yang ditentukan oleh admin."}
                  </p>
                </div>
              </div>

              <div className="mb-8 flex-grow">
                <h4 className="text-gray-900 font-bold text-sm mb-3">Deskripsi Produk</h4>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {product.description}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Zap className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[11px] font-medium text-gray-600">Proses Cepat</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <ShieldCheck className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[11px] font-medium text-gray-600">Bergaransi</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Lock className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[11px] font-medium text-gray-600">Transaksi Aman</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={product.stock === 0}
                className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? "Beli Sekarang" : "Stok Habis"}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
