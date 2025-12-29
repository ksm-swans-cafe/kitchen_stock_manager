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
    // Fetch carts without cart_total_cost_lunchbox to avoid null error
    const cartsWithoutCost = await prisma.cart.findMany({
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
        cart_lunchbox: true,
        // Explicitly exclude cart_total_cost_lunchbox
      },
    });

    if (cartsWithoutCost.length === 0) {
      return NextResponse.json({ message: "No carts found" }, { status: 404 });
    }

    // Fetch cart_total_cost_lunchbox separately using aggregateRaw with null handling
    const cartIds = cartsWithoutCost.map((c) => c.cart_id);
    let costMap = new Map<string, string>();

    if (cartIds.length > 0) {
      try {
        const costResults = await (prisma.cart as any).aggregateRaw({
          pipeline: [
            { $match: { cart_id: { $in: cartIds }, cart_status: { $in: status } } },
            {
              $project: {
                cart_id: 1,
                cart_total_cost_lunchbox: { $ifNull: ["$cart_total_cost_lunchbox", ""] },
              },
            },
          ],
        }) as unknown as Array<{ cart_id: string; cart_total_cost_lunchbox: string }>;

        if (Array.isArray(costResults)) {
          costResults.forEach((item: any) => {
            const cartId = item.cart_id;
            const cost = item.cart_total_cost_lunchbox !== null && item.cart_total_cost_lunchbox !== undefined ? item.cart_total_cost_lunchbox : "";
            costMap.set(cartId, cost);
          });
        }
      } catch (costError) {
        console.warn("Error fetching cart_total_cost_lunchbox, using default empty string:", costError);
        // If we can't fetch costs, use empty string as default
        cartIds.forEach((id) => costMap.set(id, ""));
      }
    }

    // Merge cart_total_cost_lunchbox back into results
    const result = cartsWithoutCost.map((cart) => ({
      ...cart,
      cart_total_cost_lunchbox: costMap.get(cart.cart_id) || "",
    }));

    const serializedResult = convertBigIntToNumber(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
