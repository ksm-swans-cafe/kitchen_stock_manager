import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;
  
  const params = await context.params;
  const { id } = params;
  const { export_time, receive_time } = await request.json();

  if (!id || typeof id !== "string") return NextResponse.json({ error: "ID ออเดอร์ไม่ถูกต้อง" }, { status: 400 });
  
  const parseTime = (time: string | null | undefined): string | null => {
    if (!time || typeof time !== "string") return null;

    const thaiTimeRegex = /^([0-1]?[0-9]|2[0-3])\.[0-5][0-9]\s*น\.?$/;
    const standardTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (thaiTimeRegex.test(time)) return time.replace(/\s*น\.?$/, "").replace(".", ":");
    else if (standardTimeRegex.test(time)) return time;
    else return null;
  };

  const parsedExportTime = parseTime(export_time);
  const parsedReceiveTime = parseTime(receive_time);

  if ((export_time && parsedExportTime === null) || (receive_time && parsedReceiveTime === null)) {
    return NextResponse.json(
      {
        error: "รูปแบบเวลาไม่ถูกต้อง ต้องเป็น HH:mm หรือ HH.mm น. (เช่น 14.00 น.)",
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.new_cart.updateMany({
      where: { id: id },
      data: {
        export_time: parsedExportTime || null,
        receive_time: parsedReceiveTime || null,
      },
    });

    if (result.count === 0) return NextResponse.json({ error: "ไม่พบออเดอร์ที่มี ID นี้" }, { status: 404 });

    return NextResponse.json({
      success: true,
      cart: result,
    });
  } catch (error) {
    console.error("Error updating cart times:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดทข้อมูล",
      },
      { status: 500 }
    );
  }
}
