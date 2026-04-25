"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { NetflixLogo, SpotifyLogo, YouTubeLogo, DisneyLogo, ChatGPTLogo, CanvaLogo } from "@/components/BrandLogos";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string; category: string;
  deliveryMode: string;
};

const SERVICE_MAP: Record<string, { Logo: React.ComponentType<{className?:string}>; accent: string; bg: string; border: string }> = {
  "netflix":  { Logo: NetflixLogo,  accent:"#E50914", bg:"from-[#1a0000] to-[#0d0000]", border:"border-[#E50914]/20" },
  "spotify":  { Logo: SpotifyLogo,  accent:"#1DB954", bg:"from-[#001a07] to-[#000f04]", border:"border-[#1DB954]/20" },
  "youtube":  { Logo: YouTubeLogo,  accent:"#FF0000", bg:"from-[#1a0000] to-[#0d0000]", border:"border-[#FF0000]/20" },
  "disney+":  { Logo: DisneyLogo,   accent:"#0063E5", bg:"from-[#000b1e] to-[#00061a]", border:"border-[#0063E5]/20" },
  "chatgpt":  { Logo: ChatGPTLogo,  accent:"#74AA9C", bg:"from-[#0a1410] to-[#060d0b]", border:"border-[#74AA9C]/20" },
  "canva":    { Logo: CanvaLogo,    accent:"#7D2AE7", bg:"from-[#0d0014] to-[#08000f]", border:"border-[#7D2AE7]/20" },
};

const CAT_LABELS = ["Netflix","Spotify","YouTube","Disney+","ChatGPT","Canva"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
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

  useEffect(() => { loadProducts(selectedCategory, ""); }, [selectedCategory]);

  const handleCat = (c: string) => {
    const next = c === selectedCategory ? "" : c;
    setSelectedCategory(next);
    const p = new URLSearchParams(searchParams.toString());
    next ? p.set("category", next) : p.delete("category");
    router.push(`/products?${p}`);
  };

  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Header */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <p className="text-blue-400 text-xs font-semibold tracking-[0.25em] uppercase mb-3">Katalog Produk</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Semua Layanan</h1>
            <p className="text-slate-400">Pilih platform yang kamu inginkan</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search + Filter */}
        <div className="mb-10 space-y-5">
          <form onSubmit={e=>{e.preventDefault();loadProducts(selectedCategory,search);}} className="flex gap-3 max-w-md">
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="flex-grow px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
            />
            <button type="submit" className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors">Cari</button>
          </form>

          {/* Category chips with real logos */}
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>handleCat("")} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory===""?"bg-white text-slate-900 border-white":"border-white/10 text-slate-400 hover:border-white/30 hover:text-white"}`}>
              Semua
            </button>
            {CAT_LABELS.map(cat => {
              const svc = SERVICE_MAP[cat.toLowerCase()];
              const active = selectedCategory === cat;
              return (
                <button key={cat} onClick={()=>handleCat(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${active ? "text-white" : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"}`}
                  style={active ? {backgroundColor:`${svc?.accent}20`, borderColor:`${svc?.accent}60`, color:svc?.accent} : {}}
                >
                  {svc && <svc.Logo className="w-4 h-4" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_,i)=>(
              <div key={i} className="rounded-2xl bg-white/3 border border-white/5 animate-pulse">
                <div className="h-44 bg-white/5 rounded-t-2xl"/>
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-white/5 rounded w-1/3"/>
                  <div className="h-5 bg-white/5 rounded w-3/4"/>
                  <div className="h-4 bg-white/5 rounded"/>
                  <div className="h-10 bg-white/5 rounded mt-4"/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedCategory+search} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {products.map((p,i) => {
                const svc = SERVICE_MAP[p.category.toLowerCase()];
                return (
                  <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} whileHover={{y:-6}} className="group">
                    <Link href={`/products/${p.id}`}>
                      <div className={`relative h-full overflow-hidden rounded-2xl border ${svc?.border || "border-white/10"} bg-gradient-to-br ${svc?.bg || "from-slate-800 to-slate-900"} flex flex-col transition-all duration-500 hover:shadow-2xl`}
                        style={svc ? {boxShadow:`0 0 0 transparent`,} : {}}>
                        
                        {/* Logo area */}
                        <div className="relative h-40 flex items-center justify-center p-8 border-b border-white/5">
                          <div className="absolute inset-0 opacity-5" style={{background:`radial-gradient(circle at center, ${svc?.accent || "#fff"}, transparent)`}} />
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.title} fill className="object-cover opacity-40"/>
                          ) : null}
                          <div className="relative z-10 w-20 h-12">
                            {svc ? <svc.Logo /> : <div className="w-full h-full bg-white/20 rounded-lg"/>}
                          </div>
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-xs font-bold text-red-400 border border-red-400/40 px-3 py-1 rounded-full">Stok Habis</span>
                            </div>
                          )}
                          {p.stock > 0 && p.stock <= 5 && (
                            <div className="absolute top-3 right-3 bg-orange-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-md">Sisa {p.stock}</div>
                          )}
                          
                          {/* Delivery Mode Badge */}
                          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                            {p.deliveryMode === "INSTANT" ? "⚡ Instan" : p.deliveryMode === "MANUAL" ? "💬 Proses Admin" : "⏳ Pre-Order"}
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <p className="text-xs mb-1.5 font-semibold tracking-wider uppercase" style={{color:svc?.accent || "#94a3b8"}}>{p.category}</p>
                          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 leading-snug">{p.title}</h3>
                          <p className="text-slate-500 text-xs line-clamp-2 flex-grow leading-relaxed">{p.description}</p>
                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-white font-black text-base">Rp {p.price.toLocaleString("id-ID")}</span>
                            <span className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all group-hover:opacity-100 opacity-80"
                              style={{backgroundColor:`${svc?.accent || "#fff"}15`, color:svc?.accent || "#fff"}}>
                              Detail →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && products.length === 0 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-4 relative opacity-30"><Image src="/nexlogo.png" alt="" fill sizes="64px" className="object-contain" style={{ mixBlendMode: "screen" }}/></div>
            <p className="text-white text-xl font-bold mb-2">Produk Tidak Ditemukan</p>
            <p className="text-slate-500 text-sm">{search ? `Tidak ada hasil untuk "${search}"` : "Belum ada produk tersedia."}</p>
            {(search||selectedCategory) && (
              <button onClick={()=>{setSearch("");setSelectedCategory("");loadProducts("","");}} className="mt-6 text-blue-400 hover:text-blue-300 text-sm">Reset Filter</button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050a14] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"/></div>}>
      <ProductsContent />
    </Suspense>
  );
}

