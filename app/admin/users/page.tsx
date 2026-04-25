"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, UserCircle, Trash2, ArrowRightLeft } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast("Gagal memuat data user", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const confirm = window.confirm(
      `Ubah role "${user.name}" menjadi ${newRole}?`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        showToast(`Role ${user.name} diubah menjadi ${newRole}`, "success");
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal mengubah role", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Hapus user "${user.name}" (${user.email})?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`User "${user.name}" berhasil dihapus`, "success");
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus user", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-500 text-sm mt-1">Manajemen akun pengguna Nexvora Digital</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm shadow-sm font-medium">
          Total: <span className="text-gray-900 font-bold">{users.length}</span> user
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                <th className="px-6 py-4 font-bold">PENGGUNA</th>
                <th className="px-6 py-4 font-bold">EMAIL</th>
                <th className="px-6 py-4 font-bold">ROLE</th>
                <th className="px-6 py-4 font-bold">BERGABUNG</th>
                <th className="px-6 py-4 font-bold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">Tidak ada user ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 border border-blue-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {user.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRoleToggle(user)}
                          className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-blue-200"
                          title="Ubah Role"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          {user.role === "ADMIN" ? "Jadikan USER" : "Jadikan ADMIN"}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
