import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ingredient_name,
      ingredient_total,
      ingredient_unit,
      ingredient_image,
      ingredient_total_alert,
    } = body;

    if (
      !ingredient_name ||
      !ingredient_total ||
      !ingredient_unit ||
      !ingredient_image ||
      !ingredient_total_alert
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO ingredients (
        ingredient_name,
        ingredient_total,
        ingredient_unit,
        ingredient_image,
        ingredient_total_alert
      ) VALUES (
        ${ingredient_name},
        ${ingredient_total},
        ${ingredient_unit},
        ${ingredient_image},
        ${ingredient_total_alert}
      ) RETURNING *
    `;

    return NextResponse.json(
      {
        message: 'Ingredient created successfully',
        ingredient: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    );
  }
}
