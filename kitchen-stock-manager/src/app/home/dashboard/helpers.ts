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
