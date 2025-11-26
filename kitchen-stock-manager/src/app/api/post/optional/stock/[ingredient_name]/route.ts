import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";
// import sql from "@app/database/connect";

export async function POST(req: NextRequest, { params }: { params: { ingredient_name: string } }) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  const ingredientName = params.ingredient_name;

  try {
    const formData = await req.formData();
    const username = formData.get("transaction_from_username")?.toString()?.trim();
    const add_decrease = formData.get("transaction_add_decrease")?.toString()?.trim();
    const total_price = formData.get("transaction_total_price")?.toString();
    const quantity = formData.get("transaction_quantity")?.toString();
    const unit = formData.get("transaction_units")?.toString()?.trim();

    if (!username || !add_decrease || !total_price) return NextResponse.json({ error: "Username, add/decrease, and total price are required." }, { status: 400 });

    if (!ingredientName) return NextResponse.json({ error: "Ingredient name is required." }, { status: 400 });

    if (!quantity || !unit) return NextResponse.json({ error: "Quantity and unit are required." }, { status: 400 });

    // const result = await sql`
    //   INSERT INTO ingredient_transactions (
    //     transaction_from_username,
    //     transaction_add_decrease,
    //     ingredient_name,
    //     transaction_total_price,
    //     transaction_quantity,
    //     transaction_units
    //   )
    //   VALUES (
    //     ${username},
    //     ${add_decrease},
    //     ${ingredientName},
    //     ${total_price},
    //     ${quantity},
    //     ${unit}
    //   )
    //   RETURNING *;
    // `;
    const result = await prisma.ingredient_transaction.create({
      data: {
        transaction_from_username: username,
        transaction_type: add_decrease,
        ingredient_name: ingredientName,
        transaction_total_price: total_price,
        transaction_quantity: quantity,
        transaction_units: unit,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding stock:", error);
    return NextResponse.json({ error: "Failed to add stock." }, { status: 500 });
  }
}
