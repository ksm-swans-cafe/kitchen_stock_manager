"use client";
import { useState, useEffect } from "react";

type MenuItem = {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string | Ingredient[];
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
  const [ingredientUnits, setIngredientUnits] = useState<
    Record<string, string>
  >({});
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
        console.log("Menu data from API:", menuData); // Debug log

        // Collect unique ingredient names
        const uniqueIngredients = new Set<string>();
        menuData.forEach((item) => {
          try {
            let ingredients: Ingredient[];
            if (Array.isArray(item.menu_ingredients)) {
              ingredients = item.menu_ingredients;
            } else if (typeof item.menu_ingredients === "string") {
              ingredients = JSON.parse(item.menu_ingredients);
            } else {
              console.error(
                `menu_ingredients มีรูปแบบไม่ถูกต้องสำหรับ ${item.menu_name}:`,
                item.menu_ingredients
              );
              return;
            }

            if (!Array.isArray(ingredients)) {
              console.error(
                `menu_ingredients ไม่ใช่ array สำหรับ ${item.menu_name}:`,
                ingredients
              );
              return;
            }

            ingredients.forEach((ing) => {
              if (
                typeof ing.ingredient_name === "string" &&
                typeof ing.useItem === "number" &&
                ing.useItem >= 0
              ) {
                uniqueIngredients.add(ing.ingredient_name.trim().toLowerCase()); // Normalize ingredient_name
              } else {
                console.error(
                  `ingredient ไม่ถูกต้องสำหรับ ${item.menu_name}:`,
                  ing
                );
              }
            });
          } catch (e) {
            console.error(
              `ไม่สามารถแปลงส่วนผสมสำหรับ ${item.menu_name}:`,
              e,
              item.menu_ingredients
            );
          }
        });

        // Fetch ingredient units in bulk
        const units: Record<string, string> = {};
        if (uniqueIngredients.size > 0) {
          const response = await fetch(
            `/api/get/ingredients-name?names=${encodeURIComponent(
              [...uniqueIngredients].join(",")
            )}`
          );
          if (response.ok) {
            const data: IngredientUnit[] | { error: string } =
              await response.json();
            if ("error" in data) {
              throw new Error(data.error);
            }
            console.log("Ingredient units from API:", data); // Debug log
            (data as IngredientUnit[]).forEach((unit) => {
              if (unit.ingredient_name && unit.ingredient_unit) {
                units[unit.ingredient_name.trim().toLowerCase()] =
                  unit.ingredient_unit; // Normalize ingredient_name
              } else {
                console.warn(
                  `Invalid unit data for ${unit.ingredient_name}:`,
                  unit.ingredient_unit
                );
              }
            });
          } else {
            throw new Error("ไม่สามารถดึงข้อมูลหน่วยวัตถุดิบได้");
          }
        }

        console.log("Final ingredientUnits:", units); // Debug log
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
  const formatIngredients = (ingredientsInput: unknown) => {
    try {
      let ingredients: Ingredient[];
      if (Array.isArray(ingredientsInput)) {
        ingredients = ingredientsInput;
      } else if (typeof ingredientsInput === "string") {
        ingredients = JSON.parse(ingredientsInput);
      } else {
        console.error("ingredientsInput มีรูปแบบไม่ถูกต้อง:", ingredientsInput);
        return <span className="text-red-500">ข้อมูลส่วนผสมไม่ถูกต้อง</span>;
      }

      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return <span>ไม่มีวัตถุดิบ</span>;
      }

      // ตรวจสอบว่าแต่ละ ingredient มีโครงสร้างถูกต้อง
      const validIngredients = ingredients.filter(
        (ing) =>
          typeof ing.ingredient_name === "string" &&
          typeof ing.useItem === "number" &&
          ing.useItem >= 0
      );

      if (validIngredients.length === 0) {
        return <span className="text-red-500">ข้อมูลส่วนผสมไม่ถูกต้อง</span>;
      }

      return (
        <span>
          {validIngredients.map((ing, index) => {
            // Normalize ingredient_name to avoid mismatch
            const normalizedName = ing.ingredient_name.trim().toLowerCase();
            const unit = ingredientUnits[normalizedName] || "หน่วย";

            if (!ingredientUnits[normalizedName]) {
              console.warn(
                `No unit found for ingredient: ${ing.ingredient_name}`
              );
            }

            return (
              <span
                key={index}
                className={
                  !ingredientUnits[normalizedName] ? "text-gray-500" : ""
                }
                title={!ingredientUnits[normalizedName] ? "หน่วยไม่ระบุ" : ""}
              >
                {ing.ingredient_name} ใช้ {ing.useItem} {unit}
                {index < validIngredients.length - 1 ? ", " : ""}
              </span>
            );
          })}
        </span>
      );
    } catch (e) {
      console.error("ไม่สามารถแปลงส่วนผสม:", e, ingredientsInput);
      return <span className="text-red-500">ข้อมูลส่วนผสมไม่ถูกต้อง</span>;
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
