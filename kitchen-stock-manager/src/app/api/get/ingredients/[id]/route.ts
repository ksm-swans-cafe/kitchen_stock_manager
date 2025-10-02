import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result = await prisma.ingredients.findMany({
      where: { ingredient_id: Number(id) },
    });

    if (result.length === 0) return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
