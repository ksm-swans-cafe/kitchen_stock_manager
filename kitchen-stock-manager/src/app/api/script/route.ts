import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

function convertBigIntToNumber(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? Number(value) : value)));
}

export async function POST(request: NextRequest) {
  try {
    const search = {
      menu_lunchbox: {
        lunchbox_name: "Lunch Box",
        lunchbox_set_name: "G",
        lunchbox_menu_category: "กับข้าวที่ 1",
      },
    };

    // วัตถุดิบที่ต้องการเพิ่ม
    const newIngredients = [
      {
        ingredient_name: "ข้าวสาร",
        useItem: 1,
      },
      {
        ingredient_name: "ข้าวหอมมะลิ",
        useItem: 1,
      },
      {
        ingredient_name: "น้ำกรอง",
        useItem: 1,
      },
    ];

    // ใช้ findRaw เพื่อค้นหาเมนูที่มี menu_lunchbox ตรงกับเงื่อนไข
    const menus = await prisma.menu.findRaw({
      filter: {
        menu_lunchbox: {
          $elemMatch: {
            lunchbox_name: search.menu_lunchbox.lunchbox_name,
            lunchbox_set_name: search.menu_lunchbox.lunchbox_set_name,
            lunchbox_menu_category: search.menu_lunchbox.lunchbox_menu_category,
          },
        },
      },
    });

    const foundMenus = menus as unknown as any[];

    if (foundMenus.length === 0) {
      return NextResponse.json(
        {
          message: "No menus found matching the criteria",
          search_criteria: search,
          total: 0,
        },
        { status: 404 }
      );
    }

    // อัปเดตแต่ละเมนูโดยเพิ่มวัตถุดิบใหม่
    const updateResults = [];

    for (const menu of foundMenus) {
      try {
        // ดึงวัตถุดิบเดิมที่มีอยู่
        const existingIngredients = menu.menu_ingredients || [];

        // รวมวัตถุดิบเดิมกับวัตถุดิบใหม่ (หลีกเลี่ยงการซ้ำ)
        const existingIngredientNames = existingIngredients.map((ing: any) => ing.ingredient_name);
        const ingredientsToAdd = newIngredients.filter((newIng) => !existingIngredientNames.includes(newIng.ingredient_name));

        const updatedIngredients = [...existingIngredients, ...ingredientsToAdd];

        // อัปเดตเมนูในฐานข้อมูล
        const updateResult = await prisma.menu.updateMany({
          where: { menu_id: menu.menu_id },
          data: {
            menu_ingredients: updatedIngredients,
          },
        });

        updateResults.push({
          menu_id: menu.menu_id,
          menu_name: menu.menu_name,
          updated: updateResult.count > 0,
          ingredients_added: ingredientsToAdd.length,
          new_ingredients: ingredientsToAdd.map((ing) => ing.ingredient_name),
        });
      } catch (updateError) {
        console.error(`Error updating menu ${menu.menu_id}:`, updateError);
        updateResults.push({
          menu_id: menu.menu_id,
          menu_name: menu.menu_name,
          updated: false,
          error: updateError instanceof Error ? updateError.message : "Unknown error",
        });
      }
    }

    // แปลงข้อมูลและดึงเฉพาะข้อมูลที่ต้องการสำหรับการแสดงผล
    const result = foundMenus.map((menu: any) => {
      const matchingLunchbox = menu.menu_lunchbox?.find((lb: any) => lb.lunchbox_name === search.menu_lunchbox.lunchbox_name && lb.lunchbox_set_name === search.menu_lunchbox.lunchbox_set_name && lb.lunchbox_menu_category === search.menu_lunchbox.lunchbox_menu_category);

      return {
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        menu_subname: menu.menu_subname,
        menu_category: menu.menu_category,
        menu_cost: menu.menu_cost ?? 0,
        lunchbox_cost: matchingLunchbox?.lunchbox_cost ?? menu.menu_cost ?? 0,
        menu_ingredients: menu.menu_ingredients || [],
        lunchbox_menu_category: matchingLunchbox?.lunchbox_menu_category || null,
        lunchbox_showPrice: matchingLunchbox?.lunchbox_showPrice ?? true,
        lunchbox_AutoRice: matchingLunchbox?.lunchbox_AutoRice ?? false,
        lunchbox_menuid: matchingLunchbox?.lunchbox_menuid || "",
      };
    });

    const finalResult = convertBigIntToNumber(result);

    return NextResponse.json(
      {
        message: "Menus found and ingredients updated successfully",
        search_criteria: search,
        ingredients_added: newIngredients,
        menus: finalResult,
        update_results: updateResults,
        total: finalResult.length,
        total_updated: updateResults.filter((r) => r.updated).length,
      },
      { status: 200 }
    );
  } catch (error: string | unknown) {
    console.error("Error searching and updating menus:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: "Failed to search and update menus",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
