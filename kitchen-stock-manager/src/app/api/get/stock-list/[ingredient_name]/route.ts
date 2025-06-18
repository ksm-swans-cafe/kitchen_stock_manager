import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect"

export async function GET(request: NextRequest, { params }: { params: { ingredient_name: string } }) {
    const { ingredient_name } = params;
    
    try {
        const result = await sql`
        SELECT * FROM ingredient_transactions
        WHERE ingredient_name = ${ingredient_name}
        `;
    
        if (result.length === 0) {
        return NextResponse.json({ message: "Ingredient not found" }, { status: 404 });
        }
    
        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}