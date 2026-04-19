"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo, TelegramLogo } from "@/components/BrandLogos";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
};

const SERVICES = [
  { name: "Netflix", Logo: NetflixLogo, bg: "from-[#141414] to-[#1a0000]", border: "border-[#E50914]/30", glow: "shadow-[0_0_30px_rgba(229,9,20,0.2)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(229,9,20,0.35)]", accent: "#E50914" },
  { name: "Spotify", Logo: SpotifyLogo, bg: "from-[#121212] to-[#001a07]", border: "border-[#1DB954]/30", glow: "shadow-[0_0_30px_rgba(29,185,84,0.15)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(29,185,84,0.3)]", accent: "#1DB954" },
  { name: "YouTube", Logo: YouTubeLogo, bg: "from-[#141414] to-[#1a0000]", border: "border-[#FF0000]/30", glow: "shadow-[0_0_30px_rgba(255,0,0,0.15)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(255,0,0,0.3)]", accent: "#FF0000" },
  { name: "Disney+", Logo: DisneyLogo, bg: "from-[#0a0a2e] to-[#000b1e]", border: "border-[#0063E5]/30", glow: "shadow-[0_0_30px_rgba(0,99,229,0.2)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(0,99,229,0.35)]", accent: "#0063E5" },
  { name: "ChatGPT", Logo: ChatGPTLogo, bg: "from-[#0d1a17] to-[#0a1410]", border: "border-[#74AA9C]/30", glow: "shadow-[0_0_30px_rgba(116,170,156,0.15)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(116,170,156,0.3)]", accent: "#74AA9C" },
  { name: "Canva", Logo: CanvaLogo, bg: "from-[#1a0a2e] to-[#0d0014]", border: "border-[#7D2AE7]/30", glow: "shadow-[0_0_30px_rgba(125,42,231,0.15)]", hoverGlow: "hover:shadow-[0_0_40px_rgba(125,42,231,0.3)]", accent: "#7D2AE7" },
];

function AnimatedCounter({ value }: { value: string }) {
  return <span className="text-3xl md:text-4xl font-black text-white">{value}</span>;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => setFeaturedProducts(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#050a14]">

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Deep space BG */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#050a14]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-700/10 rounded-full blur-[120px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"80px 80px"}} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Produk Bergaransi · Proses Otomatis</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.8}} className="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight mb-6">
            <span className="block" style={{color:"#ffffff"}}>Premium</span>
            <span className="block" style={{background:"linear-gradient(90deg,#60a5fa,#67e8f9,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Digital Access</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl font-light mt-3 tracking-wide" style={{color:"rgba(255,255,255,0.5)"}}>untuk Indonesia</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="max-w-xl mx-auto text-slate-400 text-base md:text-lg leading-relaxed mb-10">
            Akses Netflix, Spotify, YouTube Premium, Disney+ dan puluhan layanan digital lainnya — harga lokal, kualitas premium.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products">
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} className="relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-white text-base" style={{background:"linear-gradient(135deg,#1a6cff,#0041cc)",boxShadow:"0 0 30px rgba(26,108,255,0.5),inset 0 1px 0 rgba(255,255,255,0.15)"}}>
                <span className="relative z-10">Lihat Semua Produk →</span>
              </motion.button>
            </Link>
            <Link href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "#"} target="_blank">
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white text-base border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                <TelegramLogo className="w-5 h-5" />
                Order via Telegram
              </motion.button>
            </Link>
          </motion.div>

          {/* Brand strip */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="mt-16 flex flex-wrap justify-center items-center gap-6" style={{opacity:0.35}}>
            {[NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo].map((Logo, i) => (
              <div key={i} className="w-8 h-8 grayscale hover:grayscale-0 transition-all duration-300"><Logo /></div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{y:[0,8,0]}} transition={{repeat:Infinity,duration:2}} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-slate-400" />
          <span className="text-xs text-slate-400 tracking-widest uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#070d1f] to-[#050a14]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-50px"}} className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Layanan Tersedia</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Semua Platform, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Satu Tempat</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Akses layanan streaming & produktivitas premium dengan harga terjangkau dan proses pengiriman instan.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {SERVICES.map((s, i) => (
              <motion.div key={s.name} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} whileHover={{y:-8,scale:1.02}} className="group cursor-pointer">
                <Link href={`/products?category=${encodeURIComponent(s.name)}`}>
                  <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border ${s.border} bg-gradient-to-br ${s.bg} ${s.glow} ${s.hoverGlow} transition-all duration-500 p-6 md:p-8`}>
                    {/* Glow orb */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{backgroundColor:s.accent}} />
                    
                    <div className="w-12 h-8 md:w-16 md:h-10 mb-5">
                      <s.Logo className="w-full h-full" />
                    </div>
                    <h3 className="text-white font-bold text-base md:text-lg mb-1">{s.name}</h3>
                    <p className="text-slate-500 text-sm">Mulai dari <span className="text-slate-300">Rp 15.000</span></p>
                    
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold" style={{color:s.accent}}>
                      <span>Lihat Produk</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex justify-between items-end mb-12">
              <div>
                <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Produk Terbaru</p>
                <h2 className="text-3xl md:text-4xl font-black text-white">Pilihan Terpopuler</h2>
              </div>
              <Link href="/products" className="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-xl transition-all hidden sm:block">Lihat Semua</Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((p, i) => {
                const svc = SERVICES.find(s => s.name.toLowerCase() === p.category.toLowerCase());
                return (
                  <motion.div key={p.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} whileHover={{y:-6}} className="group">
                    <Link href={`/products/${p.id}`}>
                      <div className={`relative overflow-hidden rounded-2xl border ${svc?.border || "border-white/10"} bg-gradient-to-br ${svc?.bg || "from-slate-800 to-slate-900"} p-6 ${svc?.glow || ""} hover:shadow-2xl transition-all duration-500 h-full flex flex-col`}>
                        <div className="w-12 h-7 mb-4 opacity-90">
                          {svc ? <svc.Logo /> : <div className="w-full h-full bg-white/20 rounded" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{p.category}</p>
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{p.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 flex-grow">{p.description}</p>
                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-white font-black text-lg">Rp {p.price.toLocaleString("id-ID")}</span>
                          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{backgroundColor: svc ? `${svc.accent}20` : "#fff1", color: svc?.accent || "#fff"}}>
                            {p.stock > 0 ? "Tersedia" : "Habis"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── STATS ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-[#070d1f] to-violet-900/10" />
        <div className="absolute inset-0 border-y border-white/5" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {v:"500+",l:"Pelanggan Aktif"},
              {v:"6+",l:"Platform Tersedia"},
              {v:"<1 Mnt",l:"Proses Order"},
              {v:"100%",l:"Garansi Uang Kembali"},
            ].map((s,i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
                <AnimatedCounter value={s.v} />
                <p className="text-slate-500 text-sm mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Keunggulan Kami</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Kenapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Nexvora?</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:"⚡",title:"Pengiriman Instan",desc:"Akun dikirim otomatis dalam hitungan detik setelah pembayaran dikonfirmasi. Tanpa antrian, tanpa tunggu.",color:"#FFB800"},
              {icon:"🔒",title:"100% Aman & Terpercaya",desc:"Setiap produk telah diverifikasi dan bergaransi penuh. Tidak puas? Kami kembalikan uang Anda.",color:"#00D4FF"},
              {icon:"💬",title:"Support 24/7",desc:"Tim support kami siap membantu kapan saja via Telegram. Respon cepat, solusi tepat.",color:"#00E5A0"},
            ].map((f,i) => (
              <motion.div key={f.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.15}} whileHover={{y:-8}} className="relative group rounded-3xl border border-white/5 bg-white/2 p-8 overflow-hidden" style={{background:"linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))"}}>
                <div className="absolute inset-0 rounded-3xl border border-white/0 group-hover:border-white/10 transition-colors duration-500" />
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700" style={{backgroundColor:f.color}} />
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#050a14] to-violet-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <div className="w-16 h-16 mx-auto mb-8 relative">
              <Image src="/nexlogo.png" alt="Nexvora" fill sizes="64px" className="object-contain" style={{ mixBlendMode: "screen" }} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Mulai Berlangganan<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sekarang</span></h2>
            <p className="text-slate-400 mb-10 text-lg">Bergabung bersama 500+ pelanggan yang sudah menikmati layanan premium kami.</p>
            <Link href="/products">
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.97}} className="px-10 py-4 rounded-2xl font-black text-white text-lg" style={{background:"linear-gradient(135deg,#1a6cff,#7c3aed)",boxShadow:"0 0 40px rgba(26,108,255,0.4)"}}>
                Jelajahi Katalog Produk →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10"><Image src="/nexlogo.png" alt="Nexvora" fill sizes="40px" className="object-contain" style={{ mixBlendMode: "screen" }}/></div>
              <div>
                <p className="text-white font-black tracking-widest uppercase text-sm">NEXVORA</p>
                <p className="text-slate-500 text-xs tracking-[0.3em] uppercase">Digital</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              {[{l:"Katalog",h:"/products"},{l:"Login",h:"/login"},{l:"Daftar",h:"/register"}].map(lk=>(
                <Link key={lk.h} href={lk.h} className="text-slate-500 hover:text-white text-sm transition-colors">{lk.l}</Link>
              ))}
            </div>
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Nexvora Digital</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


