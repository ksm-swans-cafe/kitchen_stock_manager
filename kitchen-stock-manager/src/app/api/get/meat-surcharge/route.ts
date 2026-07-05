import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { searchParams } = new URL(request.url);
    const lunchbox_name = searchParams.get("lunchbox_name");
    const lunchbox_set_name = searchParams.get("lunchbox_set_name");

    if (!lunchbox_name || !lunchbox_set_name) {
      return NextResponse.json({ success: false, error: "Missing lunchbox_name or lunchbox_set_name" }, { status: 400 });
    }

    const items = await (prisma as any).meat_surcharge.findMany({
      where: { lunchbox_name, lunchbox_set_name },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching meat surcharge:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถโหลดข้อมูลราคาบวกเพิ่มเนื้อสัตว์ได้" }, { status: 500 });
  }
}
