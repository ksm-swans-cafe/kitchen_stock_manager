import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard-model";

/** ====== เพิ่มชนิดข้อมูลสำหรับหมายเหตุย่อยต่อเมนู ====== */
export interface CartItemNote {
  id: string;   // ไอดีของหมายเหตุย่อย 1 แถว
  qty: number;  // จำนวนย่อยของหมายเหตุแถวนั้น
  note: string; // ข้อความหมายเหตุ เช่น "เผ็ดน้อย", "ไม่ใส่พริก"
}
export interface CartItem extends MenuItem {
  menu_total: number;
  notes?: CartItemNote[]; // เพิ่มฟิลด์ notes สำหรับเก็บหมายเหตุย่อย
}

interface CartState {
  items: CartItem[];
  cart_customer_name: string;
  cart_customer_tel: string;
  cart_location_send: string;
  cart_delivery_date: string;
  cart_export_time: string;
  cart_receive_time: string;

  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string | number) => void;
  setItemQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: {
    name?: string;
    tel?: string;
    location?: string;
    deliveryDate?: string;
    exportTime?: string;
    receiveTime?: string;
  }) => void;

  /** ====== actions สำหรับหมายเหตุย่อย ====== */
  addItemNote: (itemId: string | number, partial?: { qty?: number; note?: string }) => void;
  updateItemNote: (itemId: string | number, noteId: string, partial: { qty?: number; note?: string }) => void;
  removeItemNote: (itemId: string | number, noteId: string) => void;
  setItemNotes: (itemId: string | number, notes: CartItemNote[]) => void;
}

/** ตัวช่วยสร้าง id สั้น ๆ */
const uid = () => Math.random().toString(36).slice(2, 10);

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

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.menu_id === item.menu_id);
        if (!existing) {
          set({
            items: [...items, { ...item, menu_total: 1, notes: [] }],
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
              i.menu_id === itemId ? { ...i, menu_total: i.menu_total - 1 } : i
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
          cart_export_time: "",
          cart_receive_time: "",
        });
        localStorage.removeItem("cart-storage");
      },

      setCustomerInfo: ({
        name,
        tel,
        location,
        deliveryDate,
        exportTime,
        receiveTime,
      }) => {
        set((state) => ({
          cart_customer_name: name ?? state.cart_customer_name,
          cart_customer_tel: tel ?? state.cart_customer_tel,
          cart_location_send: location ?? state.cart_location_send,
          cart_delivery_date: deliveryDate ?? state.cart_delivery_date,
          cart_export_time: exportTime ?? state.cart_export_time,
          cart_receive_time: receiveTime ?? state.cart_receive_time,
        }));
      },
    /** ====== หมายเหตุย่อยต่อเมนู ====== */
      addItemNote: (itemId, partial = {}) =>
        set((state) => {
          const items = state.items.map((it) => {
            if (it.menu_id !== itemId) return it;
            const nextNotes = [...(it.notes ?? [])];
            nextNotes.push({
              id: uid(),
              qty: Math.max(0, Math.floor(partial.qty ?? 1)),
              note: (partial.note ?? "").trim(),
            });
            return { ...it, notes: nextNotes };
          });
          return { ...state, items };
        }),

      updateItemNote: (itemId, noteId, partial) =>
        set((state) => {
          const items = state.items.map((it) => {
            if (it.menu_id !== itemId) return it;
            const notes = (it.notes ?? []).map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    qty:
                      partial.qty !== undefined
                        ? Math.max(0, Math.floor(partial.qty))
                        : n.qty,
                    note:
                      partial.note !== undefined
                        ? partial.note.trim()
                        : n.note,
                  }
                : n
            );
            return { ...it, notes };
          });
          return { ...state, items };
        }),

      removeItemNote: (itemId, noteId) =>
        set((state) => {
          const items = state.items.map((it) => {
            if (it.menu_id !== itemId) return it;
            const notes = (it.notes ?? []).filter((n) => n.id !== noteId);
            return { ...it, notes };
          });
          return { ...state, items };
        }),

      setItemNotes: (itemId, notes) =>
        set((state) => {
          const items = state.items.map((it) =>
            it.menu_id === itemId
              ? {
                  ...it,
                  notes: notes.map((n) => ({
                    ...n,
                    qty: Math.max(0, Math.floor(n.qty)),
                    note: (n.note ?? "").trim(),
                  })),
                }
              : it
          );
          return { ...state, items };
        }),
    }),
    {
      name: "cart-storage",
    }
  )
);

/** (ออปชัน) ตัวช่วย sum จำนวนย่อยไว้ใช้ validate ตอน submit */
export const sumNotesQty = (notes?: CartItemNote[]) =>
  (notes ?? []).reduce((acc, n) => acc + (Number(n.qty) || 0), 0);
