export interface Ingredients {
  useItem?: number;
  ingredient_id?: string;
}

export interface MenuItem {
  imageUrl?: string;
  menu_id?: string;
  menu_name?: string;
  menu_price?: number;
  menu_ingredients?: Ingredients[];
  menu_total?: number;
  description?: string;
}

export interface ingredient{
  ingredient_id? : string;
  ingredient_name? : string;
  ingredient_total? : number;
  ingredient_unit? : string;
  ingredient_lastupdate? : string;
  ingredient_image? : string;
  ingredient_total_alert? : number;
  ingredient_status? : string;
};

export interface newIngredient{
  ingredient_id? : string;
  ingredient_name? : string;
  ingredient_total? : number;
  ingredient_unit? : string;
  ingredient_lastupdate? : string;
  ingredient_image? : string;
  ingredient_total_alert? : number;
  ingredient_status? : string;
};
