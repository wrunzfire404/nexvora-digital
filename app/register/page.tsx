"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,email,password}) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal mendaftar"); }
      router.push("/login");
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-[120px]"/>
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[120px]"/>
      </div>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-11 h-11 relative"><Image src="/nexlogo.png" alt="Nexvora" fill sizes="44px" className="object-contain" style={{ mixBlendMode: "screen" }} /></div>
          <div>
            <p className="text-white font-black text-sm tracking-widest uppercase">NEXVORA</p>
            <p className="text-slate-500 text-xs tracking-[0.3em] uppercase">Digital</p>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-black text-white mb-1">Buat Akun</h1>
          <p className="text-slate-400 text-sm mb-7">Bergabung dengan Nexvora Digital</p>

          {error && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {label:"Nama Lengkap",type:"text",val:name,set:setName,ph:"Nama Anda"},
              {label:"Email",type:"email",val:email,set:setEmail,ph:"email@contoh.com"},
              {label:"Password",type:"password",val:password,set:setPassword,ph:"Min. 8 karakter"},
            ].map(f=>(
              <div key={f.label}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{f.label}</label>
                <input type={f.type} required value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 text-sm transition-all"/>
              </div>
            ))}

            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-sm mt-2 disabled:opacity-60"
              style={{background:"linear-gradient(135deg,#1a6cff,#7c3aed)",boxShadow:"0 0 25px rgba(26,108,255,0.3)"}}>
              {loading ? "Memproses..." : "Daftar Sekarang →"}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-7">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Masuk</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

