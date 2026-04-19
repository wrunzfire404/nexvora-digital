"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/products", label: "Katalog" },
    ...(session?.user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#050a14]/95 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <Image
                src="/nexlogo.png"
                alt="Nexvora Digital"
                fill
                sizes="48px"
                priority
                loading="eager"
                className="object-contain"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-base md:text-lg tracking-widest uppercase">
                NEXVORA
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-slate-400 uppercase font-light">
                Digital
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-slate-300 hover:text-white text-sm font-medium tracking-wide group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-300 text-sm">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-slate-400 hover:text-red-400 text-sm transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Masuk
                </Link>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #1a6cff 0%, #0041cc 100%)",
                      boxShadow: "0 0 20px rgba(26,108,255,0.4)",
                    }}
                  >
                    <span className="relative z-10">Daftar Gratis</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#080f1e]/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-300 text-sm">{session.user?.name}</span>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-3 text-red-400 text-sm rounded-xl hover:bg-red-500/10"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white text-sm rounded-xl hover:bg-white/5">
                      Masuk
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="block mx-4 py-3 text-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl font-medium">
                      Daftar Gratis
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
