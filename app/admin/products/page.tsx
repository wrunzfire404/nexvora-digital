"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CATEGORIES, getBrandInfo } from "@/components/BrandLogos";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string;
  category: string; isAvailable: boolean; accountStock?: string;
};

const EMPTY_FORM = {
  title: "", description: "", price: "", stock: "0",
  imageUrl: "", category: "Netflix", isAvailable: true, accountStock: "",
};

export default function AdminProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [isModalOpen, setModal]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState<string>("");
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      setProducts(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title, description: product.description || "",
        price: product.price.toString(), stock: product.stock.toString(),
        imageUrl: product.imageUrl || "", category: product.category,
        isAvailable: product.isAvailable, accountStock: product.accountStock || "",
      });
      setPreview(product.imageUrl || "");
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setPreview("");
    }
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditingId(null); setPreview(""); };

  // Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData(f => ({ ...f, imageUrl: data.url }));
        setPreview(data.url);
      } else {
        alert(data.error || "Upload gagal");
        setPreview(formData.imageUrl);
      }
    } catch { alert("Upload gagal"); setPreview(formData.imageUrl); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) };
    try {
      const url    = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { closeModal(); fetchProducts(); }
      else alert("Gagal menyimpan produk");
    } finally { setSaving(false); }
  };

  const handleDelete = async (product: Product) => {
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) { fetchProducts(); setDeleteConfirm(null); }
    else alert("Gagal menghapus produk");
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kelola Produk</h1>
          <p className="text-slate-400 mt-1">Total {products.length} produk · {products.filter(p=>p.isAvailable&&p.stock>0).length} tersedia</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Cari produk atau kategori..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                <th className="px-6 py-4 font-medium">Produk</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Harga</th>
                <th className="px-6 py-4 font-medium">Stok</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4">
                    <div className="h-10 bg-slate-700/40 rounded-lg animate-pulse"/>
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada produk. Klik 'Tambah Produk' untuk mulai."}
                </td></tr>
              ) : filtered.map(product => {
                const brand = getBrandInfo(product.category);
                const BrandIcon = brand.Logo;
                return (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 relative">
                          {product.imageUrl
                            ? <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="40px"/>
                            : <div className="w-full h-full flex items-center justify-center p-1.5" style={{ background: brand.bg }}>
                                <BrandIcon className="w-6 h-6"/>
                              </div>}
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.title}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[180px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 p-0.5" style={{ color: brand.color }}>
                          <BrandIcon className="w-full h-full"/>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: brand.bg, color: brand.color, border: `1px solid ${brand.border}` }}>
                          {product.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock > 5 ? "text-green-400" : product.stock > 0 ? "text-yellow-400" : "text-red-400"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.isAvailable && product.stock > 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {product.isAvailable && product.stock > 0 ? "● Aktif" : "○ Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(product)}
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(product)}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg text-xs font-medium transition-colors">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD/EDIT MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}/>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0f172a] rounded-3xl border border-slate-700 w-full max-w-2xl shadow-2xl z-10 overflow-hidden">

              {/* Modal Header */}
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-bold text-white">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{editingId ? "Perbarui informasi produk" : "Isi detail produk yang akan dijual"}</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="p-6 max-h-[75vh] overflow-y-auto">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Gambar Produk</label>
                    <div className="flex gap-4 items-start">
                      {/* Preview */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center relative">
                        {preview ? (
                          <Image src={preview} alt="preview" fill className="object-cover" sizes="96px"/>
                        ) : (
                          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        <button type="button" onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-xl text-sm text-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                          {uploading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Mengupload...</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>Upload Gambar</>
                          )}
                        </button>
                        <p className="text-xs text-slate-500">JPG, PNG, WebP. Maks 5MB.</p>
                        <input type="text" placeholder="Atau masukkan URL gambar..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          value={formData.imageUrl}
                          onChange={e => { setFormData(f => ({...f, imageUrl: e.target.value})); setPreview(e.target.value); }}/>
                      </div>
                    </div>
                  </div>

                  {/* Judul & Kategori */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Judul Produk *</label>
                      <input type="text" required
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="cth: Netflix Premium 1 Bulan"
                        value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategori *</label>
                      <div className="relative">
                        <select required
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm appearance-none cursor-pointer"
                          value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value}))}>
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {(() => { const b = getBrandInfo(formData.category); return <b.Logo className="w-5 h-5" />; })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Harga & Stok */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Harga (Rp) *</label>
                      <input type="number" min="0" required
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="45000"
                        value={formData.price} onChange={e => setFormData(f => ({...f, price: e.target.value}))}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Total Stok Terhitung</label>
                      <input type="number" readOnly
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 focus:outline-none text-sm cursor-not-allowed"
                        value={formData.stock} />
                      <p className="text-xs text-slate-500 mt-1">Stok dihitung otomatis dari baris di bawah</p>
                    </div>
                  </div>

                  {/* Account Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Daftar Akun / Lisensi (1 baris = 1 stok)</label>
                    <textarea rows={5}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y text-sm font-mono whitespace-pre"
                      placeholder="email1@gmail.com : pass1&#10;email2@gmail.com : pass2&#10;Atau link aktivasi..."
                      value={formData.accountStock} 
                      onChange={e => {
                        const val = e.target.value;
                        const lines = val.split('\n').filter(line => line.trim() !== '').length;
                        setFormData(f => ({...f, accountStock: val, stock: lines.toString()}));
                      }}/>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi *</label>
                    <textarea required rows={3}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                      placeholder="Deskripsi lengkap produk..."
                      value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))}/>
                  </div>

                  {/* Toggle Aktif */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-white">Tampilkan di Katalog</p>
                      <p className="text-xs text-slate-400 mt-0.5">Produk bisa dilihat dan dibeli pembeli</p>
                    </div>
                    <button type="button" onClick={() => setFormData(f => ({...f, isAvailable: !f.isAvailable}))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${formData.isAvailable ? "bg-blue-600" : "bg-slate-700"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isAvailable ? "translate-x-6" : "translate-x-0"}`}/>
                    </button>
                  </div>

                  {/* Brand Preview */}
                  <div className="p-4 rounded-xl border" style={{ background: getBrandInfo(formData.category).bg, borderColor: getBrandInfo(formData.category).border }}>
                    <p className="text-xs text-slate-400 mb-2">Preview tampilan kartu produk:</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg p-2" style={{ background: getBrandInfo(formData.category).bg, border: `1px solid ${getBrandInfo(formData.category).border}` }}>
                        {(() => { const b = getBrandInfo(formData.category); return <b.Logo className="w-full h-full"/>; })()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{formData.title || "Nama Produk"}</p>
                        <p className="text-xs" style={{ color: getBrandInfo(formData.category).color }}>{formData.category}</p>
                      </div>
                      <div className="ml-auto">
                        <p className="text-white font-bold text-sm">
                          Rp {formData.price ? parseInt(formData.price).toLocaleString("id-ID") : "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/30">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                  Batal
                </button>
                <button type="submit" form="productForm" disabled={saving || uploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95">
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {editingId ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}/>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0f172a] rounded-2xl border border-red-900/50 p-6 max-w-sm w-full shadow-2xl z-10">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h3 className="text-white font-bold text-center mb-2">Hapus Produk?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">
                <span className="text-white font-medium">&quot;{deleteConfirm.title}&quot;</span> akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors font-medium">
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
