/**
 * app/api/orders/my/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: GET /api/orders/my
 * Dipanggil oleh Telegram Bot untuk mengambil semua order PAID
 * milik user berdasarkan Telegram Chat ID.
 *
 * Header: X-Telegram-Id: <chatId>
 *
 * Format email Telegram bot: tg_<chatId>@nexvora.digital
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const telegramId = req.headers.get("x-telegram-id");

  if (!telegramId) {
    return NextResponse.json(
      { error: "Header X-Telegram-Id wajib ada." },
      { status: 400 }
    );
  }

  try {
    // Email format buyer dari bot: tg_<chatId>@nexvora.digital
    const emailPattern = `tg_${telegramId}@nexvora.digital`;

    const orders = await prisma.order.findMany({
      where: {
        payerEmail: emailPattern,
        status:     "PAID",
      },
      include: {
        product: {
          select: {
            title:        true,
            category:     true,
            isOtpEnabled: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,  // Maksimal 10 pesanan terakhir
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error("[Orders/My] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan." },
      { status: 500 }
    );
  }
}
