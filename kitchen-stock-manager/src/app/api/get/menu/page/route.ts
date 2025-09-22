import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log(`Fetching menu list: page=${page}, limit=${limit}`);
    const safePage = isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;

    // 🔹 คำนวณ offset
    const offset = (safePage - 1) * safeLimit;

    // 🔹 Query total count
    const total = await prisma.menu.count();

    // 🔹 Query menu ตามหน้าที่ต้องการ
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
    return NextResponse.json(
      { error: "Failed to fetch menu list" },
      { status: 500 }
    );
  }
}
