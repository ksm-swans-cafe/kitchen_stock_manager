import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) return obj;

  // Handle circular references
  if (typeof obj === "object" && visited.has(obj)) return null;

  if (typeof obj === "bigint") return Number(obj);

  // Handle MongoDB ObjectId - convert to string immediately
  if (obj && typeof obj === "object" && obj.constructor && obj.constructor.name === "ObjectId") {
    return obj.toString();
  }

  // Convert Date objects
  if (obj instanceof Date) return obj.toISOString();

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
          if (value && typeof value === "object" && value.constructor && value.constructor.name === "ObjectId") {
            converted[key] = value.toString();
          } else {
            converted[key] = convertBigIntToNumber(value, visited);
          }
        } catch (e) {
          console.warn(`Skipping key ${key} due to error:`, e);
        }
      }
    }
    visited.delete(obj);
    return converted;
  }

  return obj;
}

export async function POST(req: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const formData = await req.formData();
    const menu_name = formData.get("menu_name")?.toString().trim();
    const menu_ingredients = formData.get("menu_ingredients")?.toString().trim();
    const menu_subname = formData.get("menu_subname")?.toString().trim();
    const menu_category = formData.get("menu_category")?.toString().trim();
    const menu_cost = formData.get("menu_cost")?.toString().trim();
    const menu_lunchbox = formData.get("menu_lunchbox")?.toString().trim();

    if (!menu_name || !menu_ingredients || !menu_subname || !menu_category || !menu_cost) {
      return NextResponse.json(
        {
          error: "กรุณาระบุข้อมูลให้ครบถ้วน (menu_name, menu_ingredients, menu_subname, menu_category, menu_cost)",
        },
        { status: 400 }
      );
    }

    let parsedIngredients;
    let parsedLunchbox = [];

    try {
      parsedIngredients = JSON.parse(menu_ingredients);
    } catch (error) {
      return NextResponse.json({ error: "รูปแบบวัตถุดิบไม่ถูกต้อง" }, { status: 400 });
    }

    try {
      if (menu_lunchbox) parsedLunchbox = JSON.parse(menu_lunchbox);
    } catch (error) {
      return NextResponse.json({ error: "รูปแบบข้อมูลกล่องอาหารไม่ถูกต้อง" }, { status: 400 });
    }

    // ใช้ select เพื่อเลือกเฉพาะ menu_id เพื่อหลีกเลี่ยงปัญหา menu_cost เป็น null
    const lastMenu = await prisma.menu.findFirst({
      orderBy: { menu_id: "desc" },
      select: {
        menu_id: true,
      },
    });

    const lastMenuIdRaw: unknown = lastMenu?.menu_id ?? null;
    let lastMenuId = 0;
    if (typeof lastMenuIdRaw === "number") lastMenuId = lastMenuIdRaw;
    else if (typeof lastMenuIdRaw === "bigint") lastMenuId = Number(lastMenuIdRaw);
    else if (typeof lastMenuIdRaw === "string") {
      const n = Number(lastMenuIdRaw);
      if (!Number.isNaN(n)) lastMenuId = n;
    }

    const newMenuId = lastMenuId + 1;

    const result = await prisma.menu.create({
      data: {
        menu_id: newMenuId,
        menu_name,
        menu_subname,
        menu_category,
        menu_cost: parseInt(menu_cost) || 0,
        menu_ingredients: parsedIngredients,
        menu_lunchbox: parsedLunchbox,
        menu_image: "",
      },
    });

    const convertedResult = convertBigIntToNumber(result);
    return NextResponse.json(convertedResult, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ error: `Failed to create menu` }, { status: 500 });
  }
}
