import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    // ดึงข้อมูล lunchbox ทั้งหมดพร้อม id สำหรับการแก้ไข
    const lunchboxes = await prisma.lunchbox.findMany({
      orderBy: [
        { lunchbox_name: "asc" },
        { lunchbox_set_name: "asc" },
      ],
    });

    const result = lunchboxes.map((lb: any) => ({
      id: lb.id,
      lunchbox_name: lb.lunchbox_name,
      lunchbox_set_name: lb.lunchbox_set_name,
      lunchbox_limit: lb.lunchbox_limit,
      lunchbox_name_image: lb.lunchbox_name_image || null,
      lunchbox_set_name_image: lb.lunchbox_set_name_image || null,
      lunchbox_image_path: lb.lunchbox_image_path || null,
      lunchbox_check_all: lb.lunchbox_check_all || false,
      lunchbox_order_select: lb.lunchbox_order_select || [],
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
