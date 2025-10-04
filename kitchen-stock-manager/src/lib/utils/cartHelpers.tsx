// ยังไม่ได้ใช้ทำอะไร

import { Dispatch, SetStateAction } from "react";
import { MenuItem } from "@/models/menu_card/MenuCard";

export interface CartItem extends MenuItem {
  menu_total: number;
  menu_description: string;
}

export const validateInputs = (name: string, tel: string, location: string, deliveryDate: string, exportTime: string, receiveTime: string, setErrors: Dispatch<SetStateAction<string[]>>): boolean => {
  const newErrors: string[] = [];

  if (!name.trim()) newErrors.push("กรุณากรอกชื่อลูกค้า");
  if (!tel.trim()) {
    newErrors.push("กรุณากรอกเบอร์โทรลูกค้า");
  } else if (!/^\d{3}-\d{3}-\d{4}$/.test(tel)) {
    newErrors.push("เบอร์โทรต้องอยู่ในรูปแบบ 081-234-5678");
  }
  if (!location.trim()) newErrors.push("กรุณากรอกสถานที่จัดส่ง");
  if (!deliveryDate.trim()) newErrors.push("กรุณาเลือกวันที่จัดส่ง");
  if (!exportTime.trim()) newErrors.push("กรุณาเลือกเวลาส่งอาหาร");
  if (!receiveTime.trim()) newErrors.push("กรุณาเลือกเวลารับอาหาร");

  setErrors(newErrors);
  return newErrors.length === 0;
};

export const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setCustomerInfo: (data: { tel: string }) => void) => {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 3 && value.length <= 6) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else if (value.length > 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
  }

  setCustomerInfo({ tel: value });
};

export const confirmOrder = async (
  data: {
    cart_username: string;
    cart_customer_name: string;
    cart_customer_tel: string;
    cart_location_send: string;
    cart_delivery_date: string;
    cart_export_time: string;
    cart_receive_time: string;
    cart_menu_items: CartItem[];
  },
  setLoading: Dispatch<SetStateAction<boolean>>,
  setErrors: Dispatch<SetStateAction<string[]>>,
  setSuccess: Dispatch<SetStateAction<boolean>>
) => {
  setLoading(true);
  setErrors([]);
  try {
    const response = await fetch("/api/post/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการสั่งซื้อ");
    setSuccess(true);
  } catch (err: unknown) {
    setErrors([err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"]);
  } finally {
    setLoading(false);
  }
};
