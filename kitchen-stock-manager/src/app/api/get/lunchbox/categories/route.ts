import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lunchbox_name = searchParams.get("lunchbox_name");
    const lunchbox_set_name = searchParams.get("lunchbox_set_name");

    console.log("API Parameters:", { lunchbox_name, lunchbox_set_name });

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
      },
    });

    console.log("Query result:", result);

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
