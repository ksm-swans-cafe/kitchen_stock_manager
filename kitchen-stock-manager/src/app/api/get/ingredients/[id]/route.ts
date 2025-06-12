import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result = await sql`
      SELECT * FROM ingredients WHERE ingredient_id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}