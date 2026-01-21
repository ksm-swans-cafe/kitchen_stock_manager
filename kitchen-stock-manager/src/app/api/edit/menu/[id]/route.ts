import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const params = await context.params;
  const { id } = params;

  const formData = await request.formData();
  const menuName = formData.get("menu_name")?.toString() || "";
  const menuIngredientsRaw = formData.get("menu_ingredients")?.toString() || "";
  const menuSubname = formData.get("menu_subname")?.toString() || "";
  const menuCategory = formData.get("menu_category")?.toString() || "";
  const menuCost = formData.get("menu_cost")?.toString() || "";
  const menuLunchboxRaw = formData.get("menu_lunchbox")?.toString() || "";

  console.log("Received data:", { id, menuName, menuIngredientsRaw, menuSubname, menuCategory, menuCost, menuLunchboxRaw });

  if (!id) return NextResponse.json({ error: "กรุณาระบุ id" }, { status: 400 });

  if (!menuName || !menuIngredientsRaw || !menuSubname || !menuCategory || !menuCost) {
    return NextResponse.json(
      {
        error: "กรุณาระบุข้อมูลให้ครบถ้วน",
      },
      { status: 400 }
    );
  }

  let menuIngredients;
  let menuLunchbox = [];

  try {
    menuIngredients = JSON.parse(menuIngredientsRaw);
  } catch {
    return NextResponse.json({ error: "รูปแบบวัตถุดิบไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    if (menuLunchboxRaw) {
      menuLunchbox = JSON.parse(menuLunchboxRaw);
    }
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลกล่องอาหารไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    // ใช้ menu_id เพื่อหา record ก่อน (select เฉพาะ id เพื่อหลีกเลี่ยงปัญหา menu_cost เป็น null)
    const existing = await prisma.menu.findFirst({
      where: { menu_id: { equals: Number(id) } },
      select: {
        id: true,
        menu_id: true,
      },
    });

    if (!existing) return NextResponse.json({ error: "ไม่พบเมนูที่ต้องการแก้ไข" }, { status: 404 });

    // ใช้ id (ObjectId) เพื่อ update
    const result = await prisma.menu.update({
      where: { id: existing.id },
      data: {
        menu_name: menuName.trim(),
        menu_subname: menuSubname.trim(),
        menu_category: menuCategory.trim(),
        menu_cost: parseInt(menuCost) || 0,
        menu_ingredients: menuIngredients,
        menu_lunchbox: menuLunchbox,
      },
    });

    const convertedResult = convertBigIntToNumber(result);

    return NextResponse.json({
      success: true,
      updatedMenu: convertedResult,
    });
  } catch (error) {
    console.error("Server error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดในการอัปเดตเมนู",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
