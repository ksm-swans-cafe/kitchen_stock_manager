import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const dish_name = typeof body?.dish_name === "string" ? body.dish_name.trim() : "";

    if (!dish_name) {
      return NextResponse.json({ success: false, error: "กรุณาระบุชื่อประเภทกับข้าว" }, { status: 400 });
    }

    const item = await (prisma as any).dish_type.upsert({
      where: { dish_name },
      update: {},
      create: { dish_name },
    });

    return NextResponse.json({ success: true, data: item.dish_name });
  } catch (error) {
    console.error("Error adding dish type:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถเพิ่มประเภทกับข้าวได้" }, { status: 500 });
  }
}
