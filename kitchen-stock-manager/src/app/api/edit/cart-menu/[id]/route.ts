import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

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
  menu_ingredients: MenuIngredient[];
  menu_description: string;
  menu_cost?: number;
  menu_order_id: number;
}

interface Lunchbox {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_total: number;
  lunchbox_total_cost: number;
  lunchbox_menu: LunchboxMenu[];
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const { id } = params;
  const { menuName, menu_total } = await request.json();

  if (!id || !menuName || menu_total == null) {
    console.warn("Missing fields:", { id, menuName, menu_total });
    return NextResponse.json({ error: "กรุณาระบุ cart_id, menuName และ menu_total" }, { status: 400 });
  }

  const total = Number(menu_total);
  if (!Number.isInteger(total) || total < 0) {
    console.warn("Invalid menu_total:", menu_total);
    return NextResponse.json({ error: "menu_total ต้องเป็นจำนวนเต็มที่ไม่ติดลบ" }, { status: 400 });
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
      console.error("Cart not found for id:", id);
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    console.log("Fetched cart_lunchbox:", cart.cart_lunchbox);

    let lunchboxes: Lunchbox[] = [];
    if (cart.cart_lunchbox) {
      if (typeof cart.cart_lunchbox === "string") {
        try {
          lunchboxes = JSON.parse(cart.cart_lunchbox);
          if (!Array.isArray(lunchboxes)) {
            console.error("cart_lunchbox is not an array:", lunchboxes);
            return NextResponse.json({ error: "ข้อมูล lunchbox ในตะกร้าไม่ถูกต้อง" }, { status: 400 });
          }
        } catch (e) {
          console.error("JSON parse error:", (e as Error).message, "Raw data:", cart.cart_lunchbox);
          return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ในตะกร้าไม่ถูกต้อง" }, { status: 400 });
        }
      } else if (Array.isArray(cart.cart_lunchbox)) {
        lunchboxes = cart.cart_lunchbox as unknown as Lunchbox[];
      }
    }

    if (lunchboxes.length === 0) {
      console.warn("Empty lunchboxes for cart:", id);
      return NextResponse.json({ error: "ไม่มี lunchbox ในตะกร้า" }, { status: 400 });
    }

    const cleanedMenuName = menuName.trim();
    let menuFound = false;

    // อัปเดต menu_total ของเมนูในทุก lunchbox ที่มีเมนูนี้
    const updatedLunchboxes = lunchboxes.map((lunchbox) => ({
      ...lunchbox,
      lunchbox_menu: lunchbox.lunchbox_menu.map((menu) => {
        if (menu.menu_name?.trim() === cleanedMenuName) {
          menuFound = true;
          return { ...menu, menu_total: total };
        }
        return menu;
      }),
    }));

    if (!menuFound) {
      console.warn("Menu not found:", cleanedMenuName);
      return NextResponse.json({ error: `ไม่พบเมนู "${cleanedMenuName}" ในตะกร้า` }, { status: 404 });
    }

    const result = await prisma.cart.update({
      where: { id: id },
      data: {
        cart_lunchbox: updatedLunchboxes,
        cart_last_update: new Date().toISOString(),
      },
    });


    console.log("Update result:", result);

    if (!result) {
      console.error("Failed to update cart for id:", id);
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
      cartId: id,
    });
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" }, { status: 500 });
  }
}
