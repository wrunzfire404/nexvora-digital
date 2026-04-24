/**
 * app/api/payment-status/[reference]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: GET /api/payment-status/:reference
 *
 * Endpoint ini dipanggil oleh Telegram Bot untuk mengecek status pembayaran
 * secara aktif (polling), sebagai fallback saat Tripay webhook gagal.
 *
 * Flow:
 * 1. Cari order berdasarkan Tripay reference (bukan merchantRef)
 * 2. Jika order PAID dan sudah delivered → return status saja
 * 3. Jika order PAID tapi belum delivered → trigger delivery ulang
 * 4. Jika order masih PENDING → cek ke Tripay API secara langsung
 * 5. Jika Tripay bilang PAID → proses delivery + update DB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerProductDelivery } from "@/lib/notify";
import { createHmac } from "crypto";

// ─── Cek Status ke Tripay API Langsung ───────────────────────────────────────
async function checkTripayStatus(reference: string): Promise<{
  status: string;
  paid_at: number | null;
  payment_method: string;
  payment_name: string;
} | null> {
  const apiKey = process.env.TRIPAY_API_KEY;
  const baseUrl = process.env.TRIPAY_BASE_URL || "https://tripay.co.id/api";

  if (!apiKey) {
    console.error("[PayStatus] TRIPAY_API_KEY tidak dikonfigurasi");
    return null;
  }

  try {
    // Gunakan proxy VPS agar IP statis (sama seperti checkout)
    const PROXY_URL = process.env.TRIPAY_PROXY_URL || "http://168.110.202.124:8080/api/tripay-proxy";
    const PROXY_SECRET = process.env.PROXY_SECRET || "NEXVORA_PROXY_SECRET_2026";

    const response = await fetch(`${PROXY_URL}/detail?reference=${reference}`, {
      method: "GET",
      headers: {
        "X-Nexvora-Secret": PROXY_SECRET,
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[PayStatus] Tripay proxy error: ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (!json.success || !json.data) return null;

    const data = json.data;
    return {
      status: data.status,
      paid_at: data.paid_at ?? null,
      payment_method: data.payment_method ?? "",
      payment_name: data.payment_name ?? "",
    };
  } catch (err) {
    console.error("[PayStatus] Gagal cek ke Tripay:", err);
    return null;
  }
}

// ─── GET /api/payment-status/:reference ──────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  if (!reference) {
    return NextResponse.json(
      { success: false, message: "Reference wajib diisi" },
      { status: 400 }
    );
  }

  try {
    // ── 1. Cari order di DB berdasarkan Tripay reference ──────────────────────
    const order = await prisma.order.findFirst({
      where: { reference },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan", status: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // ── 2. Jika sudah PAID dan sudah delivered → langsung return ──────────────
    if (order.status === "PAID" && order.delivered) {
      return NextResponse.json({
        success: true,
        status: "PAID",
        delivered: true,
        message: "Pembayaran berhasil, akun sudah dikirim",
        merchantRef: order.merchantRef,
        amount: order.amount,
        paidAt: order.paidAt,
      });
    }

    // ── 3. Jika PAID tapi belum delivered → re-trigger delivery ──────────────
    if (order.status === "PAID" && !order.delivered) {
      console.log(`[PayStatus] Re-trigger delivery untuk ${order.merchantRef}`);

      // Ambil akun yang akan dikirim (baris pertama dari accountStock)
      const accountLines = order.product.accountStock
        ? order.product.accountStock.split("\n").filter((l) => l.trim() !== "")
        : [];

      const accountToGive =
        accountLines.length > 0
          ? accountLines[0].trim()
          : "⚠️ Stok akun kosong. Hubungi @wrunzfire dengan Nomor Resi ini.";

      await triggerProductDelivery({
        id: order.id,
        merchantRef: order.merchantRef,
        reference: reference,
        amount: order.amount,
        payerName: order.payerName,
        payerEmail: order.payerEmail,
        paymentMethod: order.paymentMethod,
        paymentName: order.paymentName,
        product: {
          id: order.product.id,
          title: order.product.title,
          category: order.product.category,
          accountStock: accountToGive,
        },
      }).then(() =>
        prisma.order.update({
          where: { merchantRef: order.merchantRef },
          data: { delivered: true, deliveredAccount: accountToGive },
        })
      ).catch((err) =>
        console.error("[PayStatus] Re-delivery gagal:", err)
      );

      return NextResponse.json({
        success: true,
        status: "PAID",
        delivered: false, // Sedang dalam proses re-delivery
        message: "Pembayaran ditemukan, mengirim ulang akun ke Telegram Anda...",
        merchantRef: order.merchantRef,
        amount: order.amount,
      });
    }

    // ── 4. Order masih PENDING — cek ke Tripay API langsung ──────────────────
    const tripayData = await checkTripayStatus(reference);

    if (!tripayData) {
      // Tidak bisa cek Tripay, return status dari DB
      const expiredAt = order.expiredAt ? order.expiredAt.getTime() / 1000 : null;
      return NextResponse.json({
        success: true,
        status: order.status,
        delivered: order.delivered,
        message: order.status === "PENDING" ? "Menunggu pembayaran" : order.status,
        expiredAt,
        merchantRef: order.merchantRef,
        amount: order.amount,
      });
    }

    // ── 5. Tripay bilang PAID tapi DB masih PENDING (webhook gagal!) ──────────
    if (tripayData.status === "PAID" && order.status !== "PAID") {
      console.log(`[PayStatus] ⚠️  Webhook miss! Order ${order.merchantRef} PAID di Tripay tapi PENDING di DB`);

      // Ambil akun untuk dikirim
      const accountLines = order.product.accountStock
        ? order.product.accountStock.split("\n").filter((l) => l.trim() !== "")
        : [];

      const accountToGive =
        accountLines.length > 0
          ? accountLines[0].trim()
          : "⚠️ Stok akun kosong. Hubungi @wrunzfire dengan Nomor Resi ini.";

      const remainingAccounts = accountLines.slice(1).join("\n");

      // Update DB secara atomik (sama persis seperti di callback/route.ts)
      await prisma.$transaction([
        prisma.order.update({
          where: { merchantRef: order.merchantRef },
          data: {
            status: "PAID",
            paymentMethod: tripayData.payment_method,
            paymentName: tripayData.payment_name,
            paidAt: tripayData.paid_at
              ? new Date(tripayData.paid_at * 1000)
              : new Date(),
          },
        }),
        prisma.product.update({
          where: { id: order.productId },
          data: {
            stock: { decrement: 1 },
            accountStock: remainingAccounts,
          },
        }),
      ]);

      // Trigger delivery (async, non-blocking)
      triggerProductDelivery({
        id: order.id,
        merchantRef: order.merchantRef,
        reference,
        amount: order.amount,
        payerName: order.payerName,
        payerEmail: order.payerEmail,
        paymentMethod: tripayData.payment_method,
        paymentName: tripayData.payment_name,
        product: {
          id: order.product.id,
          title: order.product.title,
          category: order.product.category,
          accountStock: accountToGive,
        },
      })
        .then(() =>
          prisma.order.update({
            where: { merchantRef: order.merchantRef },
            data: { delivered: true, deliveredAccount: accountToGive },
          })
        )
        .catch((err) =>
          console.error("[PayStatus] Delivery gagal setelah webhook miss:", err)
        );

      return NextResponse.json({
        success: true,
        status: "PAID",
        delivered: false,
        message: "Pembayaran dikonfirmasi! Mengirim akun ke Telegram Anda...",
        merchantRef: order.merchantRef,
        amount: order.amount,
      });
    }

    // ── 6. Status sesuai (UNPAID/EXPIRED/FAILED) ─────────────────────────────
    const expiredAt = order.expiredAt ? order.expiredAt.getTime() / 1000 : null;
    return NextResponse.json({
      success: true,
      status: tripayData.status,
      delivered: order.delivered,
      message:
        tripayData.status === "UNPAID"
          ? "Menunggu pembayaran"
          : tripayData.status === "EXPIRED"
          ? "Transaksi telah kadaluwarsa"
          : "Transaksi gagal / dibatalkan",
      expiredAt,
      merchantRef: order.merchantRef,
      amount: order.amount,
    });
  } catch (error) {
    console.error("[PayStatus] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
