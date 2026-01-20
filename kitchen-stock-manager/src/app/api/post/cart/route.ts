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
      order_name,
      channel_access,
      username,
      lunchboxes,
      customer_name,
      customer_tel,
      delivery_date,
      location_send,
      export_time,
      receive_time,
      receive_name,
      total_cost_lunchbox,
      invoice_tex,
      shipping_cost,
      shipping_by,
      pay_type,
      pay_deposit,
      pay_isdeposit,
      pay_cost,
      pay_charge,
      total_remain,
      total_cost,
      message,
      ispay,
      description,
    } = body;

    if (!channel_access || !username || !lunchboxes) {
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

    const orderCount = await prisma.new_cart.count({
      where: {
        create_date: {
          gte: todayStartString,
          lte: todayEndString,
        },
      },
    });

    const orderNumber = String(orderCount + 1).padStart(3, "0");
    const cartId = `CART-${orderNumber}-${Date.now()}`;

    const rawLunchboxes = lunchboxes.map((lunchbox: any) => ({
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

    const status = ispay === "-" ? "completed" : ispay === "paid" ? "completed" : ispay === "unpaid" ? "pending" : "pending";
    const cartData = {
      cart_id: cartId,
      order_name: order_name || "",
      channel_access: channel_access || "",
      username: username,
      lunchbox: formattedLunchboxes,
      create_date: cartCreateDateString,
      last_update: cartCreateDateString,
      order_number: orderNumber,
      customer_name: customer_name || "",
      customer_tel: customer_tel || "",
      delivery_date: delivery_date || "",
      location_send: location_send || "",
      export_time: export_time || "",
      receive_time: receive_time || "",
      shipping_cost: shipping_cost || "",
      shipping_by: shipping_by || "",
      status: status,
      receive_name: receive_name || "",
      total_cost_lunchbox: total_cost_lunchbox || "",
      invoice_tex: invoice_tex || "",
      pay_type: pay_type || "",
      pay_deposit: pay_deposit || "",
      pay_isdeposit: pay_isdeposit || false,
      pay_cost: pay_cost || "",
      pay_charge: pay_charge || "",
      total_remain: total_remain || "",
      total_cost: total_cost || "",
      ispay: ispay || "",
      description: description || [],
    };

    const cartLogData = {
      message: message || `สร้างออเดอร์ ${cartId} โดย ${username}`,
      create_date: cartCreateDateString,
      create_by: username,
      status: "created",
    };
    const finalCartData = convertBigIntToNumber(cartData);

    const result = await prisma.new_cart.create({
      data: finalCartData,
    });
    const cartLogResult = await prisma.cart_log.create({
      data: cartLogData,
    });

    const finalResult = convertBigIntToNumber(result);

    return NextResponse.json({ message: "Cart created successfully", cart: finalResult, log: cartLogResult }, { status: 201 });
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
