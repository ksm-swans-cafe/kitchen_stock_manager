// pages/api/your-api.ts
import { NextResponse } from 'next/server';
import sql from '../database/connect';

export async function GET() {
    try {
      const result = await sql`SELECT * FROM public."Employee"`;
      return NextResponse.json(result);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
  