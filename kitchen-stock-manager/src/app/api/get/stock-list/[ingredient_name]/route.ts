import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { ingredient_name: string } }) {
  const { ingredient_name } = params;

  try {
    const result = await prisma.ingredient_transactions.findMany({
      where: { ingredient_name: ingredient_name },
    });

    if (result.length === 0) {
      return NextResponse.json({ message: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
