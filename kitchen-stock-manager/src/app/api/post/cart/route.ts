import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? Number(value) : value)));
}

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;
  try {
    const body = await request.json();
    const {
      cart_channel_access,
      cart_username,
      cart_lunchboxes,
      cart_customer_name,
      cart_customer_tel,
      cart_delivery_date,
      cart_location_send,
      cart_export_time,
      cart_receive_time,
      cart_receive_name,
      cart_total_cost_lunchbox,
      cart_invoice_tex,
      cart_shipping_cost,
      cart_pay_type,
      cart_pay_deposit,
      cart_pay_isdeposit,
      cart_pay_cost,
      cart_pay_charge,
      cart_total_remain,
      cart_total_cost,
    } = body;

    if (!cart_channel_access || !cart_username || !cart_lunchboxes) {
      return NextResponse.json({ error: "Channel access, username and lunchboxes are required" }, { status: 400 });
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

    const rawLunchboxes = cart_lunchboxes.map((lunchbox: any) => ({
      lunchbox_name: lunchbox.lunchbox_name || "",
      lunchbox_set_name: lunchbox.lunchbox_set || "",
      lunchbox_limit: parseInt(lunchbox.lunchbox_limit?.toString() || "0"),
      lunchbox_total: parseInt(lunchbox.lunchbox_quantity || "1"),
      lunchbox_total_cost: parseInt((lunchbox.lunchbox_total_cost || "0").toString().replace(/[^\d]/g, "")),
      lunchbox_menu: (lunchbox.lunchbox_menus || []).map((menu: any) => ({
        menu_name: menu.menu_name || "",
        menu_subname: menu.menu_subname || "",
        menu_category: menu.menu_category || "",
        menu_total: parseInt(menu.menu_total || "1"),
        menu_ingredients: (menu.menu_ingredients || []).map((ingredient: any) => ({
          ingredient_name: ingredient.ingredient_name || "",
          useItem: parseInt(ingredient.useItem || "0"),
        })),
        menu_description: menu.menu_description || [],
        menu_cost: parseInt(menu.menu_cost || "0"),
        menu_order_id: parseInt(menu.menu_order_id || "0"),
      })),
    }));

    const formattedLunchboxes = convertBigIntToNumber(rawLunchboxes);

    const cartData = {
      cart_id: cartId,
      cart_channel_access: cart_channel_access || "",
      cart_username: cart_username,
      cart_lunchbox: formattedLunchboxes,
      cart_create_date: cartCreateDateString,
      cart_last_update: cartCreateDateString,
      cart_order_number: orderNumber,
      cart_customer_name: cart_customer_name || "",
      cart_customer_tel: cart_customer_tel || "",
      cart_delivery_date: cart_delivery_date || "",
      cart_location_send: cart_location_send || "",
      cart_export_time: cart_export_time || "",
      cart_receive_time: cart_receive_time || "",
      cart_shipping_cost: cart_shipping_cost || "",
      cart_status: "completed",
      cart_receive_name: cart_receive_name || "",
      cart_total_cost_lunchbox: cart_total_cost_lunchbox || "",
      cart_invoice_tex: cart_invoice_tex || "",
      cart_pay_type: cart_pay_type || "",
      cart_pay_deposit: cart_pay_deposit || "",
      cart_pay_isdeposit: cart_pay_isdeposit || false,
      cart_pay_cost: cart_pay_cost || "",
      cart_pay_charge: cart_pay_charge || "",
      cart_total_remain: cart_total_remain || "",
      cart_total_cost: cart_total_cost || "",
    };

    const finalCartData = convertBigIntToNumber(cartData);

    const result = await prisma.cart.create({
      data: finalCartData,
    });

    const finalResult = convertBigIntToNumber(result);

    return NextResponse.json({ message: "Cart created successfully", cart: finalResult }, { status: 201 });
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
