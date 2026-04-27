/**
 * lib/notify.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Modul pengiriman notifikasi otomatis setelah pembayaran berhasil (PAID).
 *
 * Flow pengiriman produk digital:
 * 1. Kirim notifikasi ke admin via Telegram Bot
 * 2. Kirim akun ke pembeli via Telegram (jika dari bot) + tombol OTP jika aktif
 * 3. Kirim invoice + akun ke pembeli via Email (Resend)
 * ─────────────────────────────────────────────────────────────────────────────
 */


import { sendDeliveryEmail } from "@/lib/email";
import { isOtpSupportedEmail } from "@/lib/tempmail";

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
    isOtpEnabled?: boolean;     // Flag apakah produk mendukung fitur OTP
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
interface TelegramInlineButton {
  text:          string;
  callback_data: string;
}

async function sendTelegramMessage(
  chatId:        string,
  message:       string,
  inlineButtons?: TelegramInlineButton[][],  // Array of rows → columns
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("[Notify] TELEGRAM_BOT_TOKEN tidak dikonfigurasi, skip Telegram notification");
    return false;
  }

  try {
    const payload: Record<string, unknown> = {
      chat_id:    chatId,
      text:       message,
      parse_mode: "HTML", // Mendukung <b>, <i>, <code>, dll.
    };

    // Tambahkan inline keyboard jika ada tombol
    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
        signal:  AbortSignal.timeout(10_000), // Timeout 10 detik
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
    ...(order.product.accountStock ? [
      `🔐 <b>AKUN DIGITAL DIBERIKAN:</b>`,
      `<code>${order.product.accountStock}</code>`,
      ""
    ] : []),
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
  const notifyPromises: Promise<unknown>[] = [
    notifyAdminTelegram(order).catch(err =>
      console.error("[Notify] Admin Telegram gagal:", err)
    ),
  ];

  // ── 2. Kirim detail akun ke pembeli ───────────────────────────────────────
  if (order.product.accountStock) {
    const accountData = order.product.accountStock;

    // 2a. Pembeli dari Bot Telegram (email format: tg_CHATID@nexvora.digital)
    if (order.payerEmail && order.payerEmail.startsWith('tg_')) {
      const buyerChatId = order.payerEmail.split('@')[0].replace('tg_', '');

      const appUrl = process.env.NEXTAUTH_URL ?? "https://nexvoradigital.store";
      const deliveryMessage = [
        "✅ <b>Pesanan Anda Berhasil Diproses!</b>",
        "",
        `📦 <b>${order.product.title}</b>`,
        `🔗 <b>Resi:</b> <code>${order.reference}</code>`,
        "",
        "<b>DETAIL AKUN ANDA:</b>",
        `<code>${accountData}</code>`,
        "",
        "⚠️ <i>Tolong jangan bagikan detail di atas kepada siapa pun.</i>",
        "",
        `🔗 <b>Simpan link ini</b> untuk akses detail akun &amp; OTP kapan saja:`,
        `<a href="${appUrl}/orders/${order.merchantRef}">${appUrl}/orders/${order.merchantRef}</a>`,
        "",
        "Terima kasih telah berbelanja di Nexvora Digital! 🙏"
      ].join("\n");

      // ── Cek apakah perlu menampilkan tombol OTP ───────────────────────────
      // Ekstrak email dari format: "email@booplink.xyz:password"
      const accountEmailMatch = accountData.match(/([^\s:]+@booplink\.xyz)/i);
      const accountEmail      = accountEmailMatch ? accountEmailMatch[1] : null;
      const showOtpButton     = order.product.isOtpEnabled === true
                                && isOtpSupportedEmail(accountEmail);

      // Buat inline keyboard OTP jika kondisi terpenuhi
      const inlineButtons: TelegramInlineButton[][] | undefined = showOtpButton
        ? [[
            {
              text:          "📥 Minta Kode OTP",
              callback_data: `request_otp_${order.id}`,
            }
          ]]
        : undefined;

      notifyPromises.push(
        sendTelegramMessage(buyerChatId, deliveryMessage, inlineButtons)
      );
    }

    // 2b. Pembeli dari Web — kirim invoice + akun via Email (Resend)
    if (order.payerEmail && !order.payerEmail.startsWith('tg_')) {
      notifyPromises.push(
        sendDeliveryEmail({
          customerName:    order.payerName    ?? "Pelanggan",
          customerEmail:   order.payerEmail,
          productTitle:    order.product.title,
          productCategory: order.product.category,
          merchantRef:     order.merchantRef,
          tripayRef:       order.reference,
          amount:          order.amount,
          paymentMethod:   order.paymentMethod ?? "-",
          accountData,
        }).catch(err => console.error("[Notify] Email delivery gagal:", err))
      );
    }
  } else {
    console.warn(`[Notify] Produk ${order.product.title} belum memiliki stok akun digital (accountStock kosong)`);
  }

  // Tunggu semua notifikasi selesai
  await Promise.allSettled(notifyPromises);

  console.log(`[Notify] ✅ Proses pengiriman selesai untuk order ${order.merchantRef}`);
}
