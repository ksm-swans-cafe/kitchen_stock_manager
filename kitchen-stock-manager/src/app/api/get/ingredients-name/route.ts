// import { NextResponse } from 'next/server';
// import sql from '@/app/./database/connect';

// export async function GET() {
//     try {
//         const result = await sql`SELECT DISTINCT ingredient_id, ingredient_name FROM ingredients ORDER BY ingredient_id ASC;`
    
//         if (result.length === 0) {
//             return NextResponse.json({ message: 'No ingredients found' }, { status: 404 });
//         }

//         return NextResponse.json(result, { status: 200 });
//     }catch (error) {
//         console.error('Error fetching ingredients:', error);
//         return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
//     }
// }

// pages/api/get/ingredients.js
import { NextResponse } from 'next/server';
import sql from '@/app/database/connect';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const names = searchParams.get('names');

  if (!names) {
    return NextResponse.json({ error: 'Ingredient names are required' }, { status: 400 });
  }

  try {
    const nameArray = names.split(',').map((name) => name.trim());
    const result = await sql`
      SELECT ingredient_name, ingredient_unit 
      FROM ingredients 
      WHERE ingredient_name IN (${nameArray})
    `;
    
    // Map results to ensure all requested names are returned
    const units = nameArray.map((name) => ({
      ingredient_name: name,
      ingredient_unit: result.find((r) => r.ingredient_name === name)?.ingredient_unit || 'หน่วย',
    }));

    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    console.error('Error fetching ingredient units:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array to prevent frontend crash
  }
}