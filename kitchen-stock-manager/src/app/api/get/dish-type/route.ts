import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
import { DISH_TYPES } from "@/lib/menu/dishMeatType";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const count = await (prisma as any).dish_type.count();
    if (count === 0) {
      await Promise.all(
        DISH_TYPES.map((dish_name) => (prisma as any).dish_type.upsert({ where: { dish_name }, update: {}, create: { dish_name } }))
      );
    }

    const items = await (prisma as any).dish_type.findMany({ orderBy: { dish_name: "asc" } });
    return NextResponse.json(items.map((item: { dish_name: string }) => item.dish_name));
  } catch (error) {
    console.error("Error fetching dish types:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถโหลดประเภทกับข้าวได้" }, { status: 500 });
  }
}
