import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const { 
      employee_username, 
      employee_firstname, 
      employee_lastname, 
      employee_pin, 
      employee_roles 
    } = body;

    if (!employee_username || !employee_firstname) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน (Username และ ชื่อ)" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { employee_username },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: "Username นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // Generate employee_id
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employee_id: "desc" },
    });
    const newEmployeeId = lastEmployee 
      ? String(Number(lastEmployee.employee_id) + 1).padStart(4, "0")
      : "0001";

    const newEmployee = await (prisma.employee as any).create({
      data: {
        employee_id: newEmployeeId,
        employee_username,
        employee_firstname,
        employee_lastname: employee_lastname || "",
        employee_pin: employee_pin || "0000",
        employee_roles: employee_roles || ["employee"],
      },
    });

    return NextResponse.json({
      success: true,
      message: "สร้างพนักงานสำเร็จ",
      data: {
        id: newEmployee.id,
        employee_id: newEmployee.employee_id,
        employee_username: newEmployee.employee_username,
        employee_firstname: newEmployee.employee_firstname,
        employee_lastname: newEmployee.employee_lastname,
        employee_roles: newEmployee.employee_roles,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้างพนักงานได้" },
      { status: 500 }
    );
  }
}
