import { NextRequest, NextResponse } from 'next/server';
import sql from '@/app/database/connect';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { ingredient_total, ingredient_total_alert } = requestBody;

    if (ingredient_total === undefined && ingredient_total_alert === undefined) {
      return NextResponse.json(
        { error: 'Must specify either ingredient_total or ingredient_total_alert' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE ingredients 
      SET 
        ingredient_total = COALESCE(${ingredient_total}, ingredient_total),
        ingredient_total_alert = COALESCE(${ingredient_total_alert}, ingredient_total_alert),
        ingredient_lastupdate = NOW()
      WHERE ingredient_id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error: unknown) {
    console.error('Error updating ingredient:', error);
    
    const errorResponse = {
      error: 'Failed to update ingredient',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}