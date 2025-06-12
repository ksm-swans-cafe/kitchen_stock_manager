import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import sql from '../../../../database/connect';
import { Employee } from '@/models/employee/employee-model';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ employee_uuid: string }> }
) {
  try {
    const { employee_uuid } = await context.params;

    if (!employee_uuid) {
      return NextResponse.json(
        { message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employees = await sql`
      SELECT * FROM Employee WHERE employee_id = ${employee_uuid}
    `;

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee: Employee = employees[0];

    return NextResponse.json(employee);
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
      console.error('Database error:', message);
    }

    return NextResponse.json(
      { message: 'Internal Server Error', error: message },
      { status: 500 }
    );
  }
}
