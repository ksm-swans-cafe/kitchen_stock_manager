import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface Ingredient {
  ingredient_name: string;
  useItem: number;
  ingredient_status: boolean;
  description: string;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;
  const params = await context.params;
  const { id } = params;
  const { isChecked } = await request.json();

  console.log("PATCH Request:", {
    id,
    isChecked,
  });
  if (!id || isChecked == null) {
    console.warn("Missing fields:", { id, isChecked });
    return NextResponse.json({ error: "กรุณาระบุ id และ isChecked" }, { status: 400 });
  }

  try {
    const cart = await prisma.new_cart.findFirst({
      where: { id: id },
      select: {
        id: true,
        id: true,
        lunchbox: true,
        total_cost_lunchbox: true,
      },
    });

    if (!cart) {
      console.error("Cart not found for id:", id);
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    // Parse lunchbox
    let lunchboxes: any[] = [];
    if (typeof cart.lunchbox === "string") {
      try {
        lunchboxes = JSON.parse(cart.lunchbox);
        console.log("Parsed lunchbox:", lunchboxes);
      } catch (e) {
        console.error("JSON parse error:", (e as Error).message);
        return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
      }
    } else if (Array.isArray(cart.lunchbox)) {
      lunchboxes = cart.lunchbox;
    } else {
      console.error("Invalid lunchbox format:", cart.lunchbox);
      return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
    }

    // Update all ingredients status in all menus
    const updatedLunchboxes = lunchboxes.map((lunchbox: any) => ({
      ...lunchbox,
      lunchbox_menu: lunchbox.lunchbox_menu.map((menu: any) => ({
        ...menu,
        menu_ingredients: menu.menu_ingredients.map((ing: any) => ({
          ...ing,
          ingredient_status: isChecked,
        })),
      })),
    }));

    const result = await prisma.new_cart.update({
      where: { id: cart.id }, // เปลี่ยนจาก id เป็น id
      data: {
        lunchbox: updatedLunchboxes as any,
        total_cost_lunchbox: cart.total_cost_lunchbox || "0", // Ensure non-null value
      },
    });

    console.log("Update result:", result);

    // ไม่ต้องเช็ค result.count เพราะ update จะ throw error ถ้าไม่พบข้อมูล
    return NextResponse.json({
      success: true,
      updated: 1, // update จะอัปเดต 1 record เสมอ
    });
  } catch (error) {
    console.error("Server error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
