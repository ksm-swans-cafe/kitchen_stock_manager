import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
import { send } from "process";

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
    
    // Function to get Thai day of week
    const getDayOfWeekThai = (day: number): string => {
      const daysThai = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
      return daysThai[day];
    };
    
    // Function to get day of week from DD/MM/YYYY (Buddhist calendar)
    const getDayFromDateString = (dateStr: string): string => {
      const [d, m, y] = dateStr.split("/").map(Number);
      // Convert Buddhist year to Gregorian
      const gregorianYear = y - 543;
      const date = new Date(gregorianYear, m - 1, d);
      return getDayOfWeekThai(date.getDay());
    };

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
          $project: {
            cart_id: 1,
            cart_location_send: 1,
            cart_delivery_date: 1,
            cart_export_time: 1,
            cart_receive_time: 1,
            cart_lunchbox: 1,
            cart_description: 1,
            cart_pinned: 1,
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
    
    const resultWithDayOfWeek = convertedResult.map((item: any) => ({
      id: item.cart_id,
      date: item.cart_delivery_date,
      dayOfWeek: getDayFromDateString(item.cart_delivery_date),
      location: item.cart_location_send,
      sendTime: item.cart_export_time,
      receiveTime: item.cart_receive_time,
      items: item.cart_lunchbox.map((lunchbox: any) => ({
        lunchbox_name: lunchbox.lunchbox_name,
        set: lunchbox.lunchbox_set_name,
        quantity: lunchbox.lunchbox_total,
        lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => ({
          menu_name: menu.menu_name,
          menu_quantity: menu.menu_total,
        })),
      })),
      cart_description: item.cart_description || [],
      cart_pinned: item.cart_pinned || false,
    }));
    
    return NextResponse.json({
      status: "success",
      total: resultWithDayOfWeek.length,
      result: resultWithDayOfWeek
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
