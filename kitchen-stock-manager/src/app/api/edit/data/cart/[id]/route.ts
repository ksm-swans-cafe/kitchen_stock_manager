import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const { menuName, menu_total } = await request.json();
  console.log("Received data:", { id, menuName, menu_total });

  if (!id || !menuName || menu_total == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const [cart] = await sql`
      SELECT cart_menu_items
      FROM cart
      WHERE cart_id = ${id};
    `;

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    console.log("Raw cart_menu_items:", cart.cart_menu_items); // Debug

    let menuItems = [];
    if (cart.cart_menu_items && typeof cart.cart_menu_items === "string") {
      try {
        menuItems = JSON.parse(cart.cart_menu_items);
        if (!Array.isArray(menuItems)) {
          console.error("cart_menu_items is not an array:", menuItems);
          return NextResponse.json(
            { error: "cart_menu_items is not an array" },
            { status: 400 }
          );
        }
      } catch (e) {
        console.error("JSON parse error:", e, "cart_menu_items:", cart.cart_menu_items);
        return NextResponse.json(
          { error: "Invalid cart_menu_items format" },
          { status: 400 }
        );
      }
    }

    if (menuItems.length === 0) {
      return NextResponse.json(
        { error: "No menus found in cart", cart_menu_items: cart.cart_menu_items },
        { status: 400 }
      );
    }

    const cleanedMenuName = menuName.trim().toLowerCase();
    console.log("Cleaned menuName:", cleanedMenuName);
    console.log("Available menu names:", menuItems.map((item: any) => item.menu_name));

    const menuExists = menuItems.some(
      (item: any) => item.menu_name?.trim().toLowerCase() === cleanedMenuName
    );
    console.log("Menu exists:", menuExists);

    if (!menuExists) {
      return NextResponse.json(
        {
          error: "Menu not found in cart",
          receivedMenuName: menuName,
          availableMenus: menuItems.map((item: any) => item.menu_name),
        },
        { status: 404 }
      );
    }

    const updatedMenuItems = menuItems.map((item: any) =>
      item.menu_name?.trim().toLowerCase() === cleanedMenuName
        ? { ...item, menu_total: Number(menu_total) }
        : item
    );

    const result = await sql`
      UPDATE cart
      SET cart_menu_items = ${JSON.stringify(updatedMenuItems)}
      WHERE cart_id = ${id}
      RETURNING *;
    `;

    console.log("Update result:", result);
    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating menu total:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}