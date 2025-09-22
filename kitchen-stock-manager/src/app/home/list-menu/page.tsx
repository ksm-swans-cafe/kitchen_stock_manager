"use client";

import { useState, useEffect } from "react";
import PaginationComponent from "@/components/ui/Totalpage";

interface Ingredient {
  useItem: number;
  ingredient_name: string;
}

interface IngredientOption {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_unit: string;
}

interface MenuItem {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string | Ingredient[];
  menu_subname: string;
}

interface IngredientUnit {
  ingredient_name: string;
  ingredient_unit: string;
}

export default function Page() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientUnits, setIngredientUnits] = useState<
    Record<string, string>
  >({});
  const [ingredientOptions, setIngredientOptions] = useState<
    IngredientOption[]
  >([]);
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { useItem: 0, ingredient_name: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // เพิ่ม state สำหรับ totalPages
  const [menuSubName, setMenuSubName] = useState("เมนู");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMenuId, setEditMenuId] = useState<string | null>(null);

  const itemsPerPage = 30;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [menuRes, ingOptRes] = await Promise.all([
          fetch(`/api/get/menu/page?page=${currentPage}&limit=${itemsPerPage}`),
          fetch("/api/get/ingredients"),
        ]);

        if (!menuRes.ok || !ingOptRes.ok) throw new Error("โหลดข้อมูลล้มเหลว");

        const { data: menuData, pagination } = await menuRes.json();
        console.log("Data: ", menuData);
        const ingredientOptions: IngredientOption[] = await ingOptRes.json();
        setIngredientOptions(ingredientOptions);
        setTotalPages(pagination.totalPages);

        const uniqueIngredients = new Set<string>();
        menuData.forEach((item: MenuItem) => {
          try {
            const ingredients =
              typeof item.menu_ingredients === "string"
                ? JSON.parse(item.menu_ingredients)
                : item.menu_ingredients;

            ingredients.forEach((ing: Ingredient) => {
              uniqueIngredients.add(ing.ingredient_name.trim().toLowerCase());
            });
          } catch { }
        });

        const res = await fetch(
          `/api/get/ingredients/list?names=${encodeURIComponent(
            [...uniqueIngredients].join(",")
          )}`
        );
        const units: IngredientUnit[] = await res.json();

        const unitMap: Record<string, string> = {};
        units.forEach((unit) => {
          unitMap[unit.ingredient_name.trim().toLowerCase()] =
            unit.ingredient_unit;
        });

        setIngredientUnits(unitMap);
        setMenuItems(menuData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const formatIngredients = (data: string | Ingredient[]) => {
    try {
      const ingredients = typeof data === "string" ? JSON.parse(data) : data;
      return (
        <span>
          {ingredients.map((ing: Ingredient, idx: number) => {
            const unit =
              ingredientUnits[ing.ingredient_name.trim().toLowerCase()] ||
              "หน่วย";
            return (
              <span key={idx}>
                {ing.ingredient_name} ใช้ {ing.useItem} {unit}
                {idx < ingredients.length - 1 ? ", " : ""}
              </span>
            );
          })}
        </span>
      );
    } catch {
      return <span className="text-red-500">ข้อมูลไม่ถูกต้อง</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("menu_name", menuName);
      formData.append("menu_ingredients", JSON.stringify(ingredients));
      formData.append("menu_subname", menuSubName);

      const res = await fetch(
        editMenuId ? `/api/edit/menu/${editMenuId}` : "/api/post/menu",
        {
          method: editMenuId ? "PATCH" : "POST",
          body: formData,
        }
      );

      if (!res.ok)
        throw new Error(
          editMenuId ? "ไม่สามารถแก้ไขเมนูได้" : "ไม่สามารถเพิ่มเมนูได้"
        );

      setMenuName("");
      setIngredients([{ useItem: 0, ingredient_name: "" }]);
      setMenuSubName("เมนู");
      setDialog(false);
      setEditMenuId(null);
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMenu = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?")) return;
    setIsSubmitting(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setMenuName(item.menu_name);
    setMenuSubName(item.menu_subname);
    setIngredients(
      typeof item.menu_ingredients === "string"
        ? JSON.parse(item.menu_ingredients)
        : item.menu_ingredients
    );
    setEditMenuId(item.menu_id);
    setDialog(true);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">รายการเมนู</h1>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex-1">
          <button
            onClick={() => {
              setDialog(true);
              setEditMenuId(null);
              setMenuName("");
              setMenuSubName("เมนู");
              setIngredients([{ useItem: 0, ingredient_name: "" }]);
            }}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            เพิ่มเมนู
          </button>
        </div>
      </div>

      {dialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-xl p-6 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setDialog(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="ชื่อเมนู"
                className="w-full border p-2"
                required
              />
              <input
                type="text"
                value={menuSubName}
                onChange={(e) => setMenuSubName(e.target.value)}
                placeholder="ชื่อรอง"
                className="w-full border p-2"
                required
              />
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={ing.ingredient_name}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].ingredient_name = e.target.value;
                      setIngredients(updated);
                    }}
                    className="flex-1 border p-2"
                  >
                    <option value="">เลือกวัตถุดิบ</option>
                    {ingredientOptions.map((opt) => (
                      <option
                        key={opt.ingredient_id}
                        value={opt.ingredient_name}
                      >
                        {opt.ingredient_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-24 border p-2"
                    value={ing.useItem}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].useItem = Number(e.target.value);
                      setIngredients(updated);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="text-red-500 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setIngredients([
                    ...ingredients,
                    { useItem: 0, ingredient_name: "" },
                  ])
                }
                className="text-blue-600"
              >
                + เพิ่มวัตถุดิบ
              </button>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setDialog(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "กำลังบันทึก..."
                    : editMenuId
                      ? "อัปเดตเมนู"
                      : "บันทึกเมนู"}
                </button>
              </div>
              {error && <div className="text-red-600">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="animate-pulse flex space-x-4">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-2/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 text-black">
          <thead className="text-black">
            <tr>
              <th className="py-2 px-4 border-b text-left">ชื่อเมนูอาหาร</th>
              <th className="py-2 px-4 border-b text-left">วัตถุดิบในอาหาร</th>
              <th className="py-2 px-4 border-b text-left">ชื่อเมนูรอง</th>
              <th className="py-2 px-4 border-b text-left">การ restraining</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-2 px-4 text-center">
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
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => openEditDialog(item)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => deleteMenu}
                      className="px-3 py-1 bg-yellow-400 text-white rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <PaginationComponent
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setMenuItems([]); 
            setCurrentPage(page); 
          }}
        />
      )}
    </div>
  );
}
