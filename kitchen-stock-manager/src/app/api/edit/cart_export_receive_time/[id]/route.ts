import { NextRequest, NextResponse } from 'next/server';
import sql from "@app/database/connect";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const { cart_export_time, cart_receive_time } = await request.json();
  console.log("PATCH request: ", cart_export_time, cart_receive_time);

  try {
    const result = await sql`
      UPDATE cart
      SET cart_export_time = ${cart_export_time},
          cart_receive_time = ${cart_receive_time}
      WHERE cart_id = ${id}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      cart: result,
    });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล",
      },
      { status: 500 }
    );
  }
}