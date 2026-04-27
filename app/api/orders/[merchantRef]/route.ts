import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/[merchantRef] — Cek status order
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ merchantRef: string }> }
) {
  try {
    const { merchantRef } = await params;

    const order = await prisma.order.findUnique({
      where: { merchantRef },
      include: {
        product: {
          select: {
            title:        true,
            category:     true,
            imageUrl:     true,
            price:        true,
            isOtpEnabled: true,  // ← Expose flag OTP ke frontend
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id:              order.id,
      merchantRef:     order.merchantRef,
      reference:       order.reference,
      status:          order.status,
      amount:          order.amount,
      payerName:       order.payerName,
      paymentMethod:   order.paymentMethod,
      paymentName:     order.paymentName,
      checkoutUrl:     order.checkoutUrl,
      paidAt:          order.paidAt,
      expiredAt:       order.expiredAt,
      createdAt:       order.createdAt,
      delivered:       order.delivered,
      deliveredAccount: order.deliveredAccount,  // ← Akun yang terkirim (untuk OTP check)
      product:         order.product,
    });

  } catch (error) {
    console.error("[Orders] GET by ref error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
