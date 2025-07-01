import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard-model";

export interface CartItem extends MenuItem {
  menu_total: number;
}

interface CartState {
  items: CartItem[];
  cart_customer_name: string;
  cart_customer_tel: string;
  cart_location_send: string;
  cart_delivery_date: string;

  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string | number) => void;
  setItemQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: {
    name?: string;
    tel?: string;
    location?: string;
    deliveryDate?: string;
  }) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cart_customer_name: "",
      cart_customer_tel: "",
      cart_location_send: "",
      cart_delivery_date: "",

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.menu_id === item.menu_id);
        if (!existing) {
          set({
            items: [...items, { ...item, menu_total: 1 }],
          });
        } else {
          set({
            items: items.map((i) =>
              i.menu_id === item.menu_id
                ? { ...i, menu_total: i.menu_total + 1 }
                : i
            ),
          });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        const existing = items.find((i) => i.menu_id === itemId);
        if (existing && existing.menu_total > 1) {
          set({
            items: items.map((i) =>
              i.menu_id === itemId
                ? { ...i, menu_total: i.menu_total - 1 }
                : i
            ),
          });
        } else {
          set({
            items: items.filter((i) => i.menu_id !== itemId),
          });
        }
      },

      setItemQuantity: (itemId, quantity) => {
        const { items } = get();
        set({
          items: items.map((i) =>
            i.menu_id === itemId ? { ...i, menu_total: quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({
          items: [],
          cart_customer_name: "",
          cart_customer_tel: "",
          cart_location_send: "",
          cart_delivery_date: "",
        });
        localStorage.removeItem("cart-storage");
      },

      setCustomerInfo: ({ name, tel, location, deliveryDate }) => {
        set((state) => ({
          cart_customer_name: name ?? state.cart_customer_name,
          cart_customer_tel: tel ?? state.cart_customer_tel,
          cart_location_send: location ?? state.cart_location_send,
          cart_delivery_date: deliveryDate ?? state.cart_delivery_date,
        }));
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
