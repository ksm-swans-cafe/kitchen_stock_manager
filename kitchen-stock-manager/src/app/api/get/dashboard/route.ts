import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertBigIntToString);

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }

  return obj;
}

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear() + 543;
    const todayString = `${day}/${month}/${year}`;
    
    const convertToComparableDate = (dateStr: string): string => {
      const [d, m, y] = dateStr.split("/");
      return `${y}/${m}/${d}`;
    };
    
    const todayComparable = convertToComparableDate(todayString);

    const result = await (prisma.cart as any).aggregateRaw({
      pipeline: [
        {
          $addFields: {
            comparable_date: {
              $concat: [
                { $substr: ["$cart_delivery_date", 6, 4] }, // year
                "/",
                { $substr: ["$cart_delivery_date", 3, 2] }, // month
                "/",
                { $substr: ["$cart_delivery_date", 0, 2] }, // day
              ],
            },
          },
        },
        {
          $match: {
            comparable_date: {
              $gte: todayComparable,
            },
          },
        },
        {
          $sort: {
            comparable_date: 1,
            cart_export_time: 1,
          },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            cart_id: 1,
            cart_location_send: 1,
            cart_delivery_date: 1,
            cart_export_time: 1,
            cart_lunchbox: 1,
          },
        },
      ],
    });

    if (result.length === 0) {
      return NextResponse.json({ 
        status: "success",
        total: 0,
        result: [] 
      }, { status: 404 });
    }
    
    const convertedResult = convertBigIntToString(result);
    return NextResponse.json({
      status: "success",
      total: convertedResult.length,
      result: convertedResult
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
