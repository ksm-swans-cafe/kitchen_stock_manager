import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
  }

  try {
    // const [cart] = await sql`
    //   SELECT cart_menu_items
    //   FROM cart
    //   WHERE cart_id = ${id};
    // `;
    const [cart] = await prisma.cart.findMany({
      where: { cart_id: id },
      select: { cart_menu_items: true },
    });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    let menuItems = [];
    if (cart.cart_menu_items && typeof cart.cart_menu_items === "string") {
      try {
        menuItems = JSON.parse(cart.cart_menu_items);
        if (!Array.isArray(menuItems)) {
          return NextResponse.json(
            { error: "cart_menu_items is not an array" },
            { status: 400 }
          );
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        return NextResponse.json(
          { error: "Invalid cart_menu_items format" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      cart_id: id,
      menuItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
