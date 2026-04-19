"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo, TelegramLogo } from "@/components/BrandLogos";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string; category: string;
};

const SERVICE_MAP: Record<string, { Logo: React.ComponentType<{className?:string}>; accent: string; bg: string; border: string; glow: string }> = {
  "netflix":  { Logo:NetflixLogo,  accent:"#E50914", bg:"from-[#1a0000] via-[#0d0000] to-[#050a14]", border:"border-[#E50914]/20", glow:"shadow-[0_0_80px_rgba(229,9,20,0.15)]" },
  "spotify":  { Logo:SpotifyLogo,  accent:"#1DB954", bg:"from-[#001a07] via-[#000f04] to-[#050a14]", border:"border-[#1DB954]/20", glow:"shadow-[0_0_80px_rgba(29,185,84,0.15)]" },
  "youtube":  { Logo:YouTubeLogo,  accent:"#FF0000", bg:"from-[#1a0000] via-[#0d0000] to-[#050a14]", border:"border-[#FF0000]/20", glow:"shadow-[0_0_80px_rgba(255,0,0,0.15)]" },
  "disney+":  { Logo:DisneyLogo,   accent:"#0063E5", bg:"from-[#000b1e] via-[#000614] to-[#050a14]", border:"border-[#0063E5]/20", glow:"shadow-[0_0_80px_rgba(0,99,229,0.2)]"  },
  "chatgpt":  { Logo:ChatGPTLogo,  accent:"#74AA9C", bg:"from-[#0a1410] via-[#060d0b] to-[#050a14]", border:"border-[#74AA9C]/20", glow:"shadow-[0_0_80px_rgba(116,170,156,0.15)]" },
  "canva":    { Logo:CanvaLogo,    accent:"#7D2AE7", bg:"from-[#0d0014] via-[#080010] to-[#050a14]", border:"border-[#7D2AE7]/20", glow:"shadow-[0_0_80px_rgba(125,42,231,0.2)]" },
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
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center">
      <div className="space-y-2 text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
        <p className="text-slate-500 text-sm">Memuat produk...</p>
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 relative mb-6 opacity-30"><Image src="/nexlogo.png" alt="" fill sizes="64px" className="object-contain" style={{ mixBlendMode: "screen" }}/></div>
      <h1 className="text-3xl font-black text-white mb-3">Produk Tidak Ditemukan</h1>
      <p className="text-slate-400 mb-8">Produk tidak tersedia atau sudah tidak aktif.</p>
      <Link href="/products"><button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">← Kembali ke Katalog</button></Link>
    </div>
  );

  const svc = SERVICE_MAP[product.category.toLowerCase()];

  const handleBuy = () => {
    const txt = `Halo Nexvora Digital! Saya ingin membeli:\n\n*${product.title}*\nHarga: Rp ${product.price.toLocaleString("id-ID")}\n\nApakah stok masih tersedia?`;
    window.open(`${process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/NexvoraBot"}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Katalog
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className={`rounded-3xl overflow-hidden border ${svc?.border || "border-white/10"} ${svc?.glow || ""}`}>
          <div className={`grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br ${svc?.bg || "from-slate-800 to-slate-900"}`}>

            {/* Logo / Image Panel */}
            <div className="relative flex items-center justify-center p-16 min-h-[360px] border-b md:border-b-0 md:border-r border-white/5">
              <div className="absolute inset-0 opacity-10" style={{background:`radial-gradient(circle at center, ${svc?.accent || "#fff"}, transparent 70%)`}}/>
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.title} fill className="object-cover opacity-30"/>
              ) : null}
              <div className="relative z-10 w-48 h-28 md:w-64 md:h-36">
                {svc ? <svc.Logo className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-6xl">{product.category}</div>}
              </div>
            </div>

            {/* Details Panel */}
            <div className="p-8 md:p-12 flex flex-col">
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{color:svc?.accent || "#94a3b8"}}>{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">{product.title}</h1>

              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <span className="text-4xl font-black text-white">Rp {product.price.toLocaleString("id-ID")}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {product.stock > 0 ? `✓ Stok ${product.stock}` : "✗ Habis"}
                </span>
              </div>

              <div className="mb-8 flex-grow">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Deskripsi</p>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 mb-8 p-4 rounded-2xl border border-white/5 bg-white/2">
                {[["⚡","Instan"],["🛡️","Garansi"],["💬","Support"]].map(([ic,lb])=>(
                  <div key={lb} className="text-center">
                    <div className="text-xl mb-1">{ic}</div>
                    <div className="text-xs text-slate-500">{lb}</div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={handleBuy}
                disabled={product.stock === 0}
                className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={product.stock > 0 ? {background:`linear-gradient(135deg, #1a6cff, #0041cc)`, boxShadow:"0 0 30px rgba(26,108,255,0.4)"} : {background:"#1e293b"}}
              >
                {product.stock > 0 ? (<><TelegramLogo className="w-5 h-5"/>Beli via Telegram</>) : "Stok Habis"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
