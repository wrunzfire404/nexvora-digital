/**
 * app/api/orders/track/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: POST /api/orders/track
 * Endpoint publik untuk mencari order berdasarkan Invoice ID + Nama Pembeli.
 *
 * Request: { merchantRef: string, name: string }
 * Response: { success: true, merchantRef: string }
 *
 * Validasi: nama pembeli di-match secara case-insensitive (partial match 3+ char)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { merchantRef, name } = body as { merchantRef?: string; name?: string };

    if (!merchantRef?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Invoice ID dan Nama Pembeli wajib diisi." },
        { status: 400 }
      );
    }

    if (name.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Nama minimal 3 karakter." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { merchantRef: merchantRef.trim().toUpperCase() },
      select: {
        merchantRef: true,
        payerName:   true,
        status:      true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Invoice tidak ditemukan. Periksa kembali ID Invoice Anda." },
        { status: 404 }
      );
    }

    // Validasi nama: case-insensitive, cukup cocok sebagian
    const inputName  = name.trim().toLowerCase();
    const storedName = (order.payerName ?? "").toLowerCase();

    if (!storedName || !storedName.includes(inputName) && !inputName.includes(storedName.split(" ")[0])) {
      return NextResponse.json(
        { success: false, error: "Nama pembeli tidak cocok dengan data pesanan ini." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success:     true,
      merchantRef: order.merchantRef,
      status:      order.status,
    });

  } catch (error) {
    console.error("[Track] Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}
