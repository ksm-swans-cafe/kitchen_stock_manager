import { NextResponse, NextRequest } from "next/server";
import sql from "@app/database/connect";

interface Ingredient {
  ingredient_name: string;
  useItem: number;
  ingredient_status: boolean;
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
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!id || isChecked == null) {
    console.warn("Missing fields:", { id, isChecked });
    return NextResponse.json(
      { error: "กรุณาระบุ cart_id และ isChecked" },
      { status: 400 }
    );
  }

  try {
    // ดึงข้อมูลตะกร้า
    const [cart] = await sql`
      SELECT cart_id, cart_menu_items
      FROM cart
      WHERE cart_id = ${id};
    `;

    if (!cart) {
      console.error("Cart not found for id:", id);
      return NextResponse.json(
        { error: "ไม่พบตะกร้าที่ระบุ" },
        { status: 404 }
      );
    }

    // จัดการ cart_menu_items
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
      menuItems = cart.cart_menu_items;
    } else {
      console.error("Invalid cart_menu_items format:", cart.cart_menu_items);
      return NextResponse.json(
        { error: "รูปแบบข้อมูลเมนูในตะกร้าไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // อัปเดต ingredient_status สำหรับทุก ingredient
    const updatedMenuItems = menuItems.map((item) => ({
      ...item,
      menu_ingredients: item.menu_ingredients.map((ing) => ({
        ...ing,
        ingredient_status: isChecked,
      })),
    }));

    console.log("Updated menuItems:", updatedMenuItems);

    // อัปเดตฐานข้อมูล
    const [result] = await sql`
      UPDATE cart
      SET cart_menu_items = ${JSON.stringify(updatedMenuItems)}
      WHERE cart_id = ${id}
      RETURNING *;
    `;

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
