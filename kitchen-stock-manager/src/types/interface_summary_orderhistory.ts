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
  cart_shipping_cost: string;
  menuItems: MenuItem[];
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
    ingredient_status: boolean;
  }[];
  order_number: string;
  cart_customer_name?: string;
  cart_delivery_date?: string;
  cart_receive_time?: string;
  cart_export_time?: string;
  cart_customer_tel?: string;
  cart_location_send?: string;
  cart_invoice_tex?: string;
  cart_lunchbox: Lunchbox[];
}

export interface CartItem extends MenuItem {
  totalPrice?: number;
}

export type RawCart = {
  _id?: string; // เพิ่ม _id field
  cart_id: string;
  cart_menu_items: string | MenuItem[];
  cart_create_date: string;
  cart_total_price: number;
  cart_total_cost_lunchbox?: string;
  cart_status: string;
  cart_order_number: string;
  cart_username: string;
  cart_customer_tel: string;
  cart_lunch_box: string;
  cart_lunch_box_set: string;
  cart_customer_name: string;
  cart_location_send: string;
  cart_delivery_date: string;
  cart_export_time: string;
  cart_receive_time: string;
  cart_shipping_cost: string;
  cart_invoice_tex?: string;
  cart_lunchbox: string | Lunchbox[];
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
  cart_receive_time?: string;
  cart_export_time?: string;
  cart: Cart;
  onOrderSummaryClick?: (cart: Cart) => void;
}
