import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface MenuDescription {
  menu_description_id: string | null;
  menu_description_title: string;
  menu_description_value: string;
}

interface RequestBody {
  lunchbox_name: string;
  menu_name: string;
  menu_description: MenuDescription[];
}

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body: RequestBody = await request.json();
    const { lunchbox_name, menu_name, menu_description } = body;

    if (!id) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    if (!lunchbox_name || !menu_name) {
      return NextResponse.json({ error: "lunchbox_name and menu_name are required" }, { status: 400 });
    }

    const existingCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Validate menu_description format
    if (!Array.isArray(menu_description)) {
      return NextResponse.json({ error: "menu_description must be an array" }, { status: 400 });
    }

    // Format the menu_descriptio
    const formattedDescription = menu_description.map((desc) => ({
      menu_description_id: desc.menu_description_id || null,
      menu_description_title: desc.menu_description_title || "",
      menu_description_value: desc.menu_description_value || "",
    }));

    // Get existing lunchbox and update the specific menu description
    const cartLunchbox = (existingCart as any).lunchbox || [];
    
    const updatedLunchbox = cartLunchbox.map((lunchbox: any) => {
      if (lunchbox.lunchbox_name === lunchbox_name) {
        const updatedMenu = (lunchbox.lunchbox_menu || []).map((menu: any) => {
          if (menu.menu_name === menu_name) {
            return {
              ...menu,
              menu_description: formattedDescription,
            };
          }
          return menu;
        });
        return {
          ...lunchbox,
          lunchbox_menu: updatedMenu,
        };
      }
      return lunchbox;
    });

    // Update the cart
    const result = await prisma.new_cart.update({
      where: { id: (existingCart as { id: string }).id },
      data: {
        lunchbox: updatedLunchbox,
        last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
    );

    return NextResponse.json(
      { message: "Menu description updated successfully", cart: serializedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating menu description:", error);
    return NextResponse.json({ error: "Failed to update menu description" }, { status: 500 });
  }
}
