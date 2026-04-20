"use client";

import Link from "next/link";
import Image from "next/image";

const legalLinks = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kontak", href: "/kontak" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
];

const navLinks = [
  { label: "Katalog Produk", href: "/products" },
  { label: "Masuk", href: "/login" },
  { label: "Daftar", href: "/register" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/nexlogo.png"
                  alt="Nexvora Digital"
                  fill
                  sizes="40px"
                  className="object-contain"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-black text-sm tracking-widest uppercase">NEXVORA</span>
                <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase font-light">Digital</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Platform penyedia akses aplikasi premium dan produk digital terpercaya di Indonesia.
              Proses instan, aman, dan bergaransi.
            </p>
            <p className="text-slate-600 text-xs mt-4">support@nexvoradigital.store</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Navigasi</p>
            <ul className="space-y-3">
              {navLinks.map((lk) => (
                <li key={lk.href}>
                  <Link
                    href={lk.href}
                    className="text-slate-500 hover:text-white text-sm transition-colors duration-200"
                  >
                    {lk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Informasi Legal</p>
            <ul className="space-y-3">
              {legalLinks.map((lk) => (
                <li key={lk.href}>
                  <Link
                    href={lk.href}
                    className="text-slate-500 hover:text-white text-sm transition-colors duration-200"
                  >
                    {lk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Nexvora Digital. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((lk) => (
              <Link
                key={lk.href}
                href={lk.href}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
              >
                {lk.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
