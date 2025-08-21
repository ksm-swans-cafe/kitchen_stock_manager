import { NextRequest, NextResponse } from "next/server";
// import sql from "@app/database/connect";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing menu id" }, { status: 400 });
  }

  try {
    // const result = await sql`DELETE FROM menu WHERE menu_id = ${id} RETURNING *`;
    const result = await prisma.menu.delete({
      where: { menu_id: Number(id) },
    })
    if (!result) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Menu deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete menu", details: (error as Error).message },
      { status: 500 }
    );
  }
}
