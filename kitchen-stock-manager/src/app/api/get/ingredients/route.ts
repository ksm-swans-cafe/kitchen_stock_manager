import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const result = await prisma.ingredients.findMany({
      orderBy: { ingredient_id: "asc" },
    });
    if (result.length === 0) return NextResponse.json({ message: "No ingredients found" }, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json({ message: "Error fetching ingredients" }, { status: 500 });
  }
}
