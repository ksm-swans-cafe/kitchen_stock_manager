import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to convert BigInt to string recursively
function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }

  return obj;
}

export async function GET() {
  try {
    const result = await prisma.cart.findMany({
      orderBy: {
        cart_create_date: "desc",
      },
    });
    if (result.length === 0) return NextResponse.json({ message: "No carts found" }, { status: 404 });

    // Convert BigInt values to strings before sending JSON response
    const convertedResult = convertBigIntToString(result);
    return NextResponse.json(convertedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
