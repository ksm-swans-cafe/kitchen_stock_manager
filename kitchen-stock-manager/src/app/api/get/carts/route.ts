import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.cart.findMany({
      orderBy: {
        cart_create_date: "desc",
      },
    });
    if (result.length === 0) return NextResponse.json({ message: "No carts found" }, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
