"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, MapPin } from "lucide-react";

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
    <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/nexlogo.png"
                  alt="Nexvora Digital"
                  fill
                  sizes="32px"
                  className="object-contain"
                  style={{ filter: "brightness(0) saturate(100%) invert(26%) sepia(91%) saturate(2371%) hue-rotate(211deg) brightness(97%) contrast(105%)" }} // approximate blue-600
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-blue-600 font-black text-lg tracking-wide uppercase">NEXVORA</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Platform penyedia akses aplikasi premium dan produk digital terpercaya di Indonesia.
              Proses instan, aman, dan bergaransi.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>support@nexvoradigital.store</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>@wrunzfire (Telegram)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Spacer for layout */}
          <div className="hidden md:block"></div>

          {/* Navigation */}
          <div>
            <h3 className="text-gray-900 font-bold text-base mb-5">Navigasi</h3>
            <ul className="space-y-3">
              {navLinks.map((lk) => (
                <li key={lk.href}>
                  <Link
                    href={lk.href}
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200"
                  >
                    {lk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-bold text-base mb-5">Informasi Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((lk) => (
                <li key={lk.href}>
                  <Link
                    href={lk.href}
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200"
                  >
                    {lk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Nexvora Digital. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center flex-wrap gap-4 md:gap-6 justify-center">
            {legalLinks.map((lk) => (
              <Link
                key={lk.href}
                href={lk.href}
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
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
