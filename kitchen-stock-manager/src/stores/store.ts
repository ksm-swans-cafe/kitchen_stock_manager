import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard";

export interface CartItem extends MenuItem {
  menu_total: number;
  menu_description: string;
  cart_item_id: string;
}

export interface LunchBox {
  lunchbox_name: string;
  lunchbox_set: string;
  lunchbox_limit: number;
  lunchbox_menu_items: MenuItem[];
  lunchbox_total_lunchbox: number;
  lunchbox_total_price: number;
}

interface SelectedLunchbox {
  lunchbox_name: string;
  lunchbox_set: string;
  lunchbox_limit: number;
  selected_menus: MenuItem[];
  quantity: number;
  lunchbox_total_cost: string;
}

interface CartState {
  items: CartItem[];
  cart_customer_name: string;
  cart_customer_tel: string;
  cart_location_send: string;
  cart_delivery_date: string;
  cart_lunchbox: LunchBox[];
  cart_export_time: string;
  cart_receive_time: string;
  cart_shipping_cost: string;
  // เพิ่มฟิลด์ใหม่
  cart_lunch_box: string;
  cart_lunch_box_set: string;
  selected_lunchboxes: SelectedLunchbox[];
  addItem: (item: MenuItem, description?: string) => void;
  removeItem: (cartItemId: string) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: { name?: string; tel?: string; location?: string; deliveryDate?: string; exportTime?: string; receiveTime?: string; cart_shipping_cost?: string; lunchbox?: string; lunchbox_set?: string }) => void;
  // เพิ่มฟังก์ชันใหม่
  addLunchbox: (lunchbox: SelectedLunchbox) => void;
  removeLunchbox: (index: number) => void;
  updateLunchboxQuantity: (index: number, quantity: number) => void;
  updateLunchboxMenus: (index: number, menus: MenuItem[]) => void;
  updateLunchboxTotalCost: (index: number, totalCost: string) => void;
}

const generateCartItemId = (menuId: string | undefined, description: string) => {
  return `${menuId || "no-id"}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${description.replace(/\s+/g, "_")}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cart_customer_name: "",
      cart_customer_tel: "",
      cart_location_send: "",
      cart_delivery_date: "",
      cart_lunchbox: [],
      cart_export_time: "",
      cart_receive_time: "",
      cart_shipping_cost: "",
      cart_lunch_box: "",
      cart_lunch_box_set: "",
      selected_lunchboxes: [],

      addItem: (item, description = "") => {
        const { items } = get();
        const finalDescription = description || item.menu_description || "";
        const cartItemId = generateCartItemId(item.menu_id || "", finalDescription);

        const existingIndex = items.findIndex((i) => i.menu_id === item.menu_id && i.menu_description === finalDescription);

        if (existingIndex !== -1) {
          set({
            items: items.map((i, index) => (index === existingIndex ? { ...i, menu_total: i.menu_total + 1 } : i)),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                menu_total: 1,
                menu_description: finalDescription,
                cart_item_id: cartItemId,
              },
            ],
          });
        }
      },

      removeItem: (cartItemId) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.cart_item_id === cartItemId);

        if (existingIndex !== -1) {
          const existing = items[existingIndex];
          if (existing.menu_total > 1) {
            set({
              items: items.map((i, index) => (index === existingIndex ? { ...i, menu_total: i.menu_total - 1 } : i)),
            });
          } else {
            set({
              items: items.filter((i) => i.cart_item_id !== cartItemId),
            });
          }
        }
      },

      setItemQuantity: (cartItemId, quantity) => {
        const { items } = get();
        set({
          items: items.map((i) => (i.cart_item_id === cartItemId ? { ...i, menu_total: quantity } : i)),
        });
      },

      clearCart: () => {
        set({
          items: [],
          cart_customer_name: "",
          cart_customer_tel: "",
          cart_location_send: "",
          cart_delivery_date: "",
          cart_lunchbox: [],
          cart_export_time: "",
          cart_receive_time: "",
          cart_shipping_cost: "",
          cart_lunch_box: "",
          cart_lunch_box_set: "",
          selected_lunchboxes: [],
        });
      },

      setCustomerInfo: (info) => {
        set((state) => ({
          cart_customer_name: info.name ?? state.cart_customer_name,
          cart_customer_tel: info.tel ?? state.cart_customer_tel,
          cart_location_send: info.location ?? state.cart_location_send,
          cart_delivery_date: info.deliveryDate ?? state.cart_delivery_date,
          cart_export_time: info.exportTime ?? state.cart_export_time,
          cart_receive_time: info.receiveTime ?? state.cart_receive_time,
          cart_shipping_cost: info.cart_shipping_cost ?? state.cart_shipping_cost,
          cart_lunchbox: info.lunchbox ?? state.cart_lunchbox,
          cart_lunch_box: info.lunchbox ?? state.cart_lunch_box,
          cart_lunch_box_set: info.lunchbox_set ?? state.cart_lunch_box_set,
        }));
      },

      // ฟังก์ชันใหม่สำหรับจัดการ lunchbox
      addLunchbox: (lunchbox) => {
        set((state) => ({
          selected_lunchboxes: [...state.selected_lunchboxes, lunchbox],
        }));
      },

      removeLunchbox: (index) => {
        set((state) => ({
          selected_lunchboxes: state.selected_lunchboxes.filter((_, i) => i !== index),
        }));
      },

      updateLunchboxQuantity: (index, quantity) => {
        set((state) => ({
          selected_lunchboxes: state.selected_lunchboxes.map((item, i) => (i === index ? { ...item, quantity } : item)),
        }));
      },

      updateLunchboxMenus: (index, menus) => {
        set((state) => ({
          selected_lunchboxes: state.selected_lunchboxes.map((item, i) => (i === index ? { ...item, selected_menus: menus } : item)),
        }));
      },

      updateLunchboxTotalCost: (index, totalCost) => {
        set((state) => ({
          selected_lunchboxes: state.selected_lunchboxes.map((item, i) => (i === index ? { ...item, lunchbox_total_cost: totalCost } : item)),
        }));
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
