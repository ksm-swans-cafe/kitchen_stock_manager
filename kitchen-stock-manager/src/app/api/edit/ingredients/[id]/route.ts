import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const formData = await request.formData();

    // ดึงข้อมูลจาก formData
    const ingredient_name = formData.get('ingredient_name')?.toString()?.trim();
    const ingredient_total = formData.get('ingredient_total');
    const ingredient_unit = formData.get('ingredient_unit')?.toString()?.trim();
    // const ingredient_category = formData.get('ingredient_category')?.toString()?.trim();
    // const ingredient_sub_category = formData.get('ingredient_sub_category')?.toString()?.trim();
    const ingredient_total_alert = formData.get('ingredient_total_alert');
    const ingredient_price = formData.get('ingredient_price');
    const file = formData.get('ingredient_image') as File | null;

    // ตรวจสอบข้อมูลที่จำเป็นถ้ามีการส่งมา
    if (ingredient_name && !ingredient_name.trim()) {
      return NextResponse.json(
        { error: 'Ingredient name cannot be empty' },
        { status: 400 }
      );
    }

    if (ingredient_total !== null && (!Number.isFinite(Number(ingredient_total)) || Number(ingredient_total) <= 0)) {
      return NextResponse.json(
        { error: 'Ingredient total must be a positive number' },
        { status: 400 }
      );
    }

    if (ingredient_unit && !ingredient_unit.trim()) {
      return NextResponse.json(
        { error: 'Ingredient unit cannot be empty' },
        { status: 400 }
      );
    }

    if (ingredient_total_alert !== null && (!Number.isFinite(Number(ingredient_total_alert)) || Number(ingredient_total_alert) <= 0)) {
      return NextResponse.json(
        { error: 'Ingredient total alert must be a positive number' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า ingredient_id มีอยู่ในระบบ
    // const existingIngredient = await sql`
    //   SELECT ingredient_id, ingredient_image 
    //   FROM ingredients 
    //   WHERE ingredient_id = ${id}
    // `;

    const existingIngredient = await prisma.ingredients.findMany({
      where: { ingredient_id: Number(id) },
      select: { ingredient_id: true, ingredient_image: true },
    });

    if (existingIngredient.length === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    if (ingredient_name) {
      // const duplicateName = await sql`
      //   SELECT ingredient_name 
      //   FROM ingredients 
      //   WHERE ingredient_name = ${ingredient_name} 
      //   AND ingredient_id != ${id}
      // `;
      const duplicateName = await prisma.ingredients.findMany({
        where: {
          ingredient_name: ingredient_name,
          ingredient_id: { not: Number(id) },
        },
        select: { ingredient_name: true },
      });

      if (duplicateName.length > 0) {
        return NextResponse.json(
          { error: 'Ingredient name already exists' },
          { status: 409 }
        );
      }
    }

    let ingredient_image_url = null;
    if (file && file.name) {
      // ดึง URL รูปภาพเก่าถ้ามี
      const oldImageUrl = existingIngredient[0].ingredient_image;

      // อัปโหลดรูปภาพใหม่
      const uniqueName = `Ingredients-image/${randomUUID()}-${file.name}`;
      const blob = await put(uniqueName, file, {
        access: 'public',
      });
      ingredient_image_url = blob.url;

      // ลบรูปภาพเก่าถ้ามี
      if (oldImageUrl) {
        try {
          await del(oldImageUrl);
          console.log('Deleted old image:', oldImageUrl);
        } catch (deleteError) {
          console.error('Failed to delete old image:', deleteError);
        }
      }
    }

    let ingredientPriceperUnit: string | null = null;
    const priceNum = ingredient_price !== null ? Number(ingredient_price) : null;
    const totalNum = ingredient_total !== null ? Number(ingredient_total) : null;
    if (
      priceNum !== null &&
      totalNum !== null &&
      Number.isFinite(priceNum) &&
      Number.isFinite(totalNum) &&
      totalNum !== 0
    ) {
      ingredientPriceperUnit = (priceNum / totalNum).toFixed(2);
    }

    // const result = await sql`
    //   UPDATE ingredients 
    //   SET 
    //     ingredient_name = COALESCE(${ingredient_name}, ingredient_name),
    //     ingredient_total = COALESCE(${ingredient_total ? Number(ingredient_total) : null}, ingredient_total),
    //     ingredient_unit = COALESCE(${ingredient_unit}, ingredient_unit),
    //     ingredient_total_alert = COALESCE(${ingredient_total_alert ? Number(ingredient_total_alert) : null}, ingredient_total_alert),
    //     ingredient_price = COALESCE(${ingredient_price ? Number(ingredient_price) : null}, ingredient_price),
    //     ingredient_image = COALESCE(${ingredient_image_url}, ingredient_image),
    //     ingredient_price_per_unit = COALESCE(${ingredientPriceperUnit}, ingredient_price_per_unit),
    //     ingredient_lastupdate = NOW()
    //   WHERE ingredient_id = ${id}
    //   RETURNING *
    // `;
    const result = await prisma.ingredients.update({
      where: { ingredient_id: Number(id) },
      data: {
        ingredient_name: ingredient_name,
        ingredient_total: ingredient_total ? Number(ingredient_total) : null,
        ingredient_unit: ingredient_unit,
        ingredient_total_alert: ingredient_total_alert ? Number(ingredient_total_alert) : null,
        ingredient_price: ingredient_price ? Number(ingredient_price) : null,
        ingredient_image: ingredient_image_url,
        ingredient_price_per_unit: ingredientPriceperUnit,
        ingredient_lastupdate: new Date(),
      },
    })

    // const result = await sql`
    //   UPDATE ingredients 
    //   SET 
    //     ingredient_name = COALESCE(${ingredient_name}, ingredient_name),
    //     ingredient_total = COALESCE(${ingredient_total ? Number(ingredient_total) : null}, ingredient_total),
    //     ingredient_unit = COALESCE(${ingredient_unit}, ingredient_unit),
    //     ingredient_category = COALESCE(${ingredient_category}, ingredient_category),
    //     ingredient_sub_category = COALESCE(${ingredient_sub_category}, ingredient_sub_category),
    //     ingredient_total_alert = COALESCE(${ingredient_total_alert ? Number(ingredient_total_alert) : null}, ingredient_total_alert),
    //     ingredient_price = COALESCE(${ingredient_price ? Number(ingredient_price) : null}, ingredient_price),
    //     ingredient_image = COALESCE(${ingredient_image_url}, ingredient_image),
    //     ingredient_lastupdate = NOW()
    //   WHERE ingredient_id = ${id}
    //   RETURNING *
    // `;

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update ingredient' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Ingredient updated successfully',
        ingredient: result,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      {
        error: 'Failed to update ingredient',
      },
      { status: 500 }
    );
  }
}