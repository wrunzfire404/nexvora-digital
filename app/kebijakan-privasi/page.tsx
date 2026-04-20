import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Nexvora Digital",
  description: "Kebijakan privasi Nexvora Digital mengenai pengumpulan, penggunaan, dan perlindungan data pribadi pengguna.",
};

const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content: `Nexvora Digital mengumpulkan informasi pribadi yang Anda berikan secara sukarela saat menggunakan layanan kami, termasuk:

**Data Identitas:** Nama lengkap, alamat email, dan nomor WhatsApp/telepon yang Anda daftarkan saat membuat akun atau melakukan transaksi.

**Data Transaksi:** Riwayat pembelian, detail pesanan, metode pembayaran yang digunakan (diproses secara aman oleh payment gateway pihak ketiga), dan waktu transaksi.

**Data Teknis:** Alamat IP, jenis browser, sistem operasi, dan data cookies yang dikumpulkan secara otomatis saat Anda mengakses platform kami untuk keperluan keamanan dan peningkatan layanan.`,
  },
  {
    title: "2. Cara Kami Menggunakan Data Anda",
    content: `Data pribadi yang kami kumpulkan digunakan untuk keperluan berikut:

• Memproses dan memenuhi pesanan produk digital Anda secara otomatis.
• Mengirimkan konfirmasi pesanan, invoice, dan produk digital ke email atau WhatsApp Anda.
• Mengelola akun pengguna dan memastikan keamanan akses platform.
• Memberikan layanan customer support dan menangani klaim garansi atau refund.
• Memenuhi kewajiban hukum dan peraturan yang berlaku di Indonesia.
• Mencegah penipuan, penyalahgunaan layanan, dan aktivitas ilegal lainnya.`,
  },
  {
    title: "3. Perlindungan Data Pribadi",
    content: `Nexvora Digital berkomitmen untuk melindungi data pribadi Anda dengan menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai, antara lain:

• Enkripsi SSL/TLS untuk seluruh transmisi data antara perangkat Anda dan server kami.
• Sistem autentikasi yang aman dengan proteksi kata sandi terenkripsi.
• Pembatasan akses data hanya kepada personel yang memerlukan untuk keperluan operasional.
• Pemantauan sistem secara berkala untuk mendeteksi dan mencegah akses tidak sah.
• Proses pembayaran dilakukan sepenuhnya oleh Tripay, payment gateway berlisensi yang telah memenuhi standar keamanan PCI-DSS.`,
  },
  {
    title: "4. Berbagi Data dengan Pihak Ketiga",
    content: `Kami TIDAK menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga manapun untuk keperluan komersial. Data Anda hanya dapat dibagikan dalam kondisi berikut:

• **Penyedia Layanan:** Mitra teknis yang membantu operasional platform (hosting, payment gateway Tripay, layanan email) dengan kewajiban kerahasiaan yang ketat.
• **Kewajiban Hukum:** Apabila diwajibkan oleh hukum, peraturan perundang-undangan, atau perintah pengadilan yang berlaku di Indonesia.
• **Perlindungan Hak:** Untuk melindungi hak, properti, atau keselamatan Nexvora Digital, pengguna kami, atau publik.`,
  },
  {
    title: "5. Cookies dan Teknologi Pelacakan",
    content: `Platform kami menggunakan cookies dan teknologi pelacakan serupa untuk meningkatkan pengalaman pengguna. Cookies yang kami gunakan meliputi:

• **Cookies Esensial:** Diperlukan untuk fungsi dasar platform, termasuk sesi login dan keamanan.
• **Cookies Analitik:** Membantu kami memahami cara pengguna berinteraksi dengan platform (data anonim).
• **Cookies Preferensi:** Menyimpan preferensi Anda untuk pengalaman yang lebih personal.

Anda dapat mengatur penggunaan cookies melalui pengaturan browser Anda. Namun, menonaktifkan cookies tertentu dapat mempengaruhi fungsi platform.`,
  },
  {
    title: "6. Penyimpanan dan Retensi Data",
    content: `Data pribadi Anda disimpan selama akun Anda aktif atau diperlukan untuk memberikan layanan kepada Anda. Data transaksi disimpan sesuai dengan kewajiban hukum dan akuntansi yang berlaku (umumnya 5 tahun sesuai ketentuan perpajakan Indonesia).

Apabila Anda menghapus akun, kami akan menghapus atau menganonim-kan data pribadi Anda dalam waktu 30 hari kerja, kecuali jika penyimpanan lebih lama diwajibkan oleh hukum.`,
  },
  {
    title: "7. Hak-Hak Anda",
    content: `Sesuai dengan peraturan perlindungan data yang berlaku, Anda memiliki hak-hak berikut terkait data pribadi Anda:

• **Hak Akses:** Meminta salinan data pribadi yang kami miliki tentang Anda.
• **Hak Koreksi:** Meminta koreksi data yang tidak akurat atau tidak lengkap.
• **Hak Penghapusan:** Meminta penghapusan data pribadi Anda dalam kondisi tertentu.
• **Hak Pembatasan:** Meminta pembatasan pemrosesan data Anda.
• **Hak Portabilitas:** Menerima data Anda dalam format yang dapat dibaca mesin.

Untuk menggunakan hak-hak tersebut, silakan hubungi kami melalui email support@nexvoradigital.store.`,
  },
  {
    title: "8. Perubahan Kebijakan Privasi",
    content: `Nexvora Digital berhak memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan material akan diberitahukan kepada Anda melalui email yang terdaftar atau notifikasi di platform setidaknya 7 hari sebelum perubahan berlaku.

Dengan terus menggunakan layanan kami setelah perubahan diberlakukan, Anda dianggap menyetujui Kebijakan Privasi yang telah diperbarui.`,
  },
  {
    title: "9. Hubungi Kami",
    content: `Apabila Anda memiliki pertanyaan, kekhawatiran, atau keluhan terkait Kebijakan Privasi ini atau cara kami mengelola data pribadi Anda, silakan hubungi:

**Nexvora Digital**
Email: support@nexvoradigital.store
Website: nexvoradigital.store`,
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-700/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Kebijakan Privasi</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Nexvora Digital berkomitmen untuk melindungi privasi dan data pribadi Anda.
          </p>
          <p className="text-slate-600 text-xs mt-4">Terakhir diperbarui: April 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        {/* Intro */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <p className="text-slate-400 text-sm leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana <strong className="text-white">Nexvora Digital</strong> mengumpulkan, 
            menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform dan layanan kami. 
            Dengan mengakses dan menggunakan layanan Nexvora Digital, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white/3 border border-white/8 rounded-3xl p-7 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {s.content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
          >
            Hubungi Tim Kami →
          </Link>
        </div>
      </div>
    </div>
  );
}
