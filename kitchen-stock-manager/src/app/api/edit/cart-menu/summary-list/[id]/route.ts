import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function convertBigIntToNumber(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? Number(value) : value)));
}

interface MenuItem {
  menu_name: string;
  menu_total: number;
  menu_ingredients: {
    useItem: number;
    ingredient_name: string;
    ingredient_status: boolean;
  }[];
  menu_description: string;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
  }

  const { menuItems } = body;
  console.log("Received menuItems:", JSON.stringify(menuItems, null, 2));

  if (!id || !Array.isArray(menuItems) || menuItems.some((m: MenuItem) => !m.menu_name || m.menu_total < 0 || !Array.isArray(m.menu_ingredients) || m.menu_ingredients.some((ing) => !ing.ingredient_name || ing.useItem < 0) || m.menu_description === undefined || m.menu_description === null)) {
    return NextResponse.json({ error: "กรุณาระบุ menuItems ที่ถูกต้อง" }, { status: 400 });
  }

  try {
    // Fetch cart without cart_total_cost_lunchbox to avoid null error
    const cart = await prisma.cart.findFirst({
      where: { cart_id: id },
      select: {
        id: true,
        cart_id: true,
        cart_lunchbox: true,
        // Exclude cart_total_cost_lunchbox to avoid null error
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    // Fetch cart_total_cost_lunchbox separately using aggregateRaw
    let cartTotalCostLunchbox = "0";
    try {
      const costResult = await (prisma.cart as any).aggregateRaw({
        pipeline: [
          { $match: { cart_id: id } },
          {
            $project: {
              cart_total_cost_lunchbox: { $ifNull: ["$cart_total_cost_lunchbox", "0"] },
            },
          },
        ],
      }) as unknown as Array<{ cart_total_cost_lunchbox: string }>;

      if (Array.isArray(costResult) && costResult.length > 0) {
        cartTotalCostLunchbox = costResult[0].cart_total_cost_lunchbox || "0";
      }
    } catch (costError) {
      console.warn("Error fetching cart_total_cost_lunchbox, using default '0':", costError);
      cartTotalCostLunchbox = "0";
    }

    // Parse cart_lunchbox and extract menu items
    let lunchboxes: any[] = [];
    if (typeof cart.cart_lunchbox === "string") {
      try {
        lunchboxes = JSON.parse(cart.cart_lunchbox);
      } catch (e) {
        console.error("JSON parse error:", (e as Error).message);
        return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
      }
    } else if (Array.isArray(cart.cart_lunchbox)) {
      lunchboxes = cart.cart_lunchbox;
    } else {
      lunchboxes = [];
    }

    // Extract existing menu items from cart_lunchbox structure
    let existingMenuItems: MenuItem[] = [];
    lunchboxes.forEach((lunchbox: any) => {
      if (lunchbox.lunchbox_menu && Array.isArray(lunchbox.lunchbox_menu)) {
        lunchbox.lunchbox_menu.forEach((menu: any) => {
          existingMenuItems.push({
            menu_name: menu.menu_name || "",
            menu_total: menu.menu_total || 0,
            menu_ingredients: (menu.menu_ingredients || []).map((ing: any) => ({
              useItem: ing.useItem || 0,
              ingredient_name: ing.ingredient_name || "",
              ingredient_status: ing.ingredient_status ?? false,
            })),
            menu_description: menu.menu_description || "",
          });
        });
      }
    });

    const invalidMenus = await Promise.all(
      menuItems.map(async (item: MenuItem) => {
        const [menuCheck] = await prisma.menu.findMany({
          where: { menu_name: item.menu_name },
          select: { menu_name: true },
        });
        return !menuCheck ? item.menu_name : null;
      })
    ).then((results) => results.filter((m) => m));

    if (invalidMenus.length > 0) {
      return NextResponse.json({ error: `เมนูต่อไปนี้ไม่มีอยู่ในระบบ: ${invalidMenus.join(", ")}` }, { status: 400 });
    }

    // Update menu items in cart_lunchbox structure
    const updatedLunchboxes = lunchboxes.map((lunchbox: any) => {
      const updatedLunchboxMenu = (lunchbox.lunchbox_menu || []).map((menu: any) => {
        // Find the updated menu item from the request
        const updatedMenu = menuItems.find((m: MenuItem) => m.menu_name === menu.menu_name);
        if (updatedMenu) {
          // Find existing menu to preserve ingredient_status
          const existingMenu = existingMenuItems.find((m) => m.menu_name === menu.menu_name);
          const menuIngredients = updatedMenu.menu_ingredients.map((ing) => ({
            ingredient_name: ing.ingredient_name,
            useItem: ing.useItem,
            ingredient_status: existingMenu?.menu_ingredients.find((ei) => ei.ingredient_name === ing.ingredient_name)?.ingredient_status ?? ing.ingredient_status ?? false,
          }));

          // Handle menu_description - must be array of objects, not string
          let menuDescription: any[] = [];
          if (menu.menu_description && Array.isArray(menu.menu_description)) {
            // If existing menu has description as array, use it
            menuDescription = menu.menu_description;
          } else if (updatedMenu.menu_description && Array.isArray(updatedMenu.menu_description)) {
            // If updated menu has description as array, use it
            menuDescription = updatedMenu.menu_description;
          } else {
            // Default to empty array if no description or not in correct format
            menuDescription = [];
          }

          return {
            ...menu,
            menu_total: updatedMenu.menu_total,
            menu_ingredients: menuIngredients,
            menu_description: menuDescription,
          };
        }
        return menu;
      });

      return {
        ...lunchbox,
        lunchbox_menu: updatedLunchboxMenu,
      };
    });

    // Convert BigInt to Number before stringify
    const serializedLunchboxes = convertBigIntToNumber(updatedLunchboxes);
    console.log("Updated lunchboxes to save:", JSON.stringify(serializedLunchboxes, null, 2));

    const result = await prisma.cart.updateMany({
      where: { cart_id: id },
      data: {
        cart_lunchbox: serializedLunchboxes as any,
        cart_total_cost_lunchbox: cartTotalCostLunchbox, // Use value from aggregateRaw
        cart_last_update: new Date().toISOString(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุหรือไม่สามารถอัปเดตได้" }, { status: 404 });
    }

    // Convert result to ensure no BigInt values
    const serializedResult = convertBigIntToNumber({
      success: true,
      updated: result.count,
    });

    return NextResponse.json(serializedResult);
  } catch (error: unknown) {
    console.error("Server error:", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      cartId: id,
    });
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล" }, { status: 500 });
  }
}
