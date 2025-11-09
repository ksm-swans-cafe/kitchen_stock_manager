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
    return NextResponse.json({ error: "กรุณาระบุ cart_id และ isChecked" }, { status: 400 });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: { cart_id: id },
      select: {
        id: true,
        cart_id: true,
        cart_lunchbox: true,
      },
    });

    if (!cart) {
      console.error("Cart not found for id:", id);
      return NextResponse.json({ error: "ไม่พบตะกร้าที่ระบุ" }, { status: 404 });
    }

    // Parse cart_lunchbox
    let lunchboxes: any[] = [];
    if (typeof cart.cart_lunchbox === "string") {
      try {
        lunchboxes = JSON.parse(cart.cart_lunchbox);
        console.log("Parsed cart_lunchbox:", lunchboxes);
      } catch (e) {
        console.error("JSON parse error:", (e as Error).message);
        return NextResponse.json({ error: "รูปแบบข้อมูล lunchbox ไม่ถูกต้อง" }, { status: 400 });
      }
    } else if (Array.isArray(cart.cart_lunchbox)) {
      lunchboxes = cart.cart_lunchbox;
    } else {
      console.error("Invalid cart_lunchbox format:", cart.cart_lunchbox);
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

    // แก้ไข: ใช้ replacer function เพื่อจัดการ BigInt
    // console.log(
    //   "Updated lunchboxes:",
    //   JSON.stringify(
    //     updatedLunchboxes,
    //     (key, value) => {
    //       return typeof value === "bigint" ? value.toString() : value;
    //     },
    //     2
    //   )
    // );
    // console.log("Attempting to update cart with id:", cart.id);

    const result = await prisma.cart.update({
      where: { id: cart.id }, // เปลี่ยนจาก cart_id เป็น id
      data: {
        cart_lunchbox: updatedLunchboxes as any,
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
