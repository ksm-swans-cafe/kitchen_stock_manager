"use client";

import { useState, useEffect } from "react";

interface Ingredient {
  useItem: number;
  ingredient_name: string;
}

interface IngredientOption {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_unit: string;
}

export default function AddMenuPage() {
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { useItem: 0, ingredient_name: "" },
  ]);
  const [menuSubName, setMenuSubName] = useState("เมนู");
  const [ingredientOptions, setIngredientOptions] = useState<
    IngredientOption[]
  >([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await fetch("/api/get/ingredients");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setIngredientOptions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load ingredient options"
        );
      }
    }
    fetchIngredients();
  }, []);

  const getStepValue = (unit: string): string => {
    if (["กรัม", "ฟอง", "ชิ้น", "มิลลิลิตร"].includes(unit)) return "1";
    return "0.01";
  };

  const formatNumber = (value: number, unit: string): number => {
    if (["กรัม", "ฟอง", "ชิ้น", "มิลลิลิตร"].includes(unit)) {
      return Math.floor(value);
    }
    return value;
  };

  const sortIngredients = (list: Ingredient[]) => {
    return [...list].sort((a, b) =>
      a.ingredient_name.localeCompare(b.ingredient_name)
    );
  };

  const handleAddIngredient = () => {
    const updated = [...ingredients, { useItem: 0, ingredient_name: "" }];
    setIngredients(sortIngredients(updated));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    const unit =
      ingredientOptions.find(
        (opt) => opt.ingredient_name === newIngredients[index].ingredient_name
      )?.ingredient_unit || "";
    if (field === "useItem" && typeof value === "string") {
      const formattedValue = formatNumber(Number(value), unit);
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: formattedValue,
      };
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: value,
      };
    }
    setIngredients(sortIngredients(newIngredients));
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(sortIngredients(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!menuName.trim()) {
      setError("Menu name is required");
      setIsSubmitting(false);
      return;
    }

    if (
      ingredients.some(
        (ing) =>
          !ing.ingredient_name.trim() ||
          ing.useItem <= 0 ||
          !ingredientOptions.some(
            (opt) => opt.ingredient_name === ing.ingredient_name
          )
      )
    ) {
      setError("All ingredients must have a valid name and quantity");
      setIsSubmitting(false);
      return;
    }

    if (!menuSubName.trim()) {
      setError("Menu sub name is required");
      setIsSubmitting(false);
      return;
    }

    const sortedIngredients = sortIngredients(ingredients);

    const confirmationMessage = `
      Please confirm the following details:
      - Menu Name: ${menuName}
      - Ingredients: ${sortedIngredients
        .map((ing) => `${ing.useItem} x ${ing.ingredient_name}`)
        .join(", ")}
      - Sub Name: ${menuSubName}
      Do you want to proceed?
    `;

    if (!window.confirm(confirmationMessage)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("menu_name", menuName);
      formData.append("menu_ingredients", JSON.stringify(sortedIngredients));
      formData.append("menu_subname", menuSubName);

      const response = await fetch("/api/post/menu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create menu");
      }

      setMenuName("");
      setIngredients([{ useItem: 0, ingredient_name: "" }]);
      setMenuSubName("");
      setError("Menu created successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Menu Item</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="menuName"
            className="block text-sm font-medium text-gray-700"
          >
            Menu Name
          </label>
          <input
            type="text"
            id="menuName"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Enter menu name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients
          </label>
          {sortIngredients(ingredients).map((ingredient, index) => {
            const selectedOption = ingredientOptions.find(
              (opt) => opt.ingredient_name === ingredient.ingredient_name
            );
            const stepValue = selectedOption
              ? getStepValue(selectedOption.ingredient_unit)
              : "0.01";

            return (
              <div key={index} className="flex items-center space-x-4 mb-2">
                <select
                  value={ingredient.ingredient_name}
                  onChange={(e) =>
                    handleIngredientChange(
                      index,
                      "ingredient_name",
                      e.target.value
                    )
                  }
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select Ingredient</option>
                  {ingredientOptions
                    .slice()
                    .sort((a, b) =>
                      a.ingredient_name.localeCompare(b.ingredient_name)
                    )
                    .map((option) => (
                      <option
                        key={option.ingredient_id}
                        value={option.ingredient_name}
                      >
                        {option.ingredient_name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  step={stepValue}
                  min="0"
                  value={ingredient.useItem}
                  onChange={(e) =>
                    handleIngredientChange(index, "useItem", e.target.value)
                  }
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Quantity"
                  required
                />
                <select
                  value={selectedOption?.ingredient_unit || ""}
                  disabled
                  className="w-32 rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Unit</option>
                  {[
                    ...new Set(
                      ingredientOptions.map((opt) => opt.ingredient_unit)
                    ),
                  ].map((unit, i) => (
                    <option key={i} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddIngredient}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            + Add Ingredient
          </button>
        </div>

        <div>
          <label
            htmlFor="menuSubName"
            className="block text-sm font-medium text-gray-700"
          >
            Menu SubName
          </label>
          <input
            type="text"
            id="menuSubName"
            value={menuSubName}
            onChange={(e) => {
              const input = e.target.value;
              if (input.startsWith("เมนู")) {
                setMenuSubName(input);
              } else {
                setMenuSubName("เมนู" + input);
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="เช่น แกง, ข้าว"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Add Menu"}
          </button>
        </div>
      </form>
    </div>
  );
}
