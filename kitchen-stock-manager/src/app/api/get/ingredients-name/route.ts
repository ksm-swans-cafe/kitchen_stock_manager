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
    console.log("Raw names from query:", names);
    const nameArray = names
      .split(",")
      .map((name) => decodeURIComponent(name).trim().toLowerCase());
    console.log("Processed nameArray:", nameArray);

    if (nameArray.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const result = await sql`
      SELECT ingredient_name, COALESCE(ingredient_unit, 'หน่วย') AS ingredient_unit 
      FROM ingredients 
      WHERE TRIM(LOWER(ingredient_name)) IN (${nameArray})
    `;

    console.log("Database query result:", result);

    const units = nameArray.map((name) => {
      const found = result.find(
        (r) => r.ingredient_name.trim().toLowerCase() === name
      );
      return {
        ingredient_name: name,
        ingredient_unit: found ? found.ingredient_unit : "หน่วย",
      };
    });

    if (result.length === 0) {
      console.warn("No units found in database for any ingredients");
      return NextResponse.json(
        { warning: "No units found for the provided ingredients", units },
        { status: 200 }
      );
    }

    console.log("Final units response:", units);
    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredient units:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient units" },
      { status: 500 }
    );
  }
}
