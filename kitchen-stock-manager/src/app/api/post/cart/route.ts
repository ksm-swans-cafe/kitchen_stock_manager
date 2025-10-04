import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_username, cart_menu_items, cart_customer_name, cart_customer_tel, cart_delivery_date, cart_location_send, cart_export_time, cart_receive_time, cart_shipping_cost } = body;
    if (!cart_username || !cart_menu_items) {
      return NextResponse.json({ error: "Username and menu items are required" }, { status: 400 });
    }

    const menuItemsJson = JSON.stringify(cart_menu_items);
    const cartCreateDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    const todayStart = new Date(cartCreateDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(cartCreateDate);
    todayEnd.setHours(23, 59, 59, 999);

    const orderCount = await prisma.cart.count({
      where: {
        cart_create_date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const orderNumber = String(orderCount + 1).padStart(3, "0");
    const result = await prisma.cart.create({
      data: {
        cart_username,
        cart_menu_items: menuItemsJson,
        cart_create_date: cartCreateDate,
        cart_order_number: orderNumber,
        cart_customer_name: cart_customer_name,
        cart_customer_tel: cart_customer_tel,
        cart_delivery_date: cart_delivery_date,
        cart_location_send: cart_location_send,
        cart_export_time: cart_export_time,
        cart_receive_time: cart_receive_time,
        cart_shipping_cost: cart_shipping_cost,
      },
    });

    return NextResponse.json({ message: "Cart created successfully", cart: result }, { status: 201 });
  } catch (error: string | unknown) {
    console.error("Error creating cart:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: "Failed to create cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
