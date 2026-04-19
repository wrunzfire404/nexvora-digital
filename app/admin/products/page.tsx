"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    category: "",
    isAvailable: true,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || "",
        category: product.category,
        isAvailable: product.isAvailable,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        category: "",
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeModal();
        fetchProducts();
      } else {
        alert("Terjadi kesalahan saat menyimpan produk");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${title}"?`)) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchProducts();
        } else {
          alert("Gagal menghapus produk");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kelola Produk</h1>
          <p className="text-slate-400">Atur katalog produk Nexvora Digital</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          + Tambah Produk
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full sm:max-w-xs px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-700">
                <th className="px-6 py-4 font-medium">INFO PRODUK</th>
                <th className="px-6 py-4 font-medium">KATEGORI</th>
                <th className="px-6 py-4 font-medium">HARGA</th>
                <th className="px-6 py-4 font-medium">STOK</th>
                <th className="px-6 py-4 font-medium">STATUS</th>
                <th className="px-6 py-4 font-medium text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{product.title}</div>
                      <div className="text-slate-500 text-xs truncate max-w-[200px]">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="px-2 py-1 bg-slate-700 rounded-md text-xs">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isAvailable && product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.isAvailable && product.stock > 0 ? 'Tersedia' : 'Habis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(product)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog Box */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={closeModal}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-white pb-1 text-2xl leading-none">&times;</button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Judul Produk *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Kategori *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Harga (Rp) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Stok *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Gambar URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Lengkap *</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    <label htmlFor="isAvailable" className="ml-2 text-sm text-slate-300">
                      Produk Tersedia (Publish)
                    </label>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="productForm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
