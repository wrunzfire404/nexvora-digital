import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { role } = await req.json();

    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    // Prevent self-demotion
    if (id === (session.user as { id?: string }).id && role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak dapat mengubah role sendiri" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Prevent self-deletion
  if (id === (session.user as { id?: string }).id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
