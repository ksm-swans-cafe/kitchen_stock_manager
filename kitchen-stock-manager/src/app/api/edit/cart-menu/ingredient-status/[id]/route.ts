import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface Ingredient {
  ingredient_name: string;
  useItem: number;
  ingredient_status: boolean;
  description: string;
}

interface MenuItem {
  menu_name: string;
  menu_total: number;
  menu_ingredients: Ingredient[];
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const { id } = params;
  const { menuName, ingredientName, isChecked } = await request.json();
  console.log(menuName);
  if (!id || !menuName || !ingredientName || isChecked == null) {
    console.warn("Missing fields:", {
      id,
      menuName,
      ingredientName,
      isChecked,
    });
    return NextResponse.json({ error: "กรุณาระบุ id, menuName, ingredientName และ isChecked" }, { status: 400 });
  }

  try {
    const cart = await prisma.new_cart.findFirst({
      where: { id: id },
      select: {
        id: true,
        lunchbox: true,
      },
    });

    if (!cart) {
      console.error("Cart not found for id:", id);
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    // Parse lunchbox
    let lunchboxes: any[] = [];
    if (typeof cart.lunchbox === "string") {
      try {
        lunchboxes = JSON.parse(cart.lunchbox);
      } catch (e) {
        console.error("JSON parse error:", (e as Error).message);
        return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
      }
    } else if (Array.isArray(cart.lunchbox)) {
      lunchboxes = cart.lunchbox;
    } else {
      console.error("Invalid lunchbox format:", cart.lunchbox);
      return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
    }

    // Find menu in lunchbox_menu
    let menuFound = false;
    let ingredientFound = false;

    const updatedLunchboxes = lunchboxes.map((lunchbox: any) => ({
      ...lunchbox,
      lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => {
        if (menu.menu_name === menuName) {
          menuFound = true;
          return {
            ...menu,
            menu_ingredients: menu.menu_ingredients.map((ing: any) => {
              if (ing.ingredient_name === ingredientName) {
                ingredientFound = true;
                return { ...ing, ingredient_status: isChecked };
              }
              return ing;
            }),
          };
        }
        return menu;
      }),
    }));

    if (!menuFound) {
      console.warn("Menu not found:", menuName);
      return NextResponse.json({ error: `ไม่พบเมนู "${menuName}" ในตะกร้า` }, { status: 404 });
    }

    if (!ingredientFound) {
      console.warn("Ingredient not found:", ingredientName, "in menu:", menuName);
      return NextResponse.json({ error: `ไม่พบวัตถุดิบ "${ingredientName}" ในเมนู "${menuName}"` }, { status: 404 });
    }

    console.log("Attempting to update cart with id:", cart.id);
    console.log(
      "Updated lunchboxes:",
      JSON.stringify(
        updatedLunchboxes,
        (key, value) => {
          return typeof value === "bigint" ? value.toString() : value;
        },
        2
      )
    );

    const result = await prisma.new_cart.updateMany({
      where: { id: id },
      data: {
        lunchbox: updatedLunchboxes as any,
      },
    });

    console.log("Update result:", result);

    if (result.count === 0) {
      console.error("Failed to update cart for id:", id);
      return NextResponse.json({ error: "ไม่สามารถอัปเดตตะกร้าได้" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Server error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
