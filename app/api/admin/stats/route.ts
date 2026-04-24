import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalProducts,
      totalUsers,
      availableProducts,
      outOfStock,
      totalOrders,
      paidOrders,
      pendingDelivery,
      pendingOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.product.count({ where: { isAvailable: true, stock: { gt: 0 } } }),
      prisma.product.count({ where: { OR: [{ isAvailable: false }, { stock: 0 }] } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      // Orders yang sudah PAID tapi belum delivered (perlu tindakan admin)
      prisma.order.count({ where: { status: "PAID", delivered: false } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalUsers,
      availableProducts,
      outOfStock,
      totalOrders,
      paidOrders,
      pendingDelivery,
      pendingOrders,
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
