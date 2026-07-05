import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
import { MEAT_TYPES } from "@/lib/menu/dishMeatType";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const count = await (prisma as any).meat_type.count();
    if (count === 0) {
      await Promise.all(
        MEAT_TYPES.map((meat_name) => (prisma as any).meat_type.upsert({ where: { meat_name }, update: {}, create: { meat_name } }))
      );
    }

    const items = await (prisma as any).meat_type.findMany({ orderBy: { meat_name: "asc" } });
    return NextResponse.json(items.map((item: { meat_name: string }) => item.meat_name));
  } catch (error) {
    console.error("Error fetching meat types:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถโหลดประเภทเนื้อสัตว์ได้" }, { status: 500 });
  }
}
