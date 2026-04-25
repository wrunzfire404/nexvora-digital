import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { title, description, price, stock, imageUrl, category, isAvailable, accountStock, deliveryMode } = await req.json();

    const product = await prisma.product.update({
      where: { id },
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
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
