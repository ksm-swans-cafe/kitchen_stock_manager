import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { lunchbox_name, lunchbox_set_name, lunchbox_limit, lunchbox_check_all, lunchbox_order_select } = body;

    const existing = await prisma.lunchbox.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดกล่องอาหารที่ระบุ" }, { status: 404 });
    }

    if (lunchbox_limit !== undefined) {
      const limit = Number(lunchbox_limit);
      if (!Number.isFinite(limit) || limit < 0) {
        return NextResponse.json({ success: false, error: "จำนวนจำกัดต้องเป็นตัวเลขที่ไม่ติดลบ" }, { status: 400 });
      }
    }

    if (lunchbox_name || lunchbox_set_name) {
      const duplicate = await prisma.lunchbox.findFirst({
        where: {
          lunchbox_name: lunchbox_name || existing.lunchbox_name,
          lunchbox_set_name: lunchbox_set_name || existing.lunchbox_set_name,
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json({ success: false, error: "มีชุดกล่องอาหารนี้อยู่แล้ว" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (lunchbox_name) updateData.lunchbox_name = lunchbox_name;
    if (lunchbox_set_name) updateData.lunchbox_set_name = lunchbox_set_name;
    if (lunchbox_limit !== undefined) updateData.lunchbox_limit = Number(lunchbox_limit);
    if (lunchbox_check_all !== undefined) updateData.lunchbox_check_all = Boolean(lunchbox_check_all);
    if (Array.isArray(lunchbox_order_select)) {
      updateData.lunchbox_order_select = {
        set: lunchbox_order_select.map((rule: any) => ({
          lunchbox_menu_category: String(rule.lunchbox_menu_category || ""),
          lunchbox_menu_category_limit: String(rule.lunchbox_menu_category_limit || ""),
          lunchbox_menu_category_sequence: String(rule.lunchbox_menu_category_sequence || ""),
        })),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 });
    }

    const result = await prisma.lunchbox.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating lunchbox:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถอัปเดตชุดกล่องอาหารได้" }, { status: 500 });
  }
}
