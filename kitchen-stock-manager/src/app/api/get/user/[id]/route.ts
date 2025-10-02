import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Employee } from "@/models/employee/Employee";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: employee_id } = await context.params;

    if (!employee_id) return NextResponse.json({ message: "Employee ID is required" }, { status: 400 });
    
    const employees = await prisma.employee.findMany({
      where: { employee_id: employee_id },
    });

    if (!employees || employees.length === 0) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    const employee: Employee = {
      employee_id: employees[0].employee_id,
      employee_username: employees[0].employee_username ?? "",
      employee_firstname: employees[0].employee_firstname ?? "",
      employee_lastname: employees[0].employee_lastname ?? "",
      employee_pin: employees[0].employee_pin !== null && employees[0].employee_pin !== undefined ? Number(employees[0].employee_pin) : 0,
      employee_role: employees[0].employee_role ?? "",
    };

    return NextResponse.json(employee);
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
      console.error("Database error:", message);
    }

    return NextResponse.json({ message: "Internal Server Error", error: message }, { status: 500 });
  }
}
