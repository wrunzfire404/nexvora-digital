"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";
import { ShieldCheck, Zap, HeadphonesIcon, ChevronRight, Star } from "lucide-react";

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
  { name: "Netflix", Logo: NetflixLogo, color: "#E50914" },
  { name: "Spotify", Logo: SpotifyLogo, color: "#1DB954" },
  { name: "YouTube", Logo: YouTubeLogo, color: "#FF0000" },
  { name: "Disney+", Logo: DisneyLogo, color: "#0063E5" },
  { name: "ChatGPT", Logo: ChatGPTLogo, color: "#10A37F" },
  { name: "Canva", Logo: CanvaLogo, color: "#00C4CC" },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => setFeaturedProducts(Array.isArray(d) ? d.slice(0, 8) : []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-20 md:pt-24 pb-20">

      {/* ─── HERO BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="relative bg-blue-600 rounded-2xl overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative px-6 py-12 md:py-20 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white max-w-xl text-center md:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/50 border border-blue-400 text-xs font-bold tracking-wider mb-5">
                PROMO HARI INI
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Akses Digital Premium, <br />
                Harga Lebih Hemat.
              </h1>
              <p className="text-blue-100 mb-8 text-sm md:text-base">
                Nikmati layanan Netflix, Spotify, YouTube Premium dan layanan digital lainnya tanpa harus merogoh kocek dalam. Proses instan, 100% legal dan bergaransi penuh.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/products" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  Belanja Sekarang
                </Link>
                <Link href="#categories" className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors border border-blue-500">
                  Lihat Kategori
                </Link>
              </div>
            </div>
            <div className="hidden md:block w-72 h-72 relative flex-shrink-0">
               {/* Illustration Placeholder or leave empty for text-focus */}
               <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
               <div className="grid grid-cols-2 gap-4 relative z-10 transform rotate-12">
                 {[NetflixLogo, SpotifyLogo, YouTubeLogo, ChatGPTLogo].map((Logo, i) => (
                   <div key={i} className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 transform hover:-translate-y-2 transition-transform">
                     <Logo className="w-full h-full" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KEUNGGULAN (TRUST BADGES) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Pengiriman Instan</h3>
              <p className="text-gray-500 text-xs mt-0.5">Otomatis masuk email detik itu juga.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-4 md:py-2">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">100% Aman & Garansi</h3>
              <p className="text-gray-500 text-xs mt-0.5">Produk legal dengan garansi uang kembali.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-4 md:py-2">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Layanan Bantuan 24/7</h3>
              <p className="text-gray-500 text-xs mt-0.5">Admin siap membantu kendala Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KATEGORI ─── */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-gray-900">Kategori Pilihan</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {SERVICES.map((s) => (
            <Link key={s.name} href={`/products?category=${encodeURIComponent(s.name)}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-md transition-all group aspect-square">
                <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <s.Logo className="w-10 h-10" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{s.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── PRODUK TERBARU ─── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rekomendasi Spesial</h2>
            <Link href="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts.map((p) => {
              const svc = SERVICES.find(s => s.name.toLowerCase() === p.category.toLowerCase());
              return (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col group">
                    {/* Header Image Area */}
                    <div className="h-28 bg-gray-50 flex items-center justify-center relative border-b border-gray-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 opacity-50"></div>
                      <div className="w-14 h-14 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        {svc ? <svc.Logo className="w-full h-full" /> : <div className="w-full h-full bg-gray-300 rounded-lg"></div>}
                      </div>
                      {p.stock <= 5 && p.stock > 0 && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Sisa {p.stock}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex-grow flex flex-col">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {p.category}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-grow group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h3>
                      
                      <div className="mt-2">
                        <div className="text-lg font-black text-blue-600 mb-1">
                          Rp {p.price.toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>5.0</span>
                          <span className="mx-1">•</span>
                          <span>Terjual 100+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}


