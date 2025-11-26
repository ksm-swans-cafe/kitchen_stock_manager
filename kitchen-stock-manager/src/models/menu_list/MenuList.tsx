export interface Ingredient {
  useItem: number;
  ingredient_name: string;
}

export interface IngredientOption {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_unit: string;
}

export interface MenuLunchbox {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_cost: number;
  lunchbox_menu_category: string;
}

export interface MenuItem {
  menu_id: string;
  menu_name: string;
  menu_ingredients: string | Ingredient[];
  menu_category: string;
  menu_subname: string;
  menu_description?: string;
  menu_lunchbox: MenuLunchbox[];
  menu_cost: number;
}

export interface IngredientUnit {
  ingredient_name: string;
  ingredient_unit: string;
}
