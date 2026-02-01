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
    const { employee_roles, employee_firstname, employee_lastname, employee_username, employee_pin } = body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: "ไม่พบพนักงานนี้" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (employee_roles !== undefined) updateData.employee_roles = employee_roles;
    if (employee_firstname !== undefined) updateData.employee_firstname = employee_firstname;
    if (employee_lastname !== undefined) updateData.employee_lastname = employee_lastname;
    if (employee_username !== undefined) updateData.employee_username = employee_username;
    if (employee_pin !== undefined && employee_pin !== "") updateData.employee_pin = employee_pin;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลพนักงานสำเร็จ",
      data: {
        id: updatedEmployee.id,
        employee_username: updatedEmployee.employee_username,
        employee_firstname: updatedEmployee.employee_firstname,
        employee_lastname: updatedEmployee.employee_lastname,
        employee_roles: (updatedEmployee as any).employee_roles || [],
      },
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถอัปเดตข้อมูลได้" },
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

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: "ไม่พบพนักงานนี้" },
        { status: 404 }
      );
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบพนักงานสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบพนักงานได้" },
      { status: 500 }
    );
  }
}
