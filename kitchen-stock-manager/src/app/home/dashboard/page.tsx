"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapPin, Clock, Maximize2, Minimize2, Star, Plus, Save, X, Trash2 } from "lucide-react";
import { Button } from "@/share/ui/button";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/utils";

import { Loading } from "@/components/loading/loading";
import DashboardIcon from "@/assets/dashboard.png";

// --- Interfaces ---
interface DayItem {
  name: string;
  qty: number | string;
  lunchbox_name?: string;
  menu_ingredients?: MenuIngredient[];
  menu_description?: MenuItemDescription[];
}

interface MenuIngredient {
  ingredient_name: string;
  ingredient_status?: boolean;
  useItem: number | string;
}

interface MenuItemDescription {
  menu_description_id: string | null;
  menu_description_title: string;
  menu_description_value: string;
}

interface CartDescription {
  description_id: string | null;
  description_title: string;
  description_value: string;
}

interface DayCard {
  id: number;
  cartId: string;
  dayOfWeek: string;
  dateTitle: string;
  sendPlace: string;
  sendTime: string;
  receiveTime: string;
  items: DayItem[];
  totalText: string;
  isPinned?: boolean;
  minutesToSend?: number;
  cart_description: CartDescription[];
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
        menu_ingredients: MenuIngredient[];
        menu_description: MenuItemDescription[];
      }>;
    }>;
    cart_description: CartDescription[];
    cart_pinned: boolean;
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

const dayNoteColor: Record<string, { light: string; dark: string; hover: string }> = {
  จันทร์: { light: "bg-yellow-50", dark: "bg-yellow-100", hover: "bg-yellow-200" },
  อังคาร: { light: "bg-pink-50", dark: "bg-pink-100", hover: "bg-pink-200" },
  พุธ: { light: "bg-emerald-50", dark: "bg-emerald-100", hover: "bg-emerald-200" },
  พฤหัสบดี: { light: "bg-orange-50", dark: "bg-orange-100", hover: "bg-orange-200" },
  ศุกร์: { light: "bg-sky-50", dark: "bg-sky-100", hover: "bg-sky-200" },
  เสาร์: { light: "bg-indigo-50", dark: "bg-indigo-100", hover: "bg-indigo-200" },
  อาทิตย์: { light: "bg-rose-50", dark: "bg-rose-100", hover: "bg-rose-200" },
};

const dayNoteTextColor: Record<string, string> = {
  จันทร์: "text-yellow-700",
  อังคาร: "text-pink-700",
  พุธ: "text-emerald-700",
  พฤหัสบดี: "text-orange-700",
  ศุกร์: "text-sky-700",
  เสาร์: "text-indigo-700",
  อาทิตย์: "text-rose-700",
};

// Aura/Glow colors for pinned cards
const dayAuraColor: Record<string, { class: string; style: React.CSSProperties }> = {
  จันทร์: { class: "ring-2 ring-yellow-400 animate-auraGlow", style: { "--aura-color": "rgba(250,204,21,0.4)" } as React.CSSProperties },
  อังคาร: { class: "ring-2 ring-pink-400 animate-auraGlow", style: { "--aura-color": "rgba(236,72,153,0.4)" } as React.CSSProperties },
  พุธ: { class: "ring-2 ring-emerald-400 animate-auraGlow", style: { "--aura-color": "rgba(52,211,153,0.4)" } as React.CSSProperties },
  พฤหัสบดี: { class: "ring-2 ring-orange-400 animate-auraGlow", style: { "--aura-color": "rgba(251,146,60,0.4)" } as React.CSSProperties },
  ศุกร์: { class: "ring-2 ring-sky-400 animate-auraGlow", style: { "--aura-color": "rgba(56,189,248,0.4)" } as React.CSSProperties },
  เสาร์: { class: "ring-2 ring-indigo-400 animate-auraGlow", style: { "--aura-color": "rgba(129,140,248,0.4)" } as React.CSSProperties },
  อาทิตย์: { class: "ring-2 ring-rose-400 animate-auraGlow", style: { "--aura-color": "rgba(251,113,133,0.4)" } as React.CSSProperties },
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
  // State สำหรับ note input
  const [noteInputs, setNoteInputs] = useState<Record<string, { title: string; value: string }>>({});
  const [showNoteInput, setShowNoteInput] = useState<Record<string, boolean>>({});
  const [closingNoteInput, setClosingNoteInput] = useState<Record<string, boolean>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [editingNote, setEditingNote] = useState<Record<string, { cartId: string; title: string; value: string } | null>>({});
  const [savingPin, setSavingPin] = useState<Record<string, boolean>>({});
  const [cursorHidden, setCursorHidden] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State สำหรับ menu description
  const [menuDescInputs, setMenuDescInputs] = useState<Record<string, { title: string; value: string }>>({});
  const [showMenuDescInput, setShowMenuDescInput] = useState<Record<string, boolean>>({});
  const [closingMenuDescInput, setClosingMenuDescInput] = useState<Record<string, boolean>>({});
  const [savingMenuDesc, setSavingMenuDesc] = useState<Record<string, boolean>>({});
  const [editingMenuDesc, setEditingMenuDesc] = useState<Record<string, { cartId: string; lunchboxName: string; menuName: string; title: string; value: string } | null>>({});
  const [expandedMenuItems, setExpandedMenuItems] = useState<Record<string, boolean>>({});

  // Cursor auto-hide after 5 seconds of inactivity
  useEffect(() => {
    const resetCursorTimer = () => {
      setCursorHidden(false);
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }
      cursorTimerRef.current = setTimeout(() => {
        setCursorHidden(true);
      }, 5000);
    };

    const handleActivity = () => {
      resetCursorTimer();
    };

    // Listen for mouse movement, clicks, keyboard, and scroll
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, true);

    // Start the timer initially
    resetCursorTimer();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity, true);
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }
    };
  }, []);

  // ฟังก์ชันสำหรับ toggle ปักหมุดและบันทึกลง DB
  const togglePin = async (cartId: string, currentPinned: boolean) => {
    setSavingPin((prev) => ({ ...prev, [cartId]: true }));
    try {
      const response = await fetch(`/api/edit/cart-pinned/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_pinned: !currentPinned }),
      });
      if (response.ok) {
        // Refresh data
        mutate("/api/get/dashboard");
      }
    } catch (error) {
      console.error("Error updating pin status:", error);
    } finally {
      setSavingPin((prev) => ({ ...prev, [cartId]: false }));
    }
  };

  // ฟังก์ชันบันทึก note ไปยัง database
  const saveNoteToDatabase = useCallback(async (cartId: string, descriptions: CartDescription[]) => {
    setSavingNotes((prev) => ({ ...prev, [cartId]: true }));
    try {
      const response = await fetch(`/api/edit/cart-description/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_description: descriptions }),
      });
      if (!response.ok) {
        console.error("Failed to save note");
      } else {
        // Refresh data after successful save
        mutate("/api/get/dashboard");
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSavingNotes((prev) => ({ ...prev, [cartId]: false }));
    }
  }, []);

  // ฟังก์ชันเพิ่ม note ใหม่
  const handleAddNote = useCallback((cartId: string, currentDescriptions: CartDescription[]) => {
    const noteInput = noteInputs[cartId];
    if (!noteInput || (!noteInput.title.trim() && !noteInput.value.trim())) {
      setClosingNoteInput((prev) => ({ ...prev, [cartId]: true }));
      setTimeout(() => {
        setClosingNoteInput((prev) => ({ ...prev, [cartId]: false }));
        setShowNoteInput((prev) => ({ ...prev, [cartId]: false }));
      }, 150);
      return;
    }

    const newNote: CartDescription = {
      description_id: Date.now().toString(),
      description_title: noteInput.title.trim() || "หมายเหตุ",
      description_value: noteInput.value.trim(),
    };

    const updatedDescriptions = [...currentDescriptions, newNote];
    saveNoteToDatabase(cartId, updatedDescriptions);
    
    // Reset input with closing animation
    setNoteInputs((prev) => ({ ...prev, [cartId]: { title: "", value: "" } }));
    setClosingNoteInput((prev) => ({ ...prev, [cartId]: true }));
    setTimeout(() => {
      setClosingNoteInput((prev) => ({ ...prev, [cartId]: false }));
      setShowNoteInput((prev) => ({ ...prev, [cartId]: false }));
    }, 150);
  }, [noteInputs, saveNoteToDatabase]);

  // ฟังก์ชันลบ note
  const handleDeleteNote = useCallback((cartId: string, descriptionId: string, currentDescriptions: CartDescription[]) => {
    const updatedDescriptions = currentDescriptions.filter((d) => d.description_id !== descriptionId);
    saveNoteToDatabase(cartId, updatedDescriptions);
  }, [saveNoteToDatabase]);

  // ฟังก์ชันเริ่มแก้ไข note
  const handleStartEditNote = useCallback((descriptionId: string, cartId: string, title: string, value: string) => {
    setEditingNote((prev) => ({ ...prev, [descriptionId]: { cartId, title, value } }));
  }, []);

  // ฟังก์ชันยกเลิกแก้ไข note
  const handleCancelEditNote = useCallback((descriptionId: string) => {
    setEditingNote((prev) => ({ ...prev, [descriptionId]: null }));
  }, []);

  // ฟังก์ชันบันทึกการแก้ไข note
  const handleSaveEditNote = useCallback((descriptionId: string, currentDescriptions: CartDescription[]) => {
    const editing = editingNote[descriptionId];
    if (!editing) return;

    const updatedDescriptions = currentDescriptions.map((d) =>
      d.description_id === descriptionId
        ? { ...d, description_title: editing.title.trim() || "หมายเหตุ", description_value: editing.value.trim() }
        : d
    );
    saveNoteToDatabase(editing.cartId, updatedDescriptions);
    setEditingNote((prev) => ({ ...prev, [descriptionId]: null }));
  }, [editingNote, saveNoteToDatabase]);

  // ฟังก์ชันอัปเดตค่าขณะแก้ไข
  const handleEditNoteChange = useCallback((descriptionId: string, field: "title" | "value", value: string) => {
    setEditingNote((prev) => ({
      ...prev,
      [descriptionId]: prev[descriptionId] ? { ...prev[descriptionId]!, [field]: value } : null,
    }));
  }, []);

  // Auto-save with debounce when typing
  const handleNoteInputChange = useCallback((cartId: string, field: "title" | "value", value: string) => {
    setNoteInputs((prev) => ({
      ...prev,
      [cartId]: { ...prev[cartId], [field]: value },
    }));
  }, []);

  // ======= Menu Description Functions =======
  
  // ฟังก์ชันบันทึก menu description ไปยัง database
  const saveMenuDescToDatabase = useCallback(async (
    cartId: string, 
    lunchboxName: string, 
    menuName: string, 
    descriptions: MenuItemDescription[]
  ) => {
    const key = `${cartId}-${lunchboxName}-${menuName}`;
    setSavingMenuDesc((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/edit/menu-description/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lunchbox_name: lunchboxName,
          menu_name: menuName,
          menu_description: descriptions 
        }),
      });
      if (!response.ok) {
        console.error("Failed to save menu description");
      } else {
        mutate("/api/get/dashboard");
      }
    } catch (error) {
      console.error("Error saving menu description:", error);
    } finally {
      setSavingMenuDesc((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  // ฟังก์ชันเพิ่ม menu description ใหม่
  const handleAddMenuDesc = useCallback((
    cartId: string, 
    lunchboxName: string, 
    menuName: string, 
    currentDescriptions: MenuItemDescription[]
  ) => {
    const key = `${cartId}-${lunchboxName}-${menuName}`;
    const input = menuDescInputs[key];
    if (!input || (!input.title.trim() && !input.value.trim())) {
      setClosingMenuDescInput((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setClosingMenuDescInput((prev) => ({ ...prev, [key]: false }));
        setShowMenuDescInput((prev) => ({ ...prev, [key]: false }));
      }, 150);
      return;
    }

    const newDesc: MenuItemDescription = {
      menu_description_id: Date.now().toString(),
      menu_description_title: input.title.trim() || "หมายเหตุ",
      menu_description_value: input.value.trim(),
    };

    const updatedDescriptions = [...currentDescriptions, newDesc];
    saveMenuDescToDatabase(cartId, lunchboxName, menuName, updatedDescriptions);
    
    setMenuDescInputs((prev) => ({ ...prev, [key]: { title: "", value: "" } }));
    setClosingMenuDescInput((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setClosingMenuDescInput((prev) => ({ ...prev, [key]: false }));
      setShowMenuDescInput((prev) => ({ ...prev, [key]: false }));
    }, 150);
  }, [menuDescInputs, saveMenuDescToDatabase]);

  // ฟังก์ชันลบ menu description
  const handleDeleteMenuDesc = useCallback((
    cartId: string, 
    lunchboxName: string, 
    menuName: string, 
    descriptionId: string, 
    currentDescriptions: MenuItemDescription[]
  ) => {
    const updatedDescriptions = currentDescriptions.filter((d) => d.menu_description_id !== descriptionId);
    saveMenuDescToDatabase(cartId, lunchboxName, menuName, updatedDescriptions);
  }, [saveMenuDescToDatabase]);

  // ฟังก์ชันเริ่มแก้ไข menu description
  const handleStartEditMenuDesc = useCallback((
    descriptionId: string, 
    cartId: string, 
    lunchboxName: string, 
    menuName: string, 
    title: string, 
    value: string
  ) => {
    setEditingMenuDesc((prev) => ({ ...prev, [descriptionId]: { cartId, lunchboxName, menuName, title, value } }));
  }, []);

  // ฟังก์ชันยกเลิกแก้ไข menu description
  const handleCancelEditMenuDesc = useCallback((descriptionId: string) => {
    setEditingMenuDesc((prev) => ({ ...prev, [descriptionId]: null }));
  }, []);

  // ฟังก์ชันบันทึกการแก้ไข menu description
  const handleSaveEditMenuDesc = useCallback((descriptionId: string, currentDescriptions: MenuItemDescription[]) => {
    const editing = editingMenuDesc[descriptionId];
    if (!editing) return;

    const updatedDescriptions = currentDescriptions.map((d) =>
      d.menu_description_id === descriptionId
        ? { ...d, menu_description_title: editing.title.trim() || "หมายเหตุ", menu_description_value: editing.value.trim() }
        : d
    );
    saveMenuDescToDatabase(editing.cartId, editing.lunchboxName, editing.menuName, updatedDescriptions);
    setEditingMenuDesc((prev) => ({ ...prev, [descriptionId]: null }));
  }, [editingMenuDesc, saveMenuDescToDatabase]);

  // ฟังก์ชันอัปเดตค่าขณะแก้ไข menu description
  const handleEditMenuDescChange = useCallback((descriptionId: string, field: "title" | "value", value: string) => {
    setEditingMenuDesc((prev) => ({
      ...prev,
      [descriptionId]: prev[descriptionId] ? { ...prev[descriptionId]!, [field]: value } : null,
    }));
  }, []);

  // ฟังก์ชันอัปเดต input menu description
  const handleMenuDescInputChange = useCallback((key: string, field: "title" | "value", value: string) => {
    setMenuDescInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }, []);

  // Toggle expanded menu item
  const toggleExpandMenuItem = useCallback((key: string) => {
    setExpandedMenuItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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
              lunchbox_name: lunchbox.lunchbox_name,
              menu_ingredients: menu.menu_ingredients || [],
              menu_description: menu.menu_description || [],
            });
          });
        });

        const aggregatedItems = menuItems.reduce((acc, item) => {
          const existingItem = acc.find((i) => i.name === item.name);
          if (existingItem) {
            existingItem.qty = (Number(existingItem.qty) + Number(item.qty)).toString();
            // Merge ingredients (keep unique ones)
            if (item.menu_ingredients) {
              existingItem.menu_ingredients = existingItem.menu_ingredients || [];
              item.menu_ingredients.forEach((ing) => {
                const existingIng = existingItem.menu_ingredients!.find((e) => e.ingredient_name === ing.ingredient_name);
                if (existingIng) {
                  existingIng.useItem = Number(existingIng.useItem) + Number(ing.useItem);
                } else {
                  existingItem.menu_ingredients!.push({ ...ing });
                }
              });
            }
            // Merge descriptions (keep all unique ones)
            if (item.menu_description) {
              existingItem.menu_description = existingItem.menu_description || [];
              item.menu_description.forEach((desc) => {
                const existingDesc = existingItem.menu_description!.find(
                  (d) => d.menu_description_title === desc.menu_description_title && d.menu_description_value === desc.menu_description_value
                );
                if (!existingDesc) {
                  existingItem.menu_description!.push({ ...desc });
                }
              });
            }
          } else {
            acc.push({ 
              ...item, 
              qty: String(item.qty),
              menu_ingredients: item.menu_ingredients ? [...item.menu_ingredients] : [],
              menu_description: item.menu_description ? [...item.menu_description] : [],
            });
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
          cartId: item.id, // เก็บ cart_id จริงจาก API เพื่อใช้ในการบันทึก note
          dayOfWeek: item.dayOfWeek,
          dateTitle: `วัน${item.dayOfWeek}ที่ ${dayNum} ${getMonthName(month)} พ.ศ.${year}`,
          sendPlace: item.location,
          sendTime: item.sendTime + " น.",
          receiveTime: item.receiveTime + " น.",
          items: sortedItems,
          totalText: `รวม ${totalQty} ชุด`,
          isPinned: item.cart_pinned || false,
          minutesToSend,
          cart_description: item.cart_description || [],
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

  // --- [การจัดการ Pinned Cards] ---
  // ไม่ใช้ pinnedCards/scrollableCards แยกแล้ว เพราะแสดงทั้งหมดรวมกันพร้อม highlight

  // --- Card Renderer ---
  const renderDayCard = (day: DayCard, asPinnedSlot = false) => {
    if (!day) return null;

    const headerGradient = dayColor[day.dayOfWeek] || "from-teal-400 to-teal-500";
    const timeAlert = getTimeAlertInfo(day.minutesToSend);
    const isPinned = day.isPinned || false;
    const auraConfig = dayAuraColor[day.dayOfWeek] || { class: "ring-2 ring-gray-400 animate-auraGlow", style: { "--aura-color": "rgba(156,163,175,0.4)" } as React.CSSProperties };

    return (
      <div
        key={day.id + (asPinnedSlot ? "-pinned-slot" : "-normal")}
        style={isPinned ? auraConfig.style : undefined}
        // Logic ความสูง: h-full เพื่อให้ยืดตาม Container, min-w เพื่อกำหนดความกว้างขั้นต่ำ
        className={`group/card bg-white rounded-2xl overflow-hidden flex flex-col h-full 
          min-w-[300px] transition-all duration-300
          ${isPinned ? auraConfig.class : "shadow"}
          ${timeAlert && isPinned ? "ring-4 ring-amber-300" : ""}
        `}>
        {/* HEADER (Fixed) */}
        <div className={`relative flex-none bg-gradient-to-r ${headerGradient} text-white p-4 pb-5`}>
          {/* ปุ่มดาวปักหมุด - แสดงตลอดถ้าปักหมุดแล้ว, ซ่อนถ้าไม่ได้ปัก (แสดงเมื่อ hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!savingPin[day.cartId]) {
                togglePin(day.cartId, isPinned);
              }
            }}
            disabled={savingPin[day.cartId]}
            className={`absolute top-2 right-2 p-2 transition-all duration-300
              ${isPinned 
                ? "opacity-100" 
                : "opacity-0 group-hover/card:opacity-100 hover:scale-110"}
              ${savingPin[day.cartId] ? "cursor-wait" : "cursor-pointer"}
            `}
            title={isPinned ? "ถอนหมุด" : "ปักหมุด"}>
            <Star
              className={`w-6 h-6 transition-all drop-shadow-md
                ${isPinned 
                  ? "text-yellow-400 fill-yellow-400 animate-starPulse" 
                  : "text-white/80 hover:text-yellow-300"}
                ${savingPin[day.cartId] ? "animate-spin" : ""}
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
              {day.items.map((item, index) => {
                const hasMenuDescription = item.menu_description && item.menu_description.length > 0;
                const menuKey = `${day.cartId}-${item.lunchbox_name || ''}-${item.name}`;
                const isExpanded = expandedMenuItems[menuKey];
                const isShowingAddInput = showMenuDescInput[menuKey] || closingMenuDescInput[menuKey];
                
                return (
                  <React.Fragment key={index}>
                    {/* Main menu item row */}
                    <tr 
                      className={`group/menuitem cursor-pointer transition-colors ${index % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}`}
                      onClick={() => toggleExpandMenuItem(menuKey)}
                    >
                      <td className='px-4 py-2 !text-black align-middle'>
                        <div className='flex items-center gap-2'>
                          {(hasMenuDescription || isExpanded) && (
                            <span className={`text-xs text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          )}
                          <span>{item.name}</span>
                          {hasMenuDescription && (
                            <span className='text-xs text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full'>
                              {item.menu_description!.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-2 !text-center text-gray-900 font-semibold align-middle relative'>
                        <span>{item.qty}</span>
                        {/* Add menu description button - show on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMenuItems((prev) => ({ ...prev, [menuKey]: true }));
                            setShowMenuDescInput((prev) => ({ ...prev, [menuKey]: true }));
                            setMenuDescInputs((prev) => ({ ...prev, [menuKey]: { title: "", value: "" } }));
                          }}
                          className='absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover/menuitem:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded'
                          title='เพิ่มหมายเหตุเมนู'
                        >
                          <Plus className='w-3 h-3' />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Menu Description rows - shown when expanded */}
                    {isExpanded && hasMenuDescription && item.menu_description!.map((desc, descIdx) => {
                      const descId = desc.menu_description_id || `${menuKey}-${descIdx}`;
                      const hasValue = desc.menu_description_value && desc.menu_description_value.trim() !== "";
                      const isEditingThis = editingMenuDesc[descId] !== null && editingMenuDesc[descId] !== undefined;
                      
                      // Editing mode
                      if (isEditingThis) {
                        return (
                          <tr 
                            key={`menu-desc-${index}-${descIdx}`} 
                            className='bg-blue-100/50 border-l-4 border-blue-400'
                          >
                            <td colSpan={2} className='px-4 py-2 pl-8'>
                              <div className='flex flex-wrap gap-2 items-stretch'>
                                <textarea
                                  placeholder='รายการ'
                                  value={editingMenuDesc[descId]?.title || ""}
                                  onChange={(e) => {
                                    handleEditMenuDescChange(descId, "title", e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                  }}
                                  ref={(el) => {
                                    if (el) {
                                      el.style.height = 'auto';
                                      el.style.height = el.scrollHeight + 'px';
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  rows={1}
                                  className='flex-1 min-w-[120px] px-3 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none resize-none overflow-hidden leading-normal bg-white'
                                />
                                <input
                                  type='text'
                                  placeholder='จำนวน'
                                  value={editingMenuDesc[descId]?.value || ""}
                                  onChange={(e) => handleEditMenuDescChange(descId, "value", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className='w-16 shrink-0 px-2 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none text-center bg-white'
                                />
                              </div>
                              <div className='flex gap-2 justify-end mt-2'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEditMenuDesc(descId);
                                  }}
                                  className='group/cancel px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 active:scale-95'
                                  style={{ color: '#ef4444' }}>
                                  <X className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/cancel:rotate-90' />
                                  ยกเลิก
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEditMenuDesc(descId, item.menu_description || []);
                                  }}
                                  disabled={savingMenuDesc[menuKey]}
                                  className='group/save px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                                  style={{ color: '#3b82f6' }}>
                                  <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                                  {savingMenuDesc[menuKey] ? "กำลังบันทึก..." : "บันทึก"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      // Display mode
                      return (
                        <tr 
                          key={`menu-desc-${index}-${descIdx}`} 
                          className='group/desc bg-blue-50/50 border-l-4 border-blue-400 cursor-pointer hover:bg-blue-100/50 transition-colors'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditMenuDesc(descId, day.cartId, item.lunchbox_name || '', item.name, desc.menu_description_title, desc.menu_description_value);
                          }}
                        >
                          {hasValue ? (
                            <>
                              <td className='px-4 py-1.5 pl-8 !text-blue-700 text-base align-middle'>
                                <span>↳ {desc.menu_description_title}</span>
                              </td>
                              <td className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-1.5 !text-center !text-blue-700 text-base font-medium align-middle relative overflow-hidden'>
                                <span>{desc.menu_description_value}</span>
                                {/* Delete button */}
                                <div
                                  className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                                    opacity-0 translate-x-full group-hover/desc:opacity-100 group-hover/desc:translate-x-0 
                                    transition-all duration-300 ease-out pointer-events-none group-hover/desc:pointer-events-auto'>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMenuDesc(day.cartId, item.lunchbox_name || '', item.name, desc.menu_description_id || '', item.menu_description || []);
                                    }}
                                    className='px-1.5 py-1 hover:bg-red-600 rounded-l-lg transition-colors h-full flex items-center'
                                    title='ลบหมายเหตุเมนู'>
                                    <Trash2 className='w-3 h-3 text-white' />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <td colSpan={2} className='px-4 py-1.5 pl-8 !text-blue-700 text-base align-middle relative overflow-hidden'>
                              <span>↳ {desc.menu_description_title}</span>
                              {/* Delete button */}
                              <div
                                className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                                  opacity-0 translate-x-full group-hover/desc:opacity-100 group-hover/desc:translate-x-0 
                                  transition-all duration-300 ease-out pointer-events-none group-hover/desc:pointer-events-auto'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMenuDesc(day.cartId, item.lunchbox_name || '', item.name, desc.menu_description_id || '', item.menu_description || []);
                                  }}
                                  className='px-1.5 py-1 hover:bg-red-600 rounded-l-lg transition-colors h-full flex items-center'
                                  title='ลบหมายเหตุเมนู'>
                                  <Trash2 className='w-3 h-3 text-white' />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    
                    {/* Add Menu Description Input Row */}
                    {isExpanded && isShowingAddInput && (
                      <tr className={`border-l-4 border-blue-400 ${closingMenuDescInput[menuKey] ? 'animate-fadeSlideOut' : 'animate-fadeSlideIn'}`}>
                        <td colSpan={2} className='px-4 py-2 pl-8 bg-blue-50'>
                          <div className='flex flex-wrap gap-2 items-stretch'>
                            <textarea
                              placeholder='รายการ'
                              value={menuDescInputs[menuKey]?.title || ""}
                              onChange={(e) => {
                                handleMenuDescInputChange(menuKey, "title", e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onClick={(e) => e.stopPropagation()}
                              rows={1}
                              className='flex-1 min-w-[100px] px-3 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-none overflow-hidden leading-normal bg-white'
                            />
                            <input
                              type='text'
                              placeholder='จำนวน'
                              value={menuDescInputs[menuKey]?.value || ""}
                              onChange={(e) => handleMenuDescInputChange(menuKey, "value", e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className='w-14 shrink-0 px-2 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-center bg-white'
                            />
                          </div>
                          <div className='flex gap-2 justify-end mt-2'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setClosingMenuDescInput((prev) => ({ ...prev, [menuKey]: true }));
                                setMenuDescInputs((prev) => ({ ...prev, [menuKey]: { title: "", value: "" } }));
                                setTimeout(() => {
                                  setClosingMenuDescInput((prev) => ({ ...prev, [menuKey]: false }));
                                  setShowMenuDescInput((prev) => ({ ...prev, [menuKey]: false }));
                                }, 150);
                              }}
                              className='group/cancel px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 active:scale-95'
                              style={{ color: '#ef4444' }}>
                              <X className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/cancel:rotate-90' />
                              ยกเลิก
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddMenuDesc(day.cartId, item.lunchbox_name || '', item.name, item.menu_description || []);
                              }}
                              disabled={savingMenuDesc[menuKey]}
                              className='group/save px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                              style={{ color: '#3b82f6' }}>
                              <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                              {savingMenuDesc[menuKey] ? "กำลังบันทึก..." : "บันทึก"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {/* Notes displayed as table rows */}
              {day.cart_description && day.cart_description.map((desc, idx) => {
                const rowIndex = day.items.length + idx;
                const hasValue = desc.description_value && desc.description_value.trim() !== "";
                const descId = desc.description_id || idx.toString();
                const isEditing = editingNote[descId] !== null && editingNote[descId] !== undefined;
                
                // Editing mode
                if (isEditing) {
                  return (
                    <tr 
                      key={`note-${descId}`} 
                      className={`${rowIndex % 2 === 0 ? "bg-amber-100/50" : "bg-amber-100/30"}`}
                    >
                      <td colSpan={2} className='px-4 py-2'>
                        <div className='flex flex-wrap gap-2 items-stretch'>
                          <textarea
                            placeholder='รายการ'
                            value={editingNote[descId]?.title || ""}
                            onChange={(e) => {
                              handleEditNoteChange(descId, "title", e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto';
                                el.style.height = el.scrollHeight + 'px';
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            rows={1}
                            className='flex-1 min-w-[150px] px-3 py-1.5 text-base border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none overflow-hidden leading-normal bg-white'
                          />
                          <input
                            type='text'
                            placeholder='จำนวน'
                            value={editingNote[descId]?.value || ""}
                            onChange={(e) => handleEditNoteChange(descId, "value", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className='w-20 shrink-0 px-2 py-1.5 text-base border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none text-center bg-white'
                          />
                        </div>
                        <div className='flex gap-2 justify-end mt-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditNote(descId);
                            }}
                            className='group/cancel px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 active:scale-95'
                            style={{ color: '#ef4444' }}>
                            <X className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/cancel:rotate-90' />
                            ยกเลิก
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEditNote(descId, day.cart_description);
                            }}
                            disabled={savingNotes[day.cartId]}
                            className='group/save px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                            style={{ color: '#10b981' }}>
                            <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                            {savingNotes[day.cartId] ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                // Display mode
                const noteColors = dayNoteColor[day.dayOfWeek] || { light: "bg-amber-50", dark: "bg-amber-100", hover: "bg-amber-200" };
                
                return (
                  <tr 
                    key={`note-${descId}`} 
                    className={`group cursor-pointer hover:${noteColors.hover} transition-colors ${rowIndex % 2 === 0 ? noteColors.light : noteColors.dark}`}
                    onClick={() => handleStartEditNote(descId, day.cartId, desc.description_title, desc.description_value)}
                  >
                    {hasValue ? (
                      <>
                        <td className='px-4 py-2 !text-black align-middle break-words whitespace-pre-wrap'>{desc.description_title}</td>
                        <td className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-2 !text-center !text-black font-semibold align-middle relative overflow-hidden'>
                          <span>{desc.description_value}</span>
                          <div
                            className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                              opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 
                              transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(day.cartId, desc.description_id || "", day.cart_description);
                              }}
                              className='p-2 hover:bg-red-600 rounded-l-lg transition-colors h-full'
                              title='ลบหมายเหตุ'>
                              <Trash2 className='w-4 h-4 text-white' />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className='px-4 py-2 !text-black align-middle break-words whitespace-pre-wrap relative overflow-hidden'>
                        <span>{desc.description_title}</span>
                        <div
                          className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                            opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 
                            transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(day.cartId, desc.description_id || "", day.cart_description);
                            }}
                            className='p-2 hover:bg-red-600 rounded-l-lg transition-colors h-full'
                            title='ลบหมายเหตุ'>
                            <Trash2 className='w-4 h-4 text-white' />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Notes Section */}
          <div className='border-t border-gray-200'>
            {/* Add Note Input */}
            {(showNoteInput[day.cartId] || closingNoteInput[day.cartId]) ? (
              <div 
                className={`px-4 py-3 ${closingNoteInput[day.cartId] ? 'animate-fadeSlideOut' : 'animate-fadeSlideIn'}`}
                style={{ backgroundColor: '#d1fae5' }}
                onAnimationEnd={() => {
                  if (closingNoteInput[day.cartId]) {
                    setClosingNoteInput((prev) => ({ ...prev, [day.cartId]: false }));
                    setShowNoteInput((prev) => ({ ...prev, [day.cartId]: false }));
                  }
                }}>
                <div className='flex flex-wrap gap-2 items-stretch'>
                  <textarea
                    placeholder='รายการ'
                    value={noteInputs[day.cartId]?.title || ""}
                    onChange={(e) => {
                      handleNoteInputChange(day.cartId, "title", e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onClick={(e) => e.stopPropagation()}
                    rows={1}
                    className='flex-1 min-w-[120px] px-3 py-1.5 text-base border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none resize-none overflow-hidden leading-normal bg-white'
                  />
                  <input
                    type='text'
                    placeholder='จำนวน'
                    value={noteInputs[day.cartId]?.value || ""}
                    onChange={(e) => handleNoteInputChange(day.cartId, "value", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className='w-16 shrink-0 px-2 py-1.5 text-base border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none text-center bg-white'
                  />
                </div>
                <div className='flex gap-2 justify-end mt-2'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClosingNoteInput((prev) => ({ ...prev, [day.cartId]: true }));
                      setNoteInputs((prev) => ({ ...prev, [day.cartId]: { title: "", value: "" } }));
                      // ใช้ timeout เพื่อรอ animation เสร็จ
                      setTimeout(() => {
                        setClosingNoteInput((prev) => ({ ...prev, [day.cartId]: false }));
                        setShowNoteInput((prev) => ({ ...prev, [day.cartId]: false }));
                      }, 150);
                    }}
                    className='group/cancel px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 active:scale-95'
                    style={{ color: '#ef4444' }}>
                    <X className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/cancel:rotate-90' />
                    ยกเลิก
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote(day.cartId, day.cart_description);
                    }}
                    disabled={savingNotes[day.cartId]}
                    className='group/save px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                    style={{ color: '#10b981' }}>
                    <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                    {savingNotes[day.cartId] ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              </div>
            ) : (
              // Hide when any note is being edited
              !day.cart_description?.some((desc, idx) => {
                const descId = desc.description_id || idx.toString();
                return editingNote[descId] !== null && editingNote[descId] !== undefined;
              }) && (
                <div className='overflow-hidden max-h-0 opacity-0 group-hover/card:max-h-12 group-hover/card:opacity-100 transition-all duration-500 ease-in-out'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNoteInput((prev) => ({ ...prev, [day.cartId]: true }));
                      setNoteInputs((prev) => ({ ...prev, [day.cartId]: { title: "", value: "" } }));
                    }}
                    className='group/btn w-full px-4 py-2 flex items-center justify-center gap-1 text-xs text-gray-500 border-t border-gray-100 transition-all duration-300 ease-in-out hover:bg-gray-50 hover:text-emerald-600 active:scale-95'>
                    <Plus className='w-3 h-3 transition-transform duration-300 group-hover/btn:rotate-180 group-hover/btn:scale-110' />
                    <span>เพิ่มหมายเหตุ</span>
                  </button>
                </div>
              )
            )}
          </div>
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
    <div className={`p-4 sm:p-6 h-screen flex flex-col overflow-hidden bg-gray-50 ${cursorHidden ? "cursor-hidden" : ""}`}>
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

          {/* [LAYOUT หลัก] แสดงการ์ดทั้งหมด พร้อม highlight สำหรับการ์ดที่ปักหมุด */}
          <div className='flex-1 flex gap-4 overflow-hidden'>
            {/* Scrollable Cards Area */}
            <div className={`flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2`}>
              {allCards.length > 0
                ? allCards.map((day) => (
                    <div
                      key={day.id}
                      className={`h-full flex-none transition-all duration-300
                      w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[24%]
                    `}>
                      {renderDayCard(day, false)}
                    </div>
                  ))
                : (
                    <div className='flex flex-col items-center justify-center w-full text-gray-400 h-full border-2 border-dashed rounded-xl'>
                      <p>ไม่มีรายการออเดอร์</p>
                    </div>
                  )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
