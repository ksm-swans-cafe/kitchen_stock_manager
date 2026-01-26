import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(request: NextRequest) {

  // optional body (reserved for future filters)
  await request.json().catch(() => ({}));

  type LunchboxOrderInput = {
    lunchbox_menu_category: string;
    lunchbox_menu_category_limit: string;
    lunchbox_menu_category_sequence: string;
  };

  // ตั้งค่าเป็น "รายเซ็ต" (ห้ามรวมด้วย IN ถ้า rule ไม่เหมือนกัน)
  // Requirement: A=1 หมวด, B=2 หมวด, C=3 หมวด, D=4 หมวด, E/F/G=5 หมวด (ตาม menu_category_limit รวมกัน)
  const targets: Array<{
    lunchbox_name: string;
    lunchbox_set_name: string;
    lunchbox_limit: number;
    lunchbox_order_select: LunchboxOrderInput[];
  }> = [
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "A",
      lunchbox_limit: 1,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "B",
      lunchbox_limit: 2,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "C",
      lunchbox_limit: 3,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "กับข้าวที่ 2", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "3" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "D",
      lunchbox_limit: 4,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "กับข้าวที่ 2", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "3" },
        { lunchbox_menu_category: "ผลไม้", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "4" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "E",
      lunchbox_limit: 5,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "กับข้าวที่ 2", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "2", lunchbox_menu_category_sequence: "3" },
        { lunchbox_menu_category: "ผลไม้", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "4" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "F",
      lunchbox_limit: 5,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "กับข้าวที่ 2", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "2", lunchbox_menu_category_sequence: "3" },
        { lunchbox_menu_category: "เครื่องดื่ม", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "4" },
      ],
    },
    {
      lunchbox_name: "Lunch Box",
      lunchbox_set_name: "G",
      lunchbox_limit: 5,
      lunchbox_order_select: [
        { lunchbox_menu_category: "ข้าว+กับข้าว", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "1" },
        { lunchbox_menu_category: "กับข้าวที่ 2", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "2" },
        { lunchbox_menu_category: "เครื่องเคียง", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "3" },
        { lunchbox_menu_category: "เครื่องดื่ม", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "4" },
        { lunchbox_menu_category: "เค้ก", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: "5" },
      ],
    },
  ];

  try {
    const results = await Promise.all(
      targets
        .map(async (t) => {
          const result = await prisma.lunchbox.updateMany({
            where: {
              lunchbox_name: t.lunchbox_name,
              lunchbox_set_name: t.lunchbox_set_name,
            },
            data: {
              lunchbox_limit: t.lunchbox_limit,
              // เอาข้อมูลที่ให้มาไปใส่ใน set ของ composite list (Prisma)
              lunchbox_order_select: { set: t.lunchbox_order_select },
            },
          });

          return {
            lunchbox_name: t.lunchbox_name,
            lunchbox_set_name: [t.lunchbox_set_name],
            updated: result.count,
          };
        })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}