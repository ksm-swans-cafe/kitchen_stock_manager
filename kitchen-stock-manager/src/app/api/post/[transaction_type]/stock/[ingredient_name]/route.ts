// src/app/api/post/[transaction_type]/stock/[ingredient_name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import sql from "@app/database/connect";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ transaction_type: string; ingredient_name: string }>;
  }
) {
  // Await params เพื่อรับค่า dynamic parameters
  const { ingredient_name: ingredientName, transaction_type: type } =
    await params;

  try {
    const formData = await req.formData();
    const username = formData
      .get("transaction_from_username")
      ?.toString()
      ?.trim();
    const total_price = formData.get("transaction_total_price");
    const quantity = formData.get("transaction_quantity");
    const unit = formData.get("transaction_units")?.toString()?.trim();

    if (
      !username ||
      !type ||
      !total_price ||
      !ingredientName ||
      !quantity ||
      !unit
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // const result = await sql`
    //   INSERT INTO ingredient_transactions (
    //     transaction_from_username,
    //     transaction_type,
    //     ingredient_name,
    //     transaction_total_price,
    //     transaction_quantity,
    //     transaction_units
    //   )
    //   VALUES (
    //     ${username},
    //     ${type},
    //     ${ingredientName},
    //     ${total_price},
    //     ${quantity},
    //     ${unit}
    //   )
    //   RETURNING *;
    // `;
    const result = await prisma.ingredient_transactions.create({
      data: {
        transaction_from_username: username,
        transaction_type: type,
        ingredient_name: ingredientName,
        transaction_total_price: Number(total_price),
        transaction_quantity: Number(quantity),
        transaction_units: unit,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding stock:", error);
    return NextResponse.json(
      { error: "Failed to add stock." },
      { status: 500 }
    );
  }
}
