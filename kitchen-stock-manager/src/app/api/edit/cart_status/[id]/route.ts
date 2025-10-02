import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  const formData = await request.formData();
  console.log("Form data:", Object.fromEntries(formData));
  const cart_status = formData.get("cart_status")?.toString()?.trim();
  const cart_last_updated = new Date().toISOString();

  if (!cart_status || !id) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  console.log("Updating cart item with ID:", id, "to status:", cart_status);

  try {
    const result = await prisma.cart.update({
      where: { cart_id: id },
      data: {
        cart_status: cart_status,
        cart_last_update: cart_last_updated,
      },
    });

    if (!result) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
