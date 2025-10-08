import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  });
}

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
    // ขั้นตอนที่ 1: หา cart ด้วย cart_id เพื่อได้ id (primary key)
    const cart = await prisma.cart.findFirst({
      where: { cart_id: id },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // ขั้นตอนที่ 2: อัปเดตด้วย id (primary key)
    const result = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        cart_status: cart_status,
        cart_last_update: cart_last_updated,
      },
    });

    // แก้ไข: ใช้ safeStringify หรือส่งคืนข้อมูลที่ปลอดภัย
    return new NextResponse(safeStringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // หรือส่งคืนเฉพาะข้อมูลที่จำเป็น
    // return NextResponse.json({
    //   success: true,
    //   cart_id: result.cart_id,
    //   cart_status: result.cart_status,
    //   cart_last_update: result.cart_last_update
    // });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
