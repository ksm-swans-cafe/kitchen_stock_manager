import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

const safeJson = (data: unknown) => JSON.parse(JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value)));

export async function GET(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { searchParams } = new URL(request.url);
    const lunchbox_name = searchParams.get("lunchbox_name");
    const lunchbox_set_name = searchParams.get("lunchbox_set_name");

    if (!lunchbox_name || !lunchbox_set_name) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    const result = await prisma.menu.findMany({
      where: {
        menu_lunchbox: {
          some: {
            lunchbox_name: lunchbox_name,
            lunchbox_set_name: lunchbox_set_name,
          },
        },
      },
      select: {
        menu_id: true,
        menu_name: true,
        menu_subname: true,
        menu_category: true,
        menu_ingredients: true,
        menu_lunchbox: true,
      },
    });

    const processedResult: any[] = [];

    result.forEach((menu) => {
      // หา matching lunchbox objects ทั้งหมด (ไม่ใช่แค่ตัวแรก)
      const matchingLunchboxes = menu.menu_lunchbox.filter((lb) => lb.lunchbox_name === lunchbox_name && lb.lunchbox_set_name === lunchbox_set_name);

      // สร้าง menu object สำหรับแต่ละ matching lunchbox
      matchingLunchboxes.forEach((matchingLunchbox) => {
        processedResult.push({
          menu_id: menu.menu_id,
          menu_name: menu.menu_name,
          menu_subname: menu.menu_subname,
          menu_category: menu.menu_category,
          menu_ingredients: menu.menu_ingredients,
          menu_description: "",
          lunchbox_cost: matchingLunchbox?.lunchbox_cost || 0,
          lunchbox_menu_category: matchingLunchbox?.lunchbox_menu_category || null,
          lunchbox_showPrice: matchingLunchbox?.lunchbox_showPrice ?? true,
          lunchbox_AutoRice: matchingLunchbox?.lunchbox_AutoRice ?? false,
          lunchbox_menuid: matchingLunchbox?.lunchbox_menuid || null,
        });
      });
    });

    return NextResponse.json(
      safeJson({
        success: true,
        data: processedResult,
        count: processedResult.length,
        filters: {
          lunchbox_name: lunchbox_name,
          lunchbox_set_name: lunchbox_set_name,
        },
      })
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
