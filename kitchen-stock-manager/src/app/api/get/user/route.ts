import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employee_id: true,
        employee_username: true,
        employee_firstname: true,
        employee_lastname: true,
        employee_roles: true,
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
