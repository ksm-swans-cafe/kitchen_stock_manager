import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
interface MenuItem {
  menu_name: string;
  menu_total: number;
  ingredients: {
    useItem: number;
    ingredient_id: number;
    ingredient_name: string;
    ingredient_status: boolean;
  }[];
  menu_description: string;
  menu_order_id: number;
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
      where: {
        cart_id: id,
      },
      select: {
        cart_id: true,
        cart_menu_items: true,
      },
    });

    if (!cart) {
      console.error("Cart not found for id:", id);
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    console.log("Fetched cart_menu_items:", cart.cart_menu_items);

    let menuItems: MenuItem[] = [];
    if (cart.cart_menu_items) {
      if (typeof cart.cart_menu_items === "string") {
        try {
          menuItems = JSON.parse(cart.cart_menu_items);
          if (!Array.isArray(menuItems)) {
            console.error("cart_menu_items is not an array:", menuItems);
            return NextResponse.json({ error: "ข้อมูลเมนูในตะกร้าไม่ถูกต้อง" }, { status: 400 });
          }
        } catch (e) {
          console.error("JSON parse error:", (e as Error).message, "Raw data:", cart.cart_menu_items);
          return NextResponse.json({ error: "รูปแบบข้อมูลเมนูในตะกร้าไม่ถูกต้อง" }, { status: 400 });
        }
      } else if (Array.isArray(cart.cart_menu_items)) {
        menuItems = (cart.cart_menu_items as unknown as MenuItem[]).filter((item): item is MenuItem => item !== null);
      } else {
        console.error("Invalid cart_menu_items format:", cart.cart_menu_items);
        return NextResponse.json({ error: "รูปแบบข้อมูลเมนูในตะกร้าไม่ถูกต้อง" }, { status: 400 });
      }
    }

    if (menuItems.length === 0) {
      console.warn("Empty menuItems for cart:", id);
      return NextResponse.json({ error: "ไม่มีเมนูในตะกร้า" }, { status: 400 });
    }

    const cleanedMenuName = menuName.trim();
    const menuExists = menuItems.find((item: MenuItem) => item.menu_name?.trim() === cleanedMenuName);

    if (!menuExists) {
      console.warn("Menu not found:", cleanedMenuName);
      return NextResponse.json({ error: `ไม่พบเมนู "${cleanedMenuName}" ในตะกร้า` }, { status: 404 });
    }

    const updatedMenuItems = menuItems.map((item: MenuItem) => (item.menu_name?.trim() === cleanedMenuName ? { ...item, menu_total: total } : item));

    const result = await prisma.cart.update({
      where: { cart_id: id },
      data: {
        cart_menu_items: JSON.stringify(updatedMenuItems),
      },
    });

    console.log("Update result:", result, "Updated data:", result.cart_menu_items);

    if (!result) {
      console.error("Failed to update cart for id:", id);
      return NextResponse.json({ error: "ไม่สามารถอัปเดตตะกร้าได้" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cart: result,
      updatedMenu: updatedMenuItems.find((m) => m.menu_name === cleanedMenuName),
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
