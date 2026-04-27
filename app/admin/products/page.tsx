"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CATEGORIES, getBrandInfo } from "@/components/BrandLogos";
import { Plus, Search, Image as ImageIcon, X, Trash2, Edit2, Zap, MessageCircle, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Product = {
  id: string; title: string; description: string;
  price: number; stock: number; imageUrl: string;
  category: string; isAvailable: boolean; accountStock?: string;
  deliveryMode: string; poNote?: string;
  isOtpEnabled: boolean;  // Tombol Minta Kode OTP
};

const EMPTY_FORM = {
  title: "", description: "", price: "", stock: "0",
  imageUrl: "", category: "Netflix", isAvailable: true, accountStock: "",
  deliveryMode: "INSTANT",
  isOtpEnabled: false,
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
        deliveryMode: product.deliveryMode || "INSTANT",
        isOtpEnabled: product.isOtpEnabled ?? false,
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
    const payload = {
      ...formData,
      price:        parseFloat(formData.price),
      stock:        parseInt(formData.stock),
      isOtpEnabled: formData.isOtpEnabled,  // Sertakan flag OTP
    };
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Total {products.length} produk · {products.filter(p=>p.isAvailable&&p.stock>0).length} tersedia</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari produk atau kategori..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Produk</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Harga</th>
                <th className="px-6 py-4 font-bold">Stok</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4">
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"/>
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada produk. Klik 'Tambah Produk' untuk mulai."}
                </td></tr>
              ) : filtered.map(product => {
                const brand = getBrandInfo(product.category);
                const BrandIcon = brand.Logo;
                return (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative border border-gray-200">
                          {product.imageUrl
                            ? <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="40px"/>
                            : <div className="w-full h-full flex items-center justify-center p-1.5 bg-gray-50">
                                <BrandIcon className="w-6 h-6"/>
                              </div>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                          {product.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold ${product.stock > 5 || product.stock >= 999000 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                          {product.stock >= 999000 ? "Unlimited" : product.stock}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                          {product.deliveryMode === "INSTANT" ? <><Zap className="w-3 h-3 text-orange-400"/> Instan</> : product.deliveryMode === "MANUAL" ? <><MessageCircle className="w-3 h-3 text-blue-400"/> Manual</> : <><Clock className="w-3 h-3 text-purple-400"/> PO</>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.isAvailable && product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.isAvailable && product.stock > 0 ? <><CheckCircle2 className="w-3 h-3"/> Aktif</> : <><XCircle className="w-3 h-3"/> Nonaktif</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}/>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-full">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{editingId ? "Perbarui informasi produk" : "Isi detail produk yang akan dijual"}</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Produk</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Preview */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                        {preview ? (
                          <Image src={preview} alt="preview" fill className="object-cover" sizes="96px"/>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        <button type="button" onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                          {uploading ? (
                            <><span className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"/>Mengupload...</>
                          ) : (
                            <><ImageIcon className="w-4 h-4" /> Upload Gambar</>
                          )}
                        </button>
                        <p className="text-[11px] text-gray-500">JPG, PNG, WebP. Maks 5MB.</p>
                        <input type="text" placeholder="Atau masukkan URL gambar langsung..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={formData.imageUrl}
                          onChange={e => { setFormData(f => ({...f, imageUrl: e.target.value})); setPreview(e.target.value); }}/>
                      </div>
                    </div>
                  </div>

                  {/* Judul & Kategori */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Produk *</label>
                      <input type="text" required
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="cth: Netflix Premium 1 Bulan"
                        value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))}/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Kategori *</label>
                      <div className="relative">
                        <select required
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm appearance-none cursor-pointer"
                          value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value}))}>
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {(() => { const b = getBrandInfo(formData.category); return <b.Logo className="w-4 h-4" />; })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tipe Pengiriman & Harga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipe Pengiriman *</label>
                      <div className="relative">
                        <select required
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm appearance-none cursor-pointer"
                          value={formData.deliveryMode} onChange={e => {
                            const newMode = e.target.value;
                            if (newMode === "INSTANT") {
                              const lines = formData.accountStock.split('\n').filter(line => line.trim() !== '').length;
                              setFormData(f => ({...f, deliveryMode: newMode, stock: lines.toString()}));
                            } else {
                              setFormData(f => ({...f, deliveryMode: newMode}));
                            }
                          }}>
                          <option value="INSTANT">⚡ Instan (Otomatis)</option>
                          <option value="MANUAL">💬 Manual (Proses Admin)</option>
                          <option value="PO">⏳ Pre-Order (PO)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Harga (Rp) *</label>
                      <input type="number" min="0" required
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="45000"
                        value={formData.price} onChange={e => setFormData(f => ({...f, price: e.target.value}))}/>
                    </div>
                  </div>

                  {/* Stok */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Total Stok</label>
                    <input type="number" required
                      readOnly={formData.deliveryMode === "INSTANT"}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.deliveryMode === "INSTANT"
                          ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="Masukkan stok..."
                      value={formData.stock}
                      onChange={e => setFormData(f => ({...f, stock: e.target.value}))}
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      {formData.deliveryMode === "INSTANT" 
                        ? "Mode Instan: Stok dihitung otomatis dari baris Akun/Lisensi di bawah." 
                        : "Mode Manual/PO: Masukkan stok secara manual. Isi angka 999999 untuk Unlimited."}
                    </p>
                  </div>

                  {/* Account Stock */}
                  {formData.deliveryMode === "INSTANT" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Daftar Akun / Lisensi (1 baris = 1 stok) *</label>
                      <textarea rows={5} required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:outline-none resize-y text-sm font-mono whitespace-pre shadow-inner"
                        placeholder="email1@gmail.com : pass1&#10;email2@gmail.com : pass2&#10;Atau link aktivasi..."
                        value={formData.accountStock} 
                        onChange={e => {
                          const val = e.target.value;
                          const lines = val.split('\n').filter(line => line.trim() !== '').length;
                          setFormData(f => ({...f, accountStock: val, stock: lines.toString()}));
                        }}/>
                    </motion.div>
                  )}

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi *</label>
                    <textarea required rows={4}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-y text-sm"
                      placeholder="Deskripsi lengkap produk..."
                      value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))}/>
                  </div>

                  {/* Toggle Aktif */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Tampilkan di Katalog</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Produk bisa dilihat dan dibeli pembeli</p>
                    </div>
                    <button type="button" onClick={() => setFormData(f => ({...f, isAvailable: !f.isAvailable}))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${formData.isAvailable ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isAvailable ? "translate-x-6" : "translate-x-0"}`}/>
                    </button>
                  </div>

                  {/* Toggle OTP */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-blue-900">Aktifkan Tombol OTP</p>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">@booplink.xyz</span>
                      </div>
                      <p className="text-[11px] text-blue-600 mt-0.5">Tampilkan tombol "📥 Minta Kode OTP" di Telegram &amp; Web setelah akun dikirim</p>
                    </div>
                    <button type="button" onClick={() => setFormData(f => ({...f, isOtpEnabled: !f.isOtpEnabled}))}
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${formData.isOtpEnabled ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isOtpEnabled ? "translate-x-6" : "translate-x-0"}`}/>
                    </button>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm">
                  Batal
                </button>
                <button type="submit" form="productForm" disabled={saving || uploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-2">
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
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}/>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl border border-gray-200 p-6 max-w-sm w-full shadow-xl z-10">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-center mb-2">Hapus Produk?</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                <span className="text-gray-900 font-bold">&quot;{deleteConfirm.title}&quot;</span> akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium text-sm">
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
