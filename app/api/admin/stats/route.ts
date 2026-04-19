import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalProducts, totalUsers, availableProducts, outOfStock] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.product.count({ where: { isAvailable: true, stock: { gt: 0 } } }),
      prisma.product.count({ where: { OR: [{ isAvailable: false }, { stock: 0 }] } }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalUsers,
      availableProducts,
      outOfStock,
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
