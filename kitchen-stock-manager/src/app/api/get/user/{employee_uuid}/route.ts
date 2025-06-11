import { NextResponse } from 'next/server';
import sql from '../../../../database/connect';

export async function GET(
  request: Request,
  { params }: { params: { employee_id: string } }
) {
  try {
    const employeeId = params.employee_id;
    if (!employeeId) {
      return NextResponse.json(
        { message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลทั้งหมดจากตาราง Employee
    const allEmployees = await sql`
      SELECT * FROM Employee
    `;

    if (!allEmployees || allEmployees.length === 0) {
      return NextResponse.json(
        { message: 'No employees found' },
        { status: 404 }
      );
    }

    // กรองข้อมูลให้เหลือเพียงคนเดียวตาม employee_id
    const employee = allEmployees.find(
      (emp: any) => emp.employee_id === employeeId
    );

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}