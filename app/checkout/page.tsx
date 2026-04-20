import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, ArrowRight, Store, AlertCircle } from "lucide-react";

// Halaman ini bersifat dinamis (mengambil searchParams dari URL)
export const dynamic = "force-dynamic";

export default async function GlobalCheckoutStatusPage({
  searchParams,
}: {
  searchParams: { merchant_ref?: string; reference?: string; [key: string]: string | undefined };
}) {
  const ref = searchParams.merchant_ref || searchParams.reference;

  // Jika diakses tanpa parameter dari Tripay
  if (!ref) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 font-sans selection:bg-white/20">
         <div className="w-16 h-16 bg-[#111111] border border-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-white/5">
            <Store className="w-8 h-8 text-neutral-500" />
         </div>
         <h1 className="text-2xl font-semibold text-white mb-2">Halaman Pembayaran</h1>
         <p className="text-neutral-400 mb-8 max-w-sm text-center text-sm leading-relaxed">
           Silakan pilih produk dari katalog kami untuk memulai transaksi baru.
         </p>
         <Link href="/products" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-sm">
           Lihat Katalog Produk
         </Link>
      </div>
    );
  }

  // Fetch data pesanan berdasarkan merchantRef
  const order = await prisma.order.findUnique({
    where: { merchantRef: ref },
    include: { product: true },
  });

  if (!order) {
    // Jika tidak ketemu, coba cari berdasarkan Tripay reference (jaga-jaga)
    const orderByRef = await prisma.order.findFirst({
      where: { reference: ref },
      include: { product: true },
    });
    
    if (!orderByRef) {
      return (
        <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-4 font-sans">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Pesanan Tidak Ditemukan</h1>
          <p className="text-neutral-500 mb-8 text-center text-sm">Referensi: {ref}</p>
          <Link href="/products" className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 border border-neutral-800 transition-colors text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      );
    }
    return renderOrderStatus(orderByRef);
  }

  return renderOrderStatus(order);
}

// ─── Komponen Tampilan Status Pesanan ─────────────────────────────────────────

function renderOrderStatus(order: any) {
  const isPending = order.status === "PENDING" || order.status === "UNPAID";
  const isPaid = order.status === "PAID";
  const isFailed = order.status === "FAILED" || order.status === "EXPIRED" || order.status === "REFUND";

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans selection:bg-white/20">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
        <div className={`w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${isPaid ? 'bg-emerald-600' : isFailed ? 'bg-red-600' : 'bg-blue-600'}`} />
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-2xl">
        
        {/* Status Header */}
        <div className="flex flex-col items-center text-center border-b border-neutral-800/80 pb-6 mb-6">
          {isPending && (
             <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
             </div>
          )}
          {isPaid && (
             <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
             </div>
          )}
          {isFailed && (
             <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
             </div>
          )}

          <h1 className="text-xl font-semibold text-white mb-1">
            {isPending ? "Menunggu Pembayaran" : isPaid ? "Pembayaran Berhasil" : "Pembayaran Gagal"}
          </h1>
          <p className="text-sm text-neutral-400 font-mono mt-1">ID: {order.merchantRef}</p>
        </div>

        {/* Order Info */}
        <div className="space-y-4 mb-8">
           <div className="bg-[#111111] border border-neutral-800/50 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">{order.product.category}</p>
                 <p className="text-sm font-medium text-white truncate">{order.product.title}</p>
              </div>
           </div>
           
           <div className="flex justify-between items-center text-sm px-1">
              <span className="text-neutral-500">Metode</span>
              <span className="text-neutral-200 font-medium">{order.paymentMethod}</span>
           </div>
           <div className="flex justify-between items-center text-sm px-1">
              <span className="text-neutral-500">Total</span>
              <span className="text-white font-semibold">Rp {order.amount.toLocaleString("id-ID")}</span>
           </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="space-y-3">
             <a 
               href={order.checkoutUrl} 
               className="w-full py-3.5 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors text-sm"
             >
                Lanjutkan Pembayaran <ArrowRight className="w-4 h-4" />
             </a>
             <p className="text-center text-[11px] text-neutral-500">
                Selesaikan pembayaran Anda. Invoice ini masih aktif.
             </p>
          </div>
        )}

        {isPaid && (
          <div className="space-y-3">
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
               <p className="text-emerald-400 text-sm font-medium">Pesanan sedang diproses.</p>
               <p className="text-emerald-500/80 text-xs mt-1">Cek WhatsApp atau Email Anda untuk detail produk.</p>
             </div>
             <Link href="/products" className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-800 transition-colors text-sm border border-neutral-800">
                Belanja Lagi
             </Link>
          </div>
        )}

        {isFailed && (
          <Link href={`/products/${order.productId}`} className="w-full py-3.5 bg-white text-black font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors text-sm">
             Buat Pesanan Baru
          </Link>
        )}

      </div>
    </div>
  );
}
