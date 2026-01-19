// src/lib/lunchboxUtils.ts
import { MenuItemWithAutoRice } from "./types";

// สร้างคีย์เมนู (Unique Key)
export const buildMenuKey = (menu: Partial<MenuItemWithAutoRice>) => 
  menu.lunchbox_menuid ?? `${menu.menu_id ?? ""}-${menu.lunchbox_menu_category ?? ""}-${menu.menu_name ?? ""}`;

// จัดการสระภาษาไทย (เ + เ = แ)
export const normalizeThaiText = (text: string): string => {
  if (!text) return "";
  return text.replace(/เเ/g, "แ");
};

// ดึงราคาจากชื่อ Set (เช่น "Set A 100 baht")
export const extractPriceFromSetName = (setName: string): number | null => {
  const match = setName.match(/(\d+)\s*baht/i);
  return match ? parseInt(match[1], 10) : null;
};

// เรียงลำดับตัวอักษร (รองรับภาษาไทย + ตัวเลข)
export const sortStrings = (values: string[]) => 
  [...values].sort((a, b) => a.localeCompare(b, "th", { numeric: true, sensitivity: "base" }));

// ระบุประเภทเนื้อสัตว์จากชื่อเมนู
export const getMeatType = (menuName: string): "หมู" | "ไก่" | "หมึก" | "กุ้ง" | "ทะเล" | null => {
  if (menuName.includes("หมู")) return "หมู";
  if (menuName.includes("ไก่")) return "ไก่";
  if (menuName.includes("หมึก")) return "หมึก";
  if (menuName.includes("กุ้ง")) return "กุ้ง";
  if (menuName.includes("ทะเล")) return "ทะเล";
  return null;
};

// ระบุประเภทอาหารจานหลัก
export const getDishType = (menuName: string): string | null => {
  if (menuName.includes("กะเพรา") || menuName.includes("กระเพรา")) return "กะเพรา";
  if (menuName.includes("กระเทียม")) return "กระเทียม";
  if (menuName.includes("พริกแกง") || menuName.includes("พริกเเกง")) return "พริกแกง";
  if (menuName.includes("พะแนง")) return "พะแนง";
  if (menuName.includes("คั่วกลิ้ง")) return "คั่วกลิ้ง";
  if (menuName.includes("ผัดผงกะหรี่")) return "ผัดผงกะหรี่";
  return null;
};

// สร้าง URL รูปภาพ
export const buildBlobImageUrl = (imageName?: string | null) => 
  (imageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${imageName}` : null);

// ตรวจสอบโควต้าของหมวดหมู่ (Category Limit)
export const getCategoryLimit = (foodSet: string, setMenu: string, category: string) => {
  if (category === "ข้าว") return 1;
  // เฉพาะ Set F ของ Lunch Box ที่เลือกเครื่องเคียงได้ 2
  if (category === "เครื่องเคียง") {
    if (foodSet === "Lunch Box" && setMenu === "F") return 2;
  }
  return 1;
};

import { LunchBoxFromAPI } from "./types"; // ตรวจสอบว่ามีการ import LunchBoxFromAPI ที่ด้านบนไฟล์หรือยัง ถ้ายังให้เติมด้วย

export const getSetLimit = (lunchboxData: LunchBoxFromAPI[], foodSet: string, setMenu: string) => {
  const item = lunchboxData.find((item) => item.lunchbox_name === foodSet && item.lunchbox_set_name === setMenu);
  return item?.lunchbox_limit ?? 0;
};
