import { NextResponse, NextRequest } from 'next/server';
import sql from '@/app/database/connect';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // รับข้อมูลจาก formData
    const ingredient_name = formData.get('ingredient_name')?.toString();
    const ingredient_total = Number(formData.get('ingredient_total'));
    const ingredient_unit = formData.get('ingredient_unit')?.toString();
    const ingredient_total_alert = Number(formData.get('ingredient_total_alert'));
    const file = formData.get('ingredient_image') as File | null;

    // เช็คช่องว่าง
    if (
      !ingredient_name?.trim() ||
      !Number.isFinite(ingredient_total) ||
      ingredient_total <= 0 ||
      !ingredient_unit?.trim() ||
      !Number.isFinite(ingredient_total_alert) ||
      ingredient_total_alert <= 0
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // ตรวจสอบซ้ำชื่อ
    const existingIngredient = await sql`
      SELECT ingredient_name 
      FROM ingredients 
      WHERE ingredient_name = ${ingredient_name}
    `;

    if (existingIngredient.length > 0) {
      return NextResponse.json(
        { error: 'Ingredient name already exists' },
        { status: 409 }
      );
    }

    let ingredient_image = null;
    if (file) {
      const blob = await put(`Ingredients-image/${randomUUID()}-${file.name}`, file, {
        access: 'public',
      });
      console.log('Uploaded blob:', blob);
      ingredient_image = blob.url;
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