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

    const existingCart = await prisma.cart.findFirst({
      where: { cart_id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Define the type for updateData to avoid using 'any'
    type UpdateData = {
      cart_last_update: string;
      cart_username?: string;
      cart_lunchbox?: any;
      cart_menu_items?: any;
      cart_customer_name?: string;
      cart_customer_tel?: string;
      cart_delivery_date?: string;
      cart_location_send?: string;
      cart_export_time?: string;
      cart_receive_time?: string;
      cart_shipping_cost?: any;
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
        lunchbox_total_cost: lunchbox.lunchbox_total_cost || 0,
        lunchbox_menu: (lunchbox.lunchbox_menus || []).map((menu: any) => ({
          menu_name: menu.menu_name,
          menu_subname: menu.menu_subname,
          menu_category: menu.menu_category,
          menu_total: menu.menu_total,
          menu_order_id: menu.menu_order_id || 0,
          menu_description: menu.menu_description || "",
          menu_cost: menu.menu_cost || 0,
          menu_ingredients: (menu.menu_ingredients || []).map((ing: any) => ({
            ingredient_name: ing.ingredient_name,
            useItem: ing.useItem,
          })),
        })),
      }));
      updateData.cart_lunchbox = formattedLunchboxes;
    }
    if (cart_menu_items !== undefined) {
      // Only keep fields that exist in Prisma schema
      const cleanedMenuItems = cart_menu_items.map((item: any) => ({
        menu_name: item.menu_name,
        menu_subname: item.menu_subname,
        menu_category: item.menu_category,
        menu_total: item.menu_total,
        menu_description: item.menu_description,
        menu_order_id: item.menu_order_id,
        menu_notes: item.menu_notes || [],
        menu_ingredients: item.menu_ingredients?.map((ing: any) => ({
          useItem: ing.useItem,
          ingredient_name: ing.ingredient_name,
          ingredient_status: ing.ingredient_status,
        })) || [],
      }));
      updateData.cart_menu_items = cleanedMenuItems;
    }
    if (cart_customer_name !== undefined) updateData.cart_customer_name = cart_customer_name;
    if (cart_customer_tel !== undefined) updateData.cart_customer_tel = cart_customer_tel;
    if (cart_delivery_date !== undefined) updateData.cart_delivery_date = cart_delivery_date;
    if (cart_location_send !== undefined) updateData.cart_location_send = cart_location_send;
    if (cart_export_time !== undefined) updateData.cart_export_time = cart_export_time;
    if (cart_receive_time !== undefined) updateData.cart_receive_time = cart_receive_time;
    if (cart_shipping_cost !== undefined) updateData.cart_shipping_cost = cart_shipping_cost;

    // Update the cart
    const result = await prisma.cart.update({
      where: { id: (existingCart as { id: string }).id },
      data: updateData,
    });

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({ message: "Cart updated successfully", cart: serializedResult }, { status: 200 });
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
