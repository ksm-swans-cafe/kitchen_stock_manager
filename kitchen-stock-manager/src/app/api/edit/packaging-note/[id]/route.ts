import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface PackagingNote {
  id: string;
  value: string;
}

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body = await request.json();
    const { packaging_notes, packaging_note } = body as { 
      packaging_notes?: PackagingNote[]; 
      packaging_note?: string;
    };

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    const existingCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Update the cart with packaging_notes (array) or packaging_note (legacy single string)
    // Store notes array as JSON string in packaging_note field
    let noteValue = "";
    if (packaging_notes !== undefined) {
      // New format: array of notes
      noteValue = JSON.stringify(packaging_notes);
    } else if (packaging_note !== undefined) {
      // Legacy format: single string
      noteValue = packaging_note;
    }

    const result = await prisma.new_cart.update({
      where: { id: (existingCart as { id: string }).id },
      data: {
        packaging_note: noteValue,
        last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
    );

    return NextResponse.json(
      { message: "Packaging note updated successfully", cart: serializedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating packaging note:", error);
    return NextResponse.json({ error: "Failed to update packaging note" }, { status: 500 });
  }
}
