import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const safePage = isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
    const offset = (safePage - 1) * safeLimit;
    const total = await prisma.menu.count();
    const result = await prisma.menu.findMany({
      orderBy: { menu_id: "asc" },
      skip: offset,
      take: safeLimit,
    });

    return NextResponse.json(
      {
        data: result,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching menu list:", error);
    return NextResponse.json({ error: "Failed to fetch menu list" }, { status: 500 });
  }
}
