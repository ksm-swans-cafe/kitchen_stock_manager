import { NextResponse } from "next/server";
import sql from "@/app/database/connect";

export async function GET() {
  try {
    const result =
      await sql`SELECT * FROM cart ORDER BY cart_create_date DESC `;
    if (result.length === 0) {
      return NextResponse.json({ message: "No carts found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json(
      { error: "Failed to fetch carts" },
      { status: 500 }
    );
  }
}
