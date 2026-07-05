import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { del } from "@vercel/blob";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;

    const existing = await prisma.lunchbox.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดกล่องอาหารที่ระบุ" }, { status: 404 });
    }

    const folder = existing.lunchbox_image_path || process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
    const imageNames = [existing.lunchbox_name_image, existing.lunchbox_set_name_image].filter(Boolean) as string[];

    for (const imageName of imageNames) {
      try {
        await del(`${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${folder}/${imageName}`);
      } catch (deleteError) {
        console.error("Failed to delete lunchbox image blob:", deleteError);
      }
    }

    await prisma.lunchbox.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบชุดกล่องอาหารสำเร็จ" });
  } catch (error) {
    console.error("Error deleting lunchbox:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถลบชุดกล่องอาหารได้" }, { status: 500 });
  }
}
