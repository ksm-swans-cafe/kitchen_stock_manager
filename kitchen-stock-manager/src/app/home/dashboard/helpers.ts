// Dashboard Helper Functions
import { monthNamesShort } from "./constants";

export const cleanTime = (text: string) => text.replace(/\(.*?\)/g, "").trim();

export const getMonthNameShort = (monthNum: string | number): string => {
  const num = typeof monthNum === "string" ? parseInt(monthNum, 10) : monthNum;
  return monthNamesShort[num - 1] || monthNum.toString();
};

export const getTimeAlertInfo = (minutes?: number) => {
  if (minutes == null) return null;
  if (minutes <= 30) {
    return {
      label: `ใกล้เวลาส่ง (${minutes} นาที)`,
      className: "bg-red-50 border border-red-300 text-red-700",
    };
  }
  if (minutes <= 60) {
    return {
      label: `ควรเตรียมแล้ว (${minutes} นาที)`,
      className: "bg-amber-50 border border-amber-300 text-amber-800",
    };
  }
  if (minutes <= 1440) {
    const hours = Math.round(minutes / 60);
    return {
      label: `เหลือเวลาอีก ${hours} ชั่วโมง`,
      className: "bg-emerald-50 border border-emerald-300 text-emerald-800",
    };
  }
  const days = Math.round(minutes / 1440);
  return {
    label: `เหลือเวลาอีก ${days} วัน`,
    className: "bg-blue-50 border border-blue-300 text-blue-800",
  };
};

export const calculatePackaging = (setName: string, quantity: number) => {
  const normalizedSet = setName.toUpperCase().trim();
  let fukYai = 0, box2Chan = 0, box3Chan = 0;
  
  if (normalizedSet.includes('A')) {
    box2Chan = quantity;
  } else if (normalizedSet.includes('B')) {
    box3Chan = quantity;
  } else if (/[C-G]/.test(normalizedSet)) {
    box2Chan = quantity;
    fukYai = quantity;
  }
  
  return { fukYai, box2Chan, box3Chan };
};

export const calculateMinutesToSend = (date: string, sendTime: string): number => {
  const [day, month, year] = date.split("/").map(Number);
  const [hours, minutes] = sendTime.split(":").map(Number);
  const gregorianYear = year - 543;
  const sendDateTime = new Date(gregorianYear, month - 1, day, hours, minutes, 0);
  const now = new Date();
  const diffMs = sendDateTime.getTime() - now.getTime();
  return Math.max(Math.round(diffMs / (1000 * 60)), -999);
};

// คำนวณนาทีจนถึงเวลาใดๆ ของวันนั้น (รองรับเวลาแบบมีข้อความปน เช่น "12:00 (โดยประมาณ)")
// ถ้าแปลงเวลาไม่ได้ คืนค่า null
export const calculateMinutesToTime = (date: string, timeStr: string): number | null => {
  const timeMatch = (timeStr || "").match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  const [day, month, year] = date.split("/").map(Number);
  if (!day || !month || !year) return null;
  const gregorianYear = year - 543;
  const target = new Date(gregorianYear, month - 1, day, Number(timeMatch[1]), Number(timeMatch[2]), 0);
  const diffMs = target.getTime() - new Date().getTime();
  return Math.max(Math.round(diffMs / (1000 * 60)), -999);
};

// ======= การเรียงลำดับเมนูตามหมวดหมู่ (menu_category จาก database) =======
// ลำดับ: ข้าว → สปาเก็ตตี้ → กับข้าว (กะเพรา → กระเทียม → ผัด → ซอส → ต้ม → แกง)
//        → เครื่องเคียง (ไข่ข้น/ไข่ตุ๋น) → ขนมไทย → ผลไม้ → เค้ก → ขนมปัง → เครื่องดื่ม → เพิ่มเติม
// ชื่อ category ในแต่ละกลุ่มอิงจากค่าที่มีอยู่จริงใน collection menu / new_cart
// keywords ใช้เป็น fallback สำหรับเมนูที่ไม่มี menu_category (ไล่เช็คตามลำดับกลุ่ม)
const MENU_TIERS: Array<{ label: string; categories: string[]; keywords: string[] }> = [
  { label: "ข้าว", categories: ["ข้าว", "ข้าวสวย", "ข้าวผัด"], keywords: ["ข้าวสวย", "ข้าวเหนียว", "ขนมจีน", "ข้าวผัด"] },
  { label: "สปาเก็ตตี้", categories: ["สปาเกตตี้", "สปาเก็ตตี้"], keywords: ["สปาเกตตี้", "สปาเก็ตตี้"] },
  { label: "กะเพรา", categories: [], keywords: ["กะเพรา", "กระเพรา"] },
  { label: "กระเทียม", categories: ["ทอดกระเทียม"], keywords: ["กระเทียม"] },
  { label: "ผัด", categories: ["ผัด", "กับข้าว", "ผัดพริกแกงใต้", "ย่าง", "ทอด", "สเต็ก", "ยำ", "สลัด", "เนื้อสัตว์"], keywords: ["ผัด", "คั่วกลิ้ง", "ย่าง", "ยำ", "สลัด"] },
  { label: "ซอส", categories: ["ซอส"], keywords: ["ซอส", "น้ำจิ้ม"] },
  { label: "ต้ม", categories: ["ต้ม", "ซุป"], keywords: ["ต้ม", "ซุป", "แกงจืด", "พะโล้"] },
  { label: "แกง", categories: ["แกง", "แกงใต้"], keywords: ["แกง"] },
  { label: "เครื่องเคียง", categories: ["เครื่องเคียง", "ไข่ข้น", "ไข่ตุ๋น"], keywords: ["ไข่ข้น", "ไข่ตุ๋น"] },
  { label: "ขนมไทย", categories: ["ของหวาน", "ขนม", "ขนมไทย"], keywords: ["บวชชี", "เชื่อม", "ข้าวเหนียวมะม่วง", "ขนม"] },
  { label: "ผลไม้", categories: ["ผลไม้", "ผลไม้ตามฤดูกาล"], keywords: ["ผลไม้"] },
  { label: "เค้ก", categories: ["เค้ก"], keywords: ["เค้ก", "ชีสพาย", "ชีสเค้ก", "cheesecake", "cheesepie", "บานอฟฟี่"] },
  { label: "ขนมปัง", categories: ["ขนมปัง"], keywords: ["ขนมปัง", "แซนวิช", "ครัวซองต์", "ปัง"] },
  { label: "เครื่องดื่ม", categories: ["เครื่องดื่ม", "น้ำ", "น้ำแข็งสำหรับเครื่องดื่ม"], keywords: ["น้ำ", "ชา", "กาแฟ", "โกโก้", "ลาเต้", "อเมริกาโน่"] },
  { label: "เพิ่มเติม", categories: ["เพิ่มเติม", "อุปกรณ์เสริม", "กล่อง", "-"], keywords: [] },
];
const tierIndex = (label: string) => MENU_TIERS.findIndex((t) => t.label === label);
const TIER_KAPRAO = tierIndex("กะเพรา");
const TIER_GARLIC = tierIndex("กระเทียม");
const TIER_PAD = tierIndex("ผัด");
const TIER_TOM = tierIndex("ต้ม");
const TIER_KAENG = tierIndex("แกง");
const TIER_BREAD = tierIndex("ขนมปัง");
const TIER_EXTRA = tierIndex("เพิ่มเติม"); // ไม่รู้จะจัดไว้ไหน ให้ลงเพิ่มเติมท้ายสุด

// ชื่อเมนูบางตัวใน DB มีอักขระ zero-width แทรกอยู่ ทำให้เทียบ substring ไม่เจอ ต้องล้างออกก่อน
// (เช่น "ไข่ข้นกุ้ง" เก็บ "กุ้ง" เป็น ก+วรรณยุกต์+สระ) ตาเห็นเหมือนกันแต่ byte ไม่ตรง จึงล้าง zero-width
// และย้ายวรรณยุกต์ไปหลังสระบน/ล่างตามลำดับมาตรฐานก่อนเทียบ substring
const cleanName = (text: string) => text.replace(/[\u200B\u200C\u200D\uFEFF]/g, "").replace(/([\u0E48-\u0E4B])([\u0E34-\u0E3A])/g, "$2$1").trim();

// หมวดของคาวที่ต้องแยกกะเพรา/กระเทียมออกมาด้วยชื่อเมนู
// (ใน DB เมนูกะเพราส่วนใหญ่อยู่หมวด "ผัด" เช่น "ข้าว+กะเพราหมู")
const SAVORY_CATS = new Set(["", "ผัด", "กับข้าว", "ทอดกระเทียม", "ผัดพริกแกงใต้", "ทอด"]);

const getCategoryRank = (category?: string, name?: string): number => {
  const cat = cleanName(category || "");
  const menuName = cleanName(name || "");
  // ขนมปัง/แซนวิชที่ถูกจัดหมวดไว้ผิด (เช่นอยู่ใน "ของหวาน") ให้มาอยู่กลุ่มขนมปังเสมอ
  if (/ขนมปัง|ขนมปั้ง|แซนวิช|ครัวซองต์|ปังหมูหยอง|ปังไส้/.test(menuName)) return TIER_BREAD;
  // เมนูที่หมวดใน DB ขัดแย้งกันระหว่าง collection menu กับ new_cart
  // (เช่น แกงพะแนงหมู เป็น "ต้ม" ใน menu แต่เป็น "แกง" ใน new_cart)
  // ตัดสินด้วยชื่อเมนูให้ลงกลุ่มเดียวกันเสมอ: แกงจืด/พะโล้ → ต้ม, พะแนง/เขียวหวาน → แกง, คั่วกลิ้ง → ผัด
  if (/แกงจืด|ต้มจืด|พะโล้/.test(menuName)) return TIER_TOM;
  if (/พะแนง|แกงเขียวหวาน/.test(menuName)) return TIER_KAENG;
  if (menuName.includes("คั่วกลิ้ง")) return TIER_PAD;
  if (SAVORY_CATS.has(cat)) {
    if (/กะเพรา|กระเพรา/.test(menuName)) return TIER_KAPRAO;
    if (menuName.includes("กระเทียม")) return TIER_GARLIC;
  }
  if (cat) {
    for (let i = 0; i < MENU_TIERS.length; i++) {
      if (MENU_TIERS[i].categories.includes(cat)) return i;
    }
  }
  for (let i = 0; i < MENU_TIERS.length; i++) {
    if (MENU_TIERS[i].keywords.some((k) => menuName.includes(k))) return i;
  }
  return TIER_EXTRA;
};

// ======= การเรียงลำดับเนื้อสัตว์ =======
// ลำดับ: หมูสับ → ไก่สับ → หมู → ไก่ → กุ้ง → หมึก → ทะเล → แซลมอน (อิงชื่อจาก collection meat_type)
const MEAT_ORDER = ["หมูสับ", "ไก่สับ", "หมู", "ไก่", "กุ้ง", "หมึก", "ทะเล", "แซลมอน"];
// ลำดับการตรวจชื่อ: คำเฉพาะเจาะจงมาก่อน (หมูสับ ก่อน หมู, ทะเล ก่อน กุ้ง/หมึก
// เพราะใน DB มีชื่ออย่าง "ทะเล (กุ้ง+หมึก)" ที่ต้องนับเป็นทะเล)
const MEAT_DETECT_ORDER = ["หมูสับ", "ไก่สับ", "ทะเล", "แซลมอน", "กุ้ง", "หมึก", "หมู", "ไก่"];

const getMeatRank = (name?: string, subname?: string): number => {
  // รวมสะกดที่พบใน DB: แซลม่อน / แซลมอล / แซลมอน ให้เป็นแบบเดียวกัน
  const text = cleanName(`${subname || ""} ${name || ""}`).replace(/แซลม่อน|แซลมอล/g, "แซลมอน");
  for (const meat of MEAT_DETECT_ORDER) {
    if (text.includes(meat)) return MEAT_ORDER.indexOf(meat);
  }
  return MEAT_ORDER.length;
};

// เปรียบเทียบเมนู 2 รายการ: หมวดหมู่ → เนื้อสัตว์ → ชื่อ (ก-ฮ)
export const compareMenuItems = (
  a: { name: string; menu_category?: string; menu_subname?: string },
  b: { name: string; menu_category?: string; menu_subname?: string }
): number => {
  const rankA = getCategoryRank(a.menu_category, a.name);
  const rankB = getCategoryRank(b.menu_category, b.name);
  if (rankA !== rankB) return rankA - rankB;
  const meatA = getMeatRank(a.name, a.menu_subname);
  const meatB = getMeatRank(b.name, b.menu_subname);
  if (meatA !== meatB) return meatA - meatB;
  return a.name.localeCompare(b.name, "th");
};

// ======= สถานะออเดอร์ =======
// ค่า status ใน new_cart: pending / completed / success / cancelled (ตรงกับหน้า summarylist)
// รองรับ "deposit"/"deposited" (มัดจำแล้ว) ไว้ล่วงหน้า เผื่ออนาคตมีการเพิ่มค่านี้ใน DB
export const getStatusInfo = (status?: string): { label: string; className: string } | null => {
  switch (status) {
    case "pending":
      return { label: "รอมัดจำ", className: "bg-amber-100 border border-amber-300 text-amber-800" };
    case "deposit":
    case "deposited":
      return { label: "มัดจำแล้ว", className: "bg-violet-100 border border-violet-300 text-violet-800" };
    case "completed":
      return { label: "ชำระเงินแล้ว", className: "bg-blue-100 border border-blue-300 text-blue-800" };
    case "success":
      return { label: "เสร็จสิ้น", className: "bg-emerald-100 border border-emerald-300 text-emerald-800" };
    case "cancelled":
      return { label: "ยกเลิก", className: "bg-rose-100 border border-rose-300 text-rose-800" };
    default:
      return null;
  }
};
