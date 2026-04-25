import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/admin/upload — Upload gambar produk via ImgBB
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
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
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

    // Get API Key from Environment
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("[Upload] IMGBB_API_KEY is not set in environment variables");
      return NextResponse.json({ error: "Sistem penyimpanan gambar belum dikonfigurasi (API Key missing)." }, { status: 500 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");

    // Upload to ImgBB
    const imgbbFormData = new URLSearchParams();
    imgbbFormData.append("key", apiKey);
    imgbbFormData.append("image", base64String);
    imgbbFormData.append("name", file.name.split(".")[0]); // optional name

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("[Upload] ImgBB Error:", data);
      return NextResponse.json({ error: data?.error?.message || "Gagal mengupload ke server gambar (ImgBB)" }, { status: 500 });
    }

    const url = data.data.url;
    return NextResponse.json({ url, filename: file.name });

  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal saat mengupload file" }, { status: 500 });
  }
}
