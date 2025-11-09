import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return Number(obj);

  if (Array.isArray(obj)) return obj.map((item) => convertBigIntToNumber(item));

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }

  return obj;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const id = params.id;

  try {
    const result = await prisma.menu.findMany({
      where: { menu_id: Number(id) },
    });
    if (result.length === 0) return NextResponse.json({ message: "Menu not found" }, { status: 404 });

    const convertedResult = convertBigIntToNumber(result[0]);
    return NextResponse.json(convertedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu list:", error);
    return NextResponse.json({ error: "Failed to fetch menu list" }, { status: 500 });
  }
}
