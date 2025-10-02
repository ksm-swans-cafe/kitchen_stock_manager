import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  const { isChecked } = await request.json();

  console.log("PATCH Request:", {
    id,
    isChecked,
  });
  if (!id || isChecked == null) {
    console.warn("Missing fields:", { id, isChecked });
    return NextResponse.json(
      { error: "กรุณาระบุ cart_id และ isChecked" },
      { status: 400 }
    );
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
      console.error("Cart not found for id:", id);
      return NextResponse.json(
        { error: "ไม่พบตะกร้าที่ระบุ" },
        { status: 404 }
      );
    }

    let menuItems: MenuItem[] = [];
    if (typeof cart.cart_menu_items === "string") {
      try {
        menuItems = JSON.parse(cart.cart_menu_items);
        console.log("Parsed cart_menu_items:", menuItems);
      } catch (e) {
        console.error("JSON parse error:", (e as Error).message);
        return NextResponse.json(
          { error: "รูปแบบข้อมูลเมนูในตะกร้าไม่ถูกต้อง" },
          { status: 400 }
        );
      }
    } else if (Array.isArray(cart.cart_menu_items)) {
      menuItems = (cart.cart_menu_items as unknown as MenuItem[]).filter(
        (item): item is MenuItem => item !== null
      );
    } else {
      console.error("Invalid cart_menu_items format:", cart.cart_menu_items);
      return NextResponse.json(
        { error: "รูปแบบข้อมูลเมนูในตะกร้าไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const updatedMenuItems = menuItems.map((item) => ({
      ...item,
      menu_ingredients: item.menu_ingredients.map((ing) => ({
        ...ing,
        ingredient_status: isChecked,
      })),
    }));

    console.log("Updated menuItems:", updatedMenuItems);

    const result = await prisma.cart.update({
      where: { cart_id: id },
      data: {
        cart_menu_items: JSON.stringify(updatedMenuItems),
      },
    });

    if (!result) {
      console.error("Failed to update cart for id:", id);
      return NextResponse.json(
        { error: "ไม่สามารถอัปเดตตะกร้าได้" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart: result,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" },
      { status: 500 }
    );
  }
}
