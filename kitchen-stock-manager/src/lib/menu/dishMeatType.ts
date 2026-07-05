// รายการเริ่มต้น (seed) ไว้ใช้ตอน DB ยังว่างเปล่า และเป็น fallback ระหว่างที่ยังโหลดรายการจริงจาก
// /api/get/dish-type และ /api/get/meat-type ไม่เสร็จ — รายการที่ใช้งานจริงมาจาก DB และแอดมินเพิ่มเองได้
export const DISH_TYPES = ["กะเพรา", "กระเทียม", "พริกแกง", "พะแนง", "คั่วกลิ้ง", "ผัดผงกะหรี่"] as const;
export type DishType = string;

export const MEAT_TYPES = ["หมู", "ไก่", "หมึก", "กุ้ง"] as const;
export type MeatType = string;

export interface DishMeatSource {
  menu_name?: string | null;
  lunchbox_dish_type?: string | null;
  lunchbox_meat_type?: string | null;
}

export function detectDishType(menuName: string): DishType | null {
  if (menuName.includes("กะเพรา") || menuName.includes("กระเพรา")) return "กะเพรา";
  if (menuName.includes("กระเทียม")) return "กระเทียม";
  if (menuName.includes("พริกแกง") || menuName.includes("พริกเเกง")) return "พริกแกง";
  if (menuName.includes("พะแนง")) return "พะแนง";
  if (menuName.includes("คั่วกลิ้ง")) return "คั่วกลิ้ง";
  if (menuName.includes("ผัดผงกะหรี่")) return "ผัดผงกะหรี่";
  return null;
}

export function detectMeatType(menuName: string): MeatType | null {
  if (menuName.includes("หมู")) return "หมู";
  if (menuName.includes("ไก่")) return "ไก่";
  if (menuName.includes("หมึก")) return "หมึก";
  if (menuName.includes("กุ้ง")) return "กุ้ง";
  return null;
}

export function resolveDishType(menu: DishMeatSource): DishType | null {
  const explicit = menu.lunchbox_dish_type?.trim();
  if (explicit) return explicit;
  return detectDishType(menu.menu_name ?? "");
}

export function resolveMeatType(menu: DishMeatSource): MeatType | null {
  const explicit = menu.lunchbox_meat_type?.trim();
  if (explicit) return explicit;
  return detectMeatType(menu.menu_name ?? "");
}

export const DEFAULT_MEAT_SURCHARGE: Record<MeatType, number> = {
  หมู: 0,
  ไก่: 0,
  หมึก: 10,
  กุ้ง: 10,
};
