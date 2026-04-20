"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KontakPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email tidak valid.";
    if (!form.subject.trim()) e.subject = "Subjek wajib diisi.";
    if (!form.message.trim() || form.message.length < 20) e.message = "Pesan minimal 20 karakter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: "📧", label: "Email Support", value: "support@nexvoradigital.store", desc: "Respons dalam 1x24 jam" },
    { icon: "🌐", label: "Website", value: "nexvoradigital.store", desc: "Platform belanja digital kami" },
    { icon: "⏰", label: "Jam Operasional", value: "Setiap hari, 08.00 – 22.00 WIB", desc: "Termasuk hari libur nasional" },
  ];

  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Hubungi Kami</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ada Pertanyaan? <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Kami Siap</span> Membantu
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Tim customer support Nexvora Digital siap membantu menyelesaikan setiap pertanyaan dan kendala Anda.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-white font-bold text-sm uppercase tracking-widest mb-6">Informasi Kontak</p>
            {contactInfo.map(c => (
              <div key={c.label} className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">{c.label}</p>
                  <p className="text-white font-semibold text-sm">{c.value}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 mt-6">
              <p className="text-blue-400 font-semibold text-sm mb-2">💡 Tips Cepat</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Untuk respon lebih cepat, sertakan nomor order atau ID transaksi Anda dalam pesan. 
                Kami akan memprioritaskan penanganan masalah terkait transaksi aktif.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
              <p className="text-white font-bold text-base mb-6">Kirim Pesan</p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-5xl mb-5">✅</div>
                    <h3 className="text-white font-bold text-xl mb-3">Pesan Terkirim!</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                      Terima kasih telah menghubungi kami. Tim support kami akan membalas pesan Anda dalam 1x24 jam ke email:{" "}
                      <span className="text-white font-semibold">{form.email}</span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[
                      { id: "kontak-name", key: "name", label: "Nama Lengkap", type: "text", placeholder: "Nama Anda" },
                      { id: "kontak-email", key: "email", label: "Alamat Email", type: "email", placeholder: "email@contoh.com" },
                      { id: "kontak-subject", key: "subject", label: "Subjek", type: "text", placeholder: "Topik pesan Anda" },
                    ].map(f => (
                      <div key={f.key}>
                        <label htmlFor={f.id} className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">{f.label}</label>
                        <input
                          id={f.id}
                          type={f.type}
                          value={form[f.key as keyof typeof form]}
                          onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: "" })); }}
                          placeholder={f.placeholder}
                          className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/50 ${errors[f.key] ? "border-red-500/60" : "border-white/10 focus:border-blue-500/60"}`}
                        />
                        {errors[f.key] && <p className="text-red-400 text-xs mt-1.5">⚠ {errors[f.key]}</p>}
                      </div>
                    ))}

                    <div>
                      <label htmlFor="kontak-message" className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Pesan</label>
                      <textarea
                        id="kontak-message"
                        rows={5}
                        value={form.message}
                        onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: "" })); }}
                        placeholder="Jelaskan pertanyaan atau kendala Anda secara detail..."
                        className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/50 resize-none ${errors.message ? "border-red-500/60" : "border-white/10 focus:border-blue-500/60"}`}
                      />
                      {errors.message && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.message}</p>}
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-2xl font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg, #1a6cff, #0041cc)", boxShadow: "0 0 30px rgba(26,108,255,0.4)" }}
                    >
                      Kirim Pesan →
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
