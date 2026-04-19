import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── Generate unique merchant reference ──────────────────────────────────────
function generateMerchantRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NVD-${timestamp}-${random}`;
}

// ─── Generate Tripay signature for checkout ───────────────────────────────────
function generateSignature(merchantCode: string, merchantRef: string, amount: number): string {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
  return createHmac("sha256", privateKey)
    .update(`${merchantCode}${merchantRef}${amount}`)
    .digest("hex");
}

// ─── POST /api/orders — Create order & Tripay checkout ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
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
    if (product.stock < 1) {
      return NextResponse.json({ error: "Stok produk habis" }, { status: 400 });
    }

    const merchantRef = generateMerchantRef();
    const amount      = Math.round(product.price);

    // ── Buat transaksi di Tripay ─────────────────────────────────────────────
    const tripayPayload = {
      method:           paymentMethod,        // e.g. "BRIVA", "QRIS", "GOPAY"
      merchant_ref:     merchantRef,
      amount:           amount,
      customer_name:    customerName,
      customer_email:   customerEmail,
      customer_phone:   customerPhone ?? "",
      order_items: [
        {
          sku:      product.id,
          name:     product.title,
          price:    amount,
          quantity: 1,
        },
      ],
      callback_url:     `${process.env.NEXTAUTH_URL}/api/callback`,
      return_url:       `${process.env.NEXTAUTH_URL}/orders/${merchantRef}`,
      expired_time:     Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 jam
      signature:        generateSignature(
        process.env.TRIPAY_MERCHANT_CODE!,
        merchantRef,
        amount
      ),
    };

    const tripayResponse = await fetch(
      `${process.env.TRIPAY_BASE_URL}/transaction/create`,
      {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${process.env.TRIPAY_API_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify(tripayPayload),
      }
    );

    const tripayData = await tripayResponse.json();

    if (!tripayData.success) {
      console.error("[Tripay] Create transaction failed:", tripayData);
      return NextResponse.json(
        { error: "Gagal membuat transaksi Tripay", detail: tripayData.message },
        { status: 502 }
      );
    }

    const { data: txData } = tripayData;

    // ── Simpan order ke database ─────────────────────────────────────────────
    const order = await prisma.order.create({
      data: {
        userId:        session?.user?.id ?? null,
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
      success:      true,
      merchantRef:  order.merchantRef,
      checkoutUrl:  txData.checkout_url,
      reference:    txData.reference,
      amount,
      expiredAt:    txData.expired_time,
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
