import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { role_display, role_color, permissions, is_default } = body;

    const existingRole = await (prisma as any).role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ Role นี้" },
        { status: 404 }
      );
    }

    const updatedRole = await (prisma as any).role.update({
      where: { id },
      data: {
        ...(role_display && { role_display }),
        ...(role_color && { role_color }),
        ...(permissions && { permissions }),
        ...(typeof is_default === "boolean" && { is_default }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดต Role สำเร็จ",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถอัปเดต Role ได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;

    const existingRole = await (prisma as any).role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ Role นี้" },
        { status: 404 }
      );
    }

    // Prevent deleting default roles
    if (existingRole.is_default) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถลบ Role เริ่มต้นได้" },
        { status: 400 }
      );
    }

    await (prisma as any).role.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบ Role สำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบ Role ได้" },
      { status: 500 }
    );
  }
}
