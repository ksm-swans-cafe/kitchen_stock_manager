import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const lunchboxes = await prisma.lunchbox.findMany({
      select: {
        lunchbox_name: true,
        lunchbox_set_name: true,
        lunchbox_limit: true,
      },
    });

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

    const result = lunchboxes.map((lb) => {
      const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
      return {
        ...lb,
        lunchbox_cost: lunchboxCostMap.get(key) || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
