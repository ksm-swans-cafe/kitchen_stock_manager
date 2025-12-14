import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkServerAuth } from "@/lib/auth/serverAuth";

function convertBigIntToNumber(obj: any, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) return obj;

  // Handle circular references
  if (typeof obj === "object" && visited.has(obj)) {
    return null;
  }

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  // Handle MongoDB ObjectId - convert to string immediately
  if (obj && typeof obj === "object" && obj.constructor && obj.constructor.name === "ObjectId") {
    return obj.toString();
  }

  // Skip Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Skip other special objects
  if (obj instanceof RegExp || obj instanceof Map || obj instanceof Set) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    visited.add(obj);
    const result = obj.map((item) => convertBigIntToNumber(item, visited));
    visited.delete(obj);
    return result;
  }

  if (typeof obj === "object") {
    visited.add(obj);
    const converted: any = {};
    for (const key in obj) {
      // Skip internal MongoDB/Prisma keys
      if (key.startsWith("_") || key === "$__" || key === "isNew") continue;
      
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          const value = obj[key];
          // Handle ObjectId in nested objects
          if (value && typeof value === "object" && value.constructor && value.constructor.name === "ObjectId") {
            converted[key] = value.toString();
          } else {
            converted[key] = convertBigIntToNumber(value, visited);
          }
        } catch (e) {
          // Skip problematic keys
          console.warn(`Skipping key ${key} due to error:`, e);
        }
      }
    }
    visited.delete(obj);
    return converted;
  }

  return obj;
}

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    // Fetch menus excluding menu_cost field to avoid null value error
    // Then fetch menu_cost separately and merge
    const menusWithoutCost = await prisma.menu.findMany({
      orderBy: { menu_id: "asc" },
      select: {
        id: true,
        menu_id: true,
        menu_name: true,
        menu_subname: true,
        menu_category: true,
        menu_image: true,
        menu_ingredients: true,
        menu_lunchbox: true,
        // Explicitly exclude menu_cost
      },
    });
    
    if (menusWithoutCost.length === 0) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }
    
    // Fetch menu_cost values separately using Prisma's aggregateRaw
    const menuIds = menusWithoutCost.map(m => m.menu_id);
    let costMap = new Map<number, any>();
    
    if (menuIds.length > 0) {
      try {
        // Use aggregateRaw to get menu_cost values with null handling
        const costResults = await prisma.menu.aggregateRaw({
          pipeline: [
            { $match: { menu_id: { $in: menuIds } } },
            { $project: { menu_id: 1, menu_cost: { $ifNull: ["$menu_cost", 0] } } }
          ]
        }) as unknown as Array<{ menu_id: number; menu_cost: any }>;
        
        if (Array.isArray(costResults)) {
          costResults.forEach((item: any) => {
            const menuId = item.menu_id;
            const cost = item.menu_cost !== null && item.menu_cost !== undefined ? item.menu_cost : 0;
            costMap.set(menuId, cost);
          });
        }
      } catch (costError) {
        console.warn("Error fetching menu costs, using default value 0:", costError);
        // If we can't fetch costs, use 0 as default
        menuIds.forEach(id => costMap.set(id, 0));
      }
    }
    
    // Merge menu_cost back into results
    const result = menusWithoutCost.map(menu => ({
      ...menu,
      menu_cost: costMap.get(menu.menu_id) ?? 0,
    }));

    const convertedResult = convertBigIntToNumber(result);

    // Test JSON serialization before sending
    try {
      JSON.stringify(convertedResult);
    } catch (jsonError) {
      console.error("JSON serialization error:", jsonError);
      throw new Error(`JSON serialization failed: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
    }

    return NextResponse.json(convertedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu list:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: "Failed to fetch menu list",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
