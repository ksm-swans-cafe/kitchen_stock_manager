import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const menu_name = formData.get("menu_name")?.toString().trim();
    const menu_ingredients = formData.get("menu_ingredients")?.toString().trim();
    const menu_subname = formData.get("menu_subname")?.toString().trim();
    const menu_description = formData.get("menu_description")?.toString().trim();

    if (!menu_name || !menu_ingredients) {
      return NextResponse.json({ error: "Ingredients and price are required." }, { status: 400 });
    }

    try {
      JSON.parse(menu_ingredients);
    } catch (error: string | unknown) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
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

    if (result === null) return NextResponse.json({ error: "Menu ID already exists." }, { status: 409 });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ error: `Failed to create menu` }, { status: 500 });
  }
}
