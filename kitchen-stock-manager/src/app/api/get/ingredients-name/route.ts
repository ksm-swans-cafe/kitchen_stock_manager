import { NextResponse } from 'next/server';
import sql from '@/app/./database/connect';

export async function GET() {
    try {
        const result = await sql`SELECT DISTINCT ingredient_id, ingredient_name FROM ingredients ORDER BY ingredient_id ASC;`
    
        if (result.length === 0) {
            return NextResponse.json({ message: 'No ingredients found' }, { status: 404 });
        }

        return NextResponse.json(result, { status: 200 });
    }catch (error) {
        console.error('Error fetching ingredients:', error);
        return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
    }
}