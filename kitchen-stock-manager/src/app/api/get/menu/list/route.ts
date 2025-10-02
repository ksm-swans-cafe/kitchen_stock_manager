import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.menu.findMany({
      orderBy: { menu_id: "asc" },
    });
    if (result.length === 0) return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu list:", error);
    return NextResponse.json({ error: "Failed to fetch menu list" }, { status: 500 });
  }
}
