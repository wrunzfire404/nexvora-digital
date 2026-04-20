import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Nexvora Digital",
  description: "Syarat dan ketentuan penggunaan layanan, pembelian, pengiriman produk digital, garansi, dan kebijakan refund Nexvora Digital.",
};

const sections = [
  {
    title: "1. Penerimaan Syarat",
    content: `Dengan mengakses dan menggunakan platform Nexvora Digital (nexvoradigital.store), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini beserta seluruh kebijakan yang dirujuk di dalamnya.

Apabila Anda tidak menyetujui sebagian atau seluruh syarat ini, Anda tidak diperbolehkan untuk menggunakan layanan kami. Nexvora Digital berhak memperbarui syarat ini sewaktu-waktu tanpa pemberitahuan sebelumnya.`,
  },
  {
    title: "2. Deskripsi Layanan",
    content: `Nexvora Digital adalah platform e-commerce yang menyediakan produk dan layanan digital, termasuk namun tidak terbatas pada:

• Akses akun langganan layanan streaming (Netflix, Spotify, YouTube Premium, Disney+, dll.)
• Akun layanan produktivitas digital (ChatGPT, Canva Pro, dan sejenisnya)
• Produk digital lainnya yang tersedia di katalog kami

Seluruh produk yang kami jual merupakan produk digital yang pengirimannya dilakukan secara otomatis melalui sistem. Nexvora Digital bertindak sebagai reseller dan distributor resmi produk-produk digital tersebut.`,
  },
  {
    title: "3. Persyaratan Akun",
    content: `Untuk menggunakan layanan Nexvora Digital, Anda harus:

• Berusia minimal 17 tahun atau mendapat persetujuan orang tua/wali yang sah.
• Memberikan informasi yang akurat, terkini, dan lengkap saat mendaftar.
• Menjaga kerahasiaan kata sandi dan informasi akun Anda.
• Bertanggung jawab atas seluruh aktivitas yang terjadi melalui akun Anda.
• Segera memberitahu kami jika terjadi penggunaan akun yang tidak sah.

Nexvora Digital berhak menangguhkan atau menghapus akun yang melanggar syarat ini tanpa pemberitahuan sebelumnya.`,
  },
  {
    title: "4. Proses Pembelian",
    content: `**4.1 Pemesanan**
Pemesanan dilakukan melalui platform Nexvora Digital dengan mengisi formulir checkout secara lengkap dan akurat. Pesanan dianggap sah setelah pembayaran dikonfirmasi oleh sistem.

**4.2 Harga**
Semua harga yang tercantum dalam Rupiah (IDR) dan sudah termasuk PPN apabila berlaku. Nexvora Digital berhak mengubah harga produk sewaktu-waktu tanpa pemberitahuan sebelumnya, namun perubahan harga tidak berlaku untuk pesanan yang sudah dikonfirmasi.

**4.3 Pembayaran**
Pembayaran diproses melalui Tripay, payment gateway berlisensi di Indonesia. Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet, dan minimarket. Pembayaran harus diselesaikan dalam batas waktu yang ditentukan oleh sistem.

**4.4 Konfirmasi Pesanan**
Setelah pembayaran dikonfirmasi, sistem kami akan secara otomatis memproses pesanan Anda. Konfirmasi pesanan akan dikirimkan ke alamat email yang Anda daftarkan.`,
  },
  {
    title: "5. Pengiriman Produk Digital",
    content: `**5.1 Metode Pengiriman**
Seluruh produk Nexvora Digital dikirimkan secara digital otomatis melalui email yang Anda daftarkan saat checkout. Tidak ada pengiriman fisik.

**5.2 Waktu Pengiriman**
Produk digital dikirimkan secara otomatis dalam waktu maksimal 1x5 menit setelah pembayaran berhasil dikonfirmasi. Pada kondisi tertentu (gangguan sistem, pemeliharaan), proses dapat memakan waktu lebih lama namun tidak melebihi 1x24 jam.

**5.3 Jenis Produk yang Dikirim**
Tergantung pada produk yang Anda beli, pengiriman dapat berupa:
• Informasi login (email/password) akun yang sudah aktif
• Kode voucher atau kode aktivasi
• Link dan instruksi aktivasi layanan
• File digital atau lisensi software

**5.4 Tanggung Jawab Penerima**
Anda bertanggung jawab memastikan alamat email yang digunakan untuk transaksi aktif dan dapat menerima email. Nexvora Digital tidak bertanggung jawab atas keterlambatan yang disebabkan oleh kesalahan data yang Anda berikan.`,
  },
  {
    title: "6. Kebijakan Garansi",
    content: `**6.1 Garansi Produk**
Nexvora Digital memberikan garansi penuh atas produk yang kami jual. Garansi mencakup:
• Produk tidak berfungsi atau tidak dapat diakses sejak pertama kali diterima
• Akun bermasalah yang bukan disebabkan oleh kesalahan pengguna
• Produk tidak sesuai dengan deskripsi yang tercantum

**6.2 Masa Garansi**
Masa garansi berlaku selama durasi berlangganan yang tertera pada masing-masing produk, kecuali ditentukan lain secara spesifik pada halaman produk.

**6.3 Pengajuan Klaim Garansi**
Klaim garansi harus diajukan melalui email support@nexvoradigital.store dengan menyertakan:
• Nomor pesanan/transaksi
• Bukti pembayaran
• Deskripsi lengkap masalah yang dialami
• Screenshot atau bukti pendukung (jika ada)

Tim kami akan merespons dalam waktu 1x24 jam pada hari kerja.

**6.4 Garansi Tidak Berlaku Jika:**
• Masalah disebabkan oleh pelanggaran ketentuan penggunaan platform asli (misalnya: berbagi akun melebihi batas yang ditentukan).
• Pengguna mengubah data login atau informasi akun yang diberikan.
• Masalah terjadi akibat pemadaman layanan dari penyedia platform asli (force majeure).`,
  },
  {
    title: "7. Kebijakan Refund (Pengembalian Dana)",
    content: `**7.1 Kondisi Refund**
Nexvora Digital akan memproses pengembalian dana apabila:
• Produk tidak dapat dikirimkan dalam 24 jam setelah pembayaran dikonfirmasi.
• Produk yang diterima tidak berfungsi dan tim kami tidak dapat memperbaiki atau mengganti dalam waktu yang wajar.
• Terjadi kesalahan pemrosesan dari pihak kami yang mengakibatkan pelanggan tidak menerima produk.

**7.2 Kondisi Refund TIDAK Berlaku**
• Produk telah berhasil dikirim dan dapat diakses oleh pelanggan.
• Pengguna sudah menggunakan atau mengaktifkan produk digital tersebut.
• Klaim diajukan lebih dari 3x24 jam setelah produk diterima tanpa laporan masalah.
• Pemblokiran akun akibat penggunaan yang melanggar kebijakan platform penyedia.

**7.3 Proses Refund**
Refund yang disetujui akan diproses dalam 3-7 hari kerja ke metode pembayaran yang sama dengan yang digunakan saat pembelian. Nexvora Digital tidak bertanggung jawab atas biaya yang dikenakan oleh bank atau platform pembayaran terkait proses refund.`,
  },
  {
    title: "8. Larangan Penggunaan",
    content: `Pengguna dilarang menggunakan layanan Nexvora Digital untuk:

• Melakukan transaksi penipuan, pemalsuan data, atau identitas palsu.
• Membeli produk untuk dijual kembali tanpa izin tertulis dari Nexvora Digital.
• Menggunakan produk digital yang diperoleh untuk keperluan komersial tanpa lisensi yang sesuai.
• Melanggar hak kekayaan intelektual penyedia layanan digital asli.
• Melakukan chargebacks palsu atau klaim refund yang tidak berdasar.
• Mengeksploitasi celah sistem atau melakukan tindakan yang dapat merugikan Nexvora Digital dan pengguna lain.

Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan akun, pembatalan pesanan tanpa refund, dan/atau pelaporan kepada pihak berwenang.`,
  },
  {
    title: "9. Batasan Tanggung Jawab",
    content: `Nexvora Digital tidak bertanggung jawab atas:

• Gangguan layanan yang disebabkan oleh penyedia platform digital asli (Netflix, Spotify, dll.) di luar kendali kami.
• Kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan kami.
• Kehilangan data atau kerusakan perangkat yang disebabkan oleh penggunaan produk digital kami.
• Keterlambatan atau kegagalan yang disebabkan oleh keadaan force majeure (bencana alam, gangguan internet nasional, kebijakan pemerintah, dll.).

Tanggung jawab maksimum Nexvora Digital tidak akan melebihi jumlah yang dibayarkan oleh pelanggan untuk transaksi yang bersangkutan.`,
  },
  {
    title: "10. Hukum yang Berlaku & Penyelesaian Sengketa",
    content: `Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. 

Setiap sengketa yang timbul dari atau terkait dengan syarat ini akan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat. Apabila tidak tercapai kesepakatan dalam waktu 30 hari, sengketa akan diselesaikan melalui jalur hukum yang berlaku di Indonesia.

Untuk pertanyaan, keluhan, atau pengajuan klaim, silakan hubungi: support@nexvoradigital.store`,
  },
];

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-[#050a14]">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-700/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-blue-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Syarat & Ketentuan</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Harap baca syarat dan ketentuan berikut sebelum menggunakan layanan Nexvora Digital.
          </p>
          <p className="text-slate-600 text-xs mt-4">Terakhir diperbarui: April 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">⚖️</span>
          <p className="text-slate-400 text-sm leading-relaxed">
            Dokumen ini merupakan perjanjian hukum antara Anda ("Pengguna") dan <strong className="text-white">Nexvora Digital</strong>. 
            Dengan melakukan pembelian di platform kami, Anda dianggap telah membaca dan menyetujui seluruh ketentuan yang tercantum di bawah ini.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white/3 border border-white/8 rounded-3xl p-7 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {s.content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/3 border border-white/8 rounded-2xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-4">
            Dengan menggunakan layanan Nexvora Digital, Anda menyetujui seluruh syarat dan ketentuan di atas.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/kebijakan-privasi" className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-slate-400 hover:text-white text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/kontak" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors font-semibold">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
