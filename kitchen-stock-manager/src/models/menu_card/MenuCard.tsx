export interface Ingredients {
  useItem: number;
  ingredient_id: string;
  ingredient_status: boolean;
}

export interface MenuItem {
  imageUrl: string;
  menu_id: string;
  menu_name: string;
  menu_subname: string;
  menu_category: string;
  menu_cost: number;
  menu_ingredients: Ingredients[];
  menu_total: number;
  menu_description: string;
  menu_order_id: number;
}

export interface DetailIngredient extends Ingredients{
  // ingredient_id: string;
  ingredient_name: string;
  ingredient_total: number;
  ingredient_unit: string;
  ingredient_lastupdate: string;
  ingredient_image: string;
  ingredient_total_alert: number;
  ingredient_status_value: string;
  ingredient_category: string;
  ingredient_sub_category: string;
  ingredient_price: number;
  transaction_from_username: string;
}

// export interface newIngredient{
//   ingredient_id? : string;
//   ingredient_name? : string;
//   ingredient_total? : number;
//   ingredient_unit? : string;
//   ingredient_lastupdate? : string;
//   ingredient_image? : string;
//   ingredient_total_alert? : number;
//   ingredient_status? : string;
//   ingredient_category?: string;
//   ingredient_sub_category?: string;
// };
