import { MenuItem } from "@/models/menu_card/MenuCard";

// ==================== Type หลักจากโค้ดเดิม ====================

// ใช้สำหรับเมนูที่มีสถานะเพิ่มข้าวอัตโนมัติ
export type MenuItemWithAutoRice = MenuItem & { 
  lunchbox_AutoRice?: boolean | null; 
  lunchbox_showPrice?: boolean 
};

// ใช้สำหรับรับข้อมูล Lunchbox จาก API
export interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image?: string;
  lunchbox_set_name_image?: string;
  // เพิ่ม field ที่อาจจะมาจากการแปลงข้อมูลภายหลัง (Optional)
  quantity?: number;
  lunchbox_total_cost?: string;
  note?: string;
  selected_menus?: MenuItemWithAutoRice[];
  lunchbox_set?: string; 
}

// สำหรับโหมดการแสดงผล (เดิมเขียน hardcode ไว้ใน useState)
export type ViewMode = "grid" | "list";

// สำหรับประเภทเนื้อสัตว์ (ช่วยให้ไม่ต้องพิมพ์ string เองและป้องกันการพิมพ์ผิด)
export type MeatType = "หมู" | "ไก่" | "หมึก" | "กุ้ง" | "ทะเล";

// สำหรับประเภทอาหารจานหลัก
export type DishType = "กะเพรา" | "กระเทียม" | "พริกแกง" | "พะแนง" | "คั่วกลิ้ง" | "ผัดผงกะหรี่";

// สำหรับ Props ของ Component รูปภาพ (เดิมเขียน inline ไว้)
export interface LunchboxImageProps {
  imageName?: string | null;
  alt: string;
  fallbackIcon: React.ReactNode;
}