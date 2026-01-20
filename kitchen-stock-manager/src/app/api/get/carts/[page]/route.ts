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

  if (page === "summarylist") status = ["pending", "completed"];
  else if (page === "orderhistory") status = ["success", "cancelled"];
  else return NextResponse.json({ message: "Invalid page type" }, { status: 400 });
  

  try {
    // Fetch carts without lunchbox and total_cost_lunchbox to avoid type mismatch errors
    const cartsBasic = await prisma.new_cart.findMany({
      orderBy: { create_date: "desc" },
      where: {
        status: { in: status },
      },
    });

    if (cartsBasic.length === 0) {
      return NextResponse.json({ message: "No carts found" }, { status: 404 });
    }

    const cartIds = cartsBasic.map((c) => c.id);
    let costMap = new Map<string, string>();
    let lunchboxMap = new Map<string, any[]>();
    let invoiceTexMap = new Map<string, string>();

    // Fetch invoice_tex, lunchbox and total_cost_lunchbox separately using aggregateRaw
    if (cartIds.length > 0) {
      try {
        // NOTE:
        // Prisma Mongo models map `id` -> Mongo `_id` field.
        // aggregateRaw operates on Mongo field names, so we must match on `_id` (ObjectId),
        // otherwise no documents match and `lunchbox` will always be empty.
        const objectIds = cartIds.map((id) => ({ $oid: id }));

        const rawResults = await (prisma.new_cart as any).aggregateRaw({
          pipeline: [
            { $match: { _id: { $in: objectIds }, status: { $in: status } } },
            {
              $project: {
                _id: 1,
                lunchbox: 1,
                total_cost_lunchbox: { $ifNull: ["$total_cost_lunchbox", ""] },
                invoice_tex: { $ifNull: ["$invoice_tex", ""] },
              },
            },
          ],
        }) as unknown as Array<{ _id: any; lunchbox: any; total_cost_lunchbox: string; invoice_tex: string }>;

        if (Array.isArray(rawResults)) {
          rawResults.forEach((item: any) => {
            const cartId: string =
              typeof item?._id === "string"
                ? item._id
                : typeof item?._id?.$oid === "string"
                  ? item._id.$oid
                  : "";

            if (!cartId) return;
            const cost = item.total_cost_lunchbox !== null && item.total_cost_lunchbox !== undefined ? item.total_cost_lunchbox : "";
            costMap.set(cartId, cost);

            // Handle invoice_tex - convert null to empty string
            const invoiceTex = item.invoice_tex !== null && item.invoice_tex !== undefined ? item.invoice_tex : "";
            invoiceTexMap.set(cartId, invoiceTex);

            // Handle lunchbox - convert string "[]" to empty array, or parse JSON string to array
            let lunchbox: any[] = [];
            if (item.lunchbox !== null && item.lunchbox !== undefined) {
              if (typeof item.lunchbox === "string") {
                // If it's a string, try to parse it
                if (item.lunchbox === "[]" || item.lunchbox.trim() === "[]") {
                  lunchbox = [];
                } else {
                  try {
                    lunchbox = JSON.parse(item.lunchbox);
                    if (!Array.isArray(lunchbox)) {
                      lunchbox = [];
        }
                  } catch (e) {
                    console.warn(`Failed to parse lunchbox for cart ${cartId}:`, e);
                    lunchbox = [];
                  }
                }
              } else if (Array.isArray(item.lunchbox)) {
                lunchbox = item.lunchbox;
              }
            }
            lunchboxMap.set(cartId, lunchbox);
          });
        }
      } catch (rawError) {
        console.warn("Error fetching invoice_tex, lunchbox and total_cost_lunchbox, using defaults:", rawError);
        // If we can't fetch, use empty defaults
        cartIds.forEach((id) => {
          costMap.set(id, "");
          lunchboxMap.set(id, []);
          invoiceTexMap.set(id, "");
        });
      }
    }

    // Merge invoice_tex, lunchbox and total_cost_lunchbox back into results
    const result = cartsBasic.map((cart) => ({
      ...cart,
      invoice_tex: invoiceTexMap.get(cart.id) || "",
      lunchbox: lunchboxMap.get(cart.id) || [],
      total_cost_lunchbox: costMap.get(cart.id) || "",
    }));

    const serializedResult = convertBigIntToNumber(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
