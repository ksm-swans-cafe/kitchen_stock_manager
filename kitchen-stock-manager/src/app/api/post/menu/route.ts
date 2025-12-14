import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

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
    const newMenuId = lastMenu ? lastMenu.menu_id + 1 : 1;

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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ error: `Failed to create menu` }, { status: 500 });
  }
}
