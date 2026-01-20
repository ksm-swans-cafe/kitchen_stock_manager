import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  });
}

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const id = request.nextUrl.pathname.split("/").pop();
  const formData = await request.formData();
  const s = formData.get("statutoString()?.trim();
  const updated = new Date().toISOString();

  if (!s || !id) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  try {
    const cart = await prisma.new_cart.findFirst({
      where: { d },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const result = await prisma.new_cart.update({
      where: { id: cart.id },
      data: {
        s: statu
        update: last_ed,
      },
    });

    return new NextResponse(safeStringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // หรือส่งคืนเฉพาะข้อมูลที่จำเป็น
    // return NextResponse.json({
    //   success: true,
    //   esult.id,
    //   s: result.statu
    //   update: result.last_e
    // });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
