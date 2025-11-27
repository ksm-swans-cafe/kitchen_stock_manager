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

interface ApiResponse {
  status: string;
  total: number;
  result: Array<{
    id: string;
    date: string; // DD/MM/YYYY
    dayOfWeek: string;
    location: string;
    sendTime: string; // HH:MM
    receiveTime: string; // HH:MM
    items: Array<{
      lunchbox_name: string;
      set: string;
      quantity: number;
      lunchbox_menu: Array<{
        menu_name: string;
        menu_quantity: number;
      }>;
    }>;
  }>;
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
const allCards: DayCard[] = [];

// ตัดข้อความในวงเล็บ เช่น (ตี 5)
const cleanTime = (text: string) => text.replace(/\(.*?\)/g, "").trim();

// แปลงเลขเดือนเป็นเดือนภาษาไทย
const monthNames = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const getMonthName = (monthNum: string | number): string => {
  const num = typeof monthNum === "string" ? parseInt(monthNum, 10) : monthNum;
  return monthNames[num - 1] || monthNum.toString();
};

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

  // Convert to hours if between 60 and 1440 minutes
  if (minutes <= 1440) {
    const hours = Math.round(minutes / 60);
    return {
      label: `เหลือเวลาอีก ${hours} ชั่วโมง`,
      className:
        "bg-emerald-50 border border-emerald-300 text-emerald-800",
    };
  }

  // Convert to days if more than 24 hours (1440 minutes)
  const days = Math.round(minutes / 1440);
  return {
    label: `เหลือเวลาอีก ${days} วัน`,
    className:
      "bg-blue-50 border border-blue-300 text-blue-800",
  };
};

export default function Dashboard() {
  const [fullscreen, setFullscreen] = useState(false);
  const [allCards, setAllCards] = useState<DayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate minutes until send time
  const calculateMinutesToSend = (date: string, sendTime: string): number => {
    const [day, month, year] = date.split("/").map(Number);
    const [hours, minutes] = sendTime.split(":").map(Number);
    
    // Create date object for Thai calendar date
    const gregorianYear = year - 543;
    const sendDateTime = new Date(gregorianYear, month - 1, day, hours, minutes, 0);
    const now = new Date();
    
    const diffMs = sendDateTime.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    return Math.max(diffMinutes, -999); // Return negative if past
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get/dashboard");
        const data: ApiResponse = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error("Failed to fetch dashboard data");
        }

        const transformedCards: DayCard[] = data.result
          .map((item, index) => {
            const dateStr = item.date; // DD/MM/YYYY
            const [day, month, year] = dateStr.split("/");
            const dayNum = parseInt(day, 10); // Remove leading zero
            
            // คำนวณจำนวนชุดทั้งหมด
            const totalQty = item.items.reduce((sum, lunchbox) => sum + lunchbox.quantity, 0);
            
            const menuItems: DayItem[] = [];
            item.items.forEach((lunchbox) => {
              lunchbox.lunchbox_menu.forEach((menu) => {
                menuItems.push({
                  name: menu.menu_name,
                  qty: menu.menu_quantity,
                });
              });
            });
            
            // Aggregate items with the same name
            const aggregatedItems = menuItems.reduce((acc, item) => {
              const existingItem = acc.find((i) => i.name === item.name);
              if (existingItem) {
                existingItem.qty = (Number(existingItem.qty) + Number(item.qty)).toString();
              } else {
                acc.push({ ...item, qty: String(item.qty) });
              }
              return acc;
            }, [] as DayItem[]);
            
            const minutesToSend = calculateMinutesToSend(item.date, item.sendTime);
            
            return {
              id: index + 1,
              dayOfWeek: item.dayOfWeek,
              dateTitle: `วัน${item.dayOfWeek}ที่ ${dayNum} ${getMonthName(month)} พ.ศ.${year}`,
              sendPlace: item.location,
              sendTime: item.sendTime + " น.",
              receiveTime: item.receiveTime + " น.",
              items: aggregatedItems,
              totalText: `รวม ${totalQty} ชุด`,
              isPinned: false,
              minutesToSend,
            };
          })
          .filter((card) => card.minutesToSend >= 0); // Filter out past times

        setAllCards(transformedCards);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setAllCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // ตั้งเวลารีเฟรชข้อมูลทุก ๆ 1 นาที
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "auto";
    
    // Hide/show Menubar and Navigatebar in fullscreen mode
    const menubar = document.querySelector('div[class*="bg-card"]') as HTMLElement;
    const navigatebar = document.querySelector('nav[class*="bg-gray-200"]') as HTMLElement;
    
    if (fullscreen) {
      if (menubar) menubar.style.display = "none";
      if (navigatebar) navigatebar.style.display = "none";
    } else {
      if (menubar) menubar.style.display = "";
      if (navigatebar) navigatebar.style.display = "";
    }
  }, [fullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
          asPinnedSlot && timeAlert ? "ring-2 ring-amber-300" : ""
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

          <div className="text-center mb-3 mt-6">
            <h2 className="text-xl sm:text-2xl font-semi-bold drop-shadow !text-black">
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

          {/* เวลาส่ง + เวลารับ */}
          <div className="flex flex-wrap gap-3 mt-2">
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
                <th className="px-4 py-2 text-left font-semibold !text-black">
                  รายการ
                </th>
                <th className="px-4 py-2 text-right font-semibold !text-black">
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
                  <td className="px-4 py-2 text-gray-800 !text-black align-middle">
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
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold">เกิดข้อผิดพลาด</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && allCards.length === 0 && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">ไม่มีข้อมูลออเดอร์</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && allCards.length > 0 && (
        <>
          {/* Header ปกติ (ข้อ 6: ซ่อนเวลา Fullscreen เพื่อให้ TV โล่ง) */}
          {!fullscreen && (
            <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
                className="hidden lg:flex items-center gap-2"
                size="sm"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="w-4 h-4" />
                FullScreen
              </Button>
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
        </>
      )}
    </div>
  );
}
