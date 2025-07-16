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

import { NextResponse } from "next/server";
import sql from "@/app/database/connect";

export async function GET(request: { url: string | URL }) {
  const { searchParams } = new URL(request.url);
  const names = searchParams.get("names");

  if (!names) {
    return NextResponse.json(
      { error: "Ingredient names are required" },
      { status: 400 }
    );
  }

  try {
    const nameArray = names.split(",").map((name) => name.trim());
    if (nameArray.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    console.log("Querying ingredient units for:", nameArray); // Debug log

    const result = await sql`
      SELECT ingredient_name, ingredient_unit 
      FROM ingredients 
      WHERE ingredient_name IN (${nameArray})
    `;

    console.log("Database query result:", result); // Debug log

    // Map results to ensure all requested names are returned
    const units = nameArray.map((name) => {
      const found = result.find((r) => r.ingredient_name === name);
      let unit = "หน่วย"; // Default value
      if (found) {
        unit = found.ingredient_unit || "หน่วย"; // Use ingredient_unit if exists, otherwise 'หน่วย'
        if (!found.ingredient_unit) {
          console.warn(`Unit is null or empty for ingredient: ${name}`);
        }
      } else {
        console.warn(`No unit found for ingredient: ${name}`);
      }
      return {
        ingredient_name: name,
        ingredient_unit: unit,
      };
    });

    console.log("Final units response:", units); // Debug log
    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredient units:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient units" },
      { status: 500 }
    );
  }
}
