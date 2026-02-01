import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const body = await request.json();
    const { fukYai, box2Chan, box3Chan } = body as { 
      fukYai?: number; 
      box2Chan?: number;
      box3Chan?: number;
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

    // Get current lunchbox array and update packaging for FIRST lunchbox only
    // (to avoid multiplying values when there are multiple lunchboxes)
    const currentLunchbox = (existingCart as any).lunchbox || [];
    const updatedLunchbox = currentLunchbox.map((item: any, index: number) => {
      if (index === 0) {
        // Only update the first lunchbox with the new values
        return {
          ...item,
          lunchbox_packaging: {
            fukYai: fukYai ?? 0,
            box2Chan: box2Chan ?? 0,
            box3Chan: box3Chan ?? 0,
          }
        };
      } else {
        // Clear packaging for other lunchboxes to avoid duplication
        return {
          ...item,
          lunchbox_packaging: {
            fukYai: 0,
            box2Chan: 0,
            box3Chan: 0,
          }
        };
      }
    });

    const result = await prisma.new_cart.update({
      where: { id: (existingCart as { id: string }).id },
      data: {
        lunchbox: updatedLunchbox,
        last_update: new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
    );

    return NextResponse.json(
      { message: "Packaging count updated successfully", cart: serializedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating packaging count:", error);
    return NextResponse.json({ error: "Failed to update packaging count" }, { status: 500 });
  }
}
