import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect";

interface Ingredient {
  ingredient_name: string;
  useItem: number;
  ingredient_status: boolean;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  console.log("Received id from params:", id); // Log เพื่อตรวจสอบ

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json(
      { error: "Invalid JSON format in request body" },
      { status: 400 }
    );
  }

  const { menuName, ingredients } = body;
  console.log("Received data:", { id, menuName, ingredients });

  if (
    !id ||
    !menuName ||
    !Array.isArray(ingredients) ||
    ingredients.some(
      (ing: Ingredient) => !ing.ingredient_name || ing.useItem < 0
    )
  ) {
    return NextResponse.json(
      { error: "กรุณาระบุ id, menuName และ ingredients ที่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    // ค้นหา cart
    const [cart] = await sql`
      SELECT cart_id, cart_menu_items
      FROM cart
      WHERE cart_id = ${id};
    `;

    if (!cart) {
      return NextResponse.json(
        { error: "ไม่พบตะกร้าที่ระบุ" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเมนูมีอยู่ในระบบ
    const [menuCheck] = await sql`
      SELECT menu_name FROM menu WHERE menu_name = ${menuName};
    `;
    if (!menuCheck) {
      return NextResponse.json(
        { error: `เมนู ${menuName} ไม่มีอยู่ในระบบ` },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า ingredient_name มีอยู่ในตาราง ingredients
    const invalidIngredients = await Promise.all(
      ingredients.map(async (ing: Ingredient) => {
        const [ingredientCheck] = await sql`
          SELECT ingredient_name FROM ingredients WHERE ingredient_name = ${ing.ingredient_name};
        `;
        return !ingredientCheck ? ing.ingredient_name : null;
      })
    ).then((results) => results.filter((ing) => ing));

    if (invalidIngredients.length > 0) {
      return NextResponse.json(
        {
          error: `วัตถุดิบต่อไปนี้ไม่มีอยู่ในระบบ: ${invalidIngredients.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // แปลง cart_menu_items
    let existingMenuItems: {
      menu_name: string;
      menu_total: number;
      menu_ingredients: Ingredient[];
    }[] = [];
    if (cart.cart_menu_items) {
      try {
        existingMenuItems = JSON.parse(cart.cart_menu_items);
        if (!Array.isArray(existingMenuItems)) {
          console.warn(
            "cart_menu_items is not an array, resetting to empty array"
          );
          existingMenuItems = [];
        }
      } catch (parseError) {
        console.error("Failed to parse cart_menu_items:", parseError);
        existingMenuItems = [];
      }
    }

    // อัปเดตเฉพาะวัตถุดิบของเมนูที่ระบุ
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

    // ถ้าเมนูที่ระบุไม่อยู่ใน existingMenuItems ให้เพิ่มใหม่
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

    // อัปเดต cart ในฐานข้อมูล
    const result = await sql`
      UPDATE cart
      SET cart_menu_items = ${JSON.stringify(updatedMenuItems)},
          cart_last_update = CURRENT_TIMESTAMP
      WHERE cart_id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "ไม่สามารถอัปเดตตะกร้าได้" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart: result[0],
    });
  } catch (error: unknown) {
    console.error("Server error:", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      id,
    });
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" },
      { status: 500 }
    );
  }
}
