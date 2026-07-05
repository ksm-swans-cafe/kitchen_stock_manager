import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const meat_name = typeof body?.meat_name === "string" ? body.meat_name.trim() : "";

    if (!meat_name) {
      return NextResponse.json({ success: false, error: "กรุณาระบุชื่อประเภทเนื้อสัตว์" }, { status: 400 });
    }

    const item = await (prisma as any).meat_type.upsert({
      where: { meat_name },
      update: {},
      create: { meat_name },
    });

    return NextResponse.json({ success: true, data: item.meat_name });
  } catch (error) {
    console.error("Error adding meat type:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถเพิ่มประเภทเนื้อสัตว์ได้" }, { status: 500 });
  }
}
