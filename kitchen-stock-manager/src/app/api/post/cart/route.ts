import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_username, cart_lunchboxes, cart_menu_items, cart_customer_name, cart_customer_tel, cart_delivery_date, cart_location_send, cart_export_time, cart_receive_time, cart_shipping_cost } = body;

    if (!cart_username || !cart_lunchboxes) {
      return NextResponse.json({ error: "Username and lunchboxes are required" }, { status: 400 });
    }

    const cartCreateDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    const cartCreateDateString = cartCreateDate.toISOString();

    const todayStart = new Date(cartCreateDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartString = todayStart.toISOString();

    const todayEnd = new Date(cartCreateDate);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndString = todayEnd.toISOString();

    const orderCount = await prisma.cart.count({
      where: {
        cart_create_date: {
          gte: todayStartString,
          lte: todayEndString,
        },
      },
    });

    const orderNumber = String(orderCount + 1).padStart(3, "0");

    const cartId = `CART-${orderNumber}-${Date.now()}`;

    const formattedLunchboxes = cart_lunchboxes.map((lunchbox: any) => ({
      lunchbox_name: lunchbox.lunchbox_name,
      lunchbox_set_name: lunchbox.lunchbox_set,
      lunchbox_limit: lunchbox.lunchbox_limit || 0, 
      lunchbox_total: lunchbox.lunchbox_quantity || 1, 
      lunchbox_menu: lunchbox.lunchbox_menus || [],
    }));

    const result = await prisma.cart.create({
      data: {
        cart_id: cartId, 
        cart_username,
        cart_lunchbox: formattedLunchboxes,
        cart_menu_items: cart_menu_items || [],
        cart_create_date: cartCreateDateString,
        cart_order_number: orderNumber,
        cart_customer_name: cart_customer_name,
        cart_customer_tel: cart_customer_tel,
        cart_delivery_date: cart_delivery_date,
        cart_location_send: cart_location_send,
        cart_export_time: cart_export_time,
        cart_receive_time: cart_receive_time,
        cart_shipping_cost: cart_shipping_cost,
        cart_status: "pending",
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
