import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const formData = await request.formData();
  console.log(formData);
  const cart_status = formData.get("cart_status")?.toString()?.trim();
  console.log("Updating cart item with ID:", id, "to status:", cart_status);
  if (!cart_status || !id) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  try {
    const result = await sql`
      UPDATE cart
      SET cart_status = ${cart_status}
      WHERE cart_id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}