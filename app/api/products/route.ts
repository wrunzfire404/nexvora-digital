import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        category: true,
        isAvailable: true,
        createdAt: true,
        // SANGAT PENTING: JANGAN PERNAH SELECT accountStock DI SINI!
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}
