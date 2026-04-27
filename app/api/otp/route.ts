/**
 * app/api/otp/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: POST /api/otp
 * Endpoint internal Vercel yang dipanggil dari halaman Invoice/Order Detail.
 *
 * Request body:
 *   { orderId: string }  — atau —  { merchantRef: string }
 *
 * Response:
 *   { success: true, otp: "492011", subject: "...", from: "...", rawMessage: "..." }
 *   { success: false, error: "Belum ada pesan masuk" }
 *
 * Security:
 *   - Hanya order dengan status PAID yang bisa di-query
 *   - Produk harus punya isOtpEnabled = true
 *   - Email akun yang dikirim harus @booplink.xyz
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";
import { fetchTempMailOTP, isOtpSupportedEmail } from "@/lib/tempmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, merchantRef } = body as { orderId?: string; merchantRef?: string };

    if (!orderId && !merchantRef) {
      return NextResponse.json(
        { success: false, error: "Parameter orderId atau merchantRef wajib diisi." },
        { status: 400 }
      );
    }

    // ── Cari Order di Database ─────────────────────────────────────────────────
    const order = await prisma.order.findFirst({
      where: orderId
        ? { id: orderId }
        : { merchantRef: merchantRef },
      include: {
        product: {
          select: {
            title:        true,
            isOtpEnabled: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order tidak ditemukan." },
        { status: 404 }
      );
    }

    // ── Validasi Kondisi OTP ────────────────────────────────────────────────────
    if (order.status !== "PAID") {
      return NextResponse.json(
        { success: false, error: "Fitur OTP hanya tersedia untuk order yang sudah PAID." },
        { status: 400 }
      );
    }

    if (!order.product.isOtpEnabled) {
      return NextResponse.json(
        { success: false, error: "Fitur OTP tidak aktif untuk produk ini." },
        { status: 400 }
      );
    }

    // ── Ambil Email dari deliveredAccount ──────────────────────────────────────
    // Format deliveredAccount: "email@booplink.xyz:password123"
    const deliveredAccount = order.deliveredAccount ?? "";
    const emailMatch       = deliveredAccount.match(/([^\s:]+@booplink\.xyz)/i);
    const emailAddress     = emailMatch ? emailMatch[1] : null;

    if (!emailAddress || !isOtpSupportedEmail(emailAddress)) {
      return NextResponse.json(
        {
          success: false,
          error:   "Akun yang dikirim bukan email @booplink.xyz. Fitur OTP tidak tersedia.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[OTP API] 🔍 Meminta OTP untuk order ${order.merchantRef} → email: ${emailAddress}`
    );

    // ── Fetch OTP dari TempMail ────────────────────────────────────────────────
    const result = await fetchTempMailOTP(emailAddress);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Gagal mengambil OTP." },
        { status: 200 }  // Tetap 200 agar FE bisa tampilkan pesan
      );
    }

    return NextResponse.json({
      success:    true,
      otp:        result.otp,
      subject:    result.subject,
      from:       result.from,
      rawMessage: result.rawMessage,
      email:      emailAddress,
      product:    order.product.title,
    });

  } catch (error) {
    console.error("[OTP API] ❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
