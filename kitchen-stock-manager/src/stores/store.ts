import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/models/menu_card/MenuCard";

function generateCartItemId(menuId: string, description: string): string {
  return `${menuId}-${description}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface CartItem extends MenuItem {
  menu_total: number;
  menu_description: string;
  item_id: string;
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
  channel_access: string;
  customer_name: string;
  customer_tel: string;
  location_send: string;
  delivery_date: string;
  lunchbox: LunchBox[];
  export_time: string;
  receive_time: string;
  shipping_cost: string;
  shipping_by: string;
  lunch_box: string;
  lunch_box_set: string;
  selected_lunchboxes: SelectedLunchbox[];
  addItem: (item: MenuItem, description?: string) => void;
  removeItem: (cartItemId: string) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: {
    channel_access?: string;
    name?: string;
    tel?: string;
    location?: string;
    deliveryDate?: string;
    exportTime?: string;
    receiveTime?: string;
    shipping_cost?: string;
    shipping_by?: string;
    lunchbox?: string;
    lunchbox_set?: string;
    receive_name?: string;
    invoice_tex?: string;
    pay_type?: string;
    pay_deposit?: string;
    pay_isdeposit?: boolean;
    pay_cost?: string;
    pay_charge?: string;
    total_remain?: string;
    total_cost_lunchbox?: string;
    total_cost?: string;
    description?: CartCartDescription[];
    ispay?: string;
    order_name?: string;
  }) => void;
  addLunchbox: (lunchbox: SelectedLunchbox) => void;
  removeLunchbox: (index: number) => void;
  updateLunchboxQuantity: (index: number, quantity: number) => void;
  updateLunchboxMenus: (index: number, menus: MenuItem[]) => void;
  updateLunchboxTotalCost: (index: number, totalCost: string) => void;
  updateLunchboxNote: (index: number, note: string) => void;
  receive_name: string;
  invoice_tex: string;
  pay_type: string;
  pay_deposit: string;
  pay_isdeposit: boolean;
  pay_cost: string;
  pay_charge: string;
  total_cost_lunchbox: string;
  total_remain: string;
  total_cost: string;
  description: CartCartDescription[];
  ispay: string;
  order_name: string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      channel_access: "",
      customer_name: "",
      customer_tel: "",
      location_send: "",
      delivery_date: "",
      lunchbox: [],
      export_time: "",
      receive_time: "",
      shipping_cost: "",
      shipping_by: "",
      lunch_box: "",
      lunch_box_set: "",
      selected_lunchboxes: [],
      receive_name: "",
      invoice_tex: "",
      pay_type: "",
      pay_deposit: "",
      pay_isdeposit: false,
      pay_cost: "",
      pay_charge: "",
      total_cost_lunchbox: "",
      total_remain: "",
      total_cost: "",
      description: [],
      ispay: "",
      order_name: "",
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
                item_id: cartItemId,
              },
            ],
          });
        }
      },

      removeItem: (cartItemId) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.item_id === cartItemId);

        if (existingIndex !== -1) {
          const existing = items[existingIndex];
          if (existing.menu_total > 1) {
            set({
              items: items.map((i, index) => (index === existingIndex ? { ...i, menu_total: i.menu_total - 1 } : i)),
            });
          } else {
            set({
              items: items.filter((i) => i.item_id !== cartItemId),
            });
          }
        }
      },

      setItemQuantity: (cartItemId, quantity) => {
        const { items } = get();
        set({
          items: items.map((i) => (i.item_id === cartItemId ? { ...i, menu_total: quantity } : i)),
        });
      },

      clearCart: () => {
        set({
          items: [],
          channel_access: "",
          customer_name: "",
          customer_tel: "",
          location_send: "",
          delivery_date: "",
          lunchbox: [],
          export_time: "",
          receive_time: "",
          shipping_cost: "",
          shipping_by: "",
          lunch_box: "",
          lunch_box_set: "",
          selected_lunchboxes: [],
          receive_name: "",
          invoice_tex: "",
          pay_type: "",
          pay_deposit: "",
          pay_isdeposit: false,
          pay_cost: "",
          pay_charge: "",
          total_cost_lunchbox: "",
          total_remain: "",
          total_cost: "",
          description: [],
          ispay: "",
          order_name: "",
        });
      },

      setCustomerInfo: (info) => {
        set((state) => ({
          channel_access: info.channel_access ?? state.channel_access,
          customer_name: info.name ?? state.customer_name,
          customer_tel: info.tel ?? state.customer_tel,
          location_send: info.location ?? state.location_send,
          delivery_date: info.deliveryDate ?? state.delivery_date,
          export_time: info.exportTime ?? state.export_time,
          receive_time: info.receiveTime ?? state.receive_time,
          shipping_cost: info.shipping_cost ?? state.shipping_cost,
          shipping_by: info.shipping_by ?? state.shipping_by,
          lunchbox: typeof info.lunchbox === "string" ? state.lunchbox : info.lunchbox ?? state.lunchbox,
          lunch_box: typeof info.lunchbox === "string" ? info.lunchbox : state.lunch_box,
          lunch_box_set: info.lunchbox_set ?? state.lunch_box_set,
          receive_name: info.receive_name ?? state.receive_name,
          invoice_tex: info.invoice_tex ?? state.invoice_tex,
          pay_type: info.pay_type ?? state.pay_type,
          pay_deposit: info.pay_deposit ?? state.pay_deposit,
          pay_isdeposit: info.pay_isdeposit ?? state.pay_isdeposit,
          pay_cost: info.pay_cost ?? state.pay_cost,
          pay_charge: info.pay_charge ?? state.pay_charge,
          total_cost_lunchbox: info.total_cost_lunchbox ?? state.total_cost_lunchbox,
          total_remain: info.total_remain ?? state.total_remain,
          total_cost: info.total_cost ?? state.total_cost,
          description: info.description ?? state.description,
          ispay: info.ispay ?? state.ispay,
          order_name: info.order_name ?? state.order_name,
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
