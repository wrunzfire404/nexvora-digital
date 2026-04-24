/**
 * app/api/callback/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: POST /api/callback
 * Webhook endpoint yang dipanggil oleh Tripay saat status pembayaran berubah.
 *
 * KEAMANAN PENTING:
 * - Setiap request divalidasi menggunakan HMAC-SHA256 signature
 * - Signature dihitung dari raw body JSON
 * - Dibandingkan dengan header "X-Callback-Signature"
 *
 * Flow setelah pembayaran PAID:
 * 1. Verifikasi signature dari Tripay
 * 2. Cari order di database berdasarkan merchant_ref
 * 3. Idempotency check (hindari double-processing)
 * 4. Update status order ke "PAID" dalam database transaction
 * 5. Kurangi stok produk
 * 6. TRIGGER: Kirim notifikasi + produk digital ke pembeli
 *
 * Tripay mengharapkan response 200 dengan body { success: true }.
 * Jika tidak, Tripay akan retry hingga beberapa kali.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTripayCallbackSignature, mapTripayStatus } from "@/lib/tripay";
import { triggerProductDelivery } from "@/lib/notify";

// ─── Tripay Callback Payload Type ────────────────────────────────────────────
interface TripayCallbackPayload {
  reference: string;          // Tripay reference number, e.g. "T0001234"
  merchant_ref: string;       // Merchant reference kita, e.g. "NVD-ABC123"
  payment_method: string;     // Kode metode, e.g. "BRIVA"
  payment_name: string;       // Nama metode, e.g. "BRI Virtual Account"
  total_amount: number;       // Total tagihan dalam IDR
  fee_merchant: number;       // Biaya yang ditanggung merchant
  fee_customer: number;       // Biaya yang ditanggung customer
  total_fee: number;          // Total biaya
  amount_received: number;    // Jumlah yang diterima merchant
  is_closed_payment: number;  // 1 jika closed payment (VA dengan nominal tetap)
  status: "UNPAID" | "PAID" | "FAILED" | "EXPIRED" | "REFUND";
  paid_at: number | null;     // Unix timestamp waktu pembayaran
  note: string;               // Catatan dari Tripay
}

// ─── POST /api/callback ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Baca Raw Body untuk Verifikasi Signature ───────────────────────────
    // PENTING: Body harus dibaca sebagai raw string SEBELUM di-parse ke JSON.
    // Jika sudah di-parse, signature tidak bisa diverifikasi dengan benar.
    const rawBody = await req.text();

    // ── 2. Ambil Signature dari Header ────────────────────────────────────────
    const receivedSignature = req.headers.get("X-Callback-Signature") ?? "";

    // ── 3. Verifikasi Signature ───────────────────────────────────────────────
    // Di production: selalu verifikasi.
    // Di development: bisa bypass jika tidak ada signature (untuk testing lokal).
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasSignature  = Boolean(receivedSignature);

    if (!isDevelopment || hasSignature) {
      // Verifikasi signature di production SELALU, di development hanya jika ada signature
      if (!verifyTripayCallbackSignature(rawBody, receivedSignature)) {
        console.warn("[Callback] ❌ Signature tidak valid, request ditolak");
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("[Callback] ⚠️  Development mode: signature bypass aktif");
    }

    // ── 4. Parse Payload ──────────────────────────────────────────────────────
    let payload: TripayCallbackPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const {
      reference,
      merchant_ref,
      status,
      paid_at,
      payment_method,
      payment_name,
    } = payload;

    console.log(
      `[Callback] 📥 Received: ${merchant_ref} | Status: ${status} | Ref: ${reference}`
    );

    // ── 5. Cari Order di Database ─────────────────────────────────────────────
    const order = await prisma.order.findUnique({
      where:   { merchantRef: merchant_ref },
      include: { product: true },
    });

    if (!order) {
      // Order tidak ditemukan — mungkin sudah dihapus atau reference salah.
      // Tetap return 200 agar Tripay tidak terus retry.
      console.error(`[Callback] ❌ Order tidak ditemukan: ${merchant_ref}`);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ── 6. Idempotency Check ──────────────────────────────────────────────────
    // Jika order sudah PAID, skip proses (Tripay mungkin mengirim callback ganda).
    if (order.status === "PAID") {
      console.log(`[Callback] ℹ️  Order ${merchant_ref} sudah PAID, skip`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const newStatus = mapTripayStatus(status);

    // ── 7. Proses Berdasarkan Status ──────────────────────────────────────────
    if (newStatus === "PAID") {
      // Ambil 1 baris akun teratas dari daftar accountStock
      const accountLines = order.product.accountStock 
        ? order.product.accountStock.split('\n').filter(line => line.trim() !== '') 
        : [];
      
      const accountToGive = accountLines.length > 0 
        ? accountLines[0].trim() 
        : "⚠️ Maaf, stok akun belum di-restock. Silakan hubungi @wrunzfire dengan menyertakan Nomor Resi ini.";
      
      const remainingAccounts = accountLines.slice(1).join('\n');

      // ─ Transaksi database: update order + kurangi stok secara atomik ────────
      await prisma.$transaction([
        // Update order ke status PAID
        prisma.order.update({
          where: { merchantRef: merchant_ref },
          data: {
            status:        "PAID",
            reference:     reference ?? null,  // Tripay reference (nullable di schema)
            paymentMethod: payment_method,
            paymentName:   payment_name,
            paidAt:        paid_at ? new Date(paid_at * 1000) : new Date(),
          },
        }),
        // Kurangi stok produk sebanyak 1 dan update sisa accountStock
        prisma.product.update({
          where: { id: order.productId },
          data:  { 
            stock: { decrement: 1 },
            accountStock: remainingAccounts
          },
        }),
      ]);

      console.log(`[Callback] ✅ Order ${merchant_ref} → PAID, stok dikurangi`);

      // ─ Tentukan mode pengiriman berdasarkan deliveryMode produk ────────────────────────
      const deliveryMode = order.product.deliveryMode ?? "INSTANT";

      if (deliveryMode === "INSTANT") {
        // ─ INSTANT: Kirim otomatis langsung ke pembeli ────────────────────────────────
        // Jalankan secara async (non-blocking) agar response ke Tripay cepat.
        triggerProductDelivery({
          id:            order.id,
          merchantRef:   order.merchantRef,
          reference:     reference ?? order.reference ?? "-",
          amount:        order.amount,
          payerName:     order.payerName,
          payerEmail:    order.payerEmail,
          paymentMethod: payment_method,
          paymentName:   payment_name,
          product: {
            id:           order.product.id,
            title:        order.product.title,
            category:     order.product.category,
            accountStock: accountToGive, // Kirimkan HANYA 1 akun yang terpilih
          },
        }).then(() => {
          // Tandai order sebagai sudah dikirim (delivered = true)
          return prisma.order.update({
            where: { merchantRef: merchant_ref },
            data:  { delivered: true },
          });
        }).catch(err => {
          // Log error tapi jangan throw — Tripay sudah dapat 200 response
          console.error("[Callback] ❌ Error saat triggerProductDelivery:", err);
        });

      } else if (deliveryMode === "MANUAL") {
        // ─ MANUAL: Kirim notifikasi admin saja, TIDAK kirim akun ke buyer ────────────
        console.log(`[Callback] 📎 Mode MANUAL: Notif admin dikirim, akun menunggu dikirim manual`);
        // Kirim notif ke admin via Telegram bahwa ada order masuk yang perlu dikirim manual
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        if (adminChatId) {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const msg = [
              "🔔 <b>ORDER BARU — BUTUH KIRIM MANUAL</b>",
              "",
              `📦 <b>Produk:</b> ${order.product.title}`,
              `👤 <b>Pembeli:</b> ${order.payerName ?? "-"}`,
              `📧 <b>Email:</b> <code>${order.payerEmail ?? "-"}</code>`,
              `💰 <b>Nominal:</b> Rp ${order.amount.toLocaleString("id-ID")}`,
              `🔑 <b>Merchant Ref:</b> <code>${order.merchantRef}</code>`,
              "",
              "⚠️ Harap kirim akun secara manual via Admin Panel.",
            ].join("\n");
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: adminChatId, text: msg, parse_mode: "HTML" }),
            }).catch(err => console.error("[Callback] Admin notify MANUAL gagal:", err));
          }
        }
        // Juga beritahu buyer bahwa pesanan sedang diproses
        if (order.payerEmail && order.payerEmail.startsWith("tg_")) {
          const buyerChatId = order.payerEmail.split("@")[0].replace("tg_", "");
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const buyerMsg = [
              "✅ <b>Pembayaran Berhasil Diterima!</b>",
              "",
              `📦 <b>${order.product.title}</b>`,
              `🔑 <b>Resi:</b> <code>${reference ?? order.merchantRef}</code>`,
              "",
              "⏳ <i>Pesanan Anda sedang diproses oleh admin dan akan segera dikirim.</i>",
              "Jika dalam 1 jam belum dikirim, hubungi @wrunzfire dengan menyertakan Nomor Resi.",
            ].join("\n");
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: buyerChatId, text: buyerMsg, parse_mode: "HTML" }),
            }).catch(err => console.error("[Callback] Buyer notify MANUAL gagal:", err));
          }
        }

      } else if (deliveryMode === "PO") {
        // ─ PO (Pre-Order): Beritahu buyer estimasi waktu dari poNote ────────────────
        console.log(`[Callback] 📆 Mode PO: Notif buyer & admin dikirim`);
        const poNote = order.product.poNote ?? "Estimasi 1–3 hari kerja";
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        const botToken    = process.env.TELEGRAM_BOT_TOKEN;

        if (adminChatId && botToken) {
          const adminMsg = [
            "📆 <b>PRE-ORDER BARU MASUK</b>",
            "",
            `📦 <b>Produk:</b> ${order.product.title}`,
            `👤 <b>Pembeli:</b> ${order.payerName ?? "-"}`,
            `📧 <b>Email:</b> <code>${order.payerEmail ?? "-"}</code>`,
            `💰 <b>Nominal:</b> Rp ${order.amount.toLocaleString("id-ID")}`,
            `🔑 <b>Merchant Ref:</b> <code>${order.merchantRef}</code>`,
            "",
            `⏱ <b>Estimasi:</b> ${poNote}`,
          ].join("\n");
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: adminChatId, text: adminMsg, parse_mode: "HTML" }),
          }).catch(err => console.error("[Callback] Admin notify PO gagal:", err));
        }

        if (order.payerEmail && order.payerEmail.startsWith("tg_") && botToken) {
          const buyerChatId = order.payerEmail.split("@")[0].replace("tg_", "");
          const buyerMsg = [
            "✅ <b>Pembayaran Pre-Order Berhasil!</b>",
            "",
            `📦 <b>${order.product.title}</b>`,
            `🔑 <b>Resi:</b> <code>${reference ?? order.merchantRef}</code>`,
            "",
            `⏱ <b>Estimasi pengiriman:</b> ${poNote}`,
            "Kami akan menghubungi Anda saat akun sudah siap. Terima kasih! 🙏",
          ].join("\n");
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: buyerChatId, text: buyerMsg, parse_mode: "HTML" }),
          }).catch(err => console.error("[Callback] Buyer notify PO gagal:", err));
        }
      }

    } else {
      // ─ Status selain PAID (FAILED, EXPIRED, REFUND) ──────────────────────────
      await prisma.order.update({
        where: { merchantRef: merchant_ref },
        data: {
          status:        newStatus,
          paymentMethod: payment_method,
          paymentName:   payment_name,
        },
      });

      console.log(`[Callback] ℹ️  Order ${merchant_ref} → ${newStatus}`);
    }

    // ── 8. Response ke Tripay ─────────────────────────────────────────────────
    // Tripay WAJIB menerima { success: true } dengan HTTP 200.
    // Jika tidak, Tripay akan terus retry sampai batas tertentu.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Callback] ❌ Unexpected error:", error);

    // Tetap return 200 untuk menghindari retry loop yang tidak perlu dari Tripay.
    // Error sudah ter-log dan bisa diinvestigasi nanti.
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET /api/callback (health check) ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:    "ok",
    endpoint:  "Tripay Callback Receiver",
    timestamp: new Date().toISOString(),
  });
}
