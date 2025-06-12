import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_username, cart_menu_items } = body;

    if (!cart_username || !cart_menu_items) {
      return NextResponse.json({ error: 'Username and menu items are required' }, { status: 400 });
    }

    const menuItemsJson = JSON.stringify(cart_menu_items);

    const result = await sql`
      INSERT INTO cart (cart_username, cart_menu_items) 
      VALUES (${cart_username}, ${menuItemsJson}::jsonb)
      RETURNING *`;

    return NextResponse.json({ message: 'Cart created successfully', cart: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating cart:', error);
    return NextResponse.json({ 
      error: 'Failed to create cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}