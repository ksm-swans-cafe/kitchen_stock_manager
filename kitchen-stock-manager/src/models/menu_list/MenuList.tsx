export interface Ingredient {
  useItem: number;
  ingredient_name: string;
}

export interface IngredientOption {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_unit: string;
}

export interface MenuItem {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string | Ingredient[];
  menu_category: string;
  menu_subname: string;
  menu_description?: string;
}

export interface IngredientUnit {
  ingredient_name: string;
  ingredient_unit: string;
}
