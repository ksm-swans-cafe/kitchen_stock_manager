import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface MenuItem {
  menu_name: string;
  menu_total: number;
  menu_ingredients: {
    useItem: number;
    ingredient_name: string;
    ingredient_status: boolean;
  }[];
  menu_description: string;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
  }

  const { menuItems } = body;
  console.log("Received menuItems:", JSON.stringify(menuItems, null, 2));

  if (!id || !Array.isArray(menuItems) || menuItems.some((m: MenuItem) => !m.menu_name || m.menu_total < 0 || !Array.isArray(m.menu_ingredients) || m.menu_ingredients.some((ing) => !ing.ingredient_name || ing.useItem < 0) || m.menu_description === undefined || m.menu_description === null)) {
    return NextResponse.json({ error: "กรุณาระบุ menuItems ที่ถูกต้อง" }, { status: 400 });
  }

  try {
    const [cart] = await prisma.cart.findMany({
      where: { cart_id: id },
      select: {
        cart_id: true,
        cart_menu_items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    let existingMenuItems: MenuItem[] = [];
    if (cart.cart_menu_items) {
      try {
        if (typeof cart.cart_menu_items === "string") {
          existingMenuItems = JSON.parse(cart.cart_menu_items);
        } else if (Array.isArray(cart.cart_menu_items)) {
          existingMenuItems = cart.cart_menu_items as unknown as MenuItem[];
        } else {
          existingMenuItems = [];
        }
        if (!Array.isArray(existingMenuItems)) {
          console.warn("cart_menu_items is not an array, resetting to empty array");
          existingMenuItems = [];
        }
      } catch (parseError) {
        console.error("Failed to parse cart_menu_items:", parseError);
        existingMenuItems = [];
      }
    }

    const invalidMenus = await Promise.all(
      menuItems.map(async (item: MenuItem) => {
        const [menuCheck] = await prisma.menu.findMany({
          where: { menu_name: item.menu_name },
          select: { menu_name: true },
        });
        return !menuCheck ? item.menu_name : null;
      })
    ).then((results) => results.filter((m) => m));

    if (invalidMenus.length > 0) {
      return NextResponse.json({ error: `เมนูต่อไปนี้ไม่มีอยู่ในระบบ: ${invalidMenus.join(", ")}` }, { status: 400 });
    }

    const updatedMenuItems = menuItems.map((item: MenuItem) => {
      const existingMenu = existingMenuItems.find((m) => m.menu_name === item.menu_name);
      const menuIngredients = item.menu_ingredients.map((ing) => ({
        useItem: ing.useItem,
        ingredient_name: ing.ingredient_name,
        ingredient_status: existingMenu?.menu_ingredients.find((ei) => ei.ingredient_name === ing.ingredient_name)?.ingredient_status ?? ing.ingredient_status ?? false,
      }));
      return {
        menu_name: item.menu_name,
        menu_total: item.menu_total,
        menu_ingredients: menuIngredients,
        menu_description: item.menu_description,
      };
    });

    console.log("Updated menuItems to save:", JSON.stringify(updatedMenuItems, null, 2));

    const result = await prisma.cart.updateMany({
      where: { cart_id: id },
      data: {
        cart_menu_items: updatedMenuItems,
        cart_last_update: new Date().toISOString(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุหรือไม่สามารถอัปเดตได้" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      cart: result,
    });
  } catch (error: unknown) {
    console.error("Server error:", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      cartId: id,
    });
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" }, { status: 500 });
  }
}
