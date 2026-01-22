import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

// ใช้ util เดียวกับ get menu list/page เพื่อให้แปลง BigInt/ObjectId/Date ได้ปลอดภัย
function convertBigIntToNumber(obj: any, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) return obj;

  // Handle circular references
  if (typeof obj === "object" && visited.has(obj)) {
    return null;
  }

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  // Handle MongoDB ObjectId - convert to string immediately
  if (obj && typeof obj === "object" && obj.constructor && obj.constructor.name === "ObjectId") {
    return obj.toString();
  }

  // Skip Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Skip other special objects
  if (obj instanceof RegExp || obj instanceof Map || obj instanceof Set) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    visited.add(obj);
    const result = obj.map((item) => convertBigIntToNumber(item, visited));
    visited.delete(obj);
    return result;
  }

  if (typeof obj === "object") {
    visited.add(obj);
    const converted: any = {};
    for (const key in obj) {
      // Skip internal MongoDB/Prisma keys
      if (key.startsWith("_") || key === "$__" || key === "isNew") continue;

      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          const value = obj[key];
          // Handle ObjectId in nested objects
          if (value && typeof value === "object" && value.constructor && value.constructor.name === "ObjectId") {
            converted[key] = value.toString();
          } else {
            converted[key] = convertBigIntToNumber(value, visited);
          }
        } catch (e) {
          // Skip problematic keys
          console.warn(`Skipping key ${key} due to error:`, e);
        }
      }
    }
    visited.delete(obj);
    return converted;
  }

  return obj;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const id = params.id;
  const menuId = Number(id);

  if (Number.isNaN(menuId)) {
    return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  }

  try {
    // ดึงข้อมูลเมนูโดยไม่โหลด menu_cost เพื่อเลี่ยงปัญหา null กับ Prisma Json non-nullable
    const menuWithoutCost = await prisma.menu.findFirst({
      where: { menu_id: { equals: menuId } },
      select: {
        id: true,
        menu_id: true,
        menu_name: true,
        menu_subname: true,
        menu_category: true,
        menu_image: true,
        menu_ingredients: true,
        menu_lunchbox: true,
        // อย่าดึง menu_cost ที่นี่
      },
    });

    if (!menuWithoutCost) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    // ดึง menu_cost แยกด้วย aggregateRaw และจัดการ null เป็น 0
    let menuCost: any = 0;
    try {
      const costResults = (await prisma.menu.aggregateRaw({
        pipeline: [
          { $match: { menu_id: menuId } },
          { $project: { menu_id: 1, menu_cost: { $ifNull: ["$menu_cost", 0] } } },
        ],
      })) as unknown as Array<{ menu_id: number; menu_cost: any }>;

      if (Array.isArray(costResults) && costResults.length > 0) {
        const item = costResults[0];
        menuCost = item.menu_cost !== null && item.menu_cost !== undefined ? item.menu_cost : 0;
      }
    } catch (costError) {
      console.warn("Error fetching menu cost, using default value 0:", costError);
      menuCost = 0;
    }

    const result = {
      ...menuWithoutCost,
      menu_cost: menuCost,
    };

    const convertedResult = convertBigIntToNumber(result);

    // ทดสอบ JSON serialization ก่อนส่ง
    try {
      JSON.stringify(convertedResult);
    } catch (jsonError) {
      console.error("JSON serialization error:", jsonError);
      throw new Error(
        `JSON serialization failed: ${
          jsonError instanceof Error ? jsonError.message : String(jsonError)
        }`
      );
    }

    return NextResponse.json(convertedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      {
        error: "Failed to fetch menu item",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
