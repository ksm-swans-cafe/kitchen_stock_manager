"use client";

import { useState, useEffect } from "react";

type Ingredient = {
  useItem: number;
  ingredient_name: string;
};

type MenuItem = {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string | Ingredient[];
  menu_subname: string;
};

type IngredientUnit = {
  ingredient_name: string;
  ingredient_unit: string;
};

export default function Page() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientUnits, setIngredientUnits] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch menu items
        const menuResponse = await fetch("/api/get/menu-list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!menuResponse.ok) {
          throw new Error(`Failed to fetch menu data: ${menuResponse.statusText}`);
        }

        const menuData: MenuItem[] = await menuResponse.json();

        // รวบรวม unique ingredients
        const uniqueIngredients = new Set<string>();
        menuData.forEach((item) => {
          const ingredients = safeParseIngredients(item.menu_ingredients);
          ingredients.forEach((ing) => uniqueIngredients.add(ing.ingredient_name));
        });

        // Fetch ingredient units
        const units: Record<string, string> = {};
        await Promise.all(
          [...uniqueIngredients].map(async (name) => {
            try {
              const response = await fetch(`/api/get/ingredients-name?name=${encodeURIComponent(name)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });

              if (response.ok) {
                const data: IngredientUnit = await response.json();
                units[name] = data.ingredient_unit || "หน่วย";
              } else {
                units[name] = "หน่วย";
                console.warn(`Failed to fetch unit for ${name}: ${response.statusText}`);
              }
            } catch (err) {
              console.error(`Error fetching unit for ${name}:`, err);
              units[name] = "หน่วย";
            }
          })
        );

        setIngredientUnits(units);
        setMenuItems(menuData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  function safeParseIngredients(data: string | Ingredient[]): Ingredient[] {
    if (Array.isArray(data)) return data;

    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.every((item) => "ingredient_name" in item && "useItem" in item)) {
          return parsed;
        }
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    }

    return [];
  }

  const formatIngredients = (ingredientsInput: string | Ingredient[]): string => {
    const ingredients = safeParseIngredients(ingredientsInput);
    if (ingredients.length === 0) {
      return "ไม่มีวัตถุดิบ";
    }
    return ingredients
      .map((ing) => `${ing.ingredient_name} ใช้ ${ing.useItem} ${ingredientUnits[ing.ingredient_name] || "หน่วย"}`)
      .join(", ");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">รายการเมนู</h1>

      {isLoading && (
        <div className="text-center text-gray-600">กำลังโหลด...</div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4 rounded-lg bg-red-50 p-3">
          ข้อผิดพลาด: {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ชื่อเมนูอาหาร</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">วัตถุดิบในอาหาร</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ชื่อเมนูรอง</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.menu_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 border-b text-gray-800">{item.menu_name}</td>
                    <td className="py-3 px-4 border-b text-gray-800">{formatIngredients(item.menu_ingredients)}</td>
                    <td className="py-3 px-4 border-b text-gray-800">{item.menu_subname}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}