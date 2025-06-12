import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const [cart] = await sql`
      SELECT * FROM cart WHERE cart_id = ${id}
    `;

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}