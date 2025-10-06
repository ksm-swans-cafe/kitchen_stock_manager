import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "กรุณาระบุ id" }, { status: 400 });
  }

  try {
    // ใช้ menu_id เพื่อหา record ก่อน
    const existing = await prisma.menu.findFirst({
      where: { menu_id: Number(id) },
    });

    if (!existing) return NextResponse.json({ error: "ไม่พบเมนูที่ต้องการลบ" }, { status: 404 });

    // ใช้ id (ObjectId) เพื่อ delete
    await prisma.menu.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "ลบเมนูสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบเมนู" }, { status: 500 });
  }
}
