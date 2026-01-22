import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    // ใช้ findRaw เพื่อดึงข้อมูลโดยตรงจาก MongoDB รวม field ใหม่ที่ยังไม่ได้ generate Prisma
    const lunchboxes = await prisma.lunchbox.findRaw({});

    const menus = await prisma.menu.findMany({
      select: {
        menu_lunchbox: true,
      },
    });

    const lunchboxCostMap = new Map<string, number>();
    menus.forEach((menu) => {
      menu.menu_lunchbox.forEach((lb: any) => {
        const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
        if (lb.lunchbox_cost && !lunchboxCostMap.has(key)) {
          lunchboxCostMap.set(key, Number(lb.lunchbox_cost));
        }
      });
    });

    const result = (lunchboxes as unknown as any[]).map((lb: any) => {
      const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
      return {
        lunchbox_name: lb.lunchbox_name,
        lunchbox_set_name: lb.lunchbox_set_name,
        lunchbox_limit: lb.lunchbox_limit,
        lunchbox_name_image: lb.lunchbox_name_image || null,
        lunchbox_set_name_image: lb.lunchbox_set_name_image || null,
        lunchbox_cost: lunchboxCostMap.get(key) || 0,
        lunchbox_order_select: lb.lunchbox_order_select || [],
        lunchbox_check_all: lb.lunchbox_check_all || false,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
