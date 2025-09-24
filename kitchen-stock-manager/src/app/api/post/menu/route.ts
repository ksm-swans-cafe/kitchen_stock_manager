import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import sql from "@app/database/connect";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const menu_name = formData.get("menu_name")?.toString().trim();
    const menu_ingredients = formData
      .get("menu_ingredients")
      ?.toString()
      .trim();
    const menu_subname = formData.get("menu_subname")?.toString().trim();
    const menu_description = formData.get("menu_description")?.toString().trim();

    if (!menu_name || !menu_ingredients) {
      return NextResponse.json(
        { error: "Ingredients and price are required." },
        { status: 400 }
      );
    }

    // Validate JSON for menu_ingredients
    try {
      JSON.parse(menu_ingredients);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON format for menu_ingredients." },
        { status: 400 }
      );
    }

    console.log("Creating menu with name:", menu_name);
    console.log("Menu ingredients:", menu_ingredients);
    console.log("Creating menu with subname:", menu_subname);
    console.log("Creating menu with description:", menu_description);

    const result = await prisma.menu.create({
      data: {
        menu_name,
        menu_ingredients: JSON.parse(menu_ingredients),
        menu_subname,
        menu_description,
      },
    });

    if (result === null) {
      return NextResponse.json(
        { error: "Menu ID already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: `Failed to create menu` },
      { status: 500 }
    );
  }
}
