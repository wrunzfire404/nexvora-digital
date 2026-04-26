"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";
import { Search, Zap, Clock, MessageCircle, Star } from "lucide-react";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string; category: string;
  deliveryMode: string;
};

const SERVICE_MAP: Record<string, { Logo: React.ComponentType<{className?:string}>; color: string }> = {
  "netflix":  { Logo: NetflixLogo,  color: "#E50914" },
  "spotify":  { Logo: SpotifyLogo,  color: "#1DB954" },
  "youtube":  { Logo: YouTubeLogo,  color: "#FF0000" },
  "disney+":  { Logo: DisneyLogo,   color: "#0063E5" },
  "chatgpt":  { Logo: ChatGPTLogo,  color: "#10A37F" },
  "canva":    { Logo: CanvaLogo,    color: "#00C4CC" },
};

const CAT_LABELS = ["Netflix","Spotify","YouTube","Disney+","ChatGPT","Canva"];

/** Hasilkan rating & jumlah terjual realistis dari ID produk (deterministik) */
function getProductStats(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const ratings = [4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 5.0];
  const rating  = ratings[hash % ratings.length];
  const sold    = 12 + (hash % 73); // 12–84
  return { rating: rating.toFixed(1), sold };
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  const loadProducts = (cat: string, q: string) => {
    setLoading(true);
    const p = new URLSearchParams();
    if (cat) p.set("category", cat);
    if (q)   p.set("search", q);
    fetch(`/api/products?${p}`)
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadProducts(selectedCategory, search); }, [selectedCategory]);

  const handleCat = (c: string) => {
    const next = c === selectedCategory ? "" : c;
    setSelectedCategory(next);
    const p = new URLSearchParams(searchParams.toString());
    next ? p.set("category", next) : p.delete("category");
    router.push(`/products?${p}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Temukan layanan premium dengan harga terbaik.</p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-28">
              <h3 className="font-bold text-gray-900 mb-4">Filter Pencarian</h3>
              
              <form onSubmit={e=>{e.preventDefault();loadProducts(selectedCategory,search);}} className="mb-6">
                <div className="relative">
                  <input
                    value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </form>

              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kategori</h4>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={()=>handleCat("")} 
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory==="" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Semua Kategori
                </button>
                {CAT_LABELS.map(cat => {
                  const active = selectedCategory === cat;
                  return (
                    <button 
                      key={cat} 
                      onClick={()=>handleCat(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_,i)=>(
                  <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                    <div className="h-28 bg-gray-100"/>
                    <div className="p-4 space-y-3">
                      <div className="h-2 bg-gray-200 rounded w-1/3"/>
                      <div className="h-4 bg-gray-200 rounded w-3/4"/>
                      <div className="h-6 bg-gray-200 rounded mt-2"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => {
                  const svc = SERVICE_MAP[p.category.toLowerCase()];
                  return (
                    <Link key={p.id} href={`/products/${p.id}`}>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col group">
                        
                        {/* Header Image Area */}
                        <div className="h-28 bg-gray-50 flex items-center justify-center relative border-b border-gray-100 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 opacity-50"></div>
                          {p.imageUrl && <Image src={p.imageUrl} alt={p.title} fill className="object-cover opacity-10"/>}
                          
                          <div className="w-14 h-14 relative z-10 group-hover:scale-110 transition-transform duration-300">
                            {svc ? <svc.Logo className="w-full h-full" /> : <div className="w-full h-full bg-gray-300 rounded-lg"></div>}
                          </div>
                          
                          {/* Stock Badges */}
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                              <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">Habis</span>
                            </div>
                          )}
                          {p.stock > 0 && p.stock <= 5 && (
                            <div className="absolute top-2 right-2 z-10 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                              Sisa {p.stock}
                            </div>
                          )}
                          
                          {/* Delivery Badge */}
                          <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            {p.deliveryMode === "INSTANT" ? <><Zap className="w-2.5 h-2.5 text-orange-500"/> Instan</> : p.deliveryMode === "MANUAL" ? <><MessageCircle className="w-2.5 h-2.5 text-blue-500"/> Admin</> : <><Clock className="w-2.5 h-2.5 text-purple-500"/> PO</>}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            {p.category}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-grow group-hover:text-blue-600 transition-colors">
                            {p.title}
                          </h3>
                          
                          <div className="mt-2 pt-2 border-t border-gray-50">
                            <div className="text-base font-black text-blue-600 mb-1">
                              Rp {p.price.toLocaleString("id-ID")}
                            </div>
                            {(() => { const stats = getProductStats(p.id); return (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{stats.rating}</span>
                              <span className="mx-1">•</span>
                              <span>Terjual {stats.sold}</span>
                            </div>
                            ); })()}
                          </div>
                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Produk Tidak Ditemukan</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {search ? `Tidak ada hasil pencarian untuk "${search}"` : "Kategori ini belum memiliki produk."}
                </p>
                {(search||selectedCategory) && (
                  <button onClick={()=>{setSearch("");setSelectedCategory("");loadProducts("","");}} className="text-blue-600 font-medium text-sm hover:underline">
                    Reset Semua Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"/></div>}>
      <ProductsContent />
    </Suspense>
  );
}

