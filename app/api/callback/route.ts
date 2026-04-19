import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

// ─── Tripay Callback Payload Type ────────────────────────────────────────────
interface TripayCallbackPayload {
  reference: string;        // Tripay reference number  e.g. "T00001"
  merchant_ref: string;     // Your merchant_ref (merchantRef in Order)
  payment_method: string;   // e.g. "BRIVA"
  payment_name: string;     // e.g. "BRI Virtual Account"
  total_amount: number;     // in IDR
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: "UNPAID" | "PAID" | "FAILED" | "EXPIRED" | "REFUND";
  paid_at: number | null;   // Unix timestamp
  note: string;
}

// ─── Signature Verification ───────────────────────────────────────────────────
function verifySignature(rawBody: string, receivedSignature: string): boolean {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  if (!privateKey) {
    console.error("[Tripay] TRIPAY_PRIVATE_KEY is not set");
    return false;
  }
  const computedSignature = createHmac("sha256", privateKey)
    .update(rawBody)
    .digest("hex");
  return computedSignature === receivedSignature;
}

// ─── Map Tripay status → our Order status ─────────────────────────────────────
function mapStatus(tripayStatus: string): string {
  const map: Record<string, string> = {
    PAID:    "PAID",
    UNPAID:  "PENDING",
    FAILED:  "FAILED",
    EXPIRED: "EXPIRED",
    REFUND:  "REFUND",
  };
  return map[tripayStatus] ?? "PENDING";
}

// ─── POST /api/callback ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Baca raw body untuk verifikasi signature
    const rawBody = await req.text();

    // 2. Ambil signature dari header
    const receivedSignature = req.headers.get("X-Callback-Signature") ?? "";

    // 3. Verifikasi signature (bypass saat development lokal)
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev && !verifySignature(rawBody, receivedSignature)) {
      console.warn("[Tripay] Invalid signature received");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    // 4. Parse payload
    const payload: TripayCallbackPayload = JSON.parse(rawBody);
    const { reference, merchant_ref, status, paid_at, payment_method, payment_name } = payload;

    console.log(`[Tripay] Callback received: ${merchant_ref} → ${status}`);

    // 5. Cari order berdasarkan merchantRef
    const order = await prisma.order.findUnique({
      where: { merchantRef: merchant_ref },
      include: { product: true },
    });

    if (!order) {
      console.error(`[Tripay] Order not found: ${merchant_ref}`);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 6. Hindari double-processing (idempotent)
    if (order.status === "PAID") {
      console.log(`[Tripay] Order ${merchant_ref} already PAID, skipping`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const newStatus = mapStatus(status);

    // 7. Update order + kurangi stok (hanya saat PAID)
    if (newStatus === "PAID") {
      await prisma.$transaction([
        // Update order
        prisma.order.update({
          where: { merchantRef: merchant_ref },
          data: {
            status:        "PAID",
            reference:     reference,
            paymentMethod: payment_method,
            paymentName:   payment_name,
            paidAt:        paid_at ? new Date(paid_at * 1000) : new Date(),
          },
        }),
        // Kurangi stok produk
        prisma.product.update({
          where: { id: order.productId },
          data: {
            stock: { decrement: 1 },
          },
        }),
      ]);

      console.log(`[Tripay] ✅ Order ${merchant_ref} marked PAID, stock decremented`);

      // TODO: Kirim email/Telegram notifikasi ke buyer di sini
      // await sendTelegramNotification(order);

    } else {
      // Update status saja (FAILED, EXPIRED, REFUND)
      await prisma.order.update({
        where: { merchantRef: merchant_ref },
        data: {
          status:        newStatus,
          paymentMethod: payment_method,
          paymentName:   payment_name,
        },
      });

      console.log(`[Tripay] Order ${merchant_ref} status updated to ${newStatus}`);
    }

    // Tripay mengharapkan response 200 dengan body JSON { success: true }
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Tripay] Callback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET /api/callback (health check) ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Tripay Callback Receiver",
    timestamp: new Date().toISOString(),
  });
}
