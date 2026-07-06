import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

// Prisma client รุ่นเก่าเคยเขียน Json field เป็น { set: [...] } — unwrap ให้กลับเป็น array เสมอ
function normalizeOrderSelect(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.set)) return value.set;
  return [];
}

function normalizeLunchboxLimit(value: any): number {
  if (value && typeof value === "object") {
    if ("$numberLong" in value) return Number(value.$numberLong);
    if ("$numberInt" in value) return Number(value.$numberInt);
  }
  return Number(value ?? 0);
}

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    // ใช้ findRaw เพื่อรองรับ document ที่มี field เป็น null หรือ type ไม่ตรง schema
    const lunchboxes = await prisma.lunchbox.findRaw({
      filter: {},
      options: {
        sort: { lunchbox_name: 1, lunchbox_set_name: 1 },
      },
    });

    const result = (lunchboxes as unknown as any[]).map((lb: any) => ({
      id: lb._id?.$oid ?? lb._id ?? lb.id,
      lunchbox_name: lb.lunchbox_name,
      lunchbox_set_name: lb.lunchbox_set_name,
      lunchbox_limit: normalizeLunchboxLimit(lb.lunchbox_limit),
      lunchbox_name_image: lb.lunchbox_name_image || null,
      lunchbox_set_name_image: lb.lunchbox_set_name_image || null,
      lunchbox_image_path: lb.lunchbox_image_path || null,
      lunchbox_check_all: lb.lunchbox_check_all || false,
      lunchbox_order_select: normalizeOrderSelect(lb.lunchbox_order_select),
      lunchbox_order: lb.lunchbox_order != null ? Number(lb.lunchbox_order) : null,
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
