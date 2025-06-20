import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
    try {
        const result = await sql`
      SELECT * FROM menu WHERE menu_id = ${id}
    `;
        if (result.length === 0) {
            return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
      }

      return NextResponse.json(result[0], { status: 200 });
    }catch (error) {
       console.error('Error fetching menu list:', error);
    return NextResponse.json({ error: 'Failed to fetch menu list' }, { status: 500 });
  }
}