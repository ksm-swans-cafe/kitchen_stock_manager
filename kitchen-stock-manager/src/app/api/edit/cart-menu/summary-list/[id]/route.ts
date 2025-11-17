import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface MenuIngredient {
  useItem: number;
  ingredient_name: string;
  ingredient_status: boolean;
}

interface LunchboxMenu {
  menu_name: string;
  menu_subname: string;
  menu_category: string;
  menu_total: number;
  menu_description: string;
  menu_order_id: number;
  menu_ingredients: MenuIngredient[];
}

// Interface สำหรับข้อมูลที่ส่งมาจาก frontend
interface FrontendLunchbox {
  lunchbox_name: string;
  lunchbox_set: string; // ใช้ lunchbox_set แทน lunchbox_set_name
  lunchbox_limit: number;
  lunchbox_quantity: number; // ใช้ lunchbox_quantity แทน lunchbox_total
  lunchbox_total_cost: string | number;
  lunchbox_menus: LunchboxMenu[]; // ใช้ lunchbox_menus แทน lunchbox_menu
}

// Interface สำหรับข้อมูลใน database
interface DatabaseLunchbox {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_total: number;
  lunchbox_total_cost: number;
  lunchbox_menu: LunchboxMenu[];
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

  const { cart_lunchboxes } = body;
  console.log("Received cart_lunchboxes:", JSON.stringify(cart_lunchboxes, null, 2));

  if (!id) {
    return NextResponse.json({ error: "กรุณาระบุ cart_id" }, { status: 400 });
  }

  // ตรวจสอบว่ามี cart_lunchboxes หรือไม่
  if (!Array.isArray(cart_lunchboxes) || cart_lunchboxes.length === 0) {
    return NextResponse.json({ error: "กรุณาระบุ cart_lunchboxes ที่ถูกต้อง" }, { status: 400 });
  }

  try {
    const [cart] = await prisma.cart.findMany({
      where: { cart_id: id },
      select: {
        cart_id: true,
        cart_lunchbox: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    let existingLunchboxes: DatabaseLunchbox[] = [];
    if (cart.cart_lunchbox) {
      try {
        if (typeof cart.cart_lunchbox === "string") {
          existingLunchboxes = JSON.parse(cart.cart_lunchbox);
        } else if (Array.isArray(cart.cart_lunchbox)) {
          existingLunchboxes = cart.cart_lunchbox as unknown as DatabaseLunchbox[];
        }
        if (!Array.isArray(existingLunchboxes)) {
          console.warn("cart_lunchbox is not an array, resetting to empty array");
          existingLunchboxes = [];
        }
      } catch (parseError) {
        console.error("Failed to parse cart_lunchbox:", parseError);
        existingLunchboxes = [];
      }
    }

    // แปลงข้อมูลจาก frontend format เป็น database format
    const updatedLunchboxes: DatabaseLunchbox[] = cart_lunchboxes.map((frontendLunchbox: FrontendLunchbox) => {
      const existingLunchbox = existingLunchboxes.find((lb) => lb.lunchbox_name === frontendLunchbox.lunchbox_name && lb.lunchbox_set_name === frontendLunchbox.lunchbox_set);

      return {
        lunchbox_name: frontendLunchbox.lunchbox_name,
        lunchbox_set_name: frontendLunchbox.lunchbox_set, // แปลง lunchbox_set เป็น lunchbox_set_name
        lunchbox_limit: frontendLunchbox.lunchbox_limit,
        lunchbox_total: frontendLunchbox.lunchbox_quantity, // แปลง lunchbox_quantity เป็น lunchbox_total
        lunchbox_total_cost: Number(frontendLunchbox.lunchbox_total_cost) || 0,
        lunchbox_menu: (frontendLunchbox.lunchbox_menus || []).map((newMenu) => {
          const existingMenu = existingLunchbox?.lunchbox_menu?.find((m) => m.menu_name === newMenu.menu_name);

          return {
            menu_name: newMenu.menu_name,
            menu_subname: newMenu.menu_subname || "",
            menu_category: newMenu.menu_category || "",
            menu_total: newMenu.menu_total || 0,
            menu_description: newMenu.menu_description || "",
            menu_order_id: newMenu.menu_order_id || 0,
            menu_ingredients: (newMenu.menu_ingredients || []).map((newIng) => ({
              useItem: newIng.useItem || 0,
              ingredient_name: newIng.ingredient_name || "",
              ingredient_status: existingMenu?.menu_ingredients?.find((ei) => ei.ingredient_name === newIng.ingredient_name)?.ingredient_status ?? newIng.ingredient_status ?? false,
            })),
          };
        }),
      };
    });

    console.log("Updated lunchboxes to save:", JSON.stringify(updatedLunchboxes, null, 2));

    const result = await prisma.cart.updateMany({
      where: { cart_id: id },
      data: {
        cart_lunchbox: updatedLunchboxes,
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
