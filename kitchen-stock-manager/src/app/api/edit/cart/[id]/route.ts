import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body = await request.json();
    const { cart_username, cart_lunchboxes, cart_menu_items, cart_customer_name, cart_customer_tel, cart_delivery_date, cart_location_send, cart_export_time, cart_receive_time, cart_shipping_cost } = body;

    if (!id) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    const existingCart = await prisma.cart.findUnique({
      where: { cart_id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Define the type for updateData to avoid using 'any'
    type UpdateData = {
      cart_last_update: string;
      cart_username?: string;
    };

    const updateData: UpdateData = {
      cart_last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
    };

    if (cart_username !== undefined) updateData.cart_username = cart_username;
    if (cart_lunchboxes !== undefined) {
      const formattedLunchboxes = cart_lunchboxes.map((lunchbox: any) => ({
        lunchbox_name: lunchbox.lunchbox_name,
        lunchbox_set_name: lunchbox.lunchbox_set,
        lunchbox_limit: lunchbox.lunchbox_limit || 0,
        lunchbox_total: lunchbox.lunchbox_quantity || 1,
        lunchbox_menu: lunchbox.lunchbox_menus || [],
      }));
      updateData.cart_lunchbox = formattedLunchboxes;
    }
    if (cart_menu_items !== undefined) updateData.cart_menu_items = cart_menu_items;
    if (cart_customer_name !== undefined) updateData.cart_customer_name = cart_customer_name;
    if (cart_customer_tel !== undefined) updateData.cart_customer_tel = cart_customer_tel;
    if (cart_delivery_date !== undefined) updateData.cart_delivery_date = cart_delivery_date;
    if (cart_location_send !== undefined) updateData.cart_location_send = cart_location_send;
    if (cart_export_time !== undefined) updateData.cart_export_time = cart_export_time;
    if (cart_receive_time !== undefined) updateData.cart_receive_time = cart_receive_time;
    if (cart_shipping_cost !== undefined) updateData.cart_shipping_cost = cart_shipping_cost;

    // Update the cart
    const result = await prisma.cart.update({
      where: { cart_id: id },
      data: updateData,
    });

    return NextResponse.json({ message: "Cart updated successfully", cart: result }, { status: 200 });
  } catch (error: string | unknown) {
    console.error("Error updating cart:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: "Failed to update cart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
