/**
 * app/api/checkout/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: POST /api/checkout
 *
 * Endpoint ini menerima data dari form checkout frontend, lalu:
 * 1. Validasi input (productId, email, phone, payment method)
 * 2. Ambil data produk dari database
 * 3. Buat merchant reference unik
 * 4. Generate HMAC-SHA256 signature
 * 5. Kirim POST request ke Tripay API untuk membuat transaksi
 * 6. Simpan order ke database dengan status PENDING
 * 7. Return checkout_url untuk redirect user ke halaman pembayaran Tripay
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  generateMerchantRef,
  generateTripaySignature,
  createTripayTransaction,
} from "@/lib/tripay";

// ─── POST /api/checkout ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse & Validasi Request Body ──────────────────────────────────────
    const body = await req.json();
    const {
      productId,          // ID produk dari database
      paymentMethod,      // Kode metode: "BRIVA", "QRIS", "MANDIRI", dll.
      customerName,       // Nama lengkap pembeli
      customerEmail,      // Email pembeli (untuk konfirmasi)
      customerPhone,      // Nomor WhatsApp/HP pembeli
    } = body;

    // Validasi field wajib
    if (!productId || !paymentMethod || !customerName || !customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error:   "Field wajib: productId, paymentMethod, customerName, customerEmail",
        },
        { status: 400 }
      );
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // ── 2. Ambil Data Produk dari Database ────────────────────────────────────
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!product.isAvailable) {
      return NextResponse.json(
        { success: false, error: "Produk sedang tidak tersedia" },
        { status: 400 }
      );
    }

    if (product.stock < 1) {
      return NextResponse.json(
        { success: false, error: "Stok produk habis" },
        { status: 400 }
      );
    }

    // ── 3. Persiapan Data Transaksi ───────────────────────────────────────────
    const merchantRef = generateMerchantRef();
    const amount      = Math.round(product.price); // Tripay hanya terima integer

    // Expired 24 jam dari sekarang (Unix timestamp)
    const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    // Base URL aplikasi kita (dari env, e.g. "https://nexvora.vercel.app")
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // ── 4. Ambil session user jika login (opsional, transaksi bisa tanpa login) ─
    const session = await auth();
    const userId  = session?.user
      ? (session.user as { id?: string }).id ?? null
      : null;

    // ── 5. Generate Signature HMAC-SHA256 ──────────────────────────────────────
    // Format: HMAC-SHA256(privateKey, merchantCode + merchantRef + amount)
    const signature = generateTripaySignature(merchantRef, amount);

    // ── 6. Kirim Request ke Tripay API ────────────────────────────────────────
    const tripayResponse = await createTripayTransaction({
      method:         paymentMethod,
      merchant_ref:   merchantRef,
      amount,
      customer_name:  customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone ?? "",
      order_items: [
        {
          sku:      product.id,
          name:     product.title.slice(0, 100), // Tripay max 100 char
          price:    amount,
          quantity: 1,
        },
      ],
      // Tripay akan POST ke sini saat status pembayaran berubah
      callback_url: `${appUrl}/api/callback`,
      // User di-redirect kesini setelah selesai di halaman Tripay
      return_url:   `${appUrl}/orders/${merchantRef}`,
      expired_time: expiredTime,
      signature,
    });

    // Cek response dari Tripay
    if (!tripayResponse.success) {
      console.error("[Checkout] Tripay gagal membuat transaksi:", tripayResponse);
      return NextResponse.json(
        {
          success: false,
          error:   "Gagal membuat transaksi di Tripay",
          detail:  tripayResponse.message,
        },
        { status: 502 }
      );
    }

    const txData = tripayResponse.data;

    // ── 7. Simpan Order ke Database ───────────────────────────────────────────
    // Order dibuat dengan status PENDING, akan diupdate oleh callback
    const order = await prisma.order.create({
      data: {
        userId,
        productId:     product.id,
        merchantRef,
        reference:     txData.reference,       // Tripay reference (e.g. "T0001234")
        status:        "PENDING",
        amount,
        payerName:     customerName,
        payerEmail:    customerEmail,
        paymentMethod: paymentMethod,
        paymentName:   txData.payment_name,
        checkoutUrl:   txData.checkout_url,
        expiredAt:     new Date(txData.expired_time * 1000),
      },
    });

    console.log(`[Checkout] ✅ Order dibuat: ${order.merchantRef} → ${txData.checkout_url}`);

    // ── 8. Return Response ke Frontend ───────────────────────────────────────
    // Frontend akan redirect user ke checkout_url ini
    return NextResponse.json({
      success:     true,
      merchantRef: order.merchantRef,
      checkoutUrl: txData.checkout_url,  // ← REDIRECT USER KE SINI
      reference:   txData.reference,
      amount,
      expiredAt:   txData.expired_time,
    });

  } catch (error) {
    // Log error detail untuk debugging, return pesan generik ke client
    console.error("[Checkout] Unexpected error:", error);

    // Tangani error timeout ke Tripay secara spesifik
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { success: false, error: "Koneksi ke Tripay timeout, coba lagi" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server, silakan coba lagi" },
      { status: 500 }
    );
  }
}

// ─── GET /api/checkout (health check) ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:   "ok",
    endpoint: "Nexvora Checkout → Tripay",
    env: {
      merchant_code: process.env.TRIPAY_MERCHANT_CODE ? "✅ SET" : "❌ MISSING",
      api_key:       process.env.TRIPAY_API_KEY       ? "✅ SET" : "❌ MISSING",
      private_key:   process.env.TRIPAY_PRIVATE_KEY   ? "✅ SET" : "❌ MISSING",
      base_url:      process.env.TRIPAY_BASE_URL       ?? "❌ MISSING",
    },
    timestamp: new Date().toISOString(),
  });
}
