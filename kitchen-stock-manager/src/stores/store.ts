import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard";

export interface CartItem extends MenuItem {
  menu_total: number;
  menu_description: string;
  cart_item_id: string;
}

interface CartState {
  items: CartItem[];
  cart_customer_name: string;
  cart_customer_tel: string;
  cart_location_send: string;
  cart_delivery_date: string;
  cart_export_time: string;
  cart_receive_time: string;
  cart_shipping_cost: string;
  addItem: (item: MenuItem, description?: string) => void;
  removeItem: (cartItemId: string) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: { name?: string; tel?: string; location?: string; deliveryDate?: string; exportTime?: string; receiveTime?: string; cart_shipping_cost?: string }) => void;
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
      cart_export_time: "",
      cart_receive_time: "",
      cart_shipping_cost: "",

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
          cart_export_time: "",
          cart_receive_time: "",
          cart_shipping_cost: "",
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
        }));
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
