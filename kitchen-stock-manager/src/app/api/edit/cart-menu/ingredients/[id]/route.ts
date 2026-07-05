import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface Ingredient {
  ingredient_name: string;
  useItem: number;
  ingredient_status: boolean;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const { id } = params;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
  }

  const { menuName, ingredients } = body;
  console.log("Received data:", { id, menuName, ingredients });

  if (!id || !menuName || !Array.isArray(ingredients) || ingredients.some((ing: Ingredient) => !ing.ingredient_name || ing.useItem < 0)) {
    return NextResponse.json({ error: "กรุณาระบุ id, menuName และ ingredients ที่ถูกต้อง" }, { status: 400 });
  }

  try {
    const [cart] = await prisma.new_cart.findMany({
      where: { id: id },
      select: {
        id: true,
        menu_items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    const [menuCheck] = await prisma.menu.findMany({
      where: { menu_name: menuName },
      select: { menu_name: true },
    });
    if (!menuCheck) {
      return NextResponse.json({ error: `เมนู ${menuName} ไม่มีอยู่ในระบบ` }, { status: 400 });
    }

    const invalidIngredients = await Promise.all(
      ingredients.map(async (ing: Ingredient) => {
        const [ingredientCheck] = await prisma.ingredients.findMany({
          where: { ingredient_name: ing.ingredient_name },
          select: { ingredient_name: true },
        });
        return !ingredientCheck ? ing.ingredient_name : null;
      })
    ).then((results) => results.filter((ing) => ing));

    if (invalidIngredients.length > 0) {
      return NextResponse.json(
        {
          error: `วัตถุดิบต่อไปนี้ไม่มีอยู่ในระบบ: ${invalidIngredients.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existingMenuItems: {
      menu_name: string;
      menu_total: number;
      menu_ingredients: Ingredient[];
    }[] = Array.isArray(cart.menu_items) ? (cart.menu_items as any) : [];

    const updatedMenuItems = existingMenuItems.map((item) =>
      item.menu_name === menuName
        ? {
            ...item,
            menu_ingredients: ingredients.map((ing: Ingredient) => ({
              ingredient_name: ing.ingredient_name,
              useItem: Number(ing.useItem),
              ingredient_status: ing.ingredient_status ?? false,
            })),
          }
        : item
    );

    if (!existingMenuItems.some((item) => item.menu_name === menuName)) {
      updatedMenuItems.push({
        menu_name: menuName,
        menu_total: 0,
        menu_ingredients: ingredients.map((ing: Ingredient) => ({
          ingredient_name: ing.ingredient_name,
          useItem: Number(ing.useItem),
          ingredient_status: ing.ingredient_status ?? false,
        })),
      });
    }

    const result = await prisma.new_cart.update({
      where: { id: id },
      data: {
        menu_items: updatedMenuItems as any,
        last_update: new Date().toISOString(),
      },
    });

    if (!result) {
      return NextResponse.json({ error: "ไม่สามารถอัปเดตตะกร้าได้" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cart: result,
    });
  } catch (error: unknown) {
    console.error("Server error:", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      id,
    });
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" }, { status: 500 });
  }
}
