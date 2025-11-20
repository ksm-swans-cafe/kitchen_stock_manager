import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntToNumber(item));
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }

  return obj;
}

export async function GET(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

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

    const convertedResult = convertBigIntToNumber(result);

    return NextResponse.json(
      {
        data: convertedResult,
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
