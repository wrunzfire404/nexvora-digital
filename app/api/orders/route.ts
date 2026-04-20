/**
 * app/api/orders/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: GET /api/orders  — List orders (authenticated)
 *        POST /api/orders — (Legacy) Create order via Tripay
 *
 * NOTE: Untuk checkout dari frontend, gunakan /api/checkout (route baru).
 * Route ini dipertahankan untuk kompatibilitas mundur dan penggunaan internal.
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

// ─── POST /api/orders — Create order & Tripay checkout ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body    = await req.json();
    const { productId, paymentMethod, customerName, customerEmail, customerPhone } = body;

    // Validasi input
    if (!productId || !paymentMethod || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "productId, paymentMethod, customerName, dan customerEmail wajib diisi" },
        { status: 400 }
      );
    }

    // Cari produk
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    if (!product.isAvailable) {
      return NextResponse.json({ error: "Produk tidak tersedia" }, { status: 400 });
    }
    if (product.stock < 1) {
      return NextResponse.json({ error: "Stok produk habis" }, { status: 400 });
    }

    const merchantRef = generateMerchantRef();
    const amount      = Math.round(product.price);
    const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const appUrl      = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // ── Buat transaksi di Tripay ──────────────────────────────────────────────
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
          name:     product.title.slice(0, 100),
          price:    amount,
          quantity: 1,
        },
      ],
      callback_url: `${appUrl}/api/callback`,
      return_url:   `${appUrl}/orders/${merchantRef}`,
      expired_time: expiredTime,
      signature:    generateTripaySignature(merchantRef, amount),
    });

    if (!tripayResponse.success) {
      console.error("[Orders] Tripay gagal membuat transaksi:", tripayResponse);
      return NextResponse.json(
        { error: "Gagal membuat transaksi Tripay", detail: tripayResponse.message },
        { status: 502 }
      );
    }

    const txData = tripayResponse.data;

    // ── Simpan order ke database ──────────────────────────────────────────────
    const order = await prisma.order.create({
      data: {
        userId:        session?.user ? (session.user as { id?: string }).id ?? null : null,
        productId:     product.id,
        merchantRef,
        reference:     txData.reference,
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

    return NextResponse.json({
      success:     true,
      merchantRef: order.merchantRef,
      checkoutUrl: txData.checkout_url,
      reference:   txData.reference,
      amount,
      expiredAt:   txData.expired_time,
    });

  } catch (error) {
    console.error("[Orders] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/orders — List orders (authenticated) ───────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = (session.user as { role?: string }).role === "ADMIN";

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: (session.user as { id: string }).id },
      include: {
        product: { select: { title: true, category: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error("[Orders] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
