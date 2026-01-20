import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pinned } = body;

    if (typeof pinned !== "boolean") {
      return NextResponse.json(
        { error: "pinned must be a boolean" },
        { status: 400 }
      );
    }

    // Find the cart by id
    const existingCart = await prisma.new_cart.findFirst({
      where: { id: id },
    });

    if (!existingCart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Update the cart with new pinned status
    const updatedCart = await prisma.new_cart.update({
      where: { id: existingCart.id },
      data: {
        pinned: pinned,
        last_update: new Date().toISOString(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedCart = JSON.parse(
      JSON.stringify(updatedCart, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json({
      success: true,
      data: serializedCart,
    });
  } catch (error) {
    console.error("Error updating cart pinned status:", error);
    return NextResponse.json(
      { error: "Failed to update cart pinned status" },
      { status: 500 }
    );
  }
}
