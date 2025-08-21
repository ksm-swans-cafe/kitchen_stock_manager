import { NextResponse, NextRequest } from "next/server";
import sql from "@/app/database/connect";
import { Employee } from "@/models/employee/employee-model";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // เปลี่ยนเป็น Promise ตาม error แจ้ง
) {
  try {
    const { id: employee_id } = await context.params; // await ก่อนใช้งาน

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const employees = await sql`
      SELECT * FROM Employee WHERE employee_id = ${employee_id}
    `;

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    const employee: Employee = employees[0];

    return NextResponse.json(employee);
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
      console.error("Database error:", message);
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 }
    );
  }
}
