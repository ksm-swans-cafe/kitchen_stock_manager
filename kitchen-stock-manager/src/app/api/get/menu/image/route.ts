import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.menu.findMany({
      orderBy: { menu_id: "asc" },
      select: {
        menu_image: true,
      },
    });
    if (result.length === 0) {
      return NextResponse.json({ message: "No images found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
