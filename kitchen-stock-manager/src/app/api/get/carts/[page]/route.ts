import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? Number(value) : value)));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  let status: string[] = [];

  if (page === "summarylist") {
    status = ["pending", "completed"];
  } else if (page === "orderhistory") {
    status = ["success", "cancelled"];
  } else {
    return NextResponse.json({ message: "Invalid page type" }, { status: 400 });
  }

  try {
    // Fetch carts without cart_lunchbox and cart_total_cost_lunchbox to avoid type mismatch errors
    const cartsBasic = await prisma.cart.findMany({
      orderBy: { cart_create_date: "desc" },
      where: {
        cart_status: { in: status },
      },
      select: {
        cart_id: true,
        cart_create_date: true,
        cart_status: true,
        cart_order_number: true,
        cart_username: true,
        cart_customer_tel: true,
        cart_customer_name: true,
        cart_location_send: true,
        cart_delivery_date: true,
        cart_export_time: true,
        cart_receive_time: true,
        cart_shipping_cost: true,
        // Exclude cart_invoice_tex, cart_lunchbox and cart_total_cost_lunchbox to avoid type errors
      },
    });

    if (cartsBasic.length === 0) {
      return NextResponse.json({ message: "No carts found" }, { status: 404 });
    }

    const cartIds = cartsBasic.map((c) => c.cart_id);
    let costMap = new Map<string, string>();
    let lunchboxMap = new Map<string, any[]>();
    let invoiceTexMap = new Map<string, string>();

    // Fetch cart_invoice_tex, cart_lunchbox and cart_total_cost_lunchbox separately using aggregateRaw
    if (cartIds.length > 0) {
      try {
        const rawResults = await (prisma.cart as any).aggregateRaw({
          pipeline: [
            { $match: { cart_id: { $in: cartIds }, cart_status: { $in: status } } },
            {
              $project: {
                cart_id: 1,
                cart_lunchbox: 1,
                cart_total_cost_lunchbox: { $ifNull: ["$cart_total_cost_lunchbox", ""] },
                cart_invoice_tex: { $ifNull: ["$cart_invoice_tex", ""] },
              },
            },
          ],
        }) as unknown as Array<{ cart_id: string; cart_lunchbox: any; cart_total_cost_lunchbox: string; cart_invoice_tex: string }>;

        if (Array.isArray(rawResults)) {
          rawResults.forEach((item: any) => {
            const cartId = item.cart_id;
            const cost = item.cart_total_cost_lunchbox !== null && item.cart_total_cost_lunchbox !== undefined ? item.cart_total_cost_lunchbox : "";
            costMap.set(cartId, cost);

            // Handle cart_invoice_tex - convert null to empty string
            const invoiceTex = item.cart_invoice_tex !== null && item.cart_invoice_tex !== undefined ? item.cart_invoice_tex : "";
            invoiceTexMap.set(cartId, invoiceTex);

            // Handle cart_lunchbox - convert string "[]" to empty array, or parse JSON string to array
            let lunchbox: any[] = [];
            if (item.cart_lunchbox !== null && item.cart_lunchbox !== undefined) {
              if (typeof item.cart_lunchbox === "string") {
                // If it's a string, try to parse it
                if (item.cart_lunchbox === "[]" || item.cart_lunchbox.trim() === "[]") {
                  lunchbox = [];
                } else {
                  try {
                    lunchbox = JSON.parse(item.cart_lunchbox);
                    if (!Array.isArray(lunchbox)) {
                      lunchbox = [];
        }
                  } catch (e) {
                    console.warn(`Failed to parse cart_lunchbox for cart ${cartId}:`, e);
                    lunchbox = [];
                  }
                }
              } else if (Array.isArray(item.cart_lunchbox)) {
                lunchbox = item.cart_lunchbox;
              }
            }
            lunchboxMap.set(cartId, lunchbox);
          });
        }
      } catch (rawError) {
        console.warn("Error fetching cart_invoice_tex, cart_lunchbox and cart_total_cost_lunchbox, using defaults:", rawError);
        // If we can't fetch, use empty defaults
        cartIds.forEach((id) => {
          costMap.set(id, "");
          lunchboxMap.set(id, []);
          invoiceTexMap.set(id, "");
        });
      }
    }

    // Merge cart_invoice_tex, cart_lunchbox and cart_total_cost_lunchbox back into results
    const result = cartsBasic.map((cart) => ({
      ...cart,
      cart_invoice_tex: invoiceTexMap.get(cart.cart_id) || "",
      cart_lunchbox: lunchboxMap.get(cart.cart_id) || [],
      cart_total_cost_lunchbox: costMap.get(cart.cart_id) || "",
    }));

    const serializedResult = convertBigIntToNumber(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
