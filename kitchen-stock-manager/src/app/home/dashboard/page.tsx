"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Maximize2, Minimize2, Star } from "lucide-react";
import { Button } from "@/share/ui/button";

interface DayItem {
  name: string;
  qty: number | string;
}

interface DayCard {
  id: number;
  dayOfWeek: string;
  dateTitle: string;
  sendPlace: string;
  sendTime: string;
  receiveTime: string;
  items: DayItem[];
  totalText: string;
  isPinned?: boolean;          // ใช้สำหรับระบุว่าการ์ดนี้ถูกปักหมุด
  minutesToSend?: number;      // ใช้สำหรับแจ้งเตือนเวลา (เหลือกี่นาทีก่อนเวลาส่ง)
}

const dayColor: Record<string, string> = {
  จันทร์: "from-yellow-400 to-yellow-500",
  อังคาร: "from-pink-400 to-pink-500",
  พุธ: "from-emerald-400 to-emerald-500",
  พฤหัสบดี: "from-orange-400 to-orange-500",
  ศุกร์: "from-sky-400 to-sky-500",
  เสาร์: "from-indigo-400 to-indigo-500",
  อาทิตย์: "from-rose-400 to-rose-500",
};

// legend สำหรับสีของวัน
const dayColorLegend = [
  { label: "จันทร์", className: "bg-yellow-400" },
  { label: "อังคาร", className: "bg-pink-400" },
  { label: "พุธ", className: "bg-emerald-400" },
  { label: "พฤหัสบดี", className: "bg-orange-400" },
  { label: "ศุกร์", className: "bg-sky-400" },
  { label: "เสาร์", className: "bg-indigo-400" },
  { label: "อาทิตย์", className: "bg-rose-400" },
];

// ข้อมูลทั้งหมด (4 ใบ) — ใช้ minutesToSend สำหรับแจ้งเตือนเวลา
const allCards: DayCard[] = [
  {
    id: 1,
    dayOfWeek: "พุธ",
    dateTitle: "วันพุธที่ 1 ต.ค. 68",
    sendPlace: "โบเนส ทาวเวอร์ สุขุมวิท 6",
    sendTime: "09.45 น.",
    receiveTime: "11.45 น.",
    minutesToSend: 120, // เหลือ 120 นาที (ตัวอย่าง)
    items: [
      { name: "ก๋วยจั๊บหมู", qty: 12 },
      { name: "ผัดผักรวมมิตร", qty: 12 },
      { name: "กระเพราหมู", qty: 12 },
      { name: "คั่วกลิ้งหมู", qty: 12 },
      { name: "แกงจืดเห็ดหูหนูขั้ว", qty: 12 },
      { name: "ไก่น่องทอด", qty: 12 },
      { name: "ไข่ตุ๋น", qty: 36 },
      { name: "น้ำผลไม้ / ชาไทย / กาแฟ", qty: 12 },
    ],
    totalText: "รวม 36 ชุด",
  },
  {
    id: 2,
    dayOfWeek: "พฤหัสบดี",
    dateTitle: "วันพฤหัสบดีที่ 2 ต.ค. 68",
    sendPlace: "โบเนส ทาวเวอร์ สุขุมวิท 6",
    sendTime: "09.45 น.",
    receiveTime: "11.45 น.",
    minutesToSend: 75,
    items: [
      { name: "ก๋วยจั๊บไก่", qty: 9 },
      { name: "ผัดผักรวม", qty: 10 },
      { name: "กระเพราหมูสับ", qty: 9 },
      { name: "คั่วกลิ้งหมู", qty: 9 },
      { name: "แกงจืดเห็ดหูหนูขั้ว", qty: 9 },
      { name: "ไก่น่องทอด", qty: 9 },
      { name: "ไข่ตุ๋น", qty: 28 },
    ],
    totalText: "รวม 28 ชุด",
  },
  {
    id: 3,
    dayOfWeek: "เสาร์",
    dateTitle: "วันเสาร์ที่ 4 ต.ค. 68",
    sendPlace: "สถานีกลางบางซื่อ",
    sendTime: "05.00 น. (ตี 5)",
    receiveTime: "05.30 น.",
    minutesToSend: 35,
    items: [
      { name: "ข้าวกล่องเมนูรวม", qty: 200 },
      { name: "หมูผัดซอส", qty: 760 },
      { name: "ไก่ย่าง / ไก่อบ", qty: 40 },
      { name: "บ๊ะจ่าง", qty: 200 },
    ],
    totalText: "รวม 200 ชุด",
  },
  {
    id: 4,
    dayOfWeek: "อาทิตย์",
    dateTitle: "วันอาทิตย์ที่ 5 ต.ค. 68",
    sendPlace: "อาคารตัวอย่าง",
    sendTime: "10.00 น.",
    receiveTime: "11.00 น.",
    minutesToSend: 20, // ปักหมุด + ใกล้เวลาส่ง
    items: [
      { name: "ข้าวผัดหมู", qty: 50 },
      { name: "แกงจืดเห็ดหูหนูสับ", qty: 50 },
      { name: "ไก่ทอดน้ำปลา", qty: 50 },
      { name: "ผัดผักรวม", qty: 50 },
      { name: "ผลไม้รวม", qty: 50 },
    ],
    totalText: "รวม 50 ชุด",
    isPinned: true, // ออเดอร์ที่ปักหมุด
  },
];

// ตัดข้อความในวงเล็บ เช่น (ตี 5)
const cleanTime = (text: string) => text.replace(/\(.*?\)/g, "").trim();

// คืนค่า label + classes สำหรับสถานะแจ้งเตือนเวลา
const getTimeAlertInfo = (minutes?: number) => {
  if (minutes == null) {
    return null;
  }

  if (minutes <= 30) {
    return {
      label: `ใกล้เวลาส่ง (${minutes} นาที)`,
      className:
        "bg-red-50 border border-red-300 text-red-700",
    };
  }

  if (minutes <= 60) {
    return {
      label: `ควรเตรียมแล้ว (${minutes} นาที)`,
      className:
        "bg-amber-50 border border-amber-300 text-amber-800",
    };
  }

  return {
    label: `เหลือเวลาอีก ${minutes} นาที`,
    className:
      "bg-emerald-50 border border-emerald-300 text-emerald-800",
  };
};

export default function Dashboard() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "auto";
  }, [fullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // แยกการ์ดปักหมุด / ปกติ
  const pinnedCard = allCards.find((c) => c.isPinned);
  const normalCards = allCards.filter((c) => !c.isPinned);
  const displayedNormalCards = normalCards.slice(0, 3);

  // ถ้าไม่มีปักหมุด ให้ใช้ใบที่ 4 ของปกติแทน
  const fallbackForPinned =
    !pinnedCard && normalCards.length > 3 ? normalCards[3] : undefined;

  const cardForPinnedSlot = pinnedCard || fallbackForPinned || null;

  // ฟังก์ชัน render การ์ด
  const renderDayCard = (day: DayCard, asPinnedSlot = false) => {
    if (!day) return null;

    const headerGradient =
      dayColor[day.dayOfWeek] || "from-teal-400 to-teal-500";
    const timeAlert = getTimeAlertInfo(day.minutesToSend);

    return (
      <div
        key={day.id + (asPinnedSlot ? "-pinned-slot" : "-normal")}
        className={`bg-white rounded-2xl shadow overflow-hidden flex flex-col ${
          asPinnedSlot && timeAlert ? "ring-2 ring-offset-2 ring-amber-300" : ""
        }`}
      >
        {/* HEADER */}
        <div
          className={`relative bg-gradient-to-r ${headerGradient} text-white p-4 pb-5`}
        >
          {/* Badge ปักหมุดเฉพาะการ์ดช่องปักหมุด */}
          {asPinnedSlot && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/25 text-[11px] font-semibold">
              <Star className="w-3 h-3 fill-yellow-300 text-yellow-100" />
              ปักหมุด
            </div>
          )}

          <div className="text-center mb-3">
            {asPinnedSlot && (
              <div className="text-[11px] text-white/80 -mb-0.5">
                ออเดอร์ที่ปักหมุดไว้
              </div>
            )}
            <h2 className="text-base sm:text-lg font-bold drop-shadow">
              {day.dateTitle}
            </h2>
          </div>

          {/* สถานที่ */}
          <div className="flex justify-start mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 whitespace-normal break-words">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm leading-snug">
                {day.sendPlace}
              </span>
            </div>
          </div>

          {/* เวลาส่ง + เวลารับ บรรทัดเดียวกัน */}
          <div className="flex items-center gap-3 mt-2">
            {/* เวลาส่ง */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 flex-1 min-w-[150px]">
              <Clock className="w-4 h-4" />
              <span className="font-semibold whitespace-nowrap">
                เวลาส่ง
              </span>
              <span className="whitespace-nowrap">
                {cleanTime(day.sendTime)}
              </span>
            </div>

            {/* เวลารับ */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 flex-1 min-w-[150px]">
              <Clock className="w-4 h-4" />
              <span className="font-semibold whitespace-nowrap">
                เวลารับ
              </span>
              <span className="whitespace-nowrap">
                {cleanTime(day.receiveTime)}
              </span>
            </div>
          </div>

          {/* แถบแจ้งเตือนเวลา (ข้อ 5) */}
          {timeAlert && (
            <div className="mt-3 flex justify-start">
              <div
                className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium ${timeAlert.className}`}
              >
                {timeAlert.label}
              </div>
            </div>
          )}
        </div>

        {/* ตารางรายการ */}
        <div className="flex-1 bg-white">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[70%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  รายการ
                </th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700">
                  จำนวน
                </th>
              </tr>
            </thead>
            <tbody>
              {day.items.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 text-gray-800 align-middle">
                    {item.name}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900 font-semibold align-middle">
                    {item.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* รวมชุด */}
          <div className="border-t bg-white py-3">
            <p className="text-center font-semibold text-red-600">
              {day.totalText}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 sm:p-6 ${fullscreen ? "h-screen" : "min-h-screen"}`}>
      {/* Header ปกติ (ข้อ 6: ซ่อนเวลา Fullscreen เพื่อให้ TV โล่ง) */}
      {!fullscreen && (
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Dashboard สรุปออเดอร์อาหารกล่อง
            </h1>
           
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Legend สีวัน (ข้อ 7) */}
            <div className="hidden md:flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {dayColorLegend.map((day) => (
                <div
                  key={day.label}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${day.className}`}
                  />
                  <span>{day.label}</span>
                </div>
              ))}
            </div>

            <Button
              className="flex items-center gap-2"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
             FullScreen
            </Button>
          </div>
        </div>
      )}

      {/* ปุ่มออก fullscreen (ข้อ 6) */}
      {fullscreen && (
        <div className="flex justify-end mb-2 sm:mb-3">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-white/80 bg-black/40 px-3 py-1.5 rounded-full"
          >
            <Minimize2 className="w-4 h-4" />
            ออกจากโหมดเต็มจอ
          </button>
        </div>
      )}

      {/* Legend สีวันในโหมด TV (ย่อให้เล็กลงหน่อย) */}
      {fullscreen && (
        <div className="mb-2 flex justify-end">
          <div className="flex flex-wrap gap-1 text-[10px] text-white/90 bg-black/30 px-2 py-1 rounded-full">
            {dayColorLegend.map((day) => (
              <div key={day.label} className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${day.className}`}
                />
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* การ์ดทั้งหมด 4 ใบ (3 ปกติ + 1 ช่องปักหมุด) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3 การ์ดปกติ */}
        {displayedNormalCards.map((day) => renderDayCard(day, false))}

        {/* ช่องปักหมุด ถ้าไม่มีปักหมุดก็ใช้ออเดอร์อื่นแทน */}
        {cardForPinnedSlot && renderDayCard(cardForPinnedSlot, true)}
      </div>
    </div>
  );
}
