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
    const result = await prisma.cart.findMany({
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
      },
    });

    if (result.length === 0) {
      return NextResponse.json({ message: "No carts found" }, { status: 404 });
    }

    const serializedResult = convertBigIntToNumber(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
