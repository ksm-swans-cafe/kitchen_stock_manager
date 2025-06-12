import { NextResponse } from 'next/server';
import sql from '@/app/database/connect';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM menu ORDER BY menu_id ASC`;
   
     if (result.length === 0) {
            return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
     }
            return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu list:', error);
    return NextResponse.json({ error: 'Failed to fetch menu list' }, { status: 500 });
  }
}