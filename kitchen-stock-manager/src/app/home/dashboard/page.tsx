"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPin, Clock, Maximize2, Minimize2, Star, List, X, Edit } from "lucide-react";
import { Button } from "@/share/ui/button";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

import { Loading } from "@/components/loading/loading";
import DashboardIcon from "@/assets/dashboard.png";

// --- Interfaces ---
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
  isPinned?: boolean;
  minutesToSend?: number;
}

interface ApiResponse {
  status: string;
  total: number;
  result: Array<{
    id: string;
    dayOfWeek: string;
    date: string;
    location: string;
    sendTime: string;
    receiveTime: string;
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

// --- Constants & Helpers ---
const dayColor: Record<string, string> = {
  จันทร์: "from-yellow-400 to-yellow-500",
  อังคาร: "from-pink-400 to-pink-500",
  พุธ: "from-emerald-400 to-emerald-500",
  พฤหัสบดี: "from-orange-400 to-orange-500",
  ศุกร์: "from-sky-400 to-sky-500",
  เสาร์: "from-indigo-400 to-indigo-500",
  อาทิตย์: "from-rose-400 to-rose-500",
};

const dayColorLegend = [
  { label: "จันทร์", className: "bg-yellow-400" },
  { label: "อังคาร", className: "bg-pink-400" },
  { label: "พุธ", className: "bg-emerald-400" },
  { label: "พฤหัสบดี", className: "bg-orange-400" },
  { label: "ศุกร์", className: "bg-sky-400" },
  { label: "เสาร์", className: "bg-indigo-400" },
  { label: "อาทิตย์", className: "bg-rose-400" },
];

const cleanTime = (text: string) => text.replace(/\(.*?\)/g, "").trim();

const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

const getMonthName = (monthNum: string | number): string => {
  const num = typeof monthNum === "string" ? parseInt(monthNum, 10) : monthNum;
  return monthNames[num - 1] || monthNum.toString();
};

const getTimeAlertInfo = (minutes?: number) => {
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

// --- Main Component ---
export default function Dashboard() {
  const [fullscreen, setFullscreen] = useState(false);
  // State สำหรับเก็บ ID ของการ์ดที่ User เลือกปักหมุดเอง
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  // ฟังก์ชันสำหรับ toggle ปักหมุด
  const togglePin = (id: number) => {
    setPinnedIds((prev) => {
      if (prev.includes(id)) {
        // ถ้าปักอยู่แล้ว ให้ถอนออก
        return prev.filter((pinnedId) => pinnedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Calculate minutes until send time
  const calculateMinutesToSend = (date: string, sendTime: string): number => {
    const [day, month, year] = date.split("/").map(Number);
    const [hours, minutes] = sendTime.split(":").map(Number);

    const gregorianYear = year - 543;
    const sendDateTime = new Date(gregorianYear, month - 1, day, hours, minutes, 0);
    const now = new Date();

    const diffMs = sendDateTime.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    return Math.max(diffMinutes, -999);
  };

  const {
    data: apiData,
    error,
    isLoading,
  } = useSWR<ApiResponse>("/api/get/dashboard", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  // Process Data
  const allCards = useMemo<DayCard[]>(() => {
    if (!apiData || apiData.status !== "success") {
      return [];
    }

    return apiData.result
      .map((item, index) => {
        const dateStr = item.date;
        const [day, month, year] = dateStr.split("/");
        const dayNum = parseInt(day, 10);

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

        const aggregatedItems = menuItems.reduce((acc, item) => {
          const existingItem = acc.find((i) => i.name === item.name);
          if (existingItem) {
            existingItem.qty = (Number(existingItem.qty) + Number(item.qty)).toString();
          } else {
            acc.push({ ...item, qty: String(item.qty) });
          }
          return acc;
        }, [] as DayItem[]);

        const topKeywords = ["ข้าว", "กับข้าวหลัก", "กับข้าวรอง"];
        const bottomKeywords = ["เครื่องเคียง", "ผลไม้", "ขนม", "น้ำ"];

        const getTopIndex = (name: string) => topKeywords.findIndex((keyword) => name.includes(keyword));
        const getBottomIndex = (name: string) => bottomKeywords.findIndex((keyword) => name.includes(keyword));

        const sortedItems = aggregatedItems.sort((a, b) => {
          const aTopIndex = getTopIndex(a.name);
          const bTopIndex = getTopIndex(b.name);
          const aBottomIndex = getBottomIndex(a.name);
          const bBottomIndex = getBottomIndex(b.name);

          const aIsTop = aTopIndex !== -1;
          const bIsTop = bTopIndex !== -1;
          const aIsBottom = aBottomIndex !== -1;
          const bIsBottom = bBottomIndex !== -1;

          if (aIsTop && bIsTop) {
            if (aTopIndex !== bTopIndex) return aTopIndex - bTopIndex;
            return a.name.localeCompare(b.name, "th");
          }
          if (aIsBottom && bIsBottom) {
            if (aBottomIndex !== bBottomIndex) return aBottomIndex - bBottomIndex;
            return a.name.localeCompare(b.name, "th");
          }
          if (aIsTop) return -1;
          if (bIsTop) return 1;
          if (aIsBottom) return 1;
          if (bIsBottom) return -1;
          return a.name.localeCompare(b.name, "th");
        });

        const minutesToSend = calculateMinutesToSend(item.date, item.sendTime);

        return {
          id: index + 1, // แนะนำให้ใช้ ID จริงจาก API ถ้ามี เพื่อความแม่นยำในการระบุตัวตน
          dayOfWeek: item.dayOfWeek,
          dateTitle: `วัน${item.dayOfWeek}ที่ ${dayNum} ${getMonthName(month)} พ.ศ.${year}`,
          sendPlace: item.location,
          sendTime: item.sendTime + " น.",
          receiveTime: item.receiveTime + " น.",
          items: sortedItems,
          totalText: `รวม ${totalQty} ชุด`,
          isPinned: false, // สามารถรับค่านี้จาก API ได้ถ้ามี
          minutesToSend,
        };
      })
      .filter((card) => card.minutesToSend >= 0);
  }, [apiData]);

  // Fullscreen Handlers
  useEffect(() => {
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

  // --- [LOGIC ใหม่] การจัดการ Layout และข้อมูล ---

  // 1. หาการ์ดที่ถูกปักหมุด (Pinned Cards) - สูงสุด 2 ใบ
  const pinnedCards = allCards.filter((c) => pinnedIds.includes(c.id));

  // 2. รายการที่จะอยู่ในส่วน Scroll (Scrollable List)
  // คือการ์ดทั้งหมด "ยกเว้น" ใบที่ถูกปักหมุดอยู่
  const scrollableCards = allCards.filter((c) => !pinnedIds.includes(c.id));

  // --- Card Renderer ---
  const renderDayCard = (day: DayCard, asPinnedSlot = false) => {
    if (!day) return null;

    const headerGradient = dayColor[day.dayOfWeek] || "from-teal-400 to-teal-500";
    const timeAlert = getTimeAlertInfo(day.minutesToSend);
    const isPinned = pinnedIds.includes(day.id);

    return (
      <div
        key={day.id + (asPinnedSlot ? "-pinned-slot" : "-normal")}
        // Logic ความสูง: h-full เพื่อให้ยืดตาม Container, min-w เพื่อกำหนดความกว้างขั้นต่ำ
        className={`bg-white rounded-2xl shadow overflow-hidden flex flex-col h-full 
          min-w-[300px] 
          ${asPinnedSlot && timeAlert ? "ring-4 ring-amber-300" : ""}
          ${asPinnedSlot ? "shadow-2xl border-2 border-yellow-400/50" : "shadow"}
        `}>
        {/* HEADER (Fixed) */}
        <div className={`relative flex-none bg-gradient-to-r ${headerGradient} text-white p-4 pb-5`}>
          {/* ปุ่มดาวปักหมุด - มุมขวาบนของทุก Card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(day.id);
            }}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all
              ${isPinned ? "bg-yellow-400 hover:bg-yellow-500 shadow-lg" : "bg-white/20 hover:bg-white/40 backdrop-blur-sm"}
            `}
            title={isPinned ? "ถอนหมุด" : "ปักหมุด"}>
            <Star
              className={`w-5 h-5 transition-all
                ${isPinned ? "text-white fill-white" : "text-white/80"}
              `}
            />
          </button>

          <div className='text-center mb-3 mt-5 lg:mt-6'>
            <h2 className='!text-base lg:!text-xl !font-semibold drop-shadow !text-black'>{day.dateTitle}</h2>
          </div>

          <div className='flex justify-start mb-2'>
            <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 whitespace-normal break-words'>
              <MapPin className='w-4 h-4 shrink-0 !text-black' />
              <span className='text-xs lg:text-sm leading-snug !text-black'>{day.sendPlace}</span>
            </div>
          </div>

          <div className='flex flex-wrap gap-3 mt-2'>
            <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 flex-1 min-w-[100px] lg:min-w-[150px]'>
              <Clock className='w-4 h-4 !text-black' />
              <span className='text-xs lg:text-sm font-semibold whitespace-nowrap !text-black'>เวลาส่ง</span>
              <span className='whitespace-nowrap text-xs lg:text-sm !text-black'>{cleanTime(day.sendTime)}</span>
            </div>
            <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 flex-1 min-w-[100px] lg:min-w-[150px]'>
              <Clock className='w-4 h-4 !text-black' />
              <span className='text-xs lg:text-sm font-semibold whitespace-nowrap !text-black'>เวลารับ</span>
              <span className='whitespace-nowrap text-xs lg:text-sm !text-black'>{cleanTime(day.receiveTime)}</span>
            </div>
          </div>

          {timeAlert && (
            <div className='mt-3 flex justify-start'>
              <div className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium ${timeAlert.className}`}>{timeAlert.label}</div>
            </div>
          )}
        </div>

        {/* CONTENT (Scrollable Y) */}
        <div className='flex-1 bg-white overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
          <table className='w-full table-fixed'>
            <colgroup>
              <col className='w-[70%]' />
              <col className='w-[30%]' />
            </colgroup>
            <thead className='sticky top-0 bg-gray-100 shadow-sm z-10'>
              <tr>
                <th className='px-4 py-2 text-left font-semibold !text-black'>รายการ</th>
                <th className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-2 !text-center font-semibold !text-black'>จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {day.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className='px-4 py-2 !text-black align-middle'>{item.name}</td>
                  <td className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-2 !text-center text-gray-900 font-semibold align-middle'>{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER (Fixed) */}
        <div className='flex-none border-t bg-white py-3'>
          <p className='text-center font-semibold text-red-600'>{day.totalText}</p>
        </div>
      </div>
    );
  };

  return (
    // Main Container: ความสูงเท่าหน้าจอ (h-screen) และห้าม Scroll ที่ตัวแม่ (overflow-hidden)
    <div className={`p-4 sm:p-6 h-screen flex flex-col overflow-hidden bg-gray-50`}>
      {/* Loading State */}
      {isLoading && <Loading context='หน้าแดชบอร์ด' icon={DashboardIcon.src} />}

      {/* Error State */}
      {error && !isLoading && (
        <div className='flex items-center justify-center flex-1'>
          <div className='bg-red-50 border border-red-300 rounded-lg p-6 text-center'>
            <p className='text-red-700 font-semibold'>เกิดข้อผิดพลาด</p>
            <p className='text-red-600 text-sm mt-2'>{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && allCards.length === 0 && (
        <div className='flex items-center justify-center flex-1'>
          <div className='text-center'>
            <p className='text-gray-600'>ไม่มีข้อมูลออเดอร์</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && allCards.length > 0 && (
        <>
          {/* Header Bar (Legend & Toggle) - Fixed Height */}
          <div className='flex-none transition-all'>
            {!fullscreen && (
              <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
                <div className='hidden md:flex flex-wrap gap-2 text-[11px] sm:text-xs'>
                  {dayColorLegend.map((day) => (
                    <div key={day.label} className='flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100'>
                      <span className={`w-2.5 h-2.5 rounded-full ${day.className}`} />
                      <span>{day.label}</span>
                    </div>
                  ))}
                </div>

                <Button className='hidden lg:flex items-center gap-2' size='sm' onClick={toggleFullscreen}>
                  <Maximize2 className='w-4 h-4' />
                  FullScreen
                </Button>
              </div>
            )}

            {fullscreen && (
              <div className='flex justify-end mb-2'>
                <button onClick={toggleFullscreen} className='flex items-center gap-1 text-[11px] sm:text-xs text-white/80 bg-black/40 px-3 py-1.5 rounded-full mr-2 hover:bg-black/60 transition-colors'>
                  <Minimize2 className='w-4 h-4' />
                  ออกจากโหมดเต็มจอ
                </button>
                <div className='flex items-center gap-1 text-[10px] text-white/90 bg-black/30 px-2 py-1 rounded-full'>
                  {dayColorLegend.map((day) => (
                    <div key={day.label} className='flex items-center gap-1'>
                      <span className={`w-2 h-2 rounded-full ${day.className}`} />
                      <span>{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* [LAYOUT หลัก] แบ่งส่วน Scroll และ Fixed */}
          <div className='flex-1 flex gap-4 overflow-hidden'>
            {/* ZONE 1: Scrollable List Area (ส่วนซ้ายเลื่อนแนวนอน) */}
            <div className={`flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2`}>
              {scrollableCards.length > 0
                ? scrollableCards.map((day) => (
                    // Logic การกำหนดความกว้าง (Width)
                    // - ถ้ามีปักหมุด: แบ่งพื้นที่ให้โชว์ประมาณ 3 ใบ (ใบละ ~32%)
                    // - ถ้าไม่มีปักหมุด: แบ่งพื้นที่ให้โชว์ประมาณ 4 ใบ (ใบละ ~24%)
                    <div
                      key={day.id}
                      className={`h-full flex-none transition-all duration-300
                      ${
                        pinnedCards.length > 0
                          ? "w-[85vw] sm:w-[45vw] md:w-[40vw] lg:w-[32%]" // Case มีปักหมุด
                          : "w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[24%]" // Case ไม่มีปักหมุด
                      }
                    `}>
                      {renderDayCard(day, false)}
                    </div>
                  ))
                : // กรณีไม่มีข้อมูลใน list (เช่น การ์ดทั้งหมดถูกปักหมุดหมดแล้ว)
                  pinnedCards.length === 0 && (
                    <div className='flex flex-col items-center justify-center w-full text-gray-400 h-full border-2 border-dashed rounded-xl'>
                      <p>ไม่มีรายการออเดอร์</p>
                    </div>
                  )}
            </div>

            {/* ZONE 2: Pinned Cards Area (ส่วนขวาตรึงอยู่กับที่ - ขนาดพอดีกับ 1 การ์ด) */}
            {/* แสดงเฉพาะเมื่อมีการปักหมุด */}
            {pinnedCards.length > 0 && (
              <div className='hidden lg:flex flex-none' style={{ width: "360px" }}>
                {/* Pinned Content Area */}
                <div className='flex-1 flex flex-col border-l-2 border-gray-200 pl-4 ml-3 bg-gray-50/50 min-w-0'>
                  {/* Header */}
                  <div className='flex-none flex items-center justify-between pb-2 border-b border-gray-200 mb-3'>
                    <div className='flex items-center gap-2'>
                      <Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                      <span className='text-sm font-semibold text-gray-700'>ปักหมุด ({pinnedCards.length})</span>
                    </div>
                    <button onClick={() => setPinnedIds([])} className='text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50'>
                      ล้างทั้งหมด
                    </button>
                  </div>

                  {/* Scrollable Pinned Cards */}
                  <div className='flex-1 min-w-0 overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x snap-mandatory'>
                    <div className='flex gap-4 h-full'>
                      {pinnedCards.map((card) => (
                        <div key={card.id} className='flex-none h-full snap-start' style={{ width: "300px" }}>
                          {renderDayCard(card, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
