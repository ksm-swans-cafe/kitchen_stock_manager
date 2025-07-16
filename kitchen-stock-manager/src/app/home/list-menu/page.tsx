"use client";

import { useState, useEffect } from "react";

type MenuItem = {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string;
  menu_subname: string;
};

type Ingredient = {
  useItem: number;
  ingredient_name: string;
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
      try {
        // Fetch menu items
        const menuResponse = await fetch("/api/get/menu-list");
        if (!menuResponse.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลเมนูได้");
        }
        const menuData: MenuItem[] = await menuResponse.json();

        // Collect unique ingredient names
        const uniqueIngredients = new Set<string>();
        menuData.forEach((item) => {
          try {
            const ingredients: Ingredient[] = JSON.parse(item.menu_ingredients);
            ingredients.forEach((ing) => uniqueIngredients.add(ing.ingredient_name));
          } catch (e) {
            console.error(`ไม่สามารถแปลงส่วนผสมสำหรับ ${item.menu_name}:`, e);
          }
        });

        // Fetch ingredient units in bulk
        const units: Record<string, string> = {};
        if (uniqueIngredients.size > 0) {
          const response = await fetch(
            `/api/get/ingredients-name?names=${encodeURIComponent([...uniqueIngredients].join(','))}`
          );
          if (response.ok) {
            const data: IngredientUnit[] = await response.json();
            data.forEach((unit) => {
              units[unit.ingredient_name] = unit.ingredient_unit || "หน่วย";
            });
          }
          // Set default unit for ingredients not found
          [...uniqueIngredients].forEach((name) => {
            if (!units[name]) units[name] = "หน่วย";
          });
        }

        setIngredientUnits(units);
        setMenuItems(menuData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format ingredients for display
  const formatIngredients = (ingredientsString: string): string => {
    try {
      const ingredients: Ingredient[] = JSON.parse(ingredientsString);
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return "ไม่มีวัตถุดิบ";
      }
      return ingredients
        .map(
          (ing) =>
            `${ing.ingredient_name} ใช้ ${ing.useItem} ${
              ingredientUnits[ing.ingredient_name] || "หน่วย"
            }`
        )
        .join(", ");
    } catch (e) {
      console.error("ไม่สามารถแปลงส่วนผสม:", e);
      return "ไม่มีวัตถุดิบ";
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mt-4">ข้อผิดพลาด: {error}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">รายการเมนู</h1>
      {isLoading ? (
        <div className="text-center">กำลังโหลด...</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ชื่อเมนูอาหาร</th>
              <th className="py-2 px-4 border-b text-left">วัตถุดิบในอาหาร</th>
              <th className="py-2 px-4 border-b text-left">ชื่อเมนูรอง</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-2 px-4 text-center">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item.menu_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.menu_name}</td>
                  <td className="py-2 px-4 border-b">
                    {formatIngredients(item.menu_ingredients)}
                  </td>
                  <td className="py-2 px-4 border-b">{item.menu_subname}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}