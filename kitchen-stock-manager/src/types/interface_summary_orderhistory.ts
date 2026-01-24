export interface Ingredient {
  ingredient_id?: number;
  ingredient_name: string;
  useItem: number;
  calculatedTotal?: number;
  sourceMenu?: string;
  isChecked?: boolean;
  ingredient_status?: boolean;
  ingredient_price_per_unit?: number;
  totalCost?: number;
  ingredient_unit?: string;
}

export interface MenuItem {
  menu_name: string;
  menu_category: string;
  menu_subname: string;
  menu_total: number;
  menu_ingredients: Ingredient[];
  menu_description?: string;
  menu_order_id?: number;
  status?: string;
  order_number?: string;
}

export interface LunchboxMenu {
  menu_name: string;
  menu_subname: string;
  menu_category: string;
  menu_total: number;
  menu_ingredients: Ingredient[];
  menu_description: string;
  menu_cost: number;
  menu_order_id: number;
}

export interface Lunchbox {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_total: number;
  lunchbox_total_cost: number;
  lunchbox_menu: LunchboxMenu[];
}

export interface Cart {
  id: string;
  orderNumber: string;
  name: string;
  date: string;
  dateISO: string;
  time: string;
  sets: number;
  price: number;
  status: string;
  createdBy: string;
  shipping_cost: string;
  menuItems: MenuItem[];
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
    ingredient_status: boolean;
  }[];
  order_number: string;
  customer_name?: string;
  delivery_date?: string;
  receive_time?: string;
  export_time?: string;
  customer_tel?: string;
  location_send?: string;
  invoice_tex?: string;
  lunchbox: Lunchbox[];
}

export interface CartItem extends MenuItem {
  totalPrice?: number;
}

export type RawCart = {
  _id?: string;
  id: string;
  menu_items: string | MenuItem[];
  create_date: string;
  total_price: number;
  total_cost_lunchbox?: string;
  status: string;
  order_number: string;
  username: string;
  customer_tel: string;
  lunch_box: string;
  lunch_box_set: string;
  customer_name: string;
  location_send: string;
  delivery_date: string;
  export_time: string;
  receive_time: string;
  shipping_cost: string;
  invoice_tex?: string;
  lunchbox: string | Lunchbox[];
};

export type ResponsiveOrderIdProps = {
  id: string | number;
  maxFontSize?: number;
  minFontSize?: number;
};

export type StatusOption = {
  label: string;
  value: string;
};

export interface StatusDropdownProps {
  cartId: string;
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
  }[];
  defaultStatus?: string;
  onUpdated?: () => void;
  receive_time?: string;
  export_time?: string;
  cart: Cart;
  onOrderSummaryClick?: (cart: Cart) => void;
  onPaymentCompleted?: (cart: Cart) => void;
}
