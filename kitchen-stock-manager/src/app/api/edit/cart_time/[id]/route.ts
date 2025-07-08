import { NextRequest, NextResponse } from 'next/server';
import sql from "@app/database/connect";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const { cart_export_time, cart_receive_time } = await request.json();
  console.log("PATCH request: ", cart_export_time, cart_receive_time);

  // ตรวจสอบว่า id มีอยู่และเป็น string ที่ไม่ว่าง
  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: "ID ออร์เดอร์ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  // ฟังก์ชันแปลงเวลาจาก HH.mm น. หรือ HH:mm เป็น HH:mm
  const parseTime = (time: string | null | undefined): string | null => {
    if (!time || typeof time !== 'string') return null;

    // รองรับทั้ง HH:mm และ HH.mm น.
    const thaiTimeRegex = /^([0-1]?[0-9]|2[0-3])\.[0-5][0-9]\s*น\.?$/;
    const standardTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (thaiTimeRegex.test(time)) {
      // แปลง HH.mm น. เป็น HH:mm
      return time.replace(/\s*น\.?$/, '').replace('.', ':');
    } else if (standardTimeRegex.test(time)) {
      // ถ้าเป็น HH:mm อยู่แล้ว คืนค่าเดิม
      return time;
    } else {
      return null;
    }
  };

  // แปลงเวลา
  const parsedExportTime = parseTime(cart_export_time);
  const parsedReceiveTime = parseTime(cart_receive_time);

  // ตรวจสอบว่ารูปแบบเวลาถูกต้องหรือไม่
  if (
    (cart_export_time && parsedExportTime === null) ||
    (cart_receive_time && parsedReceiveTime === null)
  ) {
    return NextResponse.json(
      { error: "รูปแบบเวลาไม่ถูกต้อง ต้องเป็น HH:mm หรือ HH.mm น. (เช่น 14.00 น.)" },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      UPDATE cart
      SET cart_export_time = ${parsedExportTime || null},
          cart_receive_time = ${parsedReceiveTime || null}
      WHERE cart_id = ${id}
      RETURNING *;
    `;

    // ตรวจสอบว่ามีการอัปเดตข้อมูลหรือไม่
    if (result.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบออร์เดอร์ที่มี ID นี้" },
        { status: 404 }
      );
    }

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