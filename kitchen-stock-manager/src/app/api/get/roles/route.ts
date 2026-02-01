import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const roles = await (prisma as any).role.findMany({
      orderBy: { role_name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูล Role ได้" },
      { status: 500 }
    );
  }
}
