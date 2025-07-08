import { NextResponse, NextRequest } from "next/server";
import sql from "@/app/database/connect";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cart_username,
      cart_menu_items,
      cart_customer_name,
      cart_customer_tel,
      cart_delivery_date,
      cart_location_send,
    } = body;

    if (!cart_username || !cart_menu_items) {
      return NextResponse.json(
        { error: "Username and menu items are required" },
        { status: 400 }
      );
    }

    const menuItemsJson = JSON.stringify(cart_menu_items);
    const cartCreateDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const orderNumber = (
      await sql`
        SELECT LPAD(
          CAST(
            (SELECT COUNT(*) + 1 FROM cart c2
             WHERE DATE(c2.cart_create_date) = DATE(${cartCreateDate})
             AND c2.cart_create_date <= ${cartCreateDate}) AS TEXT
          ),
          3,
          '0'
        ) AS order_num`
    )[0].order_num;

    const result = await sql`
      INSERT INTO cart (cart_username, cart_menu_items, 
      cart_create_date, cart_order_number,  
      cart_customer_name, cart_customer_tel, 
      cart_delivery_date, cart_location_send)
      VALUES (${cart_username}, ${menuItemsJson}::jsonb, 
      ${cartCreateDate}, ${orderNumber},  
      ${cart_customer_name}, ${cart_customer_tel}, 
      ${cart_delivery_date}, ${cart_location_send})
      RETURNING *`;

    return NextResponse.json(
      { message: "Cart created successfully", cart: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating cart:", error);
    return NextResponse.json(
      {
        error: "Failed to create cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
