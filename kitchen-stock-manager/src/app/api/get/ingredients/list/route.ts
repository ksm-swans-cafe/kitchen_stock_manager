import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(request: { url: string | URL }) {
  const { searchParams } = new URL(request.url);
  const names = searchParams.get("names");

  if (!names) {
    return NextResponse.json(
      { error: "Ingredient names are required" },
      { status: 400 }
    );
  }

  try {
    // แปลง query string เป็น array
    const nameArray = names
      .split(",")
      .map((name) => decodeURIComponent(name).trim().toLowerCase());

    if (nameArray.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // ใช้ Prisma query แทน SQL
    const result = await prisma.ingredients.findMany({
      where: {
        ingredient_name: {
          in: nameArray, // ดึง ingredient_name ที่ตรงกับ array
        },
      },
      select: {
        ingredient_name: true,
        ingredient_unit: true,
      },
    });

    // map ให้ default เป็น "หน่วย" ถ้าไม่เจอ
    const units = nameArray.map((name) => {
      const found = result.find(
        (r) => r.ingredient_name.trim().toLowerCase() === name
      );
      return {
        ingredient_name: name,
        ingredient_unit: found ? found.ingredient_unit : "หน่วย",
      };
    });

    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredient units:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient units" },
      { status: 500 }
    );
  }
}
