/**
 * app/api/admin/orders/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: GET  /api/admin/orders      — List semua orders (admin only)
 *        POST /api/admin/orders/deliver — Kirim akun manual dari admin dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { triggerProductDelivery } from "@/lib/notify";

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // filter: PENDING | PAID | FAILED | EXPIRED
  const limit  = parseInt(searchParams.get("limit") || "50");
  const page   = parseInt(searchParams.get("page")  || "1");

  try {
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: {
            select: {
              title:     true,
              category:  true,
              imageUrl:  true,
              deliveryMode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take:   limit,
        skip:   (page - 1) * limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[AdminOrders] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/admin/orders — Manual Deliver ─────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body        = await req.json();
    const { merchantRef, accountData } = body;

    if (!merchantRef || !accountData) {
      return NextResponse.json(
        { error: "merchantRef dan accountData wajib diisi" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where:   { merchantRef },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Order belum berstatus PAID, tidak bisa kirim akun" },
        { status: 400 }
      );
    }

    // Kirim akun ke pembeli
    await triggerProductDelivery({
      id:            order.id,
      merchantRef:   order.merchantRef,
      reference:     order.reference ?? "-",
      amount:        order.amount,
      payerName:     order.payerName,
      payerEmail:    order.payerEmail,
      paymentMethod: order.paymentMethod,
      paymentName:   order.paymentName,
      product: {
        id:           order.product.id,
        title:        order.product.title,
        category:     order.product.category,
        accountStock: accountData, // akun yang diisi admin secara manual
      },
    });

    // Tandai sebagai delivered
    await prisma.order.update({
      where: { merchantRef },
      data:  { delivered: true },
    });

    return NextResponse.json({
      success: true,
      message: `Akun berhasil dikirim ke pembeli (${order.payerEmail ?? order.payerName})`,
    });
  } catch (error) {
    console.error("[AdminOrders] POST deliver error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
