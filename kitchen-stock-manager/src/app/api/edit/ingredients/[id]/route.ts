// src/app/api/edit/ingredients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/app/database/connect';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    // ตรวจสอบและแปลงข้อมูล JSON
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'รูปแบบข้อมูล JSON ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const { ingredient_total, ingredient_total_alert } = requestBody;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (ingredient_total === undefined && ingredient_total_alert === undefined) {
      return NextResponse.json(
        { error: 'ต้องระบุ ingredient_total หรือ ingredient_total_alert' },
        { status: 400 }
      );
    }

    // อัปเดตฐานข้อมูล
    const result = await sql`
      UPDATE ingredients 
      SET 
        ingredient_total = COALESCE(${ingredient_total}, ingredient_total),
        ingredient_total_alert = COALESCE(${ingredient_total_alert}, ingredient_total_alert),
        ingredient_lastupdate = NOW()
      WHERE ingredient_id = ${id}
      RETURNING *
    `;

    // ตรวจสอบผลลัพธ์
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบวัตถุดิบที่ต้องการอัปเดต' },
        { status: 404 }
      );
    }

    // ส่งคำตอบสำเร็จ
    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error: unknown) {
    console.error('Error updating ingredient:', error);
  
    let errorMessage = 'An error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}