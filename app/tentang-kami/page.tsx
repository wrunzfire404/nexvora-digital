import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tentang Kami — Nexvora Digital",
  description: "Nexvora Digital adalah platform penyedia akses aplikasi premium dan produk digital terpercaya di Indonesia.",
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-700/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-700/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-8 relative">
            <Image src="/nexlogo.png" alt="Nexvora Digital" fill sizes="64px" className="object-contain" style={{ mixBlendMode: "screen" }} />
          </div>
          <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Tentang Kami</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Nexvora <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Digital</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Platform terpercaya untuk akses layanan aplikasi premium dan produk digital di Indonesia.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <div className="space-y-8">

          <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Siapa Kami?</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              <strong className="text-white">Nexvora Digital</strong> adalah perusahaan teknologi yang bergerak di bidang distribusi
              produk digital dan layanan akses aplikasi premium. Didirikan dengan visi untuk mempermudah akses masyarakat Indonesia
              terhadap layanan digital berkualitas tinggi dengan harga yang terjangkau dan proses yang aman.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Kami menyediakan akses ke berbagai platform digital terkemuka seperti Netflix, Spotify, YouTube Premium, Disney+,
              ChatGPT, Canva Pro, dan berbagai layanan lainnya — semuanya dalam satu platform yang mudah digunakan.
            </p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Visi & Misi</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">Visi</h3>
                <p className="text-slate-400 leading-relaxed">
                  Menjadi platform distribusi produk digital terdepan dan paling terpercaya di Indonesia, yang mampu menjangkau
                  seluruh lapisan masyarakat dengan layanan berkualitas premium.
                </p>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">Misi</h3>
                <ul className="space-y-2 text-slate-400">
                  {[
                    "Menyediakan akses produk digital premium dengan harga yang kompetitif dan terjangkau.",
                    "Memastikan setiap transaksi berjalan aman, cepat, dan transparan melalui sistem pembayaran terverifikasi.",
                    "Memberikan layanan pelanggan yang responsif dan solusi yang tepat untuk setiap kebutuhan pengguna.",
                    "Terus berinovasi untuk menghadirkan produk dan layanan terbaru sesuai kebutuhan pasar digital Indonesia.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">Keunggulan Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "⚡", title: "Pengiriman Instan", desc: "Produk digital dikirimkan otomatis dalam hitungan detik setelah pembayaran berhasil dikonfirmasi." },
                { icon: "🔒", title: "Transaksi Aman", desc: "Seluruh transaksi diproses melalui payment gateway resmi yang telah terverifikasi dan berlisensi." },
                { icon: "🛡️", title: "Garansi Penuh", desc: "Setiap produk dilindungi garansi. Tidak puas? Kami siap memberikan solusi terbaik untuk Anda." },
                { icon: "💬", title: "Support Responsif", desc: "Tim customer support kami siap membantu Anda 7 hari seminggu melalui berbagai saluran komunikasi." },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/5">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Informasi Perusahaan</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: "Nama Toko", value: "Nexvora Digital" },
                { label: "Website", value: "nexvoradigital.store" },
                { label: "Email", value: "support@nexvoradigital.store" },
                { label: "Bidang Usaha", value: "Distribusi Produk & Layanan Digital" },
                { label: "Wilayah Layanan", value: "Seluruh Indonesia" },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <span className="text-slate-500 w-36 flex-shrink-0">{item.label}</span>
                  <span className="text-white">: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              Hubungi Kami →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
