import { NextRequest, NextResponse } from "next/server";
import sql from "@/app/database/connect";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  console.log(params);

  const formData = await request.formData();
  const menuName = formData.get("menu_name")?.toString() || "";
  const menuIngredientsRaw = formData.get("menu_ingredients")?.toString() || "";
  const menuSubname = formData.get("menu_subname")?.toString() || "";
  const newMenuName = formData.get("newMenuName")?.toString() || "";

  if (!id || !menuName || !menuIngredientsRaw || !menuSubname) {
    return NextResponse.json(
      {
        error:
          "กรุณาระบุ id, menuName, menuIngredients และ menuSubname ให้ครบถ้วน",
      },
      { status: 400 }
    );
  }

  let menuIngredients;
  try {
    menuIngredients = JSON.parse(menuIngredientsRaw);
  } catch {
    return NextResponse.json(
      { error: "รูปแบบวัตถุดิบไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    // ตรวจสอบว่ามีเมนูนั้นจริงหรือไม่
    const existing = await sql`
        SELECT * FROM menu WHERE menu_id = ${id};
      `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบเมนูที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    // เตรียมข้อมูลอัปเดต
    const updatedName = newMenuName?.trim() || menuName.trim();
    const updatedSubname = menuSubname.trim();

    // อัปเดตข้อมูลในตาราง menu
    const result = await sql`
        UPDATE menu
        SET 
          menu_name = ${updatedName},
          menu_subname = ${updatedSubname},
          menu_ingredients = ${JSON.stringify(menuIngredients)}
        WHERE menu_id = ${id}
        RETURNING *;
      `;

    return NextResponse.json({
      success: true,
      updatedMenu: result[0],
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตเมนู" },
      { status: 500 }
    );
  }
}
