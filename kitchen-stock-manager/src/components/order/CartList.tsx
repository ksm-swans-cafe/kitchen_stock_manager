"use client";

import React, { useEffect, useRef, useState } from "react";
import { registerLocale, DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Swal from "sweetalert2";
import { create } from "zustand";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/store";

import { useAuth } from "@/lib/auth/AuthProvider";

import { th } from "date-fns/locale/th";

import { LunchBox } from "@/stores/store";

import SetFoodSelect from "@/assets/set_food_select.png";
import Edit from "@/assets/edit.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import "./style.css";
registerLocale("th", th);

interface cartList {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  errors: string[];
  setErrors: (errors: string[]) => void;
  success: boolean;
  setSuccess: (success: boolean) => void;
  rawDate: string;
  setRawDate: (rawDate: string) => void;
  lunchbox: LunchBox[];
  setLunchbox: (lunchbox: LunchBox[]) => void;
  availableSets: string[];
  setAvailableSets: (availableSets: string[]) => void;
  isErrorVisible: boolean;
  setIsErrorVisible: (isErrorVisible: boolean) => void;
  copyText: string;
  setCopyText: (copyText: string) => void;
  isCopied: boolean;
  setIsCopied: (isCopied: boolean) => void;
  customChannelName: string;
  setCustomChannelName: (customChannelName: string) => void;
}

const useCartList = create<cartList>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
  errors: [],
  setErrors: (errors) => set({ errors }),
  success: false,
  setSuccess: (success) => set({ success }),
  rawDate: "",
  setRawDate: (rawDate) => set({ rawDate }),
  lunchbox: [],
  setLunchbox: (lunchbox) => set({ lunchbox }),
  availableSets: [],
  setAvailableSets: (availableSets) => set({ availableSets }),
  isErrorVisible: false,
  setIsErrorVisible: (isErrorVisible) => set({ isErrorVisible }),
  copyText: "",
  setCopyText: (copyText) => set({ copyText }),
  isCopied: false,
  setIsCopied: (isCopied) => set({ isCopied }),
  customChannelName: "",
  setCustomChannelName: (customChannelName) => set({ customChannelName }),
}));

const CustomDateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onClick, onChange, ...props }, ref) => (
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      onChange={onChange}
      readOnly
      className='w-full border rounded px-3 py-2 font-inherit'
      style={{ fontFamily: 'inherit' }}
      {...props}
    />
  )
);
CustomDateInput.displayName = 'CustomDateInput';

export default function CartList() {
  const {
    items,
    addItem,
    removeItem,
    clearCart,
    setItemQuantity,
    customer_name,
    channel_access,
    customer_tel,
    location_send,
    delivery_date,
    export_time,
    receive_time,
    shipping_cost,
    shipping_by,
    receive_name,
    invoice_tex,
    pay_type,
    pay_deposit,
    pay_isdeposit,
    pay_cost,
    pay_charge,
    total_remain,
    total_cost,
    lunch_box,
    selected_lunchboxes,
    order_name,
    ispay,
    setCustomerInfo,
    removeLunchbox,
    updateLunchboxQuantity,
    updateLunchboxTotalCost,
  } = useCartStore();

  const {
    loading,
    setLoading,
    errors,
    setErrors,
    success,
    setSuccess,
    rawDate,
    setRawDate,
    lunchbox,
    setLunchbox,
    availableSets,
    setAvailableSets,
    isErrorVisible,
    setIsErrorVisible,
    copyText,
    setCopyText,
    isCopied,
    setIsCopied,
    customChannelName,
    setCustomChannelName,
  } = useCartList();
  const { userName, userRole } = useAuth();
  const router = useRouter();
  const locationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handle = {
    LunchboxTotalCostChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (!numericValue) {
        updateLunchboxTotalCost(index, "");
        return;
      }
      const formattedValue = Number(numericValue).toLocaleString("th-TH");
      updateLunchboxTotalCost(index, formattedValue);
    },
    EditLunchbox: (index: number) => {
      const lunchboxToEdit = selected_lunchboxes[index];

      sessionStorage.setItem("editingLunchboxIndex", index.toString());
      sessionStorage.setItem("editingLunchboxData", JSON.stringify(lunchboxToEdit));

      router.push("/home/order/menu-picker?edit=true");
    },
    PhoneChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value.replace(/\D/g, "");
      const digitsOnly = value;
      const len = digitsOnly.length;

      if (len === 0) value = "";
      else if (len === 9 && digitsOnly.startsWith("0")) {
        if (len <= 2) value = digitsOnly;
        else if (len <= 5) value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
        else value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 5)}-${digitsOnly.slice(5, 9)}`;
      } else if (len <= 8) {
        if (len > 4) value = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}`;
        else value = digitsOnly;
      } else {
        if (len <= 3) value = digitsOnly;
        else if (len <= 6) value = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
        else value = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
      setCustomerInfo({ tel: value });
    },
    ShippingCostChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (!numericValue) {
        setCustomerInfo({ shipping_cost: "" });
        return;
      }
      const formattedValue = Number(numericValue).toLocaleString("th-TH");
      setCustomerInfo({ shipping_cost: formattedValue });
    },
    TaxInvoiceNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (numericValue.length <= 13) setCustomerInfo({ invoice_tex: numericValue });
    },
    ChangeQuantity: (cartItemId: string, quantity: number) => {
      if (quantity >= 1) setItemQuantity(cartItemId, quantity);
    },
    CopyText: async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        const textarea = document.getElementById("copy-textarea") as HTMLTextAreaElement;
        if (textarea) {
          textarea.select();
          textarea.setSelectionRange(0, 99999);
          try {
            document.execCommand("copy");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          } catch (e) {
            console.error("Failed to copy:", e);
          }
        }
      }
    },

    Finish: () => {
      setSuccess(false);
      setIsCopied(false);
      clearCart();

      toast.success("ดำเนินการเสร็จสิ้น", {
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/home/summarylist");
      }, 1000);
    },
  };

  const formTemplate = {
    SelectContect: [
      {
        value: "facebook",
        label: "Facebook",
        color: "blue",
        iconColor: "#1877F2",
        svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
        svgh: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      },
      {
        value: "line",
        label: "Line",
        color: "green",
        iconColor: "#00C300",
        svg: "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.27l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.028 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314",
        svgh: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      },
      {
        value: "instagram",
        label: "Instagram",
        color: "pink",
        iconColor: "#E4405F",
        svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
        svgh: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      },
      {
        value: "others",
        label: "Others",
        color: "purple",
        iconColor: "#9333EA",
        svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
        svgh: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      },
    ]
  }

  const knownChannelValues = formTemplate.SelectContect.filter((c) => c.value !== "others").map((c) => c.value);
  const isCustomChannel = !!channel_access && channel_access !== "others" && !knownChannelValues.includes(channel_access);
  const isOtherChannelSelected = channel_access === "others" || isCustomChannel;
  const channelUi: Record<string, { activeContainer: string; inactiveContainer: string; activeText: string; activeCheck: string }> = {
    facebook: {
      activeContainer: "border-blue-500 bg-blue-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/50",
      activeText: "text-blue-700",
      activeCheck: "text-blue-500",
    },
    line: {
      activeContainer: "border-green-500 bg-green-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-green-300 hover:bg-green-50/50",
      activeText: "text-green-700",
      activeCheck: "text-green-500",
    },
    instagram: {
      activeContainer: "border-pink-500 bg-pink-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-pink-300 hover:bg-pink-50/50",
      activeText: "text-pink-700",
      activeCheck: "text-pink-500",
    },
    others: {
      activeContainer: "border-purple-500 bg-purple-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50/50",
      activeText: "text-purple-700",
      activeCheck: "text-purple-500",
    },
  };

  const shippingByOptions: Array<{ value: string; label: string }> = [
    { value: "มอเตอร์ไซด์", label: "มอเตอร์ไซด์" },
    { value: "รถยนต์(เก๋ง)", label: "รถยนต์(เก๋ง)" },
    { value: "รถ SUV", label: "รถ SUV" },
    { value: "รถกระบะตูทึบ", label: "รถกระบะตูทึบ" },
  ];

  const payTypeOptions: Array<{ value: string; label: string }> = [
    { value: "cash", label: "ชำระด้วยเงินสด" },
    { value: "transfer", label: "ชำระด้วยโอนเงิน" },
    { value: "card", label: "ชำระด้วยบัตรเครดิต" },
  ];

  const depositUi: Record<string, { activeContainer: string; inactiveContainer: string; activeText: string; iconActiveColor: string; iconInactiveColor: string }> = {
    full: {
      activeContainer: "border-orange-500 bg-orange-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50/50",
      activeText: "text-orange-700",
      iconActiveColor: "#EA580C",
      iconInactiveColor: "#6B7280",
    },
    percent: {
      activeContainer: "border-amber-500 bg-amber-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-amber-300 hover:bg-amber-50/50",
      activeText: "text-amber-700",
      iconActiveColor: "#F2B851",
      iconInactiveColor: "#6B7280",
    },
  };

  const depositOptions: Array<{ id: string; value: "full" | "percent"; label: string; icon: React.ReactNode; onSelect: () => void }> = [
    {
      id: "deposit-full",
      value: "full",
      label: "เต็มจำนวน",
      icon: (
        <svg className='!w-5 !h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      ),
      onSelect: () => setCustomerInfo({ pay_deposit: "full", ispay: "-" }),
    },
    {
      id: "deposit-percent",
      value: "percent",
      label: "50%",
      icon: (
        <svg className='!w-5 !h-5' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox='0 0 512 512' xmlSpace='preserve'>
          <path
            style={{ fill: "#F2B851" }}
            d='M512,256.8l-67.2-54.224l43.2-74.96l-91.2-7.968l-8-87.728L312,68.608L259.2,0l-49.6,70.176
	l-80-41.472l-4.8,90.928l-89.6,4.784l33.6,86.128L0,252.016l70.4,52.64l-35.2,74.96l88,9.568l4.8,89.328l81.6-38.288L264,512
	l48-71.776l75.2,36.688l6.4-89.328l88-1.6l-32-73.376L512,256.8z'
          />
          <path
            style={{ fill: "#FFFFFF" }}
            d='M252.544,210.352c0,36.352-22.992,55.328-48.128,55.328c-26.464,0-47.312-19.776-47.312-52.384
	c0-31.008,18.992-54.528,48.656-54.528C235.696,158.768,252.544,180.688,252.544,210.352z M187.296,212.224
	c0,18.176,6.16,31.264,17.92,31.264c11.488,0,17.104-11.744,17.104-31.264c0-17.664-4.816-31.28-17.376-31.28
	C192.928,180.944,187.296,194.832,187.296,212.224z M206.56,338.4l99.712-179.648h21.92L228.208,338.4H206.56z M377.648,282.528
	c0,36.352-22.992,55.344-48.128,55.344c-26.192,0-47.04-19.776-47.312-52.384c0-31.008,18.992-54.544,48.656-54.544
	C360.8,230.928,377.648,252.848,377.648,282.528z M312.688,284.4c-0.272,18.192,5.872,31.28,17.648,31.28
	c11.504,0,17.104-11.76,17.104-31.28c0-17.648-4.544-31.28-17.104-31.28C318.032,253.12,312.688,267.024,312.688,284.4z'
          />
        </svg>
      ),
      onSelect: () => {
        setCustomerInfo({ pay_deposit: "percent" });
        if (!ispay || ispay === "-") setCustomerInfo({ ispay: "" });
      },
    },
  ];

  const paymentStatusUi: Record<"paid" | "unpaid", { activeContainer: string; inactiveContainer: string; activeText: string; iconActiveColor: string }> = {
    paid: {
      activeContainer: "border-green-500 bg-green-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-green-300 hover:bg-green-50/50",
      activeText: "text-green-700",
      iconActiveColor: "#10B981",
    },
    unpaid: {
      activeContainer: "border-red-500 bg-red-50 shadow-md",
      inactiveContainer: "border-gray-300 bg-white hover:border-red-300 hover:bg-red-50/50",
      activeText: "text-red-700",
      iconActiveColor: "#EF4444",
    },
  };

  const paymentStatusOptions: Array<{ id: string; value: "paid" | "unpaid"; label: string; icon: React.ReactNode }> = [
    {
      id: "payment-paid",
      value: "paid",
      label: "ชำระแล้ว",
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' className='!w-5 !h-5' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' />
          <path d='m16 19 3 3 3-3' />
          <path d='M18 12h.01' />
          <path d='M19 16v6' />
          <path d='M6 12h.01' />
          <circle cx='12' cy='12' r='2' />
        </svg>
      ),
    },
    {
      id: "payment-unpaid",
      value: "unpaid",
      label: "ไม่ได้ชำระ",
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' className='!w-5 !h-5' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M13 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' />
          <path d='m17 17 5 5' />
          <path d='M18 12h.01' />
          <path d='m22 17-5 5' />
          <path d='M6 12h.01' />
          <circle cx='12' cy='12' r='2' />
        </svg>
      ),
    },
  ];

  const missingFieldChecks: Array<{ key: string; show: boolean; label: string }> = [
    { key: "order_name", show: !order_name.trim(), label: "ชื่อผู้สั่ง" },
    { key: "channel_access", show: !channel_access.trim(), label: "ช่องทาง" },
    { key: "delivery_date", show: !delivery_date.trim(), label: "วันที่รับสินค้า" },
    { key: "export_time", show: !export_time.trim(), label: "เวลาส่งอาหาร" },
    { key: "receive_time", show: !receive_time.trim(), label: "เวลารับอาหาร" },
    { key: "location_send", show: !location_send.trim(), label: "สถานที่จัดส่ง" },
    { key: "receive_name", show: !receive_name.trim(), label: "ชื่อผู้รับสินค้า" },
    { key: "customer_tel", show: !customer_tel.trim(), label: "เบอร์ติดต่อ" },
    { key: "shipping_cost", show: !shipping_cost.trim(), label: "ค่าจัดส่ง" },
    { key: "shipping_by", show: !shipping_by.trim(), label: "ส่งโดย" },
    { key: "customer_name", show: !customer_name.trim(), label: "ออกบิลในนาม" },
    { key: "invoice_tex_len", show: !!invoice_tex.trim() && invoice_tex.length !== 13, label: "เลขใบกำกับภาษี (ต้องเป็น 13 หลัก)" },
  ];

  const formatTimeChangeValue = (input: string): string => {
    const raw = input.replace(/[^0-9:]/g, "");
    const digits = raw.replace(/:/g, "");

    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;

    let hours = parseInt(digits.slice(0, 2), 10);
    if (hours > 23) hours = 23;
    let minutes = digits.slice(2, 4);
    if (minutes.length === 2) {
      const mins = parseInt(minutes, 10);
      if (mins > 59) minutes = "59";
    }

    return hours.toString().padStart(2, "0") + ":" + minutes;
  };

  const formatTimeBlurValue = (input: string): string | null => {
    if (!input) return null;
    const digits = input.replace(/[^0-9]/g, "");
    if (digits.length === 0) return null;

    const hours = digits.slice(0, 2).padStart(2, "0");
    const mins = digits.slice(2, 4).padEnd(2, "0");

    let h = parseInt(hours, 10);
    let m = parseInt(mins, 10);
    if (h > 23) h = 23;
    if (m > 59) m = 59;

    return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
  };
  const validate = {
    BasicInfo: (): boolean => {
      return (
        order_name.trim() !== "" &&
        receive_name.trim() !== "" &&
        channel_access.trim() !== "" &&
        customer_tel.trim() !== "" &&
        location_send.trim() !== "" &&
        delivery_date.trim() !== "" &&
        export_time.trim() !== "" &&
        receive_time.trim() !== "" &&
        shipping_cost.trim() !== "" &&
        shipping_by.trim() !== "" &&
        customer_name.trim() !== "" &&
        (invoice_tex.trim() === "" || invoice_tex.length === 13)
      );
    },
    Inputs: (): boolean => {
      const newErrors: string[] = [];

      if (!order_name.trim()) newErrors.push("กรุณากรอกชื่อผู้สั่งอาหาร");
      if (!customer_name.trim()) newErrors.push("กรุณากรอกชื่อลูกค้า");
      if (!customer_tel.trim()) {
        newErrors.push("กรุณากรอกเบอร์โทรลูกค้า");
      } else {
        const phonePattern8 = /^\d{4}-\d{4}$/;
        const phonePattern9 = /^0\d-\d{3}-\d{4}$/;
        const phonePattern10 = /^\d{3}-\d{3}-\d{4}$/;
        if (!phonePattern8.test(customer_tel) && !phonePattern9.test(customer_tel) && !phonePattern10.test(customer_tel)) {
          newErrors.push("เบอร์โทรต้องอยู่ในรูปแบบ 1234-5678, 02-123-4567 หรือ 081-234-5678");
        }
      }
      if (!location_send.trim()) newErrors.push("กรุณากรอกสถานที่จัดส่ง");
      if (!delivery_date.trim()) newErrors.push("กรุณาเลือกวันที่รับสินค้า");
      if (!export_time.trim()) newErrors.push("กรุณาเลือกเวลาส่งอาหาร");
      if (!receive_time.trim()) newErrors.push("กรุณาเลือกเวลารับอาหาร");

      if (invoice_tex.trim() !== "" && invoice_tex.length !== 13) {
        newErrors.push("เลขใบกำกับภาษีต้องเป็น 13 หลักเท่านั้น");
      }

      if (selected_lunchboxes.length > 0) {
        if (!pay_type.trim()) {
          newErrors.push("กรุณาเลือกรูปแบบการชำระเงิน");
        } else {
          if (!pay_deposit || !pay_deposit.trim()) {
            newErrors.push("กรุณาเลือกรูปแบบการมัดจำ");
          } else if (pay_deposit !== "no") {
            if (!pay_cost.trim()) {
              newErrors.push("กรุณาใส่จำนวนเงินมัดจำ");
            } else {
              const payCostNum = Number(pay_cost.replace(/[^\d]/g, ""));
              if (payCostNum === 0) newErrors.push("จำนวนเงินมัดจำต้องมากกว่า 0");
            }
          }
        }
      }

      if (selected_lunchboxes.length === 0) newErrors.push("กรุณาเลือกโปรโมชั่นอาหารอย่างน้อย 1 อย่าง");

      setErrors(newErrors);
      return newErrors.length === 0;
    },
  };

  const confirmOrder = async () => {
    if (loading) return;
    if (!validate.Inputs()) return;
    if (export_time >= receive_time) {
      Swal.fire({
        icon: "error",
        title: "เวลาไม่ถูกต้อง",
        text: "เวลาส่งอาหารต้องน้อยกว่าเวลารับอาหาร",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#e74c3c",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "info",
      title: "กรุณาตรวจสอบข้อมูลก่อนยืนยัน",
      showCancelButton: true,
      cancelButtonText: "ย้อนกลับ",
      confirmButtonText: "ยืนยัน",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      width: "500px",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setErrors([]);
    try {
      const lunchboxListForMessage = selected_lunchboxes
        .map((lb, index) => {
          const lunchboxCost = Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0;
          const costPerBox = lunchboxCost / lb.quantity;
          const menuList = lb.selected_menus.map((menu, menuIndex) => `+ ${menu.menu_name}`).join("\n      ");

          return `${index + 1}.${lb.lunchbox_name} - ${lb.lunchbox_set}
      ${menuList}
      เซ็ตละ ${costPerBox.toLocaleString("th-TH")} บาท 
      จำนวน ${lb.quantity} กล่อง 
      รวม ${lunchboxCost.toLocaleString("th-TH")} x ${lb.quantity} = ${lunchboxCost.toLocaleString("th-TH")} บาท`;
        })
        .join("\n\n      ");

      const totalLunchboxCostForMessage = selected_lunchboxes.reduce((sum, lb) => {
        return sum + (Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0);
      }, 0);

      const shippingCostNumForMessage = Number(shipping_cost.replace(/[^\d]/g, "")) || 0;
      const chargeNumForMessage = Number(pay_charge.replace(/[^\d.]/g, "") || 0);
      const totalCostNumForMessage = totalLunchboxCostForMessage + shippingCostNumForMessage + chargeNumForMessage;

      let depositTextForMessage = "";
      let depositValueForMessage = "";
      let depositAmountForMessage = 0;
      let paymentStatusText = "";

      if (pay_deposit === "percent") {
        const payCostNum = Number(pay_cost.replace(/[^\d]/g, "") || 0);
        depositAmountForMessage = (totalCostNumForMessage * payCostNum) / 100;
        depositTextForMessage = `${pay_cost}%`;
        if (ispay === "paid") {
          paymentStatusText = "ชำระแล้ว";
        } else if (ispay === "unpaid") {
          paymentStatusText = "ยังไม่ชำระ";
        } else {
          paymentStatusText = "ชำระแล้ว";
        }
        depositValueForMessage = `${Number(depositAmountForMessage.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท (${paymentStatusText})`;
      } else if (pay_deposit === "full") {
        depositAmountForMessage = Number(pay_cost.replace(/[^\d]/g, "") || 0) / 100;
        depositTextForMessage = "เต็มจำนวน";
        paymentStatusText = "ชำระแล้ว";
        depositValueForMessage = `${Number(depositAmountForMessage.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท (${paymentStatusText})`;
      } else {
        depositTextForMessage = "-";
        depositValueForMessage = "";
      }

      const copyTextContent = `📌รับออเดอร์ คุณ ${order_name} 
ช่องทางที่สั่ง : ${channel_access}
ผู้รับออเดอร์ : แอดมิน ${userName}

✅ รายละเอียดสำหรับจัดส่ง
1.วันที่รับสินค้า : ${delivery_date}
2.เวลาส่งสินค้า : ${export_time} น.
3.เวลารับสินค้า : ${receive_time} น.
4.สถานที่จัดส่ง : ${location_send}
5.ค่าจัดส่ง: ${shipping_cost} บาท ส่งโดย ${shipping_by}
6.ชื่อผู้รับสินค้า : ${receive_name}
7.เบอร์โทร : ${customer_tel}
8.ออกบิลในนาม : ${customer_name}
9.ที่อยู่ : ${location_send}
${invoice_tex.trim() !== "" ? `10.เลขประจำตัวผู้เสียภาษี : ${invoice_tex}` : ""}

✅รายการอาหาร ${selected_lunchboxes.reduce((sum, lb) => sum + lb.quantity, 0)} กล่อง 
      ${lunchboxListForMessage}

✅สรุปค่าใช้จ่าย
ค่าอาหาร ${totalLunchboxCostForMessage.toLocaleString("th-TH")} บาท
ค่าจัดส่ง ${shippingCostNumForMessage.toLocaleString("th-TH")} บาท
${chargeNumForMessage > 0 ? `ค่าธรรมเนียม ${chargeNumForMessage.toLocaleString("th-TH")} บาท` : ""}
รวมทั้งหมด ${totalCostNumForMessage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
${pay_deposit && pay_deposit !== "no"
          ? pay_deposit === "full"
            ? `มัดจำ ${depositTextForMessage}\n✅ชำระ ${Number(depositAmountForMessage.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`
            : `มัดจำ ${depositTextForMessage}\n✅ชำระ ${Number(depositAmountForMessage.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`
          : ""
        }
`;

      const copyTextNormalized = copyTextContent
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

      const response = await axios.post("/api/post/cart", {
        order_name: order_name,
        username: userName,
        channel_access,
        customer_name,
        customer_tel,
        location_send,
        delivery_date,
        export_time,
        receive_time,
        shipping_cost: shipping_cost.replace(/[^\d]/g, ""),
        shipping_by: shipping_by,
        menu_items: items.map((item, index) => ({
          menu_name: item.menu_name,
          menu_subname: item.menu_subname,
          menu_category: item.menu_category,
          menu_total: item.menu_total,
          menu_ingredients: item.menu_ingredients,
          menu_description: item.menu_description,
          menu_order_id: index + 1,
        })),
        lunchboxes: selected_lunchboxes.map((lunchbox, index) => ({
          lunchbox_name: lunchbox.lunchbox_name,
          lunchbox_set: lunchbox.lunchbox_set,
          lunchbox_limit: lunchbox.lunchbox_limit,
          lunchbox_quantity: lunchbox.quantity,
          lunchbox_total_cost: lunchbox.lunchbox_total_cost.replace(/[^\d]/g, ""),
          lunchbox_packaging: lunchbox.packaging || null,
          lunchbox_menus: lunchbox.selected_menus.map((menu, menuIndex) => ({
            menu_name: menu.menu_name,
            menu_subname: menu.menu_subname,
            menu_category: menu.menu_category,
            menu_total: lunchbox.quantity,
            menu_cost: menu.lunchbox_cost || 0,
            menu_ingredients:
              menu.menu_ingredients?.map((ingredient) => ({
                ...ingredient,
                useItem: ingredient.useItem * lunchbox.quantity,
              })) || [],
            menu_description: menu.menu_description,
            menu_order_id: menuIndex + 1,
          })),
        })),
        receive_name: receive_name,
        invoice_tex: invoice_tex,
        pay_type: pay_type,
        pay_deposit: pay_deposit,
        pay_isdeposit: pay_isdeposit,
        total_cost_lunchbox: selected_lunchboxes
          .reduce((sum, lb) => {
            return sum + (Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0);
          }, 0)
          .toString(),
        total_cost: total_cost,
        pay_cost: pay_cost,
        pay_charge: pay_charge,
        total_remain: total_remain,
        message: copyTextNormalized,
        ispay: ispay,
      });

      if (response.status !== 201) throw new Error("เกิดข้อผิดพลาดในการสั่งซื้อ");

      clearCart();
      sessionStorage.removeItem("editingLunchboxIndex");
      sessionStorage.removeItem("editingLunchboxData");

      const totalLunchboxCost = selected_lunchboxes.reduce((sum, lb) => {
        return sum + (Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0);
      }, 0);

      const shippingCostNum = Number(shipping_cost.replace(/[^\d]/g, "")) || 0;
      const chargeNum = Number(pay_charge.replace(/[^\d]/g, "")) || 0;
      const totalCostNum = totalLunchboxCost + shippingCostNum + chargeNum;

      let depositText = "";
      let depositValue = "";
      if (pay_deposit === "percent") {
        const payCostNum = Number(pay_cost.replace(/[^\d]/g, "")) || 0;
        const depositAmount = (totalCostNum * payCostNum) / 100;
        depositText = `${pay_cost}%`;
        depositValue = `(${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท)`;
      } else if (pay_deposit === "full") {
        const depositAmount = Number(pay_cost.replace(/[^\d]/g, "")) / 100;
        depositText = `${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
        depositValue = `(${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท)`;
      } else {
        depositText = "-";
      }

      const remainNum = Number(total_remain.replace(/[^\d.]/g, "")) || 0;

      setCopyText(copyTextNormalized);
      setSuccess(true);
      navigator.clipboard.writeText(copyTextNormalized).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#e74c3c",
      });

      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const groupMenusByLimit = (menus: any[], limit: number) => {
    if (limit === 0 || !limit) return menus.length > 0 ? [menus] : [];

    const groups = [];
    for (let i = 0; i < menus.length; i += limit) groups.push(menus.slice(i, i + limit));
    return groups;
  };

  useEffect(() => {
    if (delivery_date) {
      const parts = delivery_date.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10) - 543;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) setRawDate(d.toISOString());
      }
    } else setRawDate("");
  }, [delivery_date]);

  useEffect(() => {
    const fetchLunchbox = async () => {
      try {
        const response = await axios.get("/api/get/lunchbox");
        const data = response.data;
        setLunchbox(data);
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      }
    };
    fetchLunchbox();
  }, []);

  useEffect(() => {
    if (lunch_box && lunchbox.length > 0) {
      const sets = lunchbox.filter((item) => item.lunchbox_name === lunch_box).map((item) => item.lunchbox_set);
      setAvailableSets([...new Set(sets)]);
    } else setAvailableSets([]);
  }, [lunch_box, lunchbox]);

  useEffect(() => {
    const lunchboxTotal = selected_lunchboxes.reduce((sum, lb) => {
      const cost = Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0;
      return sum + cost;
    }, 0);

    const shippingCost = Number(shipping_cost.replace(/[^\d]/g, "")) || 0;

    let charge = 0;
    if (pay_type === "card" && selected_lunchboxes.length > 0) {
      const totalForFee = lunchboxTotal + shippingCost;
      charge = totalForFee * 0.03;
    } else if (pay_type === "cash" || pay_type === "transfer") {
      charge = 0;
    }

    const totalCost = lunchboxTotal + shippingCost + charge;

    setCustomerInfo({
      total_cost: totalCost > 0 ? totalCost.toLocaleString("th-TH") : "",
      pay_charge: charge > 0 ? charge.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : pay_type && selected_lunchboxes.length > 0 ? "0.00" : "",
    });
  }, [selected_lunchboxes, shipping_cost, pay_type]);

  useEffect(() => {
    if (pay_deposit === "percent" && pay_type) {
      const currentPayCost = pay_cost.replace(/[^\d]/g, "");
      if (currentPayCost !== "50") {
        setCustomerInfo({ pay_cost: "50" });
      }
    } else if (pay_deposit === "full" && total_cost) {
      const totalCostStr = total_cost.replace(/,/g, "");
      const totalCostNum = parseFloat(totalCostStr) || 0;
      const totalCostInSatang = Math.round(totalCostNum * 100); // แปลงเป็นสตางค์เพื่อเก็บใน pay_cost
      const currentPayCost = Number(pay_cost.replace(/[^\d]/g, "")) || 0;

      if (currentPayCost !== totalCostInSatang && totalCostInSatang > 0) {
        setCustomerInfo({ pay_cost: totalCostInSatang.toString() });
      }
    }
  }, [pay_deposit, pay_type, pay_cost, total_cost]);

  useEffect(() => {
    if (!total_cost || !pay_deposit) {
      setCustomerInfo({ total_remain: "" });
      return;
    }

    const totalCostStr = total_cost.replace(/,/g, "");
    const totalCostNum = parseFloat(totalCostStr) || 0;

    if (totalCostNum === 0 || isNaN(totalCostNum)) {
      setCustomerInfo({ total_remain: "" });
      return;
    }

    const payCostNum = Number(pay_cost?.replace(/[^\d]/g, "") || 0) || 0;

    if (pay_deposit === "full") {
      if (ispay !== "-") setCustomerInfo({ ispay: "-" });
      const depositAmount = payCostNum / 100;
      const remaining = totalCostNum - depositAmount;
      const formattedRemaining = remaining >= 0 && !isNaN(remaining) ? Number(remaining.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
      setCustomerInfo({ total_remain: formattedRemaining });
      return;
    }

    if (pay_deposit === "percent" && ispay === "unpaid") {
      if (totalCostNum > 0 && !isNaN(totalCostNum)) {
        const formattedRemaining = Number(totalCostNum.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setCustomerInfo({ total_remain: formattedRemaining });
      } else {
        setCustomerInfo({ total_remain: "" });
      }
      return;
    }

    let depositAmount = 0;
    if (pay_deposit === "percent") depositAmount = (totalCostNum * payCostNum) / 100;

    const remaining = totalCostNum - depositAmount;
    const formattedRemaining = remaining >= 0 && !isNaN(remaining) ? Number(remaining.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    setCustomerInfo({ total_remain: formattedRemaining });
  }, [total_cost, pay_deposit, pay_cost, ispay]);

  useEffect(() => {
    if (errors.length > 0) {
      setIsErrorVisible(true);
      const timer = setTimeout(() => {
        setIsErrorVisible(false);
        setTimeout(() => {
          setErrors([]);
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsErrorVisible(false);
    }
  }, [errors]);

  useEffect(() => {
    if (channel_access && channel_access !== "others" && !knownChannelValues.includes(channel_access)) setCustomChannelName(channel_access);
    else if (channel_access === "others") setCustomChannelName("");
    else setCustomChannelName("");
  }, [channel_access]);

  useEffect(() => {
    if (locationTextareaRef.current) {
      locationTextareaRef.current.style.height = "auto";
      locationTextareaRef.current.style.height = Math.max(40, locationTextareaRef.current.scrollHeight) + "px";
    }
  }, [location_send]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <main className='min-h-screen text-black'>
      {/* Success Modal */}
      {success && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='flex w-full items-center justify-center p-4 border-b bg-green-50 rounded-t-lg'>
              <div className='flex items-center gap-2 text-xl font-bold text-green-700'>
                <svg className='!w-5 !h-5 text-green-600' viewBox='0 0 117 117' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
                  <g fill='none' fillRule='evenodd' id='Page-1' stroke='none' strokeWidth='1'>
                    <g fillRule='nonzero' id='correct'>
                      <path
                        d='M34.5,55.1 C32.9,53.5 30.3,53.5 28.7,55.1 C27.1,56.7 27.1,59.3 28.7,60.9 L47.6,79.8 C48.4,80.6 49.4,81 50.5,81 C50.6,81 50.6,81 50.7,81 C51.8,80.9 52.9,80.4 53.7,79.5 L101,22.8 C102.4,21.1 102.2,18.5 100.5,17 C98.8,15.6 96.2,15.8 94.7,17.5 L50.2,70.8 L34.5,55.1 Z'
                        fill='#17AB13'
                        id='Shape'
                      />

                      <path
                        d='M89.1,9.3 C66.1,-5.1 36.6,-1.7 17.4,17.5 C-5.2,40.1 -5.2,77 17.4,99.6 C28.7,110.9 43.6,116.6 58.4,116.6 C73.2,116.6 88.1,110.9 99.4,99.6 C118.7,80.3 122,50.7 107.5,27.7 C106.3,25.8 103.8,25.2 101.9,26.4 C100,27.6 99.4,30.1 100.6,32 C113.1,51.8 110.2,77.2 93.6,93.8 C74.2,113.2 42.5,113.2 23.1,93.8 C3.7,74.4 3.7,42.7 23.1,23.3 C39.7,6.8 65,3.9 84.8,16.2 C86.7,17.4 89.2,16.8 90.4,14.9 C91.6,13 91,10.5 89.1,9.3 Z'
                        fill='#4A4A4A'
                        id='Shape'
                      />
                    </g>
                  </g>
                </svg>
                <p>สั่งซื้อสำเร็จ!</p>
              </div>
            </div>

            {/* Content */}
            <div className='p-4 flex-1'>
              <p className='text-gray-700 mb-4'>กรุณาคัดลอกข้อความด้านล่างเพื่อส่งให้ลูกค้า:</p>
              <div className='overflow-y-auto border-2 py-2 pl-4  border-gray-300 rounded-xl bg-gray-50 overflow-x-hidden'>
                <textarea id='copy-textarea' value={copyText} readOnly className='w-full resize-none text-sm overflow-y-visible select-none outline-none focus:outline-none' rows={15} />
              </div>

              {/* ปุ่มคัดลอก */}
              <div className='mt-4 flex justify-end gap-2'>
                <button
                  onClick={handle.CopyText}
                  className={`w-auto px-4 py-2 rounded-lg font-semibold transition-all ${isCopied ? "!bg-green-600 !text-white" : "!bg-gray-500 !text-white hover:!bg-gray-600"}`}>
                  {isCopied ? (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                      คัดลอกสำเร็จแล้ว!
                    </span>
                  ) : (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                      คัดลอกข้อความ
                    </span>
                  )}
                </button>
              </div>

              <p className='text-xs text-gray-500 mt-2 text-center'>💡 หากปุ่มคัดลอกไม่ทำงาน กรุณาเลือกข้อความในช่องด้านบนแล้วกด Ctrl+C (หรือ Cmd+C บน Mac)</p>
            </div>

            {/* Footer */}
            <div className='p-4 border-t bg-gray-50 rounded-b-lg'>
              <div className='w-full flex justify-center items-center'>
                <button onClick={handle.Finish} className='w-auto px-4 py-3 !bg-green-600 !text-white rounded-lg font-semibold hover:!bg-green-700 transition-colors'>
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Toast - Top Right */}
      {errors.length > 0 && (
        <div
          className={`fixed top-4 right-4 z-50 flex w-3/4 h-24 overflow-hidden bg-white shadow-lg max-w-96 rounded-xl transition-all duration-300 ease-in-out ${isErrorVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            }`}>
          <svg xmlns='http://www.w3.org/2000/svg' height='96' width='16'>
            <path
              strokeLinecap='round'
              strokeWidth='2'
              stroke='indianred'
              fill='indianred'
              d='M 8 0 
                   Q 4 4.8, 8 9.6 
                   T 8 19.2 
                   Q 4 24, 8 28.8 
                   T 8 38.4 
                   Q 4 43.2, 8 48 
                   T 8 57.6 
                   Q 4 62.4, 8 67.2 
                   T 8 76.8 
                   Q 4 81.6, 8 86.4 
                   T 8 96 
                   L 0 96 
                   L 0 0 
                   Z'
            />
          </svg>
          <div className='mx-2.5 overflow-hidden w-full'>
            <p className='mt-1.5 text-xl font-bold text-[indianred] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap'>เกิดข้อผิดพลาดการยืนยันคำสั่งซื้อ</p>
            <div className='overflow-hidden leading-5 break-all text-zinc-400 max-h-10'>
              {errors.map((err: string, i: number) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className='p-4 max-w-md mx-auto'>
        <h1 className='text-2xl !font-bold mb-4 flex items-center gap-2'>
          <svg
            version='1.1'
            id='Layer_1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            x='0px'
            y='0px'
            viewBox='0 0 115.35 122.88'
            xmlSpace='preserve'
            className='inline w-6! h-6!'>
            <g>
              <path d='M25.27,86.92c-1.81,0-3.26-1.46-3.26-3.26s1.47-3.26,3.26-3.26h21.49c1.81,0,3.26,1.46,3.26,3.26s-1.46,3.26-3.26,3.26 H25.27L25.27,86.92L25.27,86.92z M61.1,77.47c-0.96,0-1.78-0.82-1.78-1.82c0-0.96,0.82-1.78,1.78-1.78h4.65c0.04,0,0.14,0,0.18,0 c1.64,0.04,3.1,0.36,4.33,1.14c1.37,0.87,2.37,2.19,2.92,4.15c0,0.04,0,0.09,0.05,0.14l0.46,1.82h39.89c1,0,1.78,0.82,1.78,1.78 c0,0.18-0.05,0.36-0.09,0.55l-4.65,18.74c-0.18,0.82-0.91,1.37-1.73,1.37l0,0l-29.18,0c0.64,2.37,1.28,3.65,2.14,4.24 c1.05,0.68,2.87,0.73,5.93,0.68h0.04l0,0h20.61c1,0,1.78,0.82,1.78,1.78c0,1-0.82,1.78-1.78,1.78H87.81l0,0 c-3.79,0.04-6.11-0.05-7.98-1.28c-1.92-1.28-2.92-3.46-3.92-7.43l0,0L69.8,80.2c0-0.05,0-0.05-0.04-0.09 c-0.27-1-0.73-1.69-1.37-2.05c-0.64-0.41-1.5-0.59-2.51-0.59c-0.05,0-0.09,0-0.14,0H61.1L61.1,77.47L61.1,77.47z M103.09,114.13 c2.42,0,4.38,1.96,4.38,4.38s-1.96,4.38-4.38,4.38s-4.38-1.96-4.38-4.38S100.67,114.13,103.09,114.13L103.09,114.13L103.09,114.13z M83.89,114.13c2.42,0,4.38,1.96,4.38,4.38s-1.96,4.38-4.38,4.38c-2.42,0-4.38-1.96-4.38-4.38S81.48,114.13,83.89,114.13 L83.89,114.13L83.89,114.13z M25.27,33.58c-1.81,0-3.26-1.47-3.26-3.26c0-1.8,1.47-3.26,3.26-3.26h50.52 c1.81,0,3.26,1.46,3.26,3.26c0,1.8-1.46,3.26-3.26,3.26H25.27L25.27,33.58L25.27,33.58z M7.57,0h85.63c2.09,0,3.99,0.85,5.35,2.21 s2.21,3.26,2.21,5.35v59.98h-6.5V7.59c0-0.29-0.12-0.56-0.31-0.76c-0.2-0.19-0.47-0.31-0.76-0.31l0,0H7.57 c-0.29,0-0.56,0.12-0.76,0.31S6.51,7.3,6.51,7.59v98.67c0,0.29,0.12,0.56,0.31,0.76s0.46,0.31,0.76,0.31h55.05 c0.61,2.39,1.3,4.48,2.23,6.47H7.57c-2.09,0-3.99-0.85-5.35-2.21C0.85,110.24,0,108.34,0,106.25V7.57c0-2.09,0.85-4,2.21-5.36 S5.48,0,7.57,0L7.57,0L7.57,0z M25.27,60.25c-1.81,0-3.26-1.46-3.26-3.26s1.47-3.26,3.26-3.26h50.52c1.81,0,3.26,1.46,3.26,3.26 s-1.46,3.26-3.26,3.26H25.27L25.27,60.25L25.27,60.25z' />
            </g>
          </svg>
          รายการในตะกร้า
        </h1>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='col-span-2 flex flex-col gap-2'>
            <div className="flex items-center gap-3 w-full">
              <label className="font-bold whitespace-nowrap">
                ชื่อผู้สั่ง:
              </label>

              <textarea
                rows={1}
                value={order_name}
                onChange={(e) => setCustomerInfo({ order_name: e.target.value })}
                placeholder="ระบุชื่อผู้สั่ง"
                className="
    flex-1 border rounded px-3 py-2
    resize-none
    leading-relaxed
  "
                style={{ fontFamily: 'inherit' }}
              />
            </div>

            <label className='font-bold mt-2 whitespace-nowrap'>ช่องทางที่สั่ง</label>
            <div className='grid grid-cols-2 gap-3'>
              {formTemplate.SelectContect.map((item) => {
                const isSelected = item.value === "others" ? isOtherChannelSelected : channel_access === item.value;
                const ui = channelUi[item.value] ?? channelUi.others;

                return (
                  <label
                    key={item.value}
                    htmlFor={item.value}
                    className={`relative flex items-center justify-center gap-2 p-4 mb-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? ui.activeContainer : ui.inactiveContainer
                      }`}>
                    <input
                      type='radio'
                      id={item.value}
                      name='channel'
                      value={item.value}
                      checked={isSelected}
                      onChange={() => {
                        setCustomerInfo({ channel_access: item.value === "others" ? "others" : item.value });
                        setCustomChannelName("");
                      }}
                      className='sr-only'
                    />
                    <svg
                      className='!w-5 !h-5'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                      style={{ color: isSelected ? item.iconColor : "#6B7280" }}>
                      <path d={item.svg} />
                    </svg>
                    <span className={`font-medium ${isSelected ? ui.activeText : "text-gray-700"}`}>{item.label}</span>
                    {isSelected && (
                      <div className='absolute top-2 right-2'>
                        <svg className={`w-5 h-5 ${ui.activeCheck}`} fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d={item.svgh} clipRule='evenodd' />
                        </svg>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            {isOtherChannelSelected && (
              <div className='col-span-2 flex flex-col gap-1 -mt-5'>
                <label className='font-bold'>ชื่อช่องทาง</label>
                <textarea
                  rows={1}
                  value={channel_access === "others" ? customChannelName : channel_access || customChannelName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomChannelName(value);
                    if (value.trim()) setCustomerInfo({ channel_access: value });
                    else setCustomerInfo({ channel_access: "others" });
                  }}
                  placeholder='ระบุชื่อช่องทาง'
                  className='border rounded px-3 py-2 w-full resize-none leading-relaxed'
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
            )}
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold'>วันที่รับสินค้า</label>
            <DatePicker
              selected={rawDate ? new Date(rawDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setRawDate(date.toISOString());
                  const buddhistYear = date.getFullYear() + 543;
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  setCustomerInfo({
                    deliveryDate: `${day}/${month}/${buddhistYear}`,
                  });
                } else {
                  setRawDate("");
                  setCustomerInfo({ deliveryDate: "" });
                }
              }}
              dateFormat='dd/MM/yyyy'
              minDate={userRole === "admin" ? undefined : new Date()}
              locale='th'
              placeholderText='เลือกวัน/เดือน/ปี ที่จัดส่ง'
              className='w-full border rounded px-3 py-2 font-inherit'
              customInput={<CustomDateInput />}
              renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
                const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
                const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

                return (
                  <div className='flex justify-between items-center mb-2 px-2'>
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                      {"<"}
                    </button>

                    <div className='flex items-center gap-2'>
                      <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(Number(value))} className='border rounded px-1 py-0.5'>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year + 543}
                          </option>
                        ))}
                      </select>

                      <select value={date.getMonth()} onChange={({ target: { value } }) => changeMonth(Number(value))} className='border rounded px-1 py-0.5'>
                        {months.map((month, index) => (
                          <option key={index} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                      {">"}
                    </button>
                  </div>
                );
              }}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='food-delivery-time' className='font-bold'>
              เวลาส่งอาหาร
            </label>
            <div className='flex items-center gap-2'>
              <input
                id='food-delivery-time'
                type='text'
                value={export_time}
                onChange={(e) => {
                  setCustomerInfo({ exportTime: formatTimeChangeValue(e.target.value) });
                }}
                onBlur={(e) => {
                  const normalized = formatTimeBlurValue(e.target.value);
                  if (normalized) setCustomerInfo({ exportTime: normalized });
                }}
                maxLength={5}
                className='w-full border border-gray-300 rounded px-3 py-2 font-mono'
                placeholder='__:__'
              />
              <span className='text-gray-600'>น.</span>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='food-pickup-time' className='font-bold'>
              เวลารับอาหาร
            </label>
            <div className='flex items-center gap-2'>
              <input
                id='food-pickup-time'
                type='text'
                value={receive_time}
                onChange={(e) => {
                  setCustomerInfo({ receiveTime: formatTimeChangeValue(e.target.value) });
                }}
                onBlur={(e) => {
                  const normalized = formatTimeBlurValue(e.target.value);
                  if (normalized) setCustomerInfo({ receiveTime: normalized });
                }}
                maxLength={5}
                className='w-full border border-gray-300 rounded px-3 py-2 font-mono'
                placeholder='__:__'
              />
              <span className='text-gray-600'>น.</span>
            </div>
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold'>สถานที่จัดส่ง</label>
            <textarea
              ref={locationTextareaRef}
              rows={1}
              value={location_send}
              onChange={(e) => setCustomerInfo({ location: e.target.value })}
              placeholder='ระบุสถานที่จัดส่ง'
              className='w-full border rounded px-3 py-2 resize-none leading-relaxed overflow-hidden'
              style={{ fontFamily: 'inherit' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.max(40, target.scrollHeight) + "px";
              }}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='font-bold'>ชื่อผู้รับสินค้า</label>
            <textarea rows={1} value={receive_name} onChange={(e) => setCustomerInfo({ receive_name: e.target.value })} placeholder='ระบุชื่อผู้รับสินค้า' className='border rounded px-3 py-2 resize-none leading-relaxed' style={{ fontFamily: 'inherit' }} />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='font-bold'>เบอร์ติดต่อ</label>
            <textarea rows={1} value={customer_tel} onChange={handle.PhoneChange} placeholder='ระบุเบอร์ติดต่อ' className='border rounded px-3 py-2 resize-none leading-relaxed' style={{ fontFamily: 'inherit' }} />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='font-bold'>ค่าจัดส่ง</label>
            <textarea rows={1} value={shipping_cost} onChange={handle.ShippingCostChange} placeholder='ระบุค่าจัดส่ง' className='border rounded px-3 py-2 resize-none leading-relaxed' style={{ fontFamily: 'inherit' }} />
          </div>
          <div ref={dropdownRef} className='flex flex-col gap-1 relative'>
            <label className='font-bold'>ส่งโดย</label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className='w-auto h-auto border! border-[#e5e5e5]! text-[#808080]! rounded px-3 py-2 text-base leading-relaxed min-h-10.5 hover:bg-gray-50!'
              style={{ fontFamily: 'inherit' }}
            >
              {shipping_by || 'เลือกวิธีจัดส่ง'}
            </button>
            {dropdownOpen && (
              <div className='absolute top-full left-0 w-full bg-white border border-gray-300 rounded p-2 z-10 shadow-lg mt-1'>
                {shippingByOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCustomerInfo({ shipping_by: opt.value });
                      setDropdownOpen(false);
                    }}
                    className='w-full text-[#808080]! text-left px-3 py-1 hover:bg-gray-100! rounded transition-colors!'
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* <Select value={shipping_by || ""} onValueChange={(value) => setCustomerInfo({ shipping_by: value })}>
              <SelectTrigger className='w-auto h-auto border rounded px-3 py-2 text-base leading-relaxed min-h-10.5' style={{ fontFamily: 'inherit' }}>
                <SelectValue placeholder='เลือกวิธีจัดส่ง' />
              </SelectTrigger>
              <SelectContent side='bottom' align='end' position='popper' avoidCollisions={true} collisionPadding={8} sideOffset={4} className='w-[200px] max-w-[200px]'>
                {shippingByOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold' htmlFor=''>
              ออกบิลในนาม
            </label>
            <textarea
              value={customer_name}
              onChange={(e) => setCustomerInfo({ name: e.target.value })}
              className='border rounded px-3 py-2 min-h-[80px] resize-none overflow-hidden'
              placeholder='ออกบิลในนาม'
              style={{ fontFamily: 'inherit' }}
              rows={3}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.max(80, target.scrollHeight) + "px";
              }}
            />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold' htmlFor=''>
              เลขใบกำกับภาษี
            </label>
            <textarea
              className='border rounded px-3 py-2 resize-none'
              value={invoice_tex}
              onChange={(e) => setCustomerInfo({ invoice_tex: e.target.value })}
              placeholder='เลขใบกำกับภาษี ( 13 หลัก)'
              style={{ fontFamily: 'inherit' }}
              rows={1}
            />
          </div>
        </div>

        {/* Regular Menu Items */}
        <ul className='space-y-4 mb-4'>
          {items.map((item) =>
            item.item_id ? (
              <li key={item.item_id} className='border p-4 rounded flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='font-medium'>{item.menu_name}</div>
                  {item.menu_description && <div className='text-sm text-gray-600 mt-1 italic'>หมายเหตุ: {item.menu_description}</div>}
                </div>
                <div className='flex items-center space-x-2'>
                  <button onClick={() => removeItem(item.item_id!)} className='px-3 py-1 bg-red-500 text-white rounded'>
                    −
                  </button>
                  <input type='number' value={item.menu_total} onChange={(e) => handle.ChangeQuantity(item.item_id!, Number(e.target.value))} className='w-16 text-center border rounded' />
                  <button onClick={() => addItem(item, item.menu_description || "")} className='px-3 py-1 bg-green-500 text-white rounded'>
                    +
                  </button>
                </div>
              </li>
            ) : null
          )}
        </ul>

        {/* Selected Lunchboxes */}
        {selected_lunchboxes.length > 0 && (
          <div className='space-y-3 mb-4'>
            <div className='flex items-end'>
              <img className='w-8 h-8' src={SetFoodSelect.src} alt='' />
              <h3 className='ml-2 !font-bold'>ชุดอาหารที่เลือก</h3>
            </div>
            {selected_lunchboxes
              .slice()
              .reverse()
              .map((lunchbox, reversedIndex) => {
                const actualIndex = selected_lunchboxes.length - 1 - reversedIndex;
                const menuGroups = groupMenusByLimit(lunchbox.selected_menus, lunchbox.lunchbox_limit);

                return (
                  <div key={actualIndex} className='border p-4 rounded bg-gray-50'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h4 className='font-medium'>
                          {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set}
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          Swal.fire({
                            icon: "question",
                            title: "ยืนยันการลบ",
                            text: `คุณต้องการลบชุดอาหาร "${lunchbox.lunchbox_name} - ${lunchbox.lunchbox_set}" หรือไม่?`,
                            showCancelButton: true,
                            confirmButtonText: "ลบ",
                            cancelButtonText: "ยกเลิก",
                            confirmButtonColor: "#e74c3c",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              removeLunchbox(actualIndex);
                              Swal.fire({
                                icon: "success",
                                title: "ลบสำเร็จ",
                                text: "ชุดอาหารถูกลบเรียบร้อยแล้ว",
                                timer: 1500,
                                showConfirmButton: false,
                              });
                            }
                          });
                        }}
                        className='px-2 py-1 w-auto !bg-red-500 !text-white rounded text-sm duration-300 !transition-all ease-in-out hover:!font-semibold hover:!bg-red-700 hover:!scale-105'>
                        ลบ
                      </button>
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <label className='text-sm'>จำนวน:</label>
                      <input
                        type='number'
                        value={lunchbox.quantity}
                        onChange={(e) => updateLunchboxQuantity(actualIndex, Number(e.target.value))}
                        min='1'
                        className='w-20 border rounded px-2 py-1 text-center'
                      />
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <label className='text-sm'>ราคารวม:</label>
                      <input
                        type='text'
                        value={lunchbox.lunchbox_total_cost}
                        onChange={(e) => handle.LunchboxTotalCostChange(actualIndex, e)}
                        placeholder='ใส่ราคารวม'
                        className='w-32 border rounded px-2 py-1 text-center'
                      />
                      <span className='text-sm text-gray-500'>บาท</span>
                    </div>

                    <div className='mb-2'>
                      <p className='text-sm font-medium'>เมนูที่เลือก:</p>
                      {menuGroups.length > 0 ? (
                        menuGroups.map((group, groupIndex) => (
                          <div key={groupIndex} className='mb-2'>
                            <p className='text-xs text-gray-600'>ชุดที่ {groupIndex + 1}:</p>
                            <div className='flex flex-col gap-1 mt-1 items-start'>
                              {group.map((menu, menuIndex) => (
                                <span key={menuIndex} className='inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                                  {menuIndex + 1}. {menu.menu_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className='text-sm text-gray-500'>ยังไม่ได้เลือกเมนู</p>
                      )}
                    </div>

                    {/* แสดง Note ถ้ามี */}
                    {lunchbox.note && (
                      <div className='mb-2'>
                        <p className='text-sm font-medium text-green-600'>📝 หมายเหตุ:</p>
                        <p className='text-sm text-gray-700 bg-green-50 p-2 rounded border-l-4 border-green-200'>{lunchbox.note}</p>
                      </div>
                    )}

                    <button
                      onClick={() => handle.EditLunchbox(actualIndex)}
                      className='w-auto mx-auto flex !items-center !justify-center gap-2 px-3 py-2 rounded duration-300 !transition-all ease-in-out hover:!bg-gray-300 hover:!font-semibold hover:!scale-105 text-sm'>
                      <img className='w-7 h-7' src={Edit.src} alt='' /> แก้ไขทั้งหมด
                    </button>
                  </div>
                );
              })}
          </div>
        )}

        <div className='border p-4 rounded mb-4'>
          <button
            onClick={() => {
              if (validate.BasicInfo()) {
                router.push("/home/order/menu-picker");
              } else {
                const missingFields = [];
                if (!channel_access.trim()) missingFields.push("• ช่องทาง");
                if (!receive_name.trim()) missingFields.push("• ชื่อลูกค้า");
                if (!customer_tel.trim()) missingFields.push("• เบอร์โทรลูกค้า");
                if (!location_send.trim()) missingFields.push("• สถานที่จัดส่ง");
                if (!delivery_date.trim()) missingFields.push("• วันที่จัดส่ง");
                if (!export_time.trim()) missingFields.push("• เวลาส่งอาหาร");
                if (!receive_time.trim()) missingFields.push("• เวลารับอาหาร");
                if (!shipping_cost.trim()) missingFields.push("• ค่าจัดส่ง");
                if (!customer_name.trim()) missingFields.push("• ออกบิลในนาม");
                if (invoice_tex.trim() !== "" && invoice_tex.length !== 13) {
                  missingFields.push("• เลขใบกำกับภาษี (ต้องเป็น 13 หลัก)");
                }

                Swal.fire({
                  icon: "warning",
                  title: "ข้อมูลไม่ครบถ้วน",
                  html: `<div style="text-align: left;">กรุณากรอกข้อมูลให้ครบถ้วนก่อน:<br><br>${missingFields.join("<br>")}</div>`,
                  confirmButtonText: "ตกลง",
                  confirmButtonColor: "#f39c12",
                });
              }
            }}
            disabled={!validate.BasicInfo()}
            className={`w-full text-center px-4 py-2 text-white rounded !transition-all duration-300 ${validate.BasicInfo() ? "bg-green-500 hover:bg-green-600 hover:scale-110 hover:font-semibold cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}>
            <svg viewBox='0 0 1024 1024' className='icon relative -top-0.5 !w-10 !h-10' version='1.1' xmlns='http://www.w3.org/2000/svg'>
              <path d='M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z' fill={validate.BasicInfo() ? "#4CAF50" : "#9CA3AF"} />
              <path d='M448 298.666667h128v426.666666h-128z' fill='#FFFFFF' />
              <path d='M298.666667 448h426.666666v128H298.666667z' fill='#FFFFFF' />
            </svg>
            เพิ่มชุดอาหาร
          </button>

          {/* แสดงรายการข้อมูลที่ยังไม่ได้กรอก */}
          {!validate.BasicInfo() && (
            <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded'>
              <p className='text-sm font-medium text-yellow-800 mb-2'>📋 กรุณากรอกข้อมูลให้ครบถ้วน:</p>
              <ul className='text-xs text-yellow-700 space-y-1'>
                {missingFieldChecks
                  .filter((f) => f.show)
                  .map((f) => (
                    <li key={f.key}>• {f.label}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* แสดงส่วนการชำระเงินเมื่อมีชุดอาหารที่เลือกเท่านั้น */}
        {selected_lunchboxes.length > 0 && (
          <>
            <div className='flex items-center gap-2 mb-4'>
              <label className='font-bold'>รูปแบบการชำระเงิน</label>
              <Select value={pay_type || ""} onValueChange={(value) => setCustomerInfo({ pay_type: value })}>
                <SelectTrigger className='w-auto'>
                  <SelectValue placeholder='เลือกรูปแบบการชำระเงิน' />
                </SelectTrigger>
                <SelectContent side='bottom' align='start' position='popper' avoidCollisions={true} collisionPadding={8} sideOffset={4} className='w-[200px] max-w-[200px]'>
                  {payTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pay_type && (
              <>
                <div className='flex flex-col gap-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <label className='font-bold'>รูปแบบการชำระ</label>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    {depositOptions.map((opt) => {
                      const isSelected = pay_deposit === opt.value;
                      const ui = depositUi[opt.value];

                      return (
                        <label
                          key={opt.value}
                          htmlFor={opt.id}
                          className={`relative flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? ui.activeContainer : ui.inactiveContainer
                            }`}>
                          <input
                            type='radio'
                            id={opt.id}
                            name='deposit'
                            value={opt.value}
                            checked={isSelected}
                            onChange={opt.onSelect}
                            className='sr-only'
                          />
                          <span style={{ color: isSelected ? ui.iconActiveColor : ui.iconInactiveColor }}>{opt.icon}</span>
                          <span className={`font-medium ${isSelected ? ui.activeText : "text-gray-700"}`}>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {pay_deposit === "full" && (
                  <div className='flex flex-col gap-2 mb-4'>
                    <div className='flex items-center gap-2'>
                      <label className='font-bold'>สถานะการชำระเงิน</label>
                    </div>
                    <div className='flex items-center justify-center gap-2 p-4 border-2 rounded-lg border-green-500 bg-green-50 shadow-md'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='!w-5 !h-5'
                        style={{ color: "#10B981" }}
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'>
                        <path d='M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' />
                        <path d='m16 19 3 3 3-3' />
                        <path d='M18 12h.01' />
                        <path d='M19 16v6' />
                        <path d='M6 12h.01' />
                        <circle cx='12' cy='12' r='2' />
                      </svg>
                      <span className='font-medium text-green-700'>ชำระแล้ว</span>
                    </div>
                  </div>
                )}

                {pay_deposit && pay_deposit === "percent" && (
                  <div className='flex flex-col gap-2 mb-4'>
                    <div className='flex items-center gap-2'>
                      <label className='font-bold'>สถานะการชำระเงิน</label>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      {paymentStatusOptions.map((opt) => {
                        const isSelected = ispay === opt.value;
                        const ui = paymentStatusUi[opt.value];

                        return (
                          <label
                            key={opt.value}
                            htmlFor={opt.id}
                            className={`relative flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? ui.activeContainer : ui.inactiveContainer
                              }`}>
                            <input
                              type='radio'
                              id={opt.id}
                              name='payment-status'
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => setCustomerInfo({ ispay: opt.value })}
                              className='sr-only'
                            />
                            <span style={{ color: isSelected ? ui.iconActiveColor : "#6B7280" }}>{opt.icon}</span>
                            <span className={`font-medium ${isSelected ? ui.activeText : "text-gray-700"}`}>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              </>
            )}

            <div className='border rounded p-4 mb-4 bg-gray-50'>
              {(() => {
                const calcTotalCost = () => {
                  const totalCostStr = total_cost?.replace(/,/g, "") ?? "";
                  const totalCostNum = parseFloat(totalCostStr) || 0;
                  return totalCostNum;
                };

                const formatMoney2 = (num: number) => Number(num.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                const foodCostText =
                  Array.isArray(selected_lunchboxes) && selected_lunchboxes.length > 0
                    ? `${selected_lunchboxes.reduce((sum, lb) => sum + (Number(lb.lunchbox_total_cost?.replace(/[^\d]/g, "")) || 0), 0).toLocaleString("th-TH")} บาท`
                    : "-";

                const totalCostText = total_cost ? `${formatMoney2(calcTotalCost())} บาท` : "-";

                const depositText = (() => {
                  if (!pay_deposit || !pay_cost) return "-";
                  if (pay_deposit === "percent") {
                    const totalCostNum = calcTotalCost();
                    const payCostNum = Number(pay_cost.replace(/[^\d]/g, "")) || 0;
                    const depositAmount = (totalCostNum * payCostNum) / 100;
                    return `${pay_cost}% (${formatMoney2(depositAmount)} บาท)`;
                  }
                  return `${(Number(pay_cost.replace(/[^\d]/g, "") || 0) / 100).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
                })();

                const remainText =
                  total_remain
                    ? (() => {
                      const remainStr = typeof total_remain === "string" ? total_remain.replace(/,/g, "") : String(total_remain);
                      const remainNum = parseFloat(remainStr) || 0;
                      return remainNum > 0 ? `${remainNum.toFixed(2)} บาท` : "0.00 บาท";
                    })()
                    : "-";

                const summaryRows: Array<{
                  key: string;
                  label: React.ReactNode;
                  value: React.ReactNode;
                  withBorder: boolean;
                  labelClass: string;
                  valueClass: string;
                }> = [
                    { key: "food", label: "ค่าอาหาร", value: <span className='text-lg'>{foodCostText}</span>, withBorder: true, labelClass: "font-bold", valueClass: "" },
                    { key: "shipping", label: "ค่าส่ง", value: <span className='text-lg'>{shipping_cost ? `${shipping_cost} บาท` : "-"}</span>, withBorder: true, labelClass: "font-bold", valueClass: "" },
                    { key: "fee", label: "ค่าธรรมเนียม", value: <span className='text-lg'>{pay_charge ? `${pay_charge} บาท` : "-"}</span>, withBorder: true, labelClass: "font-bold", valueClass: "" },
                    { key: "total", label: "ยอดทั้งหมด", value: <span className='text-lg'>{totalCostText}</span>, withBorder: true, labelClass: "font-bold", valueClass: "" },
                    {
                      key: "deposit",
                      label: pay_deposit === "full" ? "ยอดที่ต้องชำระ" : "ค่ามัดจำ",
                      value: <span className='text-lg text-orange-600'>{depositText}</span>,
                      withBorder: true,
                      labelClass: "font-bold",
                      valueClass: "",
                    },
                    {
                      key: "remain",
                      label: "คงเหลือ",
                      value: <span className='text-xl font-bold text-green-700'>{remainText}</span>,
                      withBorder: false,
                      labelClass: "font-bold text-green-700",
                      valueClass: "",
                    },
                  ];

                return summaryRows.map((row) => (
                  <div key={row.key} className={`flex justify-between items-center py-2 ${row.withBorder ? "border-b" : ""}`}>
                    <label className={row.labelClass}>{row.label}</label>
                    {row.value}
                  </div>
                ));
              })()}
            </div>
          </>
        )}
        <button
          onClick={confirmOrder}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a0aec0" : errors.length === 0 ? "#38a169" : "#e53e3e",
            cursor: loading ? "not-allowed" : "pointer",
            color: "white",
          }}
          className={`w-full py-2 rounded font-bold !transition-all duration-300 ${loading ? "" : errors.length === 0 ? "hover:!bg-green-500" : "hover:bg-red-400"}`}>
          {loading ? "กำลังส่ง..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </div>
    </main>
  );
}
