"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapPin, Clock, Maximize2, Minimize2, Star, Plus, Save, X, Trash2, Edit2, CalendarDays } from "lucide-react";
import { Button } from "@/share/ui/button";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Loading } from "@/components/loading/loading";
import DashboardIcon from "@/assets/dashboard.png";

// Import from local files
import { dayColor, dayNoteColor, dayNoteTextColor, dayAuraColor, dayColorLegend } from "./constants";
import { DayItem, MenuIngredient, MenuItemDescription, CartDescription, DayCard, PackagingNote, PackagingInfo, EditCardState, ApiResponse } from "./types";
import { cleanTime, getMonthNameShort, getTimeAlertInfo, calculatePackaging, calculateMinutesToSend } from "./helpers";
import { SaveButton, CancelButton, DeleteButton, AddNoteButton, PackagingNoteForm, PackagingItem } from "./components";

// --- Main Component ---
export default function Dashboard() {
  const router = useRouter();
  const { userRole } = useAuth(); // ดึง userRole จาก AuthProvider
  const isAdmin = userRole === "admin"; // ตรวจสอบว่าเป็น admin หรือไม่
  
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

  // State สำหรับแก้ไข Card Info (เวลาจัดส่ง, เวลารับ, สถานที่, วันที่)
  const [editCardInfo, setEditCardInfo] = useState<EditCardState | null>(null);
  const [savingCardInfo, setSavingCardInfo] = useState(false);

  // State สำหรับ menu description
  const [menuDescInputs, setMenuDescInputs] = useState<Record<string, { title: string; value: string }>>({});
  const [showMenuDescInput, setShowMenuDescInput] = useState<Record<string, boolean>>({});
  const [closingMenuDescInput, setClosingMenuDescInput] = useState<Record<string, boolean>>({});
  const [savingMenuDesc, setSavingMenuDesc] = useState<Record<string, boolean>>({});
  const [editingMenuDesc, setEditingMenuDesc] = useState<Record<string, { cartId: string; lunchboxName: string; menuName: string; title: string; value: string } | null>>({});
  const [expandedMenuItems, setExpandedMenuItems] = useState<Record<string, boolean>>({});

  // State สำหรับ packaging notes (รองรับหลายโน้ต)
  const [packagingNoteInput, setPackagingNoteInput] = useState<Record<string, string>>({});
  const [showPackagingNoteInput, setShowPackagingNoteInput] = useState<Record<string, boolean>>({});
  const [savingPackagingNote, setSavingPackagingNote] = useState<Record<string, boolean>>({});
  const [editingPackagingNote, setEditingPackagingNote] = useState<Record<string, { cartId: string; noteId: string; value: string } | null>>({});

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

  // ฟังก์ชันนำทางไปหน้า summarylist พร้อม filter
  const handleNavigateToSummary = useCallback((cartId: string, dateTitle: string) => {
    Swal.fire({
      title: 'ต้องการนำทางไปหน้าสรุปรายการหรือไม่?',
      text: `ไปยังรายการ ${dateTitle}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, นำทาง',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        // นำทางไปหน้า summarylist พร้อม query parameter สำหรับ filter
        router.push(`/home/summarylist?cartId=${cartId}`);
      }
    });
  }, [router]);

  // ฟังก์ชันเริ่มแก้ไข Card Info
  const handleStartEditCardInfo = useCallback((day: DayCard) => {
    setEditCardInfo({
      cartId: day.cartId,
      date: day.rawDate,
      sendTime: day.sendTime.replace(' น.', ''),
      receiveTime: day.receiveTime.replace(' น.', ''),
      location: day.sendPlace,
    });
  }, []);

  // ฟังก์ชันบันทึก Card Info
  const handleSaveCardInfo = useCallback(async () => {
    if (!editCardInfo) return;
    
    setSavingCardInfo(true);
    try {
      const response = await fetch(`/api/edit/cart/${editCardInfo.cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_date: editCardInfo.date,
          export_time: editCardInfo.sendTime,
          receive_time: editCardInfo.receiveTime,
          location_send: editCardInfo.location,
        }),
      });
      
      if (response.ok) {
        mutate("/api/get/dashboard");
        setEditCardInfo(null);
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update');
      }
    } catch (error) {
      console.error("Error updating card info:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setSavingCardInfo(false);
    }
  }, [editCardInfo]);

  // ฟังก์ชันสำหรับ toggle ปักหมุดและบันทึกลง DB
  const togglePin = async (cartId: string, currentPinned: boolean) => {
    setSavingPin((prev) => ({ ...prev, [cartId]: true }));
    try {
      const response = await fetch(`/api/edit/cart-pinned/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !currentPinned }),
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
        body: JSON.stringify({ description: descriptions }),
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

  // ======= Packaging Notes Functions (Multiple Notes) =======
  
  // ฟังก์ชันบันทึก packaging notes ไปยัง database
  const savePackagingNotesToDatabase = useCallback(async (cartId: string, notes: PackagingNote[]) => {
    if (!cartId) {
      console.error("Cart ID is required for saving packaging notes");
      return;
    }
    setSavingPackagingNote((prev) => ({ ...prev, [cartId]: true }));
    try {
      const response = await fetch(`/api/edit/packaging-note/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packaging_notes: notes }),
      });
      if (!response.ok) {
        console.error("Failed to save packaging notes");
      } else {
        mutate("/api/get/dashboard");
      }
    } catch (error) {
      console.error("Error saving packaging notes:", error);
    } finally {
      setSavingPackagingNote((prev) => ({ ...prev, [cartId]: false }));
    }
  }, []);

  // ฟังก์ชันเพิ่ม packaging note ใหม่
  const handleAddPackagingNote = useCallback((cartId: string, currentNotes: PackagingNote[]) => {
    if (!cartId) return;
    const noteValue = packagingNoteInput[cartId]?.trim();
    if (!noteValue) {
      setShowPackagingNoteInput((prev) => ({ ...prev, [cartId]: false }));
      return;
    }
    const newNote: PackagingNote = {
      id: Date.now().toString(),
      value: noteValue,
    };
    const updatedNotes = [...currentNotes, newNote];
    savePackagingNotesToDatabase(cartId, updatedNotes);
    setShowPackagingNoteInput((prev) => ({ ...prev, [cartId]: false }));
    setPackagingNoteInput((prev) => ({ ...prev, [cartId]: "" }));
  }, [packagingNoteInput, savePackagingNotesToDatabase]);

  // ฟังก์ชันลบ packaging note
  const handleDeletePackagingNote = useCallback((cartId: string, noteId: string, currentNotes: PackagingNote[]) => {
    if (!cartId) return;
    const updatedNotes = currentNotes.filter((n) => n.id !== noteId);
    savePackagingNotesToDatabase(cartId, updatedNotes);
  }, [savePackagingNotesToDatabase]);

  // ฟังก์ชันอัปเดต packaging note
  const handleUpdatePackagingNote = useCallback((noteKey: string, currentNotes: PackagingNote[]) => {
    const editing = editingPackagingNote[noteKey];
    if (!editing) return;
    const updatedNotes = currentNotes.map((n) =>
      n.id === editing.noteId ? { ...n, value: editing.value.trim() } : n
    );
    savePackagingNotesToDatabase(editing.cartId, updatedNotes);
    setEditingPackagingNote((prev) => ({ ...prev, [noteKey]: null }));
  }, [editingPackagingNote, savePackagingNotesToDatabase]);

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

  // Auto-expand all menu items with descriptions by default
  useEffect(() => {
    if (apiData && apiData.status === "success") {
      const expandedState: Record<string, boolean> = {};
      apiData.result.forEach((item) => {
        item.items.forEach((lunchbox) => {
          lunchbox.lunchbox_menu.forEach((menu) => {
            const menuKey = `${item.id}-${lunchbox.lunchbox_name}-${menu.menu_name}`;
            // Set all menu items to expanded by default
            if (expandedState[menuKey] === undefined) {
              expandedState[menuKey] = true;
            }
          });
        });
      });
      setExpandedMenuItems((prev) => {
        // Only set keys that don't exist yet (preserve user's toggle choices)
        const newState = { ...expandedState };
        Object.keys(prev).forEach((key) => {
          newState[key] = prev[key];
        });
        return newState;
      });
    }
  }, [apiData]);

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

        // แปลงปี พ.ศ. เป็น 2 หลักท้าย (เช่น 2569 -> 69)
        const shortYear = String(year).slice(-2);

        // คำนวณ packaging จากแต่ละ lunchbox (ใช้จาก DB ถ้ามี, fallback คำนวณถ้าไม่มี)
        // แปลง packaging_notes จาก API (อาจเป็น JSON string หรือ string เก่า)
        let packagingNotes: PackagingNote[] = [];
        if (item.packaging_note && typeof item.packaging_note === 'string' && item.packaging_note.trim()) {
          // ลองแปลง JSON string ก่อน
          try {
            const parsed = JSON.parse(item.packaging_note);
            if (Array.isArray(parsed)) {
              packagingNotes = parsed as PackagingNote[];
            } else {
              // ไม่ใช่ array ใช้เป็น legacy string
              packagingNotes = [{ id: 'legacy', value: item.packaging_note }];
            }
          } catch {
            // ไม่ใช่ JSON ใช้เป็น legacy string
            packagingNotes = [{ id: 'legacy', value: item.packaging_note }];
          }
        }
        
        const packaging: PackagingInfo = { fukYai: 0, box2Chan: 0, box3Chan: 0, notes: packagingNotes };
        item.items.forEach((lunchbox) => {
          if (lunchbox.packaging) {
            // ใช้ packaging จาก database
            packaging.fukYai += lunchbox.packaging.fukYai;
            packaging.box2Chan += lunchbox.packaging.box2Chan;
            packaging.box3Chan += lunchbox.packaging.box3Chan;
          } else {
            // Fallback: คำนวณ packaging สำหรับข้อมูลเก่าที่ยังไม่มี packaging
            const packResult = calculatePackaging(lunchbox.set, lunchbox.quantity);
            packaging.fukYai += packResult.fukYai;
            packaging.box2Chan += packResult.box2Chan;
            packaging.box3Chan += packResult.box3Chan;
          }
        });

        return {
          id: index + 1, // แนะนำให้ใช้ ID จริงจาก API ถ้ามี เพื่อความแม่นยำในการระบุตัวตน
          cartId: item.id, // เก็บ id จริงจาก API เพื่อใช้ในการบันทึก note
          dayOfWeek: item.dayOfWeek,
          dateTitle: `วัน${item.dayOfWeek}ที่ ${dayNum} ${getMonthNameShort(month)} ${shortYear}`,
          rawDate: item.date, // เก็บวันที่แบบ raw (DD/MM/YYYY) สำหรับใช้ในการแก้ไข
          sendPlace: item.location,
          sendTime: item.sendTime + " น.",
          receiveTime: item.receiveTime + " น.",
          items: sortedItems,
          totalText: `รวม ${totalQty} ชุด`,
          isPinned: item.pinned || false,
          minutesToSend,
          description: item.description || [],
          packaging,
        };
      })
      .filter((card) => card.minutesToSend >= 0)
      // Sort: pinned cards มาก่อน
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0; // คงลำดับเดิมถ้า pin status เหมือนกัน
      });
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

  // Listen for fullscreen event from Navigatebar
  useEffect(() => {
    const handleDashboardFullscreen = () => {
      toggleFullscreen();
    };
    window.addEventListener('dashboard-fullscreen', handleDashboardFullscreen);
    return () => window.removeEventListener('dashboard-fullscreen', handleDashboardFullscreen);
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
        {/* HEADER (Fixed) - คลิกที่ส่วนวันที่/เวลา/สถานที่เพื่อแก้ไข (เฉพาะ admin) */}
        <div 
          className={`relative flex-none bg-gradient-to-r ${headerGradient} text-white p-4 pb-5 transition-all`}
        >
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

          {/* วันที่ - คลิกเพื่อแก้ไข (เฉพาะ admin) หรือนำทางไปหน้าสรุปรายการ */}
          <div 
            className={`text-center mb-3 mt-5 lg:mt-6 ${isAdmin ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAdmin) {
                handleNavigateToSummary(day.cartId, day.dateTitle);
              }
            }}
            title={isAdmin ? 'คลิกเพื่อไปหน้าสรุปรายการ' : undefined}
          >
            <h2 className='!text-base lg:!text-xl !font-semibold drop-shadow !text-black'>{day.dateTitle}</h2>
          </div>

          {/* สถานที่ - คลิกเพื่อแก้ไข (เฉพาะ admin) */}
          <div 
            className={`flex justify-start mb-2 ${isAdmin ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAdmin) handleStartEditCardInfo(day);
            }}
            title={isAdmin ? 'คลิกเพื่อแก้ไขข้อมูล' : undefined}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 whitespace-normal break-words ${isAdmin ? 'hover:bg-gray-300 transition-colors' : ''}`}>
              <MapPin className='w-4 h-4 shrink-0 !text-black' />
              <span className='text-xs lg:text-sm leading-snug !text-black'>{day.sendPlace}</span>
            </div>
          </div>

          {/* เวลาส่ง และ เวลารับ - คลิกเพื่อแก้ไข (เฉพาะ admin) */}
          <div 
            className={`flex flex-wrap gap-3 mt-2 ${isAdmin ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAdmin) handleStartEditCardInfo(day);
            }}
            title={isAdmin ? 'คลิกเพื่อแก้ไขข้อมูล' : undefined}
          >
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 flex-1 min-w-[100px] lg:min-w-[150px] ${isAdmin ? 'hover:bg-gray-300 transition-colors' : ''}`}>
              <Clock className='w-4 h-4 !text-black' />
              <span className='text-xs lg:text-sm font-semibold whitespace-nowrap !text-black'>เวลาส่ง</span>
              <span className='whitespace-nowrap text-xs lg:text-sm !text-black'>{cleanTime(day.sendTime)}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 flex-1 min-w-[100px] lg:min-w-[150px] ${isAdmin ? 'hover:bg-gray-300 transition-colors' : ''}`}>
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
        <div className='flex-1 bg-white overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-0'>
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
                      className={`group/menuitem cursor-pointer transition-colors ${index % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}`}
                      onClick={() => toggleExpandMenuItem(menuKey)}
                    >
                      <td className='px-4 py-2 !text-black align-middle'>
                        <div className='flex items-center gap-2'>
                          {hasMenuDescription && (
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
                                  className='flex-1 min-w-[120px] px-3 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none resize-none overflow-hidden leading-normal bg-white text-black'
                                />
                                <input
                                  type='text'
                                  placeholder='จำนวน'
                                  value={editingMenuDesc[descId]?.value || ""}
                                  onChange={(e) => handleEditMenuDescChange(descId, "value", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className='w-16 shrink-0 px-2 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none text-center bg-white text-black'
                                />
                              </div>
                              <div className='flex gap-2 justify-end mt-2'>
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
                              className='flex-1 min-w-[100px] px-3 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-none overflow-hidden leading-normal bg-white text-black'
                            />
                            <input
                              type='text'
                              placeholder='จำนวน'
                              value={menuDescInputs[menuKey]?.value || ""}
                              onChange={(e) => handleMenuDescInputChange(menuKey, "value", e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className='w-14 shrink-0 px-2 py-1.5 text-sm border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-center bg-white text-black'
                            />
                          </div>
                          <div className='flex gap-2 justify-end mt-2'>
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
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {/* Notes displayed as table rows */}
              {day.description && day.description.map((desc, idx) => {
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
                            className='flex-1 min-w-[150px] px-3 py-1.5 text-base border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none overflow-hidden leading-normal bg-white text-black'
                          />
                          <input
                            type='text'
                            placeholder='จำนวน'
                            value={editingNote[descId]?.value || ""}
                            onChange={(e) => handleEditNoteChange(descId, "value", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className='w-20 shrink-0 px-2 py-1.5 text-base border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none text-center bg-white text-black'
                          />
                        </div>
                        <div className='flex gap-2 justify-end mt-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEditNote(descId, day.description);
                            }}
                            disabled={savingNotes[day.cartId]}
                            className='group/save px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                            style={{ color: '#10b981' }}>
                            <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                            {savingNotes[day.cartId] ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
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
                        <td className='px-4 py-2 align-middle break-words whitespace-pre-wrap' style={{ color: '#1f2937', fontWeight: 500 }}>{desc.description_title}</td>
                        <td className='lg:mr-0 px-0 pr-4 lg:pr-0 lg:px-4 py-2 !text-center font-bold align-middle relative overflow-hidden' style={{ color: '#dc2626' }}>
                          <span>{desc.description_value}</span>
                          <div
                            className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                              opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 
                              transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(day.cartId, desc.description_id || "", day.description);
                              }}
                              className='p-2 hover:bg-red-600 rounded-l-lg transition-colors h-full'
                              title='ลบหมายเหตุ'>
                              <Trash2 className='w-4 h-4 text-white' />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className='px-4 py-2 align-middle break-words whitespace-pre-wrap relative overflow-hidden' style={{ color: '#1f2937', fontWeight: 500 }}>
                        <span>{desc.description_title}</span>
                        <div
                          className='absolute right-0 top-0 bottom-0 flex items-center bg-red-500
                            opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 
                            transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(day.cartId, desc.description_id || "", day.description);
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
                    className='flex-1 min-w-[120px] px-3 py-1.5 text-base border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none resize-none overflow-hidden leading-normal bg-white text-black'
                  />
                  <input
                    type='text'
                    placeholder='จำนวน'
                    value={noteInputs[day.cartId]?.value || ""}
                    onChange={(e) => handleNoteInputChange(day.cartId, "value", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className='w-16 shrink-0 px-2 py-1.5 text-base border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none text-center bg-white text-black'
                  />
                </div>
                <div className='flex gap-2 justify-end mt-2'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote(day.cartId, day.description);
                    }}
                    disabled={savingNotes[day.cartId]}
                    className='group/save px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 active:scale-95'
                    style={{ color: '#10b981' }}>
                    <Save className='w-3 h-3 inline mr-1 transition-transform duration-300 group-hover/save:scale-110' />
                    {savingNotes[day.cartId] ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
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
                </div>
              </div>
            ) : (
              // Hide when any note is being edited
              !day.description?.some((desc, idx) => {
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

        {/* FOOTER - Fixed at bottom of card using flex */}
        <div className='flex-none border-t bg-white py-2 px-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
          {/* Packaging Info */}
          {(day.packaging.fukYai > 0 || day.packaging.box2Chan > 0 || day.packaging.box3Chan > 0) && (
            <div className='mb-2 text-sm group/packaging'>
              {/* Packaging Notes - รองรับหลายโน้ต */}
              {/* ปุ่มเพิ่มโน้ต/ฟอร์มเพิ่มโน้ตใหม่ - อยู่บนสุดเสมอ */}
              {showPackagingNoteInput[day.cartId] ? (
                <div className='mb-2 p-2 bg-gray-50 rounded border border-gray-200'>
                  <textarea
                    value={packagingNoteInput[day.cartId] ?? ""}
                    onChange={(e) => setPackagingNoteInput((prev) => ({ ...prev, [day.cartId]: e.target.value }))}
                    placeholder='เพิ่มโน้ต packaging...'
                    className='w-full text-xs p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-black'
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className='flex justify-end gap-1 mt-1'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPackagingNote(day.cartId, day.packaging.notes);
                      }}
                      disabled={savingPackagingNote[day.cartId]}
                      className='px-2 py-1 text-xs rounded disabled:opacity-50 flex items-center gap-1 hover:bg-green-50'
                      style={{ color: '#16a34a' }}
                    >
                      {savingPackagingNote[day.cartId] ? (
                        <span className='animate-spin'>⏳</span>
                      ) : (
                        <Save className='w-3 h-3' />
                      )}
                      บันทึก
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPackagingNoteInput((prev) => ({ ...prev, [day.cartId]: false }));
                        setPackagingNoteInput((prev) => ({ ...prev, [day.cartId]: "" }));
                      }}
                      className='px-2 py-1 text-xs rounded hover:bg-gray-100'
                      style={{ color: '#4b5563' }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className='overflow-hidden max-h-0 group-hover/packaging:max-h-10 group-hover/packaging:mb-2 transition-all duration-200'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackagingNoteInput((prev) => ({ ...prev, [day.cartId]: "" }));
                      setShowPackagingNoteInput((prev) => ({ ...prev, [day.cartId]: true }));
                    }}
                    className='group/btn w-full px-2 py-1 text-xs text-orange-600 border border-dashed border-orange-300 rounded hover:bg-orange-50 flex items-center justify-center gap-1 transition-all duration-300 ease-in-out active:scale-95'
                  >
                    <Plus className='w-3 h-3 transition-transform duration-300 group-hover/btn:rotate-180 group-hover/btn:scale-110' />
                    เพิ่มโน้ต
                  </button>
                </div>
              )}
              
              {/* แสดงโน้ตที่มีอยู่ */}
              {day.packaging.notes.length > 0 && (
                <div className='mb-2 space-y-1'>
                  {day.packaging.notes.map((note) => {
                    const noteKey = `${day.cartId}-${note.id}`;
                    const editing = editingPackagingNote[noteKey];
                    
                    return editing ? (
                      <div key={note.id} className='p-2 bg-gray-50 rounded border border-gray-200'>
                        <textarea
                          value={editing.value}
                          onChange={(e) => setEditingPackagingNote((prev) => ({
                            ...prev,
                            [noteKey]: { ...prev[noteKey]!, value: e.target.value }
                          }))}
                          placeholder='แก้ไขโน้ต...'
                          className='w-full text-xs p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-black'
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className='flex justify-end gap-1 mt-1'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePackagingNote(day.cartId, note.id, day.packaging.notes);
                              setEditingPackagingNote((prev) => ({ ...prev, [noteKey]: null }));
                            }}
                            className='px-2 py-1 text-xs rounded flex items-center gap-1 hover:bg-red-50'
                            style={{ color: '#dc2626' }}
                          >
                            <Trash2 className='w-3 h-3' />
                            ลบ
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePackagingNote(noteKey, day.packaging.notes);
                            }}
                            disabled={savingPackagingNote[day.cartId]}
                            className='px-2 py-1 text-xs rounded disabled:opacity-50 flex items-center gap-1 hover:bg-green-50'
                            style={{ color: '#16a34a' }}
                          >
                            {savingPackagingNote[day.cartId] ? (
                              <span className='animate-spin'>⏳</span>
                            ) : (
                              <Save className='w-3 h-3' />
                            )}
                            บันทึก
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPackagingNote((prev) => ({ ...prev, [noteKey]: null }));
                            }}
                            className='px-2 py-1 text-xs rounded hover:bg-gray-100'
                            style={{ color: '#4b5563' }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        key={note.id}
                        className='p-2 bg-orange-50 border border-orange-200 rounded cursor-pointer hover:bg-orange-100 transition-colors'
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPackagingNote((prev) => ({
                            ...prev,
                            [noteKey]: { cartId: day.cartId, noteId: note.id, value: note.value }
                          }));
                        }}
                      >
                        <p className='text-xs whitespace-pre-wrap' style={{ color: '#9a3412', fontWeight: 500 }}>{note.value}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {day.packaging.fukYai > 0 && (
                <div className='flex justify-between items-center py-1 px-2 bg-purple-200 rounded mb-1'>
                  <span className='font-semibold text-purple-900'>ฟูกใหญ่</span>
                  <span className='font-bold text-purple-900'>{day.packaging.fukYai}</span>
                </div>
              )}
              {day.packaging.box2Chan > 0 && (
                <div className='flex justify-between items-center py-1 px-2 bg-blue-200 rounded mb-1'>
                  <span className='font-semibold text-blue-900'>กล่อง 2 ช่องดำ</span>
                  <span className='font-bold text-blue-900'>{day.packaging.box2Chan}</span>
                </div>
              )}
              {day.packaging.box3Chan > 0 && (
                <div className='flex justify-between items-center py-1 px-2 bg-green-200 rounded mb-1'>
                  <span className='font-semibold text-green-900'>กล่อง 3 ช่องดำ</span>
                  <span className='font-bold text-green-900'>{day.packaging.box3Chan}</span>
                </div>
              )}
            </div>
          )}
          <p className='text-center font-semibold text-red-600'>{day.totalText}</p>
        </div>
      </div>
    );
  };

  return (
    // Main Container: ความสูงเท่าหน้าจอ (h-screen) และห้าม Scroll ที่ตัวแม่ (overflow-hidden)
    <div className={`p-4 sm:p-6 h-screen flex flex-col overflow-hidden bg-gray-50 ${cursorHidden ? "cursor-hidden" : ""}`}>
      {/* Edit Card Info Modal - เฉพาะ admin */}
      {isAdmin && editCardInfo && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4' onClick={() => setEditCardInfo(null)}>
          <div 
            className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeSlideIn'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Edit2 className='w-5 h-5' />
                แก้ไขข้อมูลออเดอร์
              </h3>
            </div>

            {/* Modal Body */}
            <div className='p-5 space-y-5'>
              {/* วันที่จัดส่ง */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                  <CalendarDays className='w-4 h-4 text-blue-600' />
                  วันที่จัดส่ง
                </label>
                <input
                  type='date'
                  value={(() => {
                    // แปลงจาก DD/MM/YYYY (พ.ศ.) เป็น YYYY-MM-DD (ค.ศ.) สำหรับ input date
                    const [d, m, y] = editCardInfo.date.split('/');
                    if (d && m && y) {
                      const gregorianYear = parseInt(y) - 543;
                      return `${gregorianYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                    return '';
                  })()}
                  onChange={(e) => {
                    // แปลงจาก YYYY-MM-DD (ค.ศ.) เป็น DD/MM/YYYY (พ.ศ.)
                    const [y, m, d] = e.target.value.split('-');
                    if (y && m && d) {
                      const buddhistYear = parseInt(y) + 543;
                      setEditCardInfo({ ...editCardInfo, date: `${d}/${m}/${buddhistYear}` });
                    }
                  }}
                  className='w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white'
                />
              </div>

              {/* เวลาส่ง */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-green-600' />
                  เวลาส่ง
                </label>
                <div className='flex items-center gap-2'>
                  <select
                    value={editCardInfo.sendTime.split(':')[0] || '00'}
                    onChange={(e) => {
                      const minute = editCardInfo.sendTime.split(':')[1] || '00';
                      setEditCardInfo({ ...editCardInfo, sendTime: `${e.target.value}:${minute}` });
                    }}
                    className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white cursor-pointer'
                  >
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span className='text-xl font-bold text-gray-600'>:</span>
                  <select
                    value={editCardInfo.sendTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hour = editCardInfo.sendTime.split(':')[0] || '00';
                      setEditCardInfo({ ...editCardInfo, sendTime: `${hour}:${e.target.value}` });
                    }}
                    className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white cursor-pointer'
                  >
                    {['00', '15', '30', '45'].map((minute) => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <span className='text-sm font-medium text-gray-500'>น.</span>
                </div>
              </div>

              {/* เวลารับ */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-orange-600' />
                  เวลารับ
                </label>
                <div className='flex items-center gap-2'>
                  <select
                    value={editCardInfo.receiveTime.split(':')[0] || '00'}
                    onChange={(e) => {
                      const minute = editCardInfo.receiveTime.split(':')[1] || '00';
                      setEditCardInfo({ ...editCardInfo, receiveTime: `${e.target.value}:${minute}` });
                    }}
                    className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white cursor-pointer'
                  >
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span className='text-xl font-bold text-gray-600'>:</span>
                  <select
                    value={editCardInfo.receiveTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hour = editCardInfo.receiveTime.split(':')[0] || '00';
                      setEditCardInfo({ ...editCardInfo, receiveTime: `${hour}:${e.target.value}` });
                    }}
                    className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white cursor-pointer'
                  >
                    {['00', '15', '30', '45'].map((minute) => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <span className='text-sm font-medium text-gray-500'>น.</span>
                </div>
              </div>

              {/* สถานที่ */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-red-600' />
                  สถานที่จัดส่ง
                </label>
                <input
                  type='text'
                  value={editCardInfo.location}
                  onChange={(e) => setEditCardInfo({ ...editCardInfo, location: e.target.value })}
                  placeholder='ระบุสถานที่'
                  className='w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium bg-white placeholder:text-gray-400'
                />
              </div>
            </div>

            {/* Modal Footer - ปุ่มใหญ่และกดง่าย */}
            <div className='px-5 py-4 bg-gray-50 flex gap-3'>
              <button
                onClick={handleSaveCardInfo}
                disabled={savingCardInfo}
                className='flex-1 px-5 py-3.5 text-base font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              >
                {savingCardInfo ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    บันทึก
                  </>
                )}
              </button>
              <button
                onClick={() => setEditCardInfo(null)}
                className='flex-1 px-5 py-3.5 text-base font-semibold rounded-xl hover:opacity-80 active:scale-[0.98] transition-all flex items-center justify-center'
                style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '2px solid #d1d5db' }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

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
          {/* Fullscreen Exit Button - Fixed position when in fullscreen mode */}
          {fullscreen && (
            <div className='fixed top-4 left-4 z-50 flex items-center gap-2'>
              {/* Exit Fullscreen Button - Icon only */}
              <button 
                onClick={toggleFullscreen} 
                className='flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110'
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                title='ออกจากโหมดเต็มจอ'
              >
                <Minimize2 className='w-4 h-4' style={{ color: 'white' }} />
              </button>
              {/* Day Color Legend */}
              <div 
                className='flex items-center gap-1.5 text-[11px] text-white backdrop-blur-sm px-3 py-1.5 rounded-full'
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
              >
                {dayColorLegend.map((day) => (
                  <div key={day.label} className='flex items-center gap-1'>
                    <span className={`w-2.5 h-2.5 rounded-full ${day.className}`} />
                    <span>{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* [LAYOUT หลัก] แสดงการ์ดทั้งหมด พร้อม highlight สำหรับการ์ดที่ปักหมุด */}
          <div className='flex-1 flex gap-4 overflow-hidden min-h-0'>
            {/* Scrollable Cards Area */}
            <div className={`flex-1 flex gap-4 overflow-x-auto overflow-y-hidden snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2`}>
              {allCards.length > 0
                ? allCards.map((day) => (
                    <div
                      key={day.id}
                      className={`flex-none transition-all duration-300
                      w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[24%]
                    `}
                      style={{ height: '100%' }}>
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
