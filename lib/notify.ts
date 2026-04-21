/**
 * lib/notify.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Modul pengiriman notifikasi otomatis setelah pembayaran berhasil (PAID).
 *
 * Flow pengiriman produk digital:
 * 1. Ambil stok akun dari database (field `accountStock` di Product)
 * 2. Kirim detail akun ke email pembeli (opsional, via Resend/Nodemailer)
 * 3. Kirim notifikasi ke admin via Telegram Bot
 * 4. Update stok yang sudah terpakai
 *
 * Environment variables yang diperlukan:
 *   TELEGRAM_BOT_TOKEN  — Token bot Telegram dari @BotFather
 *   TELEGRAM_ADMIN_CHAT_ID — Chat ID admin/grup Telegram untuk notifikasi
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderWithProduct {
  id: string;
  merchantRef: string;
  reference: string;
  amount: number;
  payerName: string | null;
  payerEmail: string | null;
  paymentMethod: string | null;
  paymentName: string | null;
  product: {
    id: string;
    title: string;
    category: string;
    accountStock: string | null;
  };
}

// ─── Telegram Notification ────────────────────────────────────────────────────
/**
 * Mengirim pesan ke Telegram menggunakan Bot API.
 * Menggunakan HTML parse_mode agar pesan bisa diformat dengan bold, italic, dll.
 *
 * @param chatId  - Chat ID tujuan (bisa user atau grup/channel)
 * @param message - Pesan dalam format HTML
 */
async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("[Notify] TELEGRAM_BOT_TOKEN tidak dikonfigurasi, skip Telegram notification");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    chatId,
          text:       message,
          parse_mode: "HTML", // Mendukung <b>, <i>, <code>, dll.
        }),
        signal: AbortSignal.timeout(10_000), // Timeout 10 detik
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error(`[Notify] Telegram API error: ${err}`);
      return false;
    }

    console.log(`[Notify] ✅ Telegram message sent to ${chatId}`);
    return true;

  } catch (error) {
    console.error("[Notify] Gagal mengirim ke Telegram:", error);
    return false;
  }
}

// ─── Format Rupiah ────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Notifikasi Admin Telegram ────────────────────────────────────────────────
/**
 * Kirim notifikasi ke chat admin Telegram saat ada pembayaran berhasil.
 * Berguna untuk monitoring real-time pesanan masuk.
 */
export async function notifyAdminTelegram(order: OrderWithProduct): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn("[Notify] TELEGRAM_ADMIN_CHAT_ID tidak dikonfigurasi");
    return;
  }

  const message = [
    "🎉 <b>PEMBAYARAN BERHASIL!</b>",
    "",
    `📦 <b>Produk:</b> ${order.product.title}`,
    `🏷️ <b>Kategori:</b> ${order.product.category}`,
    `💰 <b>Nominal:</b> ${formatRupiah(order.amount)}`,
    `💳 <b>Metode:</b> ${order.paymentName ?? order.paymentMethod ?? "-"}`,
    "",
    `👤 <b>Pembeli:</b> ${order.payerName ?? "-"}`,
    `📧 <b>Email:</b> <code>${order.payerEmail ?? "-"}</code>`,
    "",
    `🔑 <b>Merchant Ref:</b> <code>${order.merchantRef}</code>`,
    `🔗 <b>Tripay Ref:</b> <code>${order.reference}</code>`,
    "",
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
  ].join("\n");

  await sendTelegramMessage(adminChatId, message);
}

// ─── Kirim Produk Digital ke Pembeli ─────────────────────────────────────────
/**
 * MAIN FUNCTION: Trigger pengiriman produk digital setelah pembayaran PAID.
 *
 * Cara kerja:
 * 1. Kirim notifikasi admin Telegram
 * 2. (TODO) Ambil stok akun dari DB dan kirim ke pembeli
 *
 * @param order - Order yang telah berhasil dibayar (dengan relasi product)
 */
export async function triggerProductDelivery(order: OrderWithProduct): Promise<void> {
  console.log(`[Notify] 🚀 Memulai pengiriman produk untuk order ${order.merchantRef}`);

  // ── 1. Notifikasi admin Telegram ───────────────────────────────────────────
  // Jalankan secara paralel untuk efisiensi, bungkus try-catch agar
  // kegagalan notifikasi tidak menghentikan proses utama.
  const notifyPromises: Promise<unknown>[] = [
    notifyAdminTelegram(order).catch(err =>
      console.error("[Notify] Admin Telegram gagal:", err)
    ),
  ];

  // ── 2. Kirim detail akun ke pembeli (Email / Telegram) ────────────────────
  if (order.product.accountStock) {
    // Cek apakah pembeli dari Telegram (dikenali dari format email)
    if (order.payerEmail && order.payerEmail.startsWith('tg_')) {
      const buyerChatId = order.payerEmail.split('@')[0].replace('tg_', '');
      
      const deliveryMessage = [
        "✅ <b>Pesanan Anda Berhasil Diproses!</b>",
        "",
        `📦 <b>${order.product.title}</b>`,
        `🔗 <b>Resi:</b> <code>${order.reference}</code>`,
        "",
        "<b>DETAIL AKUN ANDA:</b>",
        `<code>${order.product.accountStock}</code>`,
        "",
        "⚠️ <i>Tolong jangan bagikan detail di atas kepada siapa pun.</i>",
        "Terima kasih telah berbelanja di Nexvora Digital! 🙏"
      ].join("\n");
      
      notifyPromises.push(
        sendTelegramMessage(buyerChatId, deliveryMessage)
      );
    } else {
      // TODO: Logika pengiriman via Email (jika dari Web)
      console.log(`[Notify] Pembeli bukan via Telegram (${order.payerEmail}). Harap implementasi Nodemailer/Resend.`);
    }
  } else {
    console.warn(`[Notify] Produk ${order.product.title} belum memiliki stok akun digital (accountStock kosong)`);
  }

  // Tunggu semua notifikasi selesai
  await Promise.allSettled(notifyPromises);

  console.log(`[Notify] ✅ Proses pengiriman selesai untuk order ${order.merchantRef}`);
}
