import { NextResponse } from "next/server";
import sql from "@/app/database/connect"
// request: Request
export async function GET() {
    try {
        const result = await sql`SELECT menu_image FROM menu ORDER BY menu_id DESC`;
        if (result.length === 0) {
            return NextResponse.json({ message: "No images found" }, { status: 404 });
        }
        return NextResponse.json(result, { status: 200 }); 
    }catch (error) {
        console.error("Error fetching menu images:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}