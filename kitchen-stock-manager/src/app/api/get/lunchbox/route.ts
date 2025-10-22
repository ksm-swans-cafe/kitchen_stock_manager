import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all lunchboxes
    const lunchboxes = await prisma.lunchbox.findMany({
      select: {
        lunchbox_name: true,
        lunchbox_set_name: true,
        lunchbox_limit: true,
      },
    });

    // Get lunchbox costs from menu table
    const menus = await prisma.menu.findMany({
      select: {
        menu_lunchbox: true,
      },
    });

    // Create a map of lunchbox costs
    const lunchboxCostMap = new Map<string, number>();
    menus.forEach(menu => {
      menu.menu_lunchbox.forEach((lb: any) => {
        const key = `${lb.lunchbox_name}_${lb.lunchbox_set_name}`;
        if (lb.lunchbox_cost && !lunchboxCostMap.has(key)) {
          lunchboxCostMap.set(key, Number(lb.lunchbox_cost));
        }
      });
    });

    // Merge lunchbox data with costs
    const result = lunchboxes.map(lb => {
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
