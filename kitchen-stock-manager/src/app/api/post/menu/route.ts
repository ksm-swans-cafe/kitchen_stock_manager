import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect";

export async function POST(
  req: NextRequest,
) {
 
  try {
    const formData = await req.formData();
    const menu_name = formData.get("menu_name")?.toString().trim();
    const menu_ingredients = formData.get("menu_ingredients")?.toString().trim();
    const menu_subname = formData.get("menu_subname")?.toString().trim();

    if (!menu_name || !menu_ingredients) {
      return NextResponse.json(
        { error: "Ingredients and price are required." },
        { status: 400 }
      );
    }

    console.log("Creating menu with name:", menu_name);
    console.log("Menu ingredients:", menu_ingredients);
    console.log("Creating menu with subname:", menu_subname);

    const result = await sql`
      INSERT INTO menu (menu_name, menu_ingredients, menu_subname)
      VALUES (${menu_name}, ${menu_ingredients}, ${menu_subname})
      RETURNING *;
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu." },
      { status: 500 }
    );
  }
}