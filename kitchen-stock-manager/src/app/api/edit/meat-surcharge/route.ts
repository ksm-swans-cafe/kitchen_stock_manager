import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth, isElevatedRole } from "@/lib/auth/serverAuth";

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;
  if (!isElevatedRole(authResult.userRoles)) {
    return NextResponse.json({ success: false, error: "ไม่มีสิทธิ์แก้ไขราคาบวกเพิ่มเนื้อสัตว์" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { lunchbox_name, lunchbox_set_name, items } = body ?? {};

    if (!lunchbox_name || !lunchbox_set_name) {
      return NextResponse.json({ success: false, error: "ไม่พบ lunchbox_name หรือ lunchbox_set_name" }, { status: 400 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    // เก็บเฉพาะรายการที่ถูกต้อง (ชื่อเนื้อสัตว์ต้องไม่ว่าง และราคาต้องเป็นตัวเลข >= 0)
    // meat_name เป็นรายการแบบเปิด (มาจาก DB collection meat_type ที่แอดมินเพิ่มเองได้) จึงไม่ล็อกกับ enum คงที่อีกต่อไป
    const validItems = items
      .filter((item) => item && typeof item.meat_name === "string" && item.meat_name.trim() && Number.isFinite(Number(item.surcharge)) && Number(item.surcharge) >= 0)
      .map((item) => ({ ...item, meat_name: item.meat_name.trim() }));

    // Full-replace: ลบเนื้อสัตว์ที่ไม่อยู่ใน items (รองรับการ "ลบ" ออกจากชุดนี้) แล้วค่อย upsert ที่เหลือ
    await (prisma as any).meat_surcharge.deleteMany({
      where: {
        lunchbox_name,
        lunchbox_set_name,
        meat_name: { notIn: validItems.map((item) => item.meat_name) },
      },
    });

    const results = await Promise.all(
      validItems.map((item) =>
        (prisma as any).meat_surcharge.upsert({
          where: { lunchbox_name_lunchbox_set_name_meat_name: { lunchbox_name, lunchbox_set_name, meat_name: item.meat_name } },
          update: { surcharge: Number(item.surcharge) },
          create: { lunchbox_name, lunchbox_set_name, meat_name: item.meat_name, surcharge: Number(item.surcharge) },
        })
      )
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error updating meat surcharge:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถอัปเดตราคาบวกเพิ่มเนื้อสัตว์ได้" }, { status: 500 });
  }
}
