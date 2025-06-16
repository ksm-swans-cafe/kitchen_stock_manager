import { NextResponse } from 'next/server';
import sql from '@/app/database/connect';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { ingredient_total, ingredient_total_alert } = await request.json();

    // Validate input
    if (ingredient_total === undefined && ingredient_total_alert === undefined) {
      return NextResponse.json(
        { error: 'ต้องระบุ ingredient_total หรือ ingredient_total_alert' },
        { status: 400 }
      );
    }

    // Update database
    const result = await sql`
      UPDATE ingredients 
      SET 
        ingredient_total = COALESCE(${ingredient_total}, ingredient_total),
        ingredient_total_alert = COALESCE(${ingredient_total_alert}, ingredient_total_alert),
        ingredient_lastupdate = NOW()
      WHERE ingredient_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบวัตถุดิบที่ต้องการอัปเดต' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}