import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST /api/admin/upload — Upload gambar produk
export async function POST(req: NextRequest) {
  try {
    // Cek autentikasi admin
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diupload" }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }

    // Validasi ukuran (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    // Buat nama file unik
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const uniqueName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Pastikan folder uploads ada
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Simpan file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadsDir, uniqueName), buffer);

    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({ url, filename: uniqueName });

  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
