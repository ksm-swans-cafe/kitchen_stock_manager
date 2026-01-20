import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body = await request.json();
    const { username, lunchboxes, menu_items, customer_name, customer_tel, delivery_date, location_send, export_time, receive_time, shipping_cost } = body;

    if (!id) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    const existingCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    type UpdateData = {
      last_update: string;
      username?: string;
      lunchbox?: any;
      menu_items?: any;
      customer_name?: string;
      customer_tel?: string;
      delivery_date?: string;
      location_send?: string;
      export_time?: string;
      receive_time?: string;
      shipping_cost?: any;
    };

    const updateData: UpdateData = {
      last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
    };

    if (username !== undefined) updateData.username = username;
    if (lunchboxes !== undefined) {
      const formattedLunchboxes = lunchboxes.map((lunchbox: any) => ({
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
          menu_description: Array.isArray(menu.menu_description) ? menu.menu_description : [],
          menu_cost: menu.menu_cost || 0,
          menu_ingredients: (menu.menu_ingredients || []).map((ing: any) => ({
            ingredient_name: ing.ingredient_name,
            useItem: ing.useItem,
          })),
        })),
      }));
      updateData.lunchbox = formattedLunchboxes;
    }
    if (menu_items !== undefined) {
      // Only keep fields that exist in Prisma schema
      const cleanedMenuItems = menu_items.map((item: any) => ({
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
      updateData.menu_items = cleanedMenuItems;
    }
    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (customer_tel !== undefined) updateData.customer_tel = customer_tel;
    if (delivery_date !== undefined) updateData.delivery_date = delivery_date;
    if (location_send !== undefined) updateData.location_send = location_send;
    if (export_time !== undefined) updateData.export_time = export_time;
    if (receive_time !== undefined) updateData.receive_time = receive_time;
    if (shipping_cost !== undefined) updateData.shipping_cost = shipping_cost;

    // Update the cart using updateMany to avoid null field validation errors
    const result = await prisma.new_cart.updateMany({
      where: { id: id },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุหรือไม่สามารถอัปเดตได้" }, { status: 404 });
    }

    // Fetch the updated cart to return
    const updatedCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: "ไม่พบตะกร้าหลังอัปเดต" }, { status: 404 });
    }

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(JSON.stringify(updatedCart, (key, value) =>
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
