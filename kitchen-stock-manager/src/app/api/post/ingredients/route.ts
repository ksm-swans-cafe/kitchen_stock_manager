import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const formData = await request.formData();

    const ingredient_name = formData.get("ingredient_name")?.toString();
    const ingredient_total = Number(formData.get("ingredient_total"));
    const ingredient_unit = formData.get("ingredient_unit")?.toString();
    const ingredient_category = formData.get("ingredient_category")?.toString() || "";
    const ingredient_sub_category = formData.get("ingredient_sub_category")?.toString() || "";
    const ingredient_total_alert = Number(formData.get("ingredient_total_alert"));
    const ingredient_price = Number(formData.get("ingredient_price"));
    const file = formData.get("ingredient_image") as File | null;

    if (!ingredient_name?.trim() || !Number.isFinite(ingredient_total) || ingredient_total <= 0 || !ingredient_unit?.trim() || !Number.isFinite(ingredient_total_alert) || ingredient_total_alert <= 0) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredients.findFirst({
      where: { ingredient_name: ingredient_name }
    });

    if (existingIngredient) {
      return NextResponse.json({ error: "Ingredient name already exists" }, { status: 409 });
    }

    // Upload image if provided
    let ingredient_image = "";
    if (file) {
      const blob = await put(`Ingredients-image/${randomUUID()}-${file.name}`, file, {
        access: "public",
      });
      console.log("Uploaded blob:", blob);
      ingredient_image = blob.url;
    }

    const ingredientPricePerUnit = (ingredient_price / ingredient_total).toFixed(2);

    // Get max ingredient_id for auto-increment
    const maxIdResult = await prisma.ingredients.findFirst({
      orderBy: { ingredient_id: "desc" },
      select: { ingredient_id: true }
    });
    const newIngredientId = (maxIdResult?.ingredient_id || 0) + 1;

    // Create new ingredient
    const result = await prisma.ingredients.create({
      data: {
        ingredient_id: newIngredientId,
        ingredient_name: ingredient_name,
        ingredient_total: ingredient_total.toString(),
        ingredient_unit: ingredient_unit,
        ingredient_category: ingredient_category,
        ingredient_sub_category: ingredient_sub_category,
        ingredient_image: ingredient_image,
        ingredient_total_alert: ingredient_total_alert.toString(),
        ingredient_price: ingredient_price.toString(),
        ingredient_price_per_unit: ingredientPricePerUnit,
        ingredient_lastupdate: new Date().toISOString(),
      }
    });

    return NextResponse.json(
      {
        message: "Ingredient created successfully",
        ingredient: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 });
  }
}
