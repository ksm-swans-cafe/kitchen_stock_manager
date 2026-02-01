import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const { role_name, role_display, role_color, permissions, is_default } = body;

    if (!role_name || !role_display) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุชื่อ Role" },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await (prisma as any).role.findUnique({
      where: { role_name: role_name.toLowerCase() },
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: "Role นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    const newRole = await (prisma as any).role.create({
      data: {
        role_name: role_name.toLowerCase(),
        role_display,
        role_color: role_color || "#6B7280",
        permissions: permissions || [],
        is_default: is_default || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "สร้าง Role สำเร็จ",
      data: newRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้าง Role ได้" },
      { status: 500 }
    );
  }
}
