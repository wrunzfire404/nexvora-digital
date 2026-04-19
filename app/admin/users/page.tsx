"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kelola User</h1>
          <p className="text-slate-400">Manajemen akun pengguna Nexvora Digital</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm">
          Total: <span className="text-white font-bold">{users.length}</span> user
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            placeholder="Cari user berdasarkan nama atau email..."
            className="w-full sm:max-w-sm px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-700">
                <th className="px-6 py-4 font-medium">PENGGUNA</th>
                <th className="px-6 py-4 font-medium">EMAIL</th>
                <th className="px-6 py-4 font-medium">ROLE</th>
                <th className="px-6 py-4 font-medium">BERGABUNG</th>
                <th className="px-6 py-4 font-medium text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-700/50 hover:bg-slate-800/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-slate-600/50 text-slate-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleRoleToggle(user)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        {user.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Hapus
                      </button>
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
