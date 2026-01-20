import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

interface CartDescription {
  description_id: string | null;
  description_title: string;
  description_value: string;
}

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body = await request.json();
    const { description } = body as { description: CartDescription[] };

    if (!id) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    const existingCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!existingCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Validate description format
    if (!Array.isArray(description)) {
      return NextResponse.json({ error: "description must be an array" }, { status: 400 });
    }

    // Format the description
    const formattedDescription = description.map((desc) => ({
      description_id: desc.description_id || null,
      description_title: desc.description_title || "",
      description_value: desc.description_value || "",
    }));

    // Update the cart
    const result = await prisma.new_cart.update({
      where: { id: (existingCart as { id: string }).id },
      data: {
        description: formattedDescription,
        last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
    );

    return NextResponse.json(
      { message: "Cart description updated successfully", cart: serializedResult },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating cart description:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: "Failed to update cart description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
