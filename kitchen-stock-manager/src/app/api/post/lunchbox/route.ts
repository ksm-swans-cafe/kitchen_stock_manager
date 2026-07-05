import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const { lunchbox_name, lunchbox_set_name, lunchbox_limit, lunchbox_check_all, lunchbox_order_select } = body;

    if (!lunchbox_name || !lunchbox_set_name) {
      return NextResponse.json({ success: false, error: "กรุณาระบุชื่อกล่องอาหารและชื่อชุด" }, { status: 400 });
    }

    const limit = Number(lunchbox_limit);
    if (!Number.isFinite(limit) || limit < 0) {
      return NextResponse.json({ success: false, error: "จำนวนจำกัดต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
    }

    const existing = await prisma.lunchbox.findFirst({
      where: { lunchbox_name, lunchbox_set_name },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "มีชุดกล่องอาหารนี้อยู่แล้ว" }, { status: 409 });
    }

    const orderSelect = Array.isArray(lunchbox_order_select)
      ? lunchbox_order_select.map((rule: any) => ({
          lunchbox_menu_category: String(rule.lunchbox_menu_category || ""),
          lunchbox_menu_category_limit: String(rule.lunchbox_menu_category_limit || ""),
          lunchbox_menu_category_sequence: String(rule.lunchbox_menu_category_sequence || ""),
        }))
      : [];

    const result = await prisma.lunchbox.create({
      data: {
        lunchbox_name,
        lunchbox_set_name,
        lunchbox_limit: limit,
        lunchbox_name_image: "",
        lunchbox_set_name_image: "",
        lunchbox_check_all: Boolean(lunchbox_check_all),
        lunchbox_order_select: orderSelect,
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating lunchbox:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถสร้างชุดกล่องอาหารได้" }, { status: 500 });
  }
}
