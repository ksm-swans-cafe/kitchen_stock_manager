import { NextResponse, NextRequest } from 'next/server';

import sql from '@/app/database/connect'

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse>  {
  const { id } = params;
  console.log(id)
  try {

    const { ingredient_total, ingredient_total_alert } = await request.json();

    const updates = [];
    if (ingredient_total !== undefined) {
      updates.push(sql`ingredient_total = ${ingredient_total}`);
    }
    if (ingredient_total_alert !== undefined) {
      updates.push(sql`ingredient_total_alert = ${ingredient_total_alert}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'ต้องระบุ ingredient_total หรือ ingredient_total_alert' },
        { status: 400 }
      );
    }

    if (ingredient_total === undefined && ingredient_total_alert === undefined) {
      return NextResponse.json(
        { error: 'ต้องระบุ ingredient_total หรือ ingredient_total_alert' },
        { status: 400 }
      );
    }

    const result = await sql`
        UPDATE ingredients 
        SET 
          ingredient_total = ${ingredient_total},
          ingredient_total_alert = ${ingredient_total_alert},
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
      data: result[0],
    });

  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}