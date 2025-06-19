import { NextRequest, NextResponse } from "next/server";
import sql from "@app/database/connect";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      transaction_add_decrease: string;
      ingredient_name: string;
    };
  }
) {
  const ingredientName = params.ingredient_name;
  const add_decrease = params.transaction_add_decrease;

  try {
    const formData = await req.formData();
    const username = formData.get("transaction_from_username")?.toString()?.trim();
    const total_price = formData.get("transaction_total_price");
    const quantity = formData.get("transaction_quantity");
    const unit = formData.get("transaction_units")?.toString()?.trim();

    if (!username || !add_decrease || !total_price || !ingredientName || !quantity || !unit) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO ingredient_transactions (
        transaction_from_username,
        transaction_add_decrease,
        ingredient_name,
        transaction_total_price,
        transaction_quantity,
        transaction_units
      )
      VALUES (
        ${username},
        ${add_decrease},
        ${ingredientName},
        ${total_price},
        ${quantity},
        ${unit}
      )
      RETURNING *;
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding stock:", error);
    return NextResponse.json(
      { error: "Failed to add stock." },
      { status: 500 }
    );
  }
}
