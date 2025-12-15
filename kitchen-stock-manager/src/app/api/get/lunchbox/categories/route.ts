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

    // ใช้ $runCommandRaw เพื่อหลีกเลี่ยงปัญหา null ใน menu_cost
    const menus = await prisma.menu.findRaw({
      filter: {
        menu_lunchbox: {
          $elemMatch: {
            lunchbox_name: lunchbox_name,
            lunchbox_set_name: lunchbox_set_name,
          },
        },
      },
    });

    const result = (menus as any[]).map((menu: any) => {
      const matchingLunchbox = menu.menu_lunchbox?.find(
        (lb: any) => lb.lunchbox_name === lunchbox_name && lb.lunchbox_set_name === lunchbox_set_name
      );

      return {
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        menu_subname: menu.menu_subname,
        menu_category: menu.menu_category,
        menu_cost: menu.menu_cost ?? 0,
        menu_ingredients: menu.menu_ingredients || [],
        menu_description: "",
        lunchbox_menu_category: matchingLunchbox?.lunchbox_menu_category || null,
        lunchbox_showPrice: matchingLunchbox?.lunchbox_showPrice ?? true,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      filters: {
        lunchbox_name: lunchbox_name,
        lunchbox_set_name: lunchbox_set_name,
      },
    });
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
