"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { href: "/products", label: "Katalog" },
    ...(session?.user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
              <Image
                src="/nexlogo.png"
                alt="Nexvora Digital"
                fill
                sizes="40px"
                priority
                className="object-contain"
                style={{ filter: "brightness(0) saturate(100%) invert(26%) sepia(91%) saturate(2371%) hue-rotate(211deg) brightness(97%) contrast(105%)" }} // approximate blue-600
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-blue-600 font-black text-lg md:text-xl tracking-wide">
                NEXVORA
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-2xl px-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                placeholder="Cari layanan streaming, desain, dll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg py-2.5 pl-4 pr-12 text-sm text-gray-900 transition-all outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-200">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{session.user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors border border-transparent">
                  Masuk
                </Link>
                <Link href="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & search icon */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible when mobileOpen is false but we need it on mobile) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text" 
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg py-2.5 pl-4 pr-12 text-sm text-gray-900 transition-all outline-none"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 text-sm font-medium">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 text-sm rounded-lg hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-center text-blue-600 border border-blue-600 hover:bg-blue-50 text-sm rounded-lg font-medium transition-colors">
                    Masuk
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium shadow-sm transition-colors">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
