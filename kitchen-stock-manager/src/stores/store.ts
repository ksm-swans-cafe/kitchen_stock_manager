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
  note?: string; // เพิ่ม note field
}

interface CartCartDescription {
  description_id: string;
  description_title: string;
  description_value: string;
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
  cart_lunch_box: string;
  cart_lunch_box_set: string;
  selected_lunchboxes: SelectedLunchbox[];
  addItem: (item: MenuItem, description?: string) => void;
  removeItem: (cartItemId: string) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: {
    name?: string;
    tel?: string;
    location?: string;
    deliveryDate?: string;
    exportTime?: string;
    receiveTime?: string;
    cart_shipping_cost?: string;
    lunchbox?: string;
    lunchbox_set?: string;
    receive_name?: string;
    invoice_tex?: string;
    pay_type?: string;
    pay_deposit?: string;
    pay_isdeposit?: boolean;
    pay_cost?: string;
    total_remain?: string;
    total_cost_lunchbox?: string;
    total_cost?: string;
    description?: CartCartDescription[];
  }) => void;
  addLunchbox: (lunchbox: SelectedLunchbox) => void;
  removeLunchbox: (index: number) => void;
  updateLunchboxQuantity: (index: number, quantity: number) => void;
  updateLunchboxMenus: (index: number, menus: MenuItem[]) => void;
  updateLunchboxTotalCost: (index: number, totalCost: string) => void;
  updateLunchboxNote: (index: number, note: string) => void;
  cart_receive_name: string;
  cart_invoice_tex: string;
  cart_pay_type: string;
  cart_pay_deposit: string;
  cart_pay_isdeposit: boolean;
  cart_pay_cost: string;
  cart_total_cost_lunchbox: string;
  cart_total_remain: string;
  cart_total_cost: string;
  cart_description: CartCartDescription[];
}

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
      cart_receive_name: "",
      cart_invoice_tex: "",
      cart_pay_type: "",
      cart_pay_deposit: "",
      cart_pay_isdeposit: false,
      cart_pay_cost: "",
      cart_total_cost_lunchbox: "",
      cart_total_remain: "",
      cart_total_cost: "",
      cart_description: [],

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
          cart_receive_name: "",
          cart_invoice_tex: "",
          cart_pay_type: "",
          cart_pay_deposit: "",
          cart_pay_isdeposit: false,
          cart_pay_cost: "",
          cart_total_cost_lunchbox: "",
          cart_total_remain: "",
          cart_total_cost: "",
          cart_description: [],
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
          cart_lunchbox: typeof info.lunchbox === "string" ? state.cart_lunchbox : info.lunchbox ?? state.cart_lunchbox,
          cart_lunch_box: typeof info.lunchbox === "string" ? info.lunchbox : state.cart_lunch_box,
          cart_lunch_box_set: info.lunchbox_set ?? state.cart_lunch_box_set,
          cart_receive_name: info.receive_name ?? state.cart_receive_name,
          cart_invoice_tex: info.invoice_tex ?? state.cart_invoice_tex,
          cart_pay_type: info.pay_type ?? state.cart_pay_type,
          cart_pay_deposit: info.pay_deposit ?? state.cart_pay_deposit,
          cart_pay_isdeposit: info.pay_isdeposit ?? state.cart_pay_isdeposit,
          cart_pay_cost: info.pay_cost ?? state.cart_pay_cost,
          cart_total_cost_lunchbox: info.total_cost_lunchbox ?? state.cart_total_cost_lunchbox,
          cart_total_remain: info.total_remain ?? state.cart_total_remain,
          cart_total_cost: info.total_cost ?? state.cart_total_cost,
          cart_description: info.description ?? state.cart_description,
        }));
      },

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
          selected_lunchboxes: state.selected_lunchboxes.map((item, i) => {
            if (i === index) {
              const baseCost = item.lunchbox_total_cost ? Number(item.lunchbox_total_cost.replace(/[^\d]/g, "")) : 0;
              const originalQuantity = item.quantity || 1;
              const newCost = baseCost > 0 ? (baseCost / originalQuantity) * quantity : 0;

              return {
                ...item,
                quantity,
                lunchbox_total_cost: newCost > 0 ? newCost.toLocaleString("th-TH") : "",
              };
            }
            return item;
          }),
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

      updateLunchboxNote: (index, note) => {
        set((state) => ({
          selected_lunchboxes: state.selected_lunchboxes.map((item, i) => (i === index ? { ...item, note } : item)),
        }));
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
