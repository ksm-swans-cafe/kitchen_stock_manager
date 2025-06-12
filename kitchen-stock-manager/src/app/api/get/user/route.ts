import { NextResponse } from 'next/server';
import sql from '@/app/./database/connect';

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM Employee
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'No employees found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}