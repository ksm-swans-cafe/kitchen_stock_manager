import { NextResponse } from 'next/server';
import sql from '@/app/database/connect'

export async function GET() {
    try {
        const result = await sql`
            SELECT * FROM ingredients ORDER BY ingredient_id ASC;`
    
        if (result.length === 0) {
            return NextResponse.json({ message: 'No ingredients found' }, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    }catch (error) {
        console.error('Error fetching ingredients:', error);
        return NextResponse.json({ message: 'Error fetching ingredients' }, { status: 500 });
    }
}