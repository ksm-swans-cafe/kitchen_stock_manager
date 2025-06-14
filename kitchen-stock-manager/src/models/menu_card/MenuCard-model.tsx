export interface MenuIngredient {
  useItem: number;
  ingredient_id: number;
}

export interface MenuItem {
  imageUrl?: string;
  menu_id?: string;
  menu_name?: string;
  menu_ingredients?: MenuIngredient[];
  menu_total?: string;
  description: string;
}

export interface ingredient{
  ingredient_id? : string,
  ingredient_name? : string,
  ingredient_total? : number,
  ingredient_unit? : string,
  ingredient_lastupdate? : string,
  ingredient_image? : string
  ingredient_total_alert? : number
};
