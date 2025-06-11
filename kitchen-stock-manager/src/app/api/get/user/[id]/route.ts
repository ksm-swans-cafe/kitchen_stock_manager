import { NextResponse } from 'next/server';
import sql from '../../../../database/connect';

export async function GET(
  request: Request,
  { params }: { params: { employee_uuid: string } }
) {
  try {
    const employee_uuId = params.employee_uuid;
    if (!employee_uuId) {
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

    // กรองข้อมูลให้เหลือเพียงคนเดียวตาม employee_uuid
    const employee = allEmployees.find(
      (emp: any) => emp.employee_uuid === employee_uuId
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