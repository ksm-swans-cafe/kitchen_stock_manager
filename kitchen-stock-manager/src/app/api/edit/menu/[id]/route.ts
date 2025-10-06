import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  if (!id) {
    return NextResponse.json({ error: "กรุณาระบุ id" }, { status: 400 });
  }

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
    // ใช้ menu_id เพื่อหา record ก่อน
    const existing = await prisma.menu.findFirst({
      where: { menu_id: Number(id) },
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

    return NextResponse.json({
      success: true,
      updatedMenu: result,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตเมนู" }, { status: 500 });
  }
}
