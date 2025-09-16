import { NextRequest, NextResponse } from "next/server";
// import sql from "@app/database/connect";
import prisma from "@/lib/prisma";
export async function PATCH(request: NextRequest) {
  // Await params เพื่อดึง id จาก dynamic route
  // const params = await request.nextUrl.searchParams; // หรือใช้ dynamic params ผ่าน context
  const id = request.nextUrl.pathname.split("/").pop(); // ดึง id จาก URL path
  const formData = await request.formData();
  console.log("Form data:", Object.fromEntries(formData));
  const cart_status = formData.get("cart_status")?.toString()?.trim();
  const cart_last_updated = new Date().toISOString();

  if (!cart_status || !id) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  console.log("Updating cart item with ID:", id, "to status:", cart_status);

  try {
    // const result = await sql`
    //   UPDATE cart
    //   SET cart_status = ${cart_status}
    //   , cart_last_update = ${cart_last_updated}
    //   WHERE cart_id = ${id}
    //   RETURNING *;
    // `;
    const result = await prisma.cart.update({
      where: { cart_id: id },
      data: {
        cart_status: cart_status,
        cart_last_update: cart_last_updated,
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
