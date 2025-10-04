import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      transaction_date: string; 
      ingredient_name: string;
    }>;
  }
) {
  const params = await context.params;
  const rawDateTime = decodeURIComponent(params.transaction_date); 
  const ingredientName = params.ingredient_name;

  try {
    const formData = await req.formData();
    const username = formData.get("transaction_from_username")?.toString().trim();
    const type = formData.get("transaction_type")?.toString().trim();
    const total_price = formData.get("transaction_total_price");
    const quantity = formData.get("transaction_quantity");
    const unit = formData.get("transaction_units")?.toString().trim();

    if (!username || !total_price || !ingredientName || !quantity || !unit) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const transaction = await prisma.ingredient_transactions.findFirst({
      where: {
        transaction_date: new Date(rawDateTime),
        ingredient_name: ingredientName,
      },
    });

    if (!transaction) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    
    const result = await prisma.ingredient_transactions.update({
      where: {
        transaction_id: transaction.transaction_id,
      },
      data: {
        transaction_from_username: username,
        transaction_type: type,
        transaction_total_price: Number(total_price),
        transaction_quantity: Number(quantity),
        transaction_units: unit,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json({ error: "Failed to update stock." }, { status: 500 });
  }
}
