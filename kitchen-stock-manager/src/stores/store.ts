// stores/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard-model";

export interface CartItem extends MenuItem {
  menu_total: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string | number) => void;
  setItemQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.menu_id === item.menu_id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menu_id === item.menu_id
                ? { ...i, menu_total: i.menu_total + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, menu_total: 1 }],
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
        set({ items: [] });
        localStorage.removeItem("cart-storage");
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
