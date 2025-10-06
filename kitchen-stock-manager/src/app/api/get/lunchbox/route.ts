import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.lunchbox.findMany({
      select: {
        lunchbox_name: true,
        lunchbox_set_name: true,
        lunchbox_limit: true,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
