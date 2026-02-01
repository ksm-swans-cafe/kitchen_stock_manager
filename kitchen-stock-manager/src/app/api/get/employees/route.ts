import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const employees = await prisma.employee.findMany({
      orderBy: { employee_username: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: employees.map((emp: any) => ({
        id: emp.id,
        employee_id: emp.employee_id,
        employee_username: emp.employee_username,
        employee_firstname: emp.employee_firstname,
        employee_lastname: emp.employee_lastname,
        employee_pin: emp.employee_pin,
        employee_roles: emp.employee_roles || (emp.employee_role ? [emp.employee_role] : []),
      })),
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลพนักงานได้" },
      { status: 500 }
    );
  }
}
