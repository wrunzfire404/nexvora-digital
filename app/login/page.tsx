"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";

const BRANDS = [NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) { setError("Email atau password salah."); setLoading(false); }
    else { router.push("/"); router.refresh(); }
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#050a14] border-r border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"/>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16 text-center">
          <div className="w-20 h-20 relative mb-8">
            <Image src="/nexlogo.png" alt="Nexvora" fill sizes="80px" className="object-contain" style={{ mixBlendMode: "screen" }} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-wide">NEXVORA DIGITAL</h2>
          <p className="text-slate-400 text-base mb-12 max-w-xs leading-relaxed">Satu platform untuk semua kebutuhan layanan digital premium Anda.</p>
          {/* Brand logos grid */}
          <div className="grid grid-cols-3 gap-5">
            {BRANDS.map((Logo, i) => (
              <motion.div key={i} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1+0.3}} whileHover={{scale:1.1}}
                className="w-14 h-9 p-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Logo className="w-full h-full"/>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.5}} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 relative"><Image src="/nexlogo.png" alt="Nexvora" fill sizes="40px" className="object-contain" style={{ mixBlendMode: "screen" }} /></div>
            <span className="text-white font-black text-lg tracking-widest uppercase">NEXVORA</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Selamat Datang</h1>
          <p className="text-slate-400 mb-8 text-sm">Masuk ke akun Nexvora Digital Anda</p>

          {error && (
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 text-sm transition-all"
                placeholder="email@contoh.com"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 text-sm transition-all"
                placeholder="••••••••"/>
            </div>

            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-sm mt-2 disabled:opacity-60"
              style={{background:"linear-gradient(135deg,#1a6cff,#0041cc)",boxShadow:"0 0 25px rgba(26,108,255,0.35)"}}>
              {loading ? "Memproses..." : "Masuk →"}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Daftar Gratis</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

