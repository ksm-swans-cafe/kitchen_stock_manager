import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
    try {
    const result = await prisma.menu.findMany({
      where: { menu_id: Number(id) },
    })
        if (result.length === 0) {
            return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
      }

      return NextResponse.json(result[0], { status: 200 });
    }catch (error) {
       console.error('Error fetching menu list:', error);
    return NextResponse.json({ error: 'Failed to fetch menu list' }, { status: 500 });
  }
}