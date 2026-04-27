import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, price, stock, imageUrl, category, isAvailable, accountStock, deliveryMode, isOtpEnabled } = await req.json();

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || null,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        accountStock: accountStock || null,
        deliveryMode: deliveryMode || "INSTANT",
        isOtpEnabled: isOtpEnabled === true,  // Pastikan boolean
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menambahkan produk" }, { status: 500 });
  }
}
