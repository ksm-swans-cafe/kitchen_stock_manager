// Dashboard Types

export interface DayItem {
  name: string;
  qty: number | string;
  lunchbox_name?: string;
  menu_ingredients?: MenuIngredient[];
  menu_description?: MenuItemDescription[];
}

export interface MenuIngredient {
  ingredient_name: string;
  ingredient_status?: boolean;
  useItem: number | string;
}

export interface MenuItemDescription {
  menu_description_id: string | null;
  menu_description_title: string;
  menu_description_value: string;
}

export interface CartDescription {
  description_id: string | null;
  description_title: string;
  description_value: string;
}

export interface PackagingNote {
  id: string;
  value: string;
}

export interface PackagingInfo {
  fukYai: number;
  box2Chan: number;
  box3Chan: number;
  notes: PackagingNote[];
}

export interface DayCard {
  id: number;
  cartId: string;
  dayOfWeek: string;
  dateTitle: string;
  rawDate: string;
  sendPlace: string;
  sendTime: string;
  receiveTime: string;
  items: DayItem[];
  totalText: string;
  isPinned?: boolean;
  minutesToSend?: number;
  description: CartDescription[];
  packaging: PackagingInfo;
}

export interface EditCardState {
  cartId: string;
  date: string;
  sendTime: string;
  receiveTime: string;
  location: string;
}

export interface ApiResponse {
  status: string;
  total: number;
  result: Array<{
    id: string;
    dayOfWeek: string;
    date: string;
    location: string;
    sendTime: string;
    receiveTime: string;
    items: Array<{
      lunchbox_name: string;
      set: string;
      quantity: number;
      packaging?: {
        fukYai: number;
        box2Chan: number;
        box3Chan: number;
      } | null;
      lunchbox_menu: Array<{
        menu_name: string;
        menu_quantity: number;
        menu_ingredients: MenuIngredient[];
        menu_description: MenuItemDescription[];
      }>;
    }>;
    description: CartDescription[];
    pinned: boolean;
    packaging_note: string;
  }>;
}
