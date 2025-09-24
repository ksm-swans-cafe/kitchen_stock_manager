import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
  const menuDescription = formData.get("menu_description")?.toString() || "";
  const newMenuName = formData.get("newMenuName")?.toString() || "";

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่ (อนุญาตให้อัปเดตเฉพาะ description ได้)
  if (!id) {
    return NextResponse.json(
      {
        error: "กรุณาระบุ id",
      },
      { status: 400 }
    );
  }

  // ถ้ามีเฉพาะ description ให้อัปเดตเฉพาะ description (description อาจเป็นค่าว่างได้)
  if (menuDescription !== undefined && !menuName && !menuIngredientsRaw && !menuSubname) {
    try {
      const existing = await prisma.menu.findUnique({
        where: { menu_id: Number(id) },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "ไม่พบเมนูที่ต้องการแก้ไข" },
          { status: 404 }
        );
      }

      const result = await prisma.menu.update({
        where: { menu_id: Number(id) },
        data: {
          menu_description: menuDescription.trim() || null,
        },
      });

      return NextResponse.json({
        success: true,
        updatedMenu: result,
      });
    } catch (error) {
      console.error("Server error:", error);
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการอัปเดตคำอธิบายเมนู" },
        { status: 500 }
      );
    }
  }

  // ตรวจสอบข้อมูลที่จำเป็นสำหรับการอัปเดตแบบเต็ม
  if (!menuName || !menuIngredientsRaw || !menuSubname) {
    return NextResponse.json(
      {
        error:
          "กรุณาระบุ menuName, menuIngredients และ menuSubname ให้ครบถ้วน",
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
    const existing = await prisma.menu.findUnique({
      where: { menu_id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ไม่พบเมนูที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    // เตรียมข้อมูลอัปเดต
    const updatedName = newMenuName?.trim() || menuName.trim();
    const updatedSubname = menuSubname.trim();
    const updatedDescription = menuDescription.trim();

    // อัปเดตข้อมูลในตาราง menu
    // const result = await sql`
    //     UPDATE menu
    //     SET 
    //       menu_name = ${updatedName},
    //       menu_subname = ${updatedSubname},
    //       menu_ingredients = ${JSON.stringify(menuIngredients)},
    //       menu_description = ${updatedDescription}
    //     WHERE menu_id = ${id}
    //     RETURNING *;
    //   `;
    const result = await prisma.menu.update({
      where: { menu_id: Number(id) },
      data: {
        menu_name: updatedName,
        menu_subname: updatedSubname,
        menu_ingredients: JSON.stringify(menuIngredients),
        menu_description: updatedDescription,
      },
    });

    return NextResponse.json({
      success: true,
      updatedMenu: result,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตเมนู" },
      { status: 500 }
    );
  }
}
