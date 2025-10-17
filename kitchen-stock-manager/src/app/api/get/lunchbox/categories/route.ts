import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
        menu_cost: true,
        menu_ingredients: true,
        menu_lunchbox: true, 
      },
    });

    const processedResult = result.map((menu) => {
      const matchingLunchbox = menu.menu_lunchbox.find((lb) => lb.lunchbox_name === lunchbox_name && lb.lunchbox_set_name === lunchbox_set_name);

      return {
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        menu_subname: menu.menu_subname,
        menu_category: menu.menu_category,
        menu_cost: menu.menu_cost,
        menu_ingredients: menu.menu_ingredients,
        menu_description: "",
        lunchbox_menu_category: matchingLunchbox?.lunchbox_menu_category || null,
      };
    });


    return NextResponse.json({
      success: true,
      data: processedResult,
      count: processedResult.length,
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
