"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate, EventInput } from "@fullcalendar/core";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import { Clock, User, Package, FileText, Search, CalendarDays, Filter, Smartphone, Wallet, Map, Download, Users, Edit2, Container } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/share/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Input } from "@/share/ui/input";
import ResponsiveOrderId from "./ResponsiveOrderId";
import StatusDropdown from "./StatusDropdown";
import PaginationComponent from "@/components/ui/Totalpage";
import { Ingredient, MenuItem, Cart, CartItem, RawCart } from "@/types/interface_summary_orderhistory";
import Swal from "sweetalert2";

// Fetcher function สำหรับ SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  return res.json();
};

const SummaryList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterCreator, setFilterCreator] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingMenu, setEditingMenu] = useState<{
    cartId: string;
    menuName: string;
  } | null>(null);
  const [editTotalBox, setEditTotalBox] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Cart[]>([]);
  const [selectedDateForSummary, setSelectedDateForSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [summaryDialogType, setSummaryDialogType] = useState<"order" | "date" | null>(null);
  const [selectedCartForSummary, setSelectedCartForSummary] = useState<Cart | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isOrderSummaryModalOpen, setIsOrderSummaryModalOpen] = useState(false);
  const [shouldFetchMenu, setShouldFetchMenu] = useState(false);
  const [editMenuDialog, setEditMenuDialog] = useState<{
    cartId: string;
    menuItems: {
      menu_name: string;
      menu_total: number;
      menu_ingredients: {
        useItem: number;
        ingredient_name: string;
        ingredient_status: boolean;
      }[];
    }[];
    newMenu: { menu_name: string; menu_total: number };
  } | null>(null);
  const [editIngredientsMenu, setEditIngredientsMenu] = useState<{
    cartId: string;
    menuName: string;
    ingredients: {
      ingredient_name: string;
      useItem: number;
      ingredient_status: boolean;
      ingredient_unit: string;
    }[];
    newIngredient: { ingredient_name: string; useItem: number };
  } | null>(null);
  // ใช้ SWR เพื่อดึงข้อมูล
  const { data: menuListData, error: menuListError } = useSWR(shouldFetchMenu ? "/api/get/menu/name" : null, fetcher, {
    refreshInterval: 30000,
  });
  const { data: cartsData, error: cartsError, mutate: mutateCarts } = useSWR("/api/get/carts", fetcher, { refreshInterval: 30000 });
  const { data: menuData, error: menuError } = useSWR("/api/get/menu/list", fetcher, { refreshInterval: 30000 });
  const { data: ingredientData, error: ingredientError } = useSWR("/api/get/ingredients", fetcher, { refreshInterval: 30000 });
  const error = cartsError || menuError || ingredientError;
  const isLoading = !cartsData || !menuData || !ingredientData;
  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  // const [editIngredientsMenu, setEditIngredientsMenu] = useState<{
  //   cartId: string;
  //   menuName: string;
  //   ingredients: Ingredient[];
  // } | null>(null);

  const [newIngredient, setNewIngredient] = useState<{
    name: string;
    useItem: number;
    unit: string;
  }>({ name: "", useItem: 1, unit: "" });

  const [addMenuDialog, setAddMenuDialog] = useState<{ cartId: string } | null>(null);
  const [newMenu, setNewMenu] = useState<{ name: string; total: number }>({
    name: "",
    total: 1,
  });

  const handleSummaryprice = () => {
    router.push("/home/summarylist/summaryprice");
  };

  const handleOpenDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  const safeParseJSON = (jsonString: string): CartItem[] => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return [];
    }
  };

  // แปลงข้อมูลเมื่อข้อมูลจาก SWR พร้อม
  useEffect(() => {
    if (!cartsData || !ingredientData) return;

    const formatOrders = async () => {
      try {
        const ingredientUnitMap = new globalThis.Map<string, string>();
        ingredientData.forEach((ing: { ingredient_name: string; ingredient_unit: string }) => {
          ingredientUnitMap.set(ing.ingredient_name, ing.ingredient_unit);
        });

        const formattedOrders: Cart[] = cartsData.map((cart: RawCart) => {
          const [rawDate] = cart.cart_create_date.split("T");
          const [year, month, day] = rawDate.split("-");
          const dateObjectForLocale = new Date(Number(year), Number(month) - 1, Number(day));
          const formattedDate = dateObjectForLocale
            .toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .replace(/ /g, " ");

          const date = new Date(cart.cart_create_date);
          const formattedDateISO = date.toISOString().split("T")[0];
          const formattedTime = cart.cart_create_date.split("T")[1].split(".")[0].slice(0, 5);

          const menuItems: MenuItem[] =
            typeof cart.cart_menu_items === "string" && cart.cart_menu_items
              ? safeParseJSON(cart.cart_menu_items)
              : Array.isArray(cart.cart_menu_items)
              ? cart.cart_menu_items.filter((item) => item && typeof item.menu_total === "number")
              : [];

          const totalSets = menuItems.filter((item) => item && typeof item === "object" && typeof item.menu_total === "number").reduce((sum, item) => sum + (item.menu_total || 0), 0);

          const menuDisplayName = menuItems.length > 0 ? menuItems.map((item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`).join(" + ") : "ไม่มีชื่อเมนู";

          const allIngredients = menuItems.map((menu) => ({
            menuName: menu.menu_name,
            ingredients: (menu.menu_ingredients ?? []).map((dbIng: Ingredient) => ({
              ...dbIng,
              ingredient_id: dbIng.ingredient_id || undefined,
              ingredient_name: dbIng.ingredient_name || "ไม่พบวัตถุดิบ",
              calculatedTotal: dbIng.useItem * (menu.menu_total || 0),
              sourceMenu: menu.menu_name,
              isChecked: dbIng.ingredient_status ?? false,
              ingredient_status: dbIng.ingredient_status ?? false,
              ingredient_unit: ingredientUnitMap.get(dbIng.ingredient_name?.toString() || "") || "ไม่ระบุหน่วย",
            })),
            ingredient_status: (menu.menu_ingredients ?? []).every((ing: Ingredient) => ing.ingredient_status ?? false),
          }));

          const orderNumber = `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;
          return {
            id: cart.cart_id || "no-id",
            orderNumber,
            name: menuDisplayName,
            date: formattedDate,
            dateISO: formattedDateISO,
            time: formattedTime,
            sets: totalSets,
            price: cart.cart_total_price || 0,
            status: cart.cart_status,
            createdBy: cart.cart_username || "ไม่ทราบผู้สร้าง",
            menuItems: menuItems.map((item) => ({
              ...item,
              menu_ingredients: item.menu_ingredients || [],
            })),
            allIngredients,
            order_number: cart.cart_order_number,
            cart_delivery_date: cart.cart_delivery_date,
            cart_receive_time: cart.cart_receive_time,
            cart_export_time: cart.cart_export_time,
            cart_customer_tel: cart.cart_customer_tel,
            cart_customer_name: cart.cart_customer_name,
            cart_location_send: cart.cart_location_send,
            cart_shipping_cost: cart.cart_shipping_cost,
          };
        });

        formattedOrders.sort((a, b) => {
          const dateA = convertThaiDateToISO(a.cart_delivery_date);
          const dateB = convertThaiDateToISO(b.cart_delivery_date);

          if (!dateA) return 1;
          if (!dateB) return -1;

          const diffA = Math.abs(new Date(dateA).getTime() - new Date().getTime());
          const diffB = Math.abs(new Date(dateB).getTime() - new Date().getTime());

          if (diffA !== diffB) {
            return diffA - diffB;
          }

          const orderNumA = parseInt(a.order_number || "0");
          const orderNumB = parseInt(b.order_number || "0");
          return orderNumB - orderNumA;
        });

        setAllCarts(formattedOrders);
        setCarts(formattedOrders);
      } catch (err) {
        console.error("Error formatting orders:", err);
      }
    };

    formatOrders();
  }, [cartsData, ingredientData]);
  // แปลงข้อมูลสำหรับปฏิทิน
  useEffect(() => {
    if (!cartsData) return;

    const groupedByDate: { [date: string]: RawCart[] } = {};
    const allowedStatuses = ["pending", "completed"];

    cartsData.forEach((cart: RawCart) => {
      if (!allowedStatuses.includes(cart.cart_status)) return;
      const deliveryDate = convertThaiDateToISO(cart.cart_delivery_date);
      if (!deliveryDate) return;
      if (!groupedByDate[deliveryDate]) {
        groupedByDate[deliveryDate] = [];
      }
      groupedByDate[deliveryDate].push(cart);
    });

    const events = Object.entries(groupedByDate).map(([date, carts]) => ({
      start: date,
      allDay: true,
      display: "background",
      backgroundColor: "#f70505",
      borderColor: "#ef4444",
      timeZone: "Asia/Bangkok",
      extendedProps: { carts },
    }));

    setCalendarEvents(events);
  }, [cartsData]);

  // State และฟังก์ชันสำหรับการแก้ไขเวลา
  const [editingTimes, setEditingTimes] = useState<{
    cartId: string;
    exportHour: string;
    exportMinute: string;
    receiveHour: string;
    receiveMinute: string;
  } | null>(null);

  const handleEditTimes = (cartId: string, exportTime: string, receiveTime: string) => {
    const parseTime = (time: string) => {
      if (!time) return { hour: "00", minute: "00" };
      const [hour, minute] = time.split(":").map((h) => h.padStart(2, "0"));
      return { hour: hour || "00", minute: minute || "00" };
    };

    const exportParsed = parseTime(exportTime);
    const receiveParsed = parseTime(receiveTime);

    setEditingTimes({
      cartId,
      exportHour: exportParsed.hour,
      exportMinute: exportParsed.minute,
      receiveHour: receiveParsed.hour,
      receiveMinute: receiveParsed.minute,
    });
  };

  const formatToHHMM = (time: string | undefined): string | undefined => {
    if (!time) return undefined;
    const cleaned = time.replace(/\s*น\.?$/, "").replace(".", ":");
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(cleaned) ? cleaned : undefined;
  };

  const handleSaveTimes = async (cartId: string) => {
    if (!editingTimes) {
      console.error("ไม่พบข้อมูลเวลาที่กำลังแก้ไข");
      return;
    }

    const exportTime = `${editingTimes.exportHour}:${editingTimes.exportMinute}`;
    const receiveTime = `${editingTimes.receiveHour}:${editingTimes.receiveMinute}`;

    setIsSaving(cartId);
    try {
      const payload = {
        cart_export_time: exportTime,
        cart_receive_time: receiveTime,
      };
      const response = await fetch(`/api/edit/cart_time/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update times");
      }

      mutateCarts();
      setEditingTimes(null);
      Swal.fire({
        icon: "success",
        title: "อัปเดตเวลาเรียบร้อย!",
        text: `เวลาส่ง: ${exportTime}, เวลารับ: ${receiveTime}`,
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      console.error("Error updating times:", err);
      console.error(err instanceof Error ? `ไม่สามารถอัปเดตเวลา: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตเวลา");
    } finally {
      setIsSaving(null);
    }
  };

  const formatInputTime = (value: string): string => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (cleaned.length >= 4) {
      const hours = cleaned.slice(0, 2);
      const minutes = cleaned.slice(2, 4);
      if (parseInt(hours) <= 23 && parseInt(minutes) <= 59) {
        return `${hours}.${minutes}`;
      }
    }
    return value;
  };

  const handleToggleIngredientCheck = async (cartId: string, menuName: string, ingredientName: string) => {
    const previousCarts = [...carts];
    const currentCart = carts.find((cart) => cart.id === cartId);
    const currentIngredient = currentCart?.allIngredients.find((group) => group.menuName === menuName)?.ingredients.find((ing) => ing.ingredient_name === ingredientName);

    const newCheckedStatus = !currentIngredient?.isChecked;

    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              allIngredients: cart.allIngredients.map((group) =>
                group.menuName === menuName
                  ? {
                      ...group,
                      ingredients: group.ingredients.map((ing) =>
                        ing.ingredient_name === ingredientName
                          ? {
                              ...ing,
                              isChecked: newCheckedStatus,
                              ingredient_status: newCheckedStatus,
                            }
                          : ing
                      ),
                      ingredient_status: group.ingredients.every((ing) => (ing.ingredient_name === ingredientName ? newCheckedStatus : ing.isChecked)),
                    }
                  : group
              ),
            }
          : cart
      )
    );

    try {
      const response = await fetch(`/api/edit/cart-menu/ingredient-status/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuName,
          ingredientName,
          isChecked: newCheckedStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ingredient status");
      }

      mutateCarts();
    } catch (err) {
      console.error("Error updating ingredient status:", err);
      console.error(err instanceof Error ? `ไม่สามารถอัปเดตสถานะวัตถุดิบ: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตสถานะวัตถุดิบ");
      setCarts(previousCarts);
    }
  };

  const handleCheckAllIngredients = async (cartId: string) => {
    const previousCarts = [...carts];
    setIsSaving(cartId);

    // อัปเดต state ทันทีเพื่อให้ dialog แสดงผลเปลี่ยนแปลง
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              allIngredients: cart.allIngredients.map((group) => ({
                ...group,
                ingredients: group.ingredients.map((ing) => ({
                  ...ing,
                  isChecked: true,
                  ingredient_status: true,
                })),
                ingredient_status: true,
              })),
            }
          : cart
      )
    );

    // อัปเดต selectedCartForSummary ด้วยเพื่อให้ dialog แสดงข้อมูลใหม่
    if (selectedCartForSummary && selectedCartForSummary.id === cartId) {
      setSelectedCartForSummary((prev) =>
        prev
          ? {
              ...prev,
              allIngredients: prev.allIngredients.map((group) => ({
                ...group,
                ingredients: group.ingredients.map((ing) => ({
                  ...ing,
                  isChecked: true,
                  ingredient_status: true,
                })),
                ingredient_status: true,
              })),
            }
          : prev
      );
    }

    try {
      const response = await fetch(`/api/edit/cart-menu/all-ingredients-status/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update all ingredients status");
      }

      mutateCarts();
      // ไม่ปิด dialog ทันที เพื่อให้ผู้ใช้เห็นการเปลี่ยนแปลง
      // setIsSummaryDialogOpen(false);
    } catch (err) {
      console.error("Error updating all ingredients status:", err);
      console.error(err instanceof Error ? `ไม่สามารถอัปเดตสถานะวัตถุดิบทั้งหมด: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตสถานะวัตถุดิบทั้งหมด");
      // คืนค่า state เดิมเมื่อเกิดข้อผิดพลาด
      setCarts(previousCarts);
      if (selectedCartForSummary && selectedCartForSummary.id === cartId) {
        setSelectedCartForSummary(previousCarts.find((cart) => cart.id === cartId) || null);
      }
    } finally {
      setIsSaving(null);
    }
  };

  const handleCheckAllIngredientsForDate = async (date: string) => {
    const previousCarts = [...carts];
    setIsSaving("all");

    const targetCarts = carts.filter((cart) => convertThaiDateToISO(cart.cart_delivery_date) === date);

    // อัปเดต state ทันทีเพื่อให้ dialog แสดงผลเปลี่ยนแปลง
    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        targetCarts.some((target) => target.id === cart.id)
          ? {
              ...cart,
              allIngredients: cart.allIngredients.map((group) => ({
                ...group,
                ingredients: group.ingredients.map((ing) => ({
                  ...ing,
                  isChecked: true,
                  ingredient_status: true,
                })),
                ingredient_status: true,
              })),
            }
          : cart
      )
    );

    try {
      await Promise.all(
        targetCarts.map((cart) =>
          fetch(`/api/edit/cart-menu/all-ingredients-status/${cart.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isChecked: true }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to update all ingredients status for cart ${cart.id}`);
            }
          })
        )
      );

      mutateCarts();
      // ไม่ปิด dialog ทันที เพื่อให้ผู้ใช้เห็นการเปลี่ยนแปลง
      // setIsSummaryModalOpen(false);
    } catch (err) {
      console.error("Error updating all ingredients for date:", err);
      console.error(err instanceof Error ? `ไม่สามารถอัปเดตสถานะวัตถุดิบทั้งหมดสำหรับวันที่: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตสถานะวัตถุดิบทั้งหมดสำหรับวันที่");
      // คืนค่า state เดิมเมื่อเกิดข้อผิดพลาด
      setCarts(previousCarts);
    } finally {
      setIsSaving(null);
    }
  };

  const convertThaiDateToISO = (thaiDate: string | undefined): string | null => {
    if (!thaiDate) return null;
    const [day, month, year] = thaiDate.split("/");
    const buddhistYear = parseInt(year, 10);
    const christianYear = buddhistYear - 543;
    return `${christianYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // ฟังก์ชันช่วยแปลงเวลาเป็นนาทีสำหรับการเปรียบเทียบ
  const getTimeInMinutes = (timeStr: string | undefined): number => {
    if (!timeStr) return 9999; // ให้เวลาที่ไม่ระบุอยู่ท้ายสุด
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleDateClick = (info: { dateStr: string }) => {
    const selectedDateStr = info.dateStr;
    const filteredOrders = allCarts.filter((cart) => convertThaiDateToISO(cart.cart_delivery_date) === selectedDateStr);
    setSelectedOrders(filteredOrders);
    setIsOrderModalOpen(true);
    setSelectedDate(new Date(selectedDateStr));
    setIsDatePickerOpen(false);
    setCarts(filteredOrders);
    if (filteredOrders.length === 0) {
      console.error(
        `ไม่มีออร์เดอร์สำหรับวันที่ ${formatDate(new Date(selectedDateStr), {
          year: "numeric",
          month: "short",
          day: "numeric",
          locale: "th",
          timeZone: "Asia/Bangkok",
        })}`
      );
    } else {
      console.error(null);
    }
  };

  const handleEditTotalBox = (cartId: string, menuName: string, currentTotal: number) => {
    setEditingMenu({ cartId, menuName });
    setEditTotalBox(currentTotal);
  };

  const handleSaveTotalBox = async (cartId: string, menuName: string) => {
    if (editTotalBox < 0) {
      console.error("จำนวนกล่องต้องไม่น้อยกว่า 0");
      return;
    }
    if (!menuName) {
      console.error("ชื่อเมนูไม่ถูกต้อง");
      return;
    }

    const cleanedMenuName = menuName.trim();
    setIsSaving(cartId);
    try {
      const patchResponse = await fetch(`/api/edit/cart-menu/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuName: menuName, menu_total: editTotalBox }),
      });

      if (!patchResponse.ok) {
        const errorData = await patchResponse.json();
        throw new Error(errorData.error || "Failed to update total box");
      }

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                menuItems: cart.menuItems.map((item) => (item.menu_name === cleanedMenuName ? { ...item, menu_total: editTotalBox } : item)),
                allIngredients: cart.allIngredients.map((group) =>
                  group.menuName === cleanedMenuName
                    ? {
                        ...group,
                        ingredients: group.ingredients.map((ing) => ({
                          ...ing,
                          calculatedTotal: ing.useItem * editTotalBox,
                        })),
                      }
                    : group
                ),
                sets: cart.menuItems.reduce((sum, item) => sum + (item.menu_name === cleanedMenuName ? editTotalBox : item.menu_total), 0),
              }
            : cart
        )
      );

      Swal.fire({
        icon: "success",
        title: "อัปเดตจำนวนกล่องเรียบร้อย!",
        text: `เมนู: ${cleanedMenuName}, จำนวนกล่อง: ${editTotalBox}`,
        showConfirmButton: false,
        timer: 3000,
      });

      mutateCarts();
      setEditingMenu(null);
    } catch (err) {
      console.error("Error updating total box:", err);
      console.error(err instanceof Error ? `ไม่สามารถอัปเดตจำนวนกล่อง: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตจำนวนกล่อง");
    } finally {
      setIsSaving(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอมัดจำ";
      case "completed":
        return "ชำระเงินเเล้ว";
      case "success":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "from-amber-50 to-yellow-50 border-amber-200";
      case "completed":
        return "from-blue-50 to-indigo-50 border-blue-200";
      case "success":
        return "from-emerald-50 to-teal-50 border-emerald-200";
      case "cancelled":
        return "from-rose-50 to-red-50 border-rose-200";
      default:
        return "from-slate-50 to-gray-50 border-slate-200";
    }
  };

  const uniqueCreators = useMemo(() => {
    return [...new Set(carts.map((cart) => cart.createdBy))];
  }, [carts]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...carts].filter((cart) => cart.status === "pending" || cart.status === "completed");

    if (selectedDate) {
      const selectedDateISO = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((order) => convertThaiDateToISO(order.cart_delivery_date) === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => [order.name, order.id, order.createdBy].some((field) => (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter((order) => getStatusText(order.status) === filterStatus);
    }
    if (filterCreator !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    const groupedByDate = filtered.reduce((acc, cart) => {
      const deliveryDateISO = convertThaiDateToISO(cart.cart_delivery_date) || "no-date";
      if (!acc[deliveryDateISO]) {
        acc[deliveryDateISO] = [];
      }
      acc[deliveryDateISO].push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });

    // เรียงลำดับภายในแต่ละวันที่ตามเวลาส่งและเวลารับ
    Object.values(groupedByDate).forEach((orders) => {
      orders.sort((a, b) => {
        // แปลงเวลาส่งเป็นนาทีสำหรับการเปรียบเทียบ
        const getTimeInMinutes = (timeStr: string | undefined): number => {
          if (!timeStr) return 9999; // ให้เวลาที่ไม่ระบุอยู่ท้ายสุด
          const [hours, minutes] = timeStr.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const exportTimeA = getTimeInMinutes(a.cart_export_time);
        const exportTimeB = getTimeInMinutes(b.cart_export_time);
        const receiveTimeA = getTimeInMinutes(a.cart_receive_time);
        const receiveTimeB = getTimeInMinutes(b.cart_receive_time);

        // เรียงตามเวลาส่งก่อน (จากน้อยไปมาก)
        if (exportTimeA !== exportTimeB) {
          return exportTimeA - exportTimeB;
        }

        // ถ้าเวลาส่งเท่ากัน ให้เรียงตามเวลารับ (จากน้อยไปมาก)
        if (receiveTimeA !== receiveTimeB) {
          return receiveTimeA - receiveTimeB;
        }

        // ถ้าเวลาส่งและเวลารับเท่ากัน ให้เรียงตามเลขที่ออร์เดอร์
        const orderNumA = parseInt(a.order_number || "0");
        const orderNumB = parseInt(b.order_number || "0");
        return orderNumA - orderNumB;
      });
    });

    const currentDate = new Date();
    const sortedDates = Object.keys(groupedByDate).sort((dateA, dateB) => {
      if (dateA === "no-date") return 1;
      if (dateB === "no-date") return -1;
      const diffA = Math.abs(new Date(dateA).getTime() - currentDate.getTime());
      const diffB = Math.abs(new Date(dateB).getTime() - currentDate.getTime());
      return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
    });

    return sortedDates.flatMap((date) => groupedByDate[date]);
  }, [carts, searchTerm, filterStatus, filterCreator, selectedDate, sortOrder]);

  const groupedOrders = useMemo(() => {
    const grouped = filteredAndSortedOrders.reduce((acc, cart) => {
      const deliveryDateISO = convertThaiDateToISO(cart.cart_delivery_date);
      const dateDisplay = deliveryDateISO
        ? new Date(deliveryDateISO)
            .toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .replace(/ /g, " ")
        : "ไม่มีวันที่จัดส่ง";
      (acc[dateDisplay] = acc[dateDisplay] || []).push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });

    // เรียงลำดับภายในแต่ละวันที่ตามเวลาส่งและเวลารับ
    Object.values(grouped).forEach((orders) => {
      orders.sort((a, b) => {
        const exportTimeA = getTimeInMinutes(a.cart_export_time);
        const exportTimeB = getTimeInMinutes(b.cart_export_time);
        const receiveTimeA = getTimeInMinutes(a.cart_receive_time);
        const receiveTimeB = getTimeInMinutes(b.cart_receive_time);

        // เรียงตามเวลาส่งก่อน (จากน้อยไปมาก)
        if (exportTimeA !== exportTimeB) {
          return exportTimeA - exportTimeB;
        }

        // ถ้าเวลาส่งเท่ากัน ให้เรียงตามเวลารับ (จากน้อยไปมาก)
        if (receiveTimeA !== receiveTimeB) {
          return receiveTimeA - receiveTimeB;
        }

        // ถ้าเวลาส่งและเวลารับเท่ากัน ให้เรียงตามเลขที่ออร์เดอร์
        const orderNumA = parseInt(a.order_number || "0");
        const orderNumB = parseInt(b.order_number || "0");
        return orderNumA - orderNumB;
      });
    });

    const currentDate = new Date();
    const currentDateDisplay = currentDate
      .toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, " ");

    const currentDateGroup: [string, Cart[]][] = grouped[currentDateDisplay] ? [[currentDateDisplay, grouped[currentDateDisplay]]] : [];
    const otherDateGroups = Object.entries(grouped).filter(([date]) => date !== currentDateDisplay);

    const sortedOtherDates = otherDateGroups.sort((a, b) => {
      const dateA = convertThaiDateToISO(a[1][0].cart_delivery_date);
      const dateB = convertThaiDateToISO(b[1][0].cart_delivery_date);

      if (!dateA) return 1;
      if (!dateB) return -1;

      const diffA = Math.abs(new Date(dateA).getTime() - currentDate.getTime());
      const diffB = Math.abs(new Date(dateB).getTime() - currentDate.getTime());

      return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
    });

    return [...currentDateGroup, ...sortedOtherDates];
  }, [filteredAndSortedOrders, sortOrder]);

  const summarizeIngredients = (date: string) => {
    const ingredientSummary: {
      [key: string]: { checked: number; total: number };
    } = {};

    const ordersOnDate = filteredAndSortedOrders.filter((cart) => convertThaiDateToISO(cart.cart_delivery_date) === date);

    ordersOnDate.forEach((cart) => {
      cart.allIngredients.forEach((menuGroup) => {
        menuGroup.ingredients.forEach((ing) => {
          if (!ingredientSummary[ing.ingredient_name]) {
            ingredientSummary[ing.ingredient_name] = { checked: 0, total: 0 };
          }
          const totalGrams = ing.calculatedTotal || 0;
          ingredientSummary[ing.ingredient_name].total += totalGrams;
          if (ing.isChecked) {
            ingredientSummary[ing.ingredient_name].checked += totalGrams;
          }
        });
      });
    });

    const allIngredientsChecked = ordersOnDate.every((cart) => cart.allIngredients.every((menuGroup) => menuGroup.ingredients.every((ing) => ing.isChecked)));

    return {
      summary: Object.entries(ingredientSummary).map(([name, { checked, total }]) => ({
        name,
        checked,
        total,
      })),
      allIngredientsChecked,
    };
  };

  const summarizeOrderIngredients = (cart: Cart) => {
    const ingredientSummary: {
      [key: string]: { checked: number; total: number; unit: string };
    } = {};

    cart.allIngredients.forEach((menuGroup) => {
      menuGroup.ingredients.forEach((ing) => {
        if (!ingredientSummary[ing.ingredient_name]) {
          ingredientSummary[ing.ingredient_name] = {
            checked: 0,
            total: 0,
            unit: ing.ingredient_unit || "ไม่ระบุหน่วย",
          };
        }
        const totalGrams = ing.calculatedTotal || 0;
        ingredientSummary[ing.ingredient_name].total += totalGrams;
        if (ing.isChecked) {
          ingredientSummary[ing.ingredient_name].checked += totalGrams;
        }
      });
    });

    const allIngredientsChecked = cart.allIngredients.every((menuGroup) => menuGroup.ingredients.every((ing) => ing.isChecked));

    return {
      summary: Object.entries(ingredientSummary).map(([name, { checked, total, unit }]) => ({
        name,
        checked,
        total,
        unit,
      })),
      allIngredientsChecked,
    };
  };

  // const handleSummaryClick = (date: string) => {
  //   setSelectedDateForSummary(date);
  //   setIsSummaryModalOpen(true);
  // };

  // const handleOrderSummaryClick = (cart: Cart) => {
  //   setSelectedCartForSummary(cart);
  //   setIsOrderSummaryModalOpen(true);
  // };
  const handleSummaryClick = (date: string) => {
    setSelectedDateForSummary(date);
    setSummaryDialogType("date");
    setIsSummaryDialogOpen(true);
  };

  const handleOrderSummaryClick = (cart: Cart) => {
    setSelectedCartForSummary(cart);
    setSummaryDialogType("order");
    setIsSummaryDialogOpen(true);
  };

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
  const paginatedGroupedOrders = groupedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateWithCheck = (cart: { id: string; allIngredients: unknown[] }) => {
    mutateCarts();
  };

  const handleExportCSV = () => {
    const headers = ["เลขที่ออร์เดอร์", "ชื่อเมนู", "วันที่", "เวลา", "จำนวน Set", "ราคา", "สถานะ", "ผู้สร้าง"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedOrders.map((cart) => [cart.id, cart.name, cart.date, cart.time, cart.sets, cart.price, getStatusText(cart.status), cart.createdBy].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "order_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Order History", 14, 20);

    const tableColumn = ["Order ID", "Menu", "Date", "Time", "Sets", "Price", "Status", "Created By"];

    const tableRows = filteredAndSortedOrders.map((cart) => [cart.id, cart.name, cart.date, cart.time, cart.sets, cart.price, getStatusText(cart.status), cart.createdBy]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { font: "helvetica", fontSize: 10 },
    });

    doc.save("order_history.pdf");
  };

  const handleEditMenu = async (cartId: string, menuItems: MenuItem[]) => {
    if (
      !cartId ||
      !menuItems ||
      !Array.isArray(menuItems) ||
      menuItems.some((m) => !m.menu_name || m.menu_total < 0 || !Array.isArray(m.menu_ingredients) || m.menu_ingredients.some((ing) => !ing.ingredient_name || ing.useItem < 0))
    ) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "กรุณาระบุเมนูและจำนวนกล่องที่ถูกต้อง",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    console.log("Sending menuItems to API:", JSON.stringify(menuItems, null, 2));

    setIsSaving(cartId);
    try {
      const currentCart = carts.find((cart) => cart.id === cartId);
      if (!currentCart) {
        throw new Error("ไม่พบข้อมูล cart");
      }

      const ingredientsResponse = await fetch("/api/get/ingredients");
      if (!ingredientsResponse.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      const ingredientsData = await ingredientsResponse.json();

      const ingredientUnitMap = new globalThis.Map<string, string>();
      ingredientsData.forEach((ing: { ingredient_name: string; ingredient_unit: string }) => {
        ingredientUnitMap.set(ing.ingredient_name, ing.ingredient_unit);
      });

      const updatedMenuItems = menuItems.map((item) => {
        const existingMenu = currentCart.menuItems.find((m) => m.menu_name === item.menu_name);
        const menuData = menuListData?.find((m: { menu_name: string }) => m.menu_name === item.menu_name);

        const menuIngredients = (existingMenu?.menu_ingredients || menuData?.menu_ingredients || []).map(
          (ing: { useItem?: number; quantity?: number; ingredient_name?: string; name?: string; ingredient_status?: boolean }) => {
            const ingredientName = ing.ingredient_name ?? ing.name ?? "ไม่ระบุวัตถุดิบ";
            return {
              useItem: ing.useItem ?? ing.quantity ?? 0,
              ingredient_name: ingredientName,
              ingredient_status: ing.ingredient_status ?? false,
              ingredient_unit: ingredientUnitMap.get(ingredientName) ?? "ไม่ระบุหน่วย",
            };
          }
        );

        if (!menuIngredients.every((ing: { ingredient_name: string; useItem: number }) => ing.ingredient_name && ing.useItem >= 0)) {
          throw new Error(`Invalid ingredients for menu: ${item.menu_name}`);
        }

        return {
          menu_name: item.menu_name,
          menu_total: item.menu_total,
          menu_ingredients: menuIngredients,
        };
      });

      console.log("Updated menuItems to send:", JSON.stringify(updatedMenuItems, null, 2));

      const response = await fetch(`/api/edit/cart-menu/summary-list/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItems: updatedMenuItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update menu");
      }

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                menuItems: updatedMenuItems,
                allIngredients: updatedMenuItems.map((item) => ({
                  menuName: item.menu_name,
                  ingredients: item.menu_ingredients.map((ing: { useItem: number; ingredient_name: string; ingredient_status: boolean }) => ({
                    ...ing,
                    calculatedTotal: ing.useItem * item.menu_total,
                    isChecked: ing.ingredient_status,
                    ingredient_status: ing.ingredient_status,
                    ingredient_unit: ingredientUnitMap.get(ing.ingredient_name) ?? "ไม่ระบุหน่วย",
                  })),
                  ingredient_status: item.menu_ingredients.every((ing: { ingredient_status: boolean }) => ing.ingredient_status),
                })),
                sets: updatedMenuItems.reduce((sum, item) => sum + item.menu_total, 0),
              }
            : cart
        )
      );

      Swal.fire({
        icon: "success",
        title: "อัปเดตเมนูเรียบร้อย!",
        text: `จำนวนเมนู: ${updatedMenuItems.length} รายการ`,
        showConfirmButton: false,
        timer: 3000,
      });

      mutateCarts();
      setEditMenuDialog(null);
      setShouldFetchMenu(false);
    } catch (err) {
      console.error("Error updating menu:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err instanceof Error ? `ไม่สามารถอัปเดตเมนู: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตเมนู",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleEditIngredients = async (cartId: string, menuName: string, ingredients: Ingredient[]) => {
    setEditIngredientsMenu({
      cartId,
      menuName,
      ingredients: ingredients.map((ing) => ({
        ingredient_name: ing.ingredient_name,
        useItem: ing.useItem,
        ingredient_status: ing.ingredient_status ?? false,
        ingredient_unit: ing.ingredient_unit ?? "",
      })),
      newIngredient: { ingredient_name: "", useItem: 0 },
    });
  };

  const handleSaveIngredients = async (cartId: string, menuName: string) => {
    if (!editIngredientsMenu || !cartId) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบรหัสตะกร้า (cartId) หรือข้อมูลการแก้ไข",
        showConfirmButton: false,
        timer: 3000,
      });
      setEditIngredientsMenu(null);
      return;
    }

    setIsSaving(cartId);
    try {
      console.log("Sending request with cartId:", cartId); // เพิ่ม log เพื่อตรวจสอบ
      const response = await fetch(`/api/edit/cart-menu/ingredients/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuName,
          ingredients: editIngredientsMenu.ingredients,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ingredients");
      }

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                menuItems: cart.menuItems.map((item) =>
                  item.menu_name === menuName
                    ? {
                        ...item,
                        menu_ingredients: editIngredientsMenu.ingredients,
                      }
                    : item
                ),
                allIngredients: cart.allIngredients.map((group) =>
                  group.menuName === menuName
                    ? {
                        ...group,
                        ingredients: editIngredientsMenu.ingredients.map((ing) => ({
                          ...ing,
                          calculatedTotal: ing.useItem * (cart.menuItems.find((m) => m.menu_name === menuName)?.menu_total || 0),
                          isChecked: ing.ingredient_status,
                        })),
                        ingredient_status: editIngredientsMenu.ingredients.every((ing) => ing.ingredient_status),
                      }
                    : group
                ),
              }
            : cart
        )
      );

      Swal.fire({
        icon: "success",
        title: "อัปเดตวัตถุดิบเรียบร้อย!",
        text: `เมนู: ${menuName}`,
        showConfirmButton: false,
        timer: 3000,
      });

      mutateCarts();
      setEditIngredientsMenu(null);
    } catch (err) {
      console.error("Error updating ingredients:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err instanceof Error ? `ไม่สามารถอัปเดตวัตถุดิบ: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตวัตถุดิบ",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-2'>สรุปรายการ</h2>
        <p className='text-slate-600 mb-4'>จัดการและติดตามประวัติการสั่งซื้อทั้งหมด</p>

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>{error.message}</div>}

        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6'>
          <div className='col-span-full xl:col-span-2'>
            <div className='relative'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none' />
              <Input
                placeholder='Enter name, order ID...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pr-10 h-10 bg-white border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 rounded-xl shadow-sm:text-sm'
              />
            </div>
          </div>

          <div>
            <Button onClick={handleOpenDatePicker} className='w-full h-10 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center px-3 text-sm text-slate-600'>
              {selectedDate
                ? `วันที่ ${formatDate(selectedDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    locale: "th",
                    timeZone: "Asia/Bangkok",
                  })}`
                : "เลือกวันที่ที่ต้องการ"}
            </Button>

            <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <DialogContent className='max-w-4xl'>
                <DialogTitle className='sr-only'>Calendar View</DialogTitle>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView='dayGridMonth'
                  timeZone='Asia/Bangkok'
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  height='auto'
                  locale='th'
                  buttonText={{
                    today: "วันนี้",
                    month: "เดือน",
                    week: "สัปดาห์",
                    day: "วัน",
                  }}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek,dayGridDay",
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Select value={sortOrder} onValueChange={(val: "asc" | "desc") => setSortOrder(val)}>
              <SelectTrigger className='w-full h-10 rounded-lg border-slate-300 shadow-sm'>
                <SelectValue placeholder='Order' />
              </SelectTrigger>
              <SelectContent side='bottom' align='start' avoidCollisions={false}>
                <SelectItem value='asc'>เรียงจากใหม่ไปเก่า</SelectItem>
                <SelectItem value='desc'>เรียงจากเก่าไปใหม่</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-full h-10 rounded-lg border-slate-300 shadow-sm'>
                <Filter className='w-4 h-4 mr-2 text-slate-500' />
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent side='bottom' align='start' avoidCollisions={false}>
                <SelectItem value='ทั้งหมด'>ทั้งหมด</SelectItem>
                <SelectItem value='รอมัดจำ'>รอมัดจำ</SelectItem>
                <SelectItem value='ชำระเงินเเล้ว'>ชำระเงินเเล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className='w-full h-10 rounded-lg border-slate-300 shadow-sm'>
                <Users className='w-4 h-4 mr-2 text-slate-500' />
                <SelectValue placeholder='All creators' />
              </SelectTrigger>
              <SelectContent side='bottom' align='start' avoidCollisions={false}>
                <SelectItem value='ทั้งหมด'>ทั้งหมด</SelectItem>
                {uniqueCreators.map((creator) => (
                  <SelectItem key={creator} value={creator}>
                    {creator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 sm:w-full lg:grid-cols-4 gap-3 lg:w-1/2 lg:justify-self-end -mt-9 mb-5'>
          <Button
            onClick={() => {
              setSelectedDate(null);
              setCarts(allCarts);
            }}
            className='h-12 w-full rounded-lg border border-slate-300 shadow-sm text-sm'>
            ล้างวันที่
          </Button>
          <div className='flex flex-center'>
            <Button onClick={handleExportCSV} className='h-12 w-full flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2' /> CSV
            </Button>
            <Button onClick={handleExportPDF} className='h-12 w-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2' /> PDF
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          {isLoading ? (
            <Card>
              <CardContent className='text-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4'></div>
                <span className='text-slate-500'>Loading...</span>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className='text-center py-12'>
                <span className='text-red-500'>เกิดข้อผิดพลาด: {error.message}</span>
              </CardContent>
            </Card>
          ) : paginatedGroupedOrders.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <Package className='w-12 h-12 text-slate-400 mx-auto mb-2' />
                <span className='text-slate-500'>No orders found</span>
              </CardContent>
            </Card>
          ) : (
            paginatedGroupedOrders.map(([date, orders], index) => (
              <div key={`date-${index}`} className='space-y-4 bg-blue-50 rounded-xl shadow-sm'>
                <h3 style={{ fontSize: "28px" }} className='text-6xl font-bold text-blue-700 text-center px-4 py-3'>
                  วันที่ส่งอาหาร {date} ( จำนวน {orders.length} รายการ)
                </h3>

                <div className='space-y-4'>
                  {orders.map((cart) => (
                    <Accordion key={cart.id} type='multiple' defaultValue={[]} className='border-none m-4'>
                      <AccordionItem value={cart.id} className='border-none'>
                        <Card className={`bg-gradient-to-r ${getStatusColor(cart.status)} p-4 rounded-xl shadow-sm`}>
                          <div className='flex w-full items-center'>
                            <div className='ml-auto flex items-center gap-2'>
                              {editingTimes?.cartId === cart.id ? (
                                <div className='flex flex-col gap-2'>
                                  <div className='flex items-center gap-2'>
                                    <BsCashStack className='w-6 h-6' />
                                    <span>เวลาส่งอาหาร</span>
                                    <select
                                      value={editingTimes.exportHour}
                                      onChange={(e) =>
                                        setEditingTimes((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                exportHour: e.target.value,
                                              }
                                            : prev
                                        )
                                      }
                                      className='border rounded px-1'>
                                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                                        <option key={h} value={h}>
                                          {h}
                                        </option>
                                      ))}
                                    </select>
                                    :
                                    <select
                                      value={editingTimes.exportMinute}
                                      onChange={(e) =>
                                        setEditingTimes((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                exportMinute: e.target.value,
                                              }
                                            : prev
                                        )
                                      }
                                      className='border rounded px-1'>
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                                        <option key={m} value={m}>
                                          {m}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <FaWallet className='w-4 h-4' />
                                    <span>เวลารับอาหาร</span>
                                    <select
                                      value={editingTimes.receiveHour}
                                      onChange={(e) =>
                                        setEditingTimes((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                receiveHour: e.target.value,
                                              }
                                            : prev
                                        )
                                      }
                                      className='border rounded px-1'>
                                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                                        <option key={h} value={h}>
                                          {h}
                                        </option>
                                      ))}
                                    </select>
                                    :
                                    <select
                                      value={editingTimes.receiveMinute}
                                      onChange={(e) =>
                                        setEditingTimes((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                receiveMinute: e.target.value,
                                              }
                                            : prev
                                        )
                                      }
                                      className='border rounded px-1'>
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                                        <option key={m} value={m}>
                                          {m}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className='flex w-full items-center'>
                                    <div className='ml-auto flex items-center gap-2'>
                                      <Button variant='ghost' size='sm' onClick={() => handleSaveTimes(cart.id)} className='h-8 px-2' disabled={isSaving === cart.id}>
                                        {isSaving === cart.id ? "Saving..." : "Save"}
                                      </Button>
                                      <Button variant='ghost' size='sm' onClick={() => setEditingTimes(null)} className='h-8 px-2 text-gray-600 hover:bg-gray-50' disabled={isSaving === cart.id}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className='flex items-center gap-2'>
                                  <BsCashStack className='w-6 h-6' />
                                  <span>เวลาส่งอาหาร {cart.cart_export_time || "ไม่ระบุ"} น.</span>
                                  <FaWallet className='w-4 h-4 ml-4' />
                                  <span>เวลารับอาหาร {cart.cart_receive_time || "ไม่ระบุ"} น.</span>
                                  <span className='cursor-pointer ml-2' onClick={() => handleEditTimes(cart.id, cart.cart_export_time || "", cart.cart_receive_time || "")}>
                                    <Edit2 className='w-4 h-4' />
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <AccordionTrigger className='w-full hover:no-underline px-0'>
                            <div className='flex flex-col gap-3 w-full text-slate-700 text-sm sm:text-base font-bold'>
                              <div>รายการคำสั่งซื้อหมายเลข {String(cart.order_number).padStart(3, "0")}</div>
                              <div className='flex items-center gap-2 font-medium text-slate-800'>
                                <FileText className='w-4 h-4 text-blue-500' />
                                <span className='truncate text-sm sm:text-base'>
                                  ผู้สร้างรายการคำสั่งซื้อ: <span className=''>{cart.createdBy}</span>
                                </span>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 font-normal text-black'>
                                <div className='flex items-center gap-1 text-sm sm:text-base'>
                                  <Package className='w-4 h-4' />
                                  <span>จำนวนทั้งหมด {cart.sets} กล่อง</span>
                                  <Wallet className='w-4 h-4 text-green-400' />
                                  <span className='text-sm sm:text-base font-normal'>ราคาทั้งหมด {cart.price.toLocaleString()} บาท</span>
                                  <Container className='w-4 h-4 text-green-400' />
                                  <span className='text-sm sm:text-base font-normal'>ค่าจัดส่ง {cart.cart_shipping_cost?.toLocaleString() ?? "0"} บาท</span>
                                </div>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:justify-between font-normal sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-1 text-sm sm:text-base'>
                                  <Map className='w-4 h-4 text-red-600' />
                                  <span>สถานที่จัดส่ง {cart.cart_location_send} </span>
                                </div>
                              </div>
                              <div className='font-normal flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-1 text-sm sm:text-base'>
                                  <User className='w-4 h-4' />
                                  <span>ส่งถึงคุณ {cart.cart_customer_name}</span>
                                  <Smartphone className='w-4 h-4' />
                                  <span>เบอร์ {cart.cart_customer_tel} </span>
                                </div>
                              </div>
                              <div className='flex flex-wrap items-center gap-4 text-xs sm:text-sm font-normal text-black'>
                                <div className='flex items-center gap-1'>
                                  <CalendarDays className='w-4 h-4' />
                                  <span>วันที่สั่งอาหาร {cart.date}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Clock className='w-4 h-4' />
                                  <span>เวลา {cart.time} น.</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <BsCashStack className='w-4 h-4' />
                                  <span>ส่ง: {cart.cart_export_time || "ไม่ระบุ"} น.</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <FaWallet className='w-4 h-4' />
                                  <span>รับ: {cart.cart_receive_time || "ไม่ระบุ"} น.</span>
                                </div>
                              </div>
                              <div className='hidden flex items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] sm:text-xs text-gray-500'>
                                <ResponsiveOrderId id={cart.id} maxFontSize={10} minFontSize={10} />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className='flex justify-center mt-2'>
                            <StatusDropdown
                              cartId={cart.id}
                              allIngredients={cart.allIngredients}
                              defaultStatus={cart.status}
                              cart_receive_time={formatToHHMM(cart.cart_receive_time)}
                              cart_export_time={formatToHHMM(cart.cart_export_time)}
                              cart={cart}
                              onUpdated={() => handleUpdateWithCheck(cart)}
                              onOrderSummaryClick={handleOrderSummaryClick}
                            />
                          </div>
                          <AccordionContent className='mt-4'>
                            <div className='grid md:grid-cols-2 gap-6'>
                              <div>
                                <div className='flex justify-between items-center mb-2'>
                                  <div>
                                    <h4 className='text-sm font-bold mb-2 text-emerald-700 flex items-center gap-2'>
                                      <User className='w-4 h-4' /> เมนูที่สั่ง
                                    </h4>
                                  </div>
                                  <div>
                                    <Button
                                      onClick={() => {
                                        setShouldFetchMenu(true);
                                        const currentCart = carts.find((c) => c.id === cart.id);
                                        if (!currentCart || !currentCart.menuItems) {
                                          Swal.fire({
                                            icon: "error",
                                            title: "เกิดข้อผิดพลาด",
                                            text: "ไม่พบข้อมูลออร์เดอร์หรือเมนู",
                                            showConfirmButton: false,
                                            timer: 3000,
                                          });
                                          return;
                                        }
                                        setEditMenuDialog({
                                          cartId: cart.id,
                                          menuItems: currentCart.menuItems.map((item) => ({
                                            menu_name: item.menu_name || "เมนูไม่ระบุ",
                                            menu_total: item.menu_total || 0,
                                            menu_ingredients: Array.isArray(item.menu_ingredients)
                                              ? item.menu_ingredients.map((ing) => ({
                                                  useItem: ing.useItem ?? 0,
                                                  ingredient_name: ing.ingredient_name ?? "ไม่ระบุวัตถุดิบ",
                                                  ingredient_status: ing.ingredient_status ?? false,
                                                }))
                                              : [],
                                          })),
                                          newMenu: {
                                            menu_name: "",
                                            menu_total: 1,
                                          },
                                        });
                                      }}
                                      className='flex items-center gap-2'>
                                      แก้ไขเมนูที่สั่ง
                                      <Edit2 className='w-4 h-4' />
                                    </Button>
                                  </div>
                                </div>
                                <Dialog
                                  open={editMenuDialog !== null}
                                  onOpenChange={() => {
                                    setEditMenuDialog(null);
                                    setShouldFetchMenu(false);
                                  }}>
                                  <DialogContent className='max-w-lg max-h-[70vh] overflow-y-auto'>
                                    <div style={{ color: "black" }}>
                                      <div style={{ fontSize: "20px" }}>
                                        <DialogTitle>แก้ไขเมนูสำหรับ Order</DialogTitle>
                                      </div>
                                      <div className='space-y-4'>
                                        {menuListError ? (
                                          <div className='text-red-600 text-sm'>เกิดข้อผิดพลาดในการดึงข้อมูลเมนู: {menuListError.message}</div>
                                        ) : !menuListData ? (
                                          <div className='text-gray-500 text-sm'>กำลังโหลดข้อมูลเมนู...</div>
                                        ) : (
                                          <>
                                            {/* แสดงเมนูปัจจุบัน */}
                                            <div className='space-y-2'>
                                              <h5 className='text-sm font-semibold text-gray-700'>เมนูปัจจุบัน</h5>
                                              {editMenuDialog?.menuItems.length === 0 ? (
                                                <div className='text-gray-500 text-sm'>ไม่มีเมนูใน order นี้</div>
                                              ) : (
                                                editMenuDialog?.menuItems.map((item, idx) => (
                                                  <div key={idx} className='flex flex-col gap-2 border-b border-gray-200 py-2'>
                                                    <div className='flex items-center gap-2'>
                                                      <span className='flex-1 text-sm text-gray-700'>{item.menu_name}</span>
                                                      <Input
                                                        type='number'
                                                        value={item.menu_total}
                                                        onChange={(e) =>
                                                          setEditMenuDialog((prev) =>
                                                            prev
                                                              ? {
                                                                  ...prev,
                                                                  menuItems: prev.menuItems.map((m, i) =>
                                                                    i === idx
                                                                      ? {
                                                                          ...m,
                                                                          menu_total: Number(e.target.value),
                                                                        }
                                                                      : m
                                                                  ),
                                                                }
                                                              : prev
                                                          )
                                                        }
                                                        placeholder='จำนวนกล่อง'
                                                        min='0'
                                                        className='w-20 h-8 text-sm'
                                                      />
                                                      <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                          setEditMenuDialog((prev) =>
                                                            prev
                                                              ? {
                                                                  ...prev,
                                                                  menuItems: prev.menuItems.filter((_, i) => i !== idx),
                                                                }
                                                              : prev
                                                          )
                                                        }
                                                        className='text-red-600 hover:text-red-800'>
                                                        ลบ
                                                      </Button>
                                                    </div>
                                                    {/* แสดงวัตถุดิบของเมนูนี้ */}
                                                    {/* <div className="ml-4 text-sm text-gray-600">
                                                      <strong>วัตถุดิบ:</strong>
                                                      {Array.isArray(
                                                        item.menu_ingredients
                                                        ) &&
                                                        item.menu_ingredients
                                                        .length > 0 ? (
                                                          <ul className="list-disc ml-4">
                                                          {item.menu_ingredients.map(
                                                            (ing, ingIdx) => {
                                                              const ingredientUnit =
                                                              ingredientData?.find(
                                                                (i: {
                                                                  ingredient_name: string;
                                                                  }) =>
                                                                  i.ingredient_name ===
                                                                  ing.ingredient_name
                                                                  )
                                                                  ?.ingredient_unit ||
                                                                  "หน่วย";
                                                                  return (
                                                                    <li
                                                                    key={ingIdx}
                                                                    >
                                                                    {ing.ingredient_name ||
                                                                    "ไม่ระบุวัตถุดิบ"}{" "}
                                                                    (
                                                                      {ing.useItem ??
                                                                      0}{" "}
                                                                      {
                                                                        ingredientUnit
                                                                        }
                                                                        )
                                                                        </li>
                                                                        );
                                                                        }
                                                                        )}
                                                                        </ul>
                                                                        ) : (
                                                                          <span>
                                                                          ไม่มีวัตถุดิบ
                                                                          </span>
                                                                          )}
                                                                          </div> */}
                                                  </div>
                                                ))
                                              )}
                                            </div>

                                            {/* เพิ่มเมนูใหม่ */}
                                            <div className='space-y-2'>
                                              <h5 className='text-sm font-semibold text-gray-700'>เพิ่มเมนูใหม่</h5>
                                              <div className='flex items-center gap-2'>
                                                <Select
                                                  value={editMenuDialog?.newMenu.menu_name || ""}
                                                  onValueChange={(value) =>
                                                    setEditMenuDialog((prev) =>
                                                      prev
                                                        ? {
                                                            ...prev,
                                                            newMenu: {
                                                              ...prev.newMenu,
                                                              menu_name: value,
                                                            },
                                                          }
                                                        : prev
                                                    )
                                                  }>
                                                  <SelectTrigger className='flex-1 h-8 text-sm'>
                                                    <SelectValue placeholder='เลือกเมนู' />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {menuListData?.map((menu: { menu_name: string }) => (
                                                      <SelectItem key={menu.menu_name} value={menu.menu_name}>
                                                        {menu.menu_name}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                <Input
                                                  type='number'
                                                  value={editMenuDialog?.newMenu.menu_total || 1}
                                                  onChange={(e) =>
                                                    setEditMenuDialog((prev) =>
                                                      prev
                                                        ? {
                                                            ...prev,
                                                            newMenu: {
                                                              ...prev.newMenu,
                                                              menu_total: Number(e.target.value),
                                                            },
                                                          }
                                                        : prev
                                                    )
                                                  }
                                                  placeholder='จำนวน'
                                                  min='0'
                                                  className='w-20 h-8 text-sm'
                                                />
                                                <Button
                                                  size='sm'
                                                  onClick={() =>
                                                    editMenuDialog?.newMenu.menu_name &&
                                                    editMenuDialog?.newMenu.menu_total >= 0 &&
                                                    setEditMenuDialog((prev) => {
                                                      if (!menuListData) {
                                                        Swal.fire({
                                                          icon: "error",
                                                          title: "เกิดข้อผิดพลาด",
                                                          text: "ข้อมูลเมนูยังไม่พร้อม กรุณาลองอีกครั้ง",
                                                          showConfirmButton: false,
                                                          timer: 3000,
                                                        });
                                                        return prev;
                                                      }
                                                      const menuData = menuListData.find((m: { menu_name: string }) => m.menu_name === prev?.newMenu.menu_name);
                                                      return prev
                                                        ? {
                                                            ...prev,
                                                            menuItems: [
                                                              ...prev.menuItems,
                                                              {
                                                                menu_name: prev.newMenu.menu_name,
                                                                menu_total: prev.newMenu.menu_total,
                                                                menu_ingredients:
                                                                  menuData?.menu_ingredients?.map((ing: { useItem?: number; quantity?: number; ingredient_name?: string; name?: string }) => ({
                                                                    useItem: ing.useItem || ing.quantity || 0,
                                                                    ingredient_name: ing.ingredient_name || ing.name || "",
                                                                    ingredient_status: false,
                                                                  })) || [],
                                                              },
                                                            ],
                                                            newMenu: {
                                                              menu_name: "",
                                                              menu_total: 1,
                                                            },
                                                          }
                                                        : prev;
                                                    })
                                                  }
                                                  disabled={!editMenuDialog?.newMenu.menu_name || editMenuDialog?.newMenu.menu_total < 0 || !menuListData}
                                                  className='h-8'>
                                                  เพิ่ม
                                                </Button>
                                              </div>
                                            </div>

                                            {/* ปุ่มบันทึกและยกเลิก */}
                                            <div className='flex justify-end gap-2'>
                                              <Button
                                                onClick={() => editMenuDialog && handleEditMenu(editMenuDialog.cartId, editMenuDialog.menuItems)}
                                                disabled={isSaving !== null || editMenuDialog?.menuItems.some((m) => m.menu_total < 0)}>
                                                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                                              </Button>
                                              <Button
                                                variant='ghost'
                                                onClick={() => {
                                                  setEditMenuDialog(null);
                                                  setShouldFetchMenu(false);
                                                }}>
                                                ยกเลิก
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Accordion type='multiple' className='space-y-3'>
                                  {cart.allIngredients.map((menuGroup, groupIdx) => {
                                    const totalBox = cart.menuItems.find((me) => me.menu_name === menuGroup.menuName)?.menu_total || 0;
                                    const isEditingThisMenu = editingMenu?.cartId === cart.id && editingMenu?.menuName === menuGroup.menuName;
                                    const allIngredientsChecked = menuGroup.ingredients.every((ing) => ing.isChecked);

                                    return (
                                      <AccordionItem
                                        key={groupIdx}
                                        value={`menu-${groupIdx}`}
                                        className={`rounded-xl border border-slate-200 shadow-sm px-4 py-3 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                        <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                          <span className='truncate text-sm text-gray-700'>{menuGroup.menuName}</span>
                                          <span className='flex items-center gap-2'>
                                            {isEditingThisMenu ? (
                                              <>
                                                <input
                                                  type='number'
                                                  value={editTotalBox}
                                                  onChange={(e) => setEditTotalBox(Number(e.target.value))}
                                                  className='w-20 h-8 text-sm rounded-md border-gray-300 px-2'
                                                  min='0'
                                                  aria-label='Edit box quantity'
                                                  style={{
                                                    outline: "1px solid #ccc",
                                                  }}
                                                />
                                                <span
                                                  className='cursor-pointer text-green-600 hover:text-green-800 px-1'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveTotalBox(cart.id, menuGroup.menuName);
                                                  }}
                                                  tabIndex={0}
                                                  role='button'
                                                  aria-label='บันทึกจำนวนกล่อง'>
                                                  ✔
                                                </span>
                                                <span
                                                  className='cursor-pointer text-gray-600 hover:text-gray-800 px-1'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingMenu(null);
                                                  }}
                                                  tabIndex={0}
                                                  role='button'
                                                  aria-label='ยกเลิก'>
                                                  ✖
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <span className='text-sm font-mono text-blue-600'>(จำนวน {totalBox} กล่อง)</span>
                                                <span
                                                  className='cursor-pointer text-blue-600 hover:text-blue-800'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTotalBox(cart.id, menuGroup.menuName, totalBox);
                                                  }}
                                                  tabIndex={0}
                                                  role='button'
                                                  aria-label='แก้ไขจำนวนกล่อง'>
                                                  <Edit2 className='w-4 h-4' />
                                                </span>
                                              </>
                                            )}
                                          </span>
                                        </AccordionTrigger>
                                        <AccordionContent className='pt-3 space-y-2'>
                                          <div className='flex justify-end mb-2'>
                                            <Button onClick={() => handleEditIngredients(cart.id, menuGroup.menuName, menuGroup.ingredients)} className='flex items-center gap-2'>
                                              แก้ไขวัตถุดิบ
                                              <Edit2 className='w-4 h-4' />
                                            </Button>
                                          </div>
                                          {menuGroup.ingredients.map((ing, idx) => (
                                            <div
                                              key={idx}
                                              className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                                                ing.isChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                              } text-sm`}>
                                              <span className='text-gray-700'>{ing.ingredient_name || `Unknown ingredient`}</span>
                                              <div className='flex items-center gap-4'>
                                                <span className='text-gray-600'>
                                                  ใช้ {ing.useItem} {ing.ingredient_unit} × {totalBox} กล่อง ={" "}
                                                  <strong
                                                    className='text-black-600'
                                                    style={{
                                                      color: "#000000",
                                                    }}>
                                                    {ing.calculatedTotal}
                                                  </strong>{" "}
                                                  {ing.ingredient_unit}
                                                </span>
                                                <label className='cursor-pointer'>
                                                  <input
                                                    type='checkbox'
                                                    checked={ing.isChecked || false}
                                                    onChange={() => handleToggleIngredientCheck(cart.id, menuGroup.menuName, ing.ingredient_name)}
                                                    className='hidden'
                                                  />
                                                  <span
                                                    className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                                                      ing.isChecked ? "bg-green-500" : "bg-red-500"
                                                    }`}>
                                                    <span
                                                      className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                                        ing.isChecked ? "translate-x-5" : "translate-x-0.5"
                                                      }`}
                                                    />
                                                  </span>
                                                </label>
                                              </div>
                                            </div>
                                          ))}
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  })}
                                </Accordion>
                              </div>
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  <div className='flex justify-center m-4'>
                    <Button
                      size='sm'
                      onClick={() => handleSummaryClick(convertThaiDateToISO(orders[0].cart_delivery_date)!)}
                      className='h-9 px-4 rounded-xl border border-emerald-500 text-emerald-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md mb-4'
                      style={{ color: "#000000", background: "#fcf22d" }}>
                      📦 สรุปวัตถุดิบทั้งหมด
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Dialog open={editIngredientsMenu !== null} onOpenChange={() => setEditIngredientsMenu(null)}>
          <DialogContent className='max-w-lg max-h-[70vh] overflow-y-auto'>
            <div style={{ color: "#000000" }}>
              <div style={{ fontSize: "20px" }}>
                <DialogTitle>แก้ไขวัตถุดิบสำหรับเมนู {editIngredientsMenu?.menuName}</DialogTitle>
              </div>
              <div className='space-y-4'>
                {ingredientError ? (
                  <div className='text-red-600 text-sm'>เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ: {ingredientError.message}</div>
                ) : !ingredientData ? (
                  <div className='text-gray-500 text-sm'>กำลังโหลดข้อมูลวัตถุดิบ...</div>
                ) : (
                  <>
                    <div className='space-y-2'>
                      <h5 className='text-sm font-semibold text-gray-700'>วัตถุดิบปัจจุบัน</h5>
                      {editIngredientsMenu?.ingredients.length === 0 ? (
                        <div className='text-gray-500 text-sm'>ไม่มีวัตถุดิบในเมนูนี้</div>
                      ) : (
                        editIngredientsMenu?.ingredients.map((ingredient, idx) => (
                          <div key={idx} className='flex flex-col gap-2 border-b border-gray-200 py-2'>
                            <div className='flex items-center gap-2'>
                              <span className='flex-1 text-sm text-gray-700'>{ingredient.ingredient_name}</span>
                              <Input
                                type='number'
                                value={ingredient.useItem}
                                onChange={(e) =>
                                  setEditIngredientsMenu((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          ingredients: prev.ingredients.map((ing, i) =>
                                            i === idx
                                              ? {
                                                  ...ing,
                                                  useItem: Number(e.target.value),
                                                }
                                              : ing
                                          ),
                                        }
                                      : prev
                                  )
                                }
                                placeholder='จำนวน'
                                min='0'
                                className='w-20 h-8 text-sm'
                              />
                              <span className='text-sm'>{ingredient.ingredient_unit}</span>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  setEditIngredientsMenu((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          ingredients: prev.ingredients.filter((_, i) => i !== idx),
                                        }
                                      : prev
                                  )
                                }
                                className='text-red-600 hover:text-red-800'>
                                ลบ
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className='space-y-2'>
                      <h5 className='text-sm font-semibold text-gray-700'>เพิ่มวัตถุดิบใหม่</h5>
                      <div className='flex items-center gap-2'>
                        <Select
                          value={editIngredientsMenu?.newIngredient.ingredient_name || ""}
                          onValueChange={(value) =>
                            setEditIngredientsMenu((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    newIngredient: {
                                      ...prev.newIngredient,
                                      ingredient_name: value,
                                    },
                                  }
                                : prev
                            )
                          }>
                          <SelectTrigger className='flex-1 h-8 text-sm'>
                            <SelectValue placeholder='เลือกวัตถุดิบ' />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredientData?.map((ing: { ingredient_name: string; ingredient_unit: string }) => (
                              <SelectItem key={ing.ingredient_name} value={ing.ingredient_name}>
                                {ing.ingredient_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type='number'
                          value={editIngredientsMenu?.newIngredient.useItem || 0}
                          onChange={(e) =>
                            setEditIngredientsMenu((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    newIngredient: {
                                      ...prev.newIngredient,
                                      useItem: Number(e.target.value),
                                    },
                                  }
                                : prev
                            )
                          }
                          placeholder='จำนวน'
                          min='0'
                          className='w-20 h-8 text-sm'
                        />
                        <span className='text-sm'>
                          {editIngredientsMenu?.newIngredient.ingredient_name
                            ? ingredientData?.find((ing: { ingredient_name: string }) => ing.ingredient_name === editIngredientsMenu.newIngredient.ingredient_name)?.ingredient_unit || "ไม่ระบุหน่วย"
                            : ""}
                          {/* ^^^^ คือไร */}
                        </span>
                        <Button
                          size='sm'
                          onClick={() =>
                            setEditIngredientsMenu((prev) => {
                              if (!prev || !prev.newIngredient.ingredient_name || prev.newIngredient.useItem < 0) {
                                Swal.fire({
                                  icon: "error",
                                  title: "เกิดข้อผิดพลาด",
                                  text: "กรุณาเลือกวัตถุดิบและระบุจำนวนที่ถูกต้อง",
                                  showConfirmButton: false,
                                  timer: 3000,
                                });
                                return prev;
                              }
                              const selectedIngredient = ingredientData?.find((ing: { ingredient_name: string }) => ing.ingredient_name === prev.newIngredient.ingredient_name);
                              return {
                                ...prev,
                                ingredients: [
                                  ...prev.ingredients,
                                  {
                                    ingredient_name: prev.newIngredient.ingredient_name,
                                    useItem: prev.newIngredient.useItem,
                                    ingredient_status: false,
                                    ingredient_unit: selectedIngredient?.ingredient_unit || "ไม่ระบุหน่วย",
                                  },
                                ],
                                newIngredient: {
                                  ingredient_name: "",
                                  useItem: 0,
                                },
                              };
                            })
                          }
                          disabled={!editIngredientsMenu?.newIngredient.ingredient_name || editIngredientsMenu?.newIngredient.useItem < 0 || !ingredientData}
                          className='h-8'>
                          เพิ่ม
                        </Button>
                      </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                      <Button onClick={() => editIngredientsMenu && handleSaveIngredients(editIngredientsMenu.cartId, editIngredientsMenu.menuName)} disabled={isSaving !== null}>
                        {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                      </Button>
                      <Button variant='ghost' onClick={() => setEditIngredientsMenu(null)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <DialogContent className='max-w-md max-h-[70vh] overflow-y-auto'>
            <div>
              <DialogTitle className='text-lg font-bold'>
                {summaryDialogType === "order" && selectedCartForSummary && (
                  <div style={{ color: "#000000" }} className='mb-4'>
                    สรุปวัตถุดิบของออเดอร์ {selectedCartForSummary.orderNumber} <br />
                    (วันที่ส่ง: {selectedCartForSummary.cart_delivery_date})
                  </div>
                )}
                {summaryDialogType === "date" && selectedDateForSummary && (
                  <div style={{ color: "#000000" }} className='mb-4'>
                    สรุปวัตถุดิบทั้งหมดของวันที่{" "}
                    {new Date(selectedDateForSummary).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </DialogTitle>
              <div className='space-y-4'>
                {summaryDialogType === "order" &&
                  selectedCartForSummary &&
                  (() => {
                    const { summary, allIngredientsChecked } = summarizeOrderIngredients(selectedCartForSummary);
                    return (
                      <>
                        <div className='space-y-2'>
                          <h5 className='text-sm font-semibold text-gray-700'>สรุปวัตถุดิบของออเดอร์</h5>
                          {summary.map((ing, idx) => (
                            <div key={idx} className='flex justify-between items-center text-sm border-b border-gray-200 py-2'>
                              <span className='text-gray-700'>{ing.name}</span>
                              <span className='text-gray-600'>
                                {ing.checked}/{ing.total} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ color: "#000000", background: "#5cfa6c" }}>
                          <Button
                            onClick={() => handleCheckAllIngredients(selectedCartForSummary.id)}
                            className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg'
                            disabled={isSaving === selectedCartForSummary.id || allIngredientsChecked}>
                            {isSaving === selectedCartForSummary.id ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
                          </Button>
                        </div>
                      </>
                    );
                  })()}

                {summaryDialogType === "date" &&
                  selectedDateForSummary &&
                  (() => {
                    const { summary, allIngredientsChecked } = summarizeIngredients(selectedDateForSummary);
                    return (
                      <>
                        <div className='space-y-2'>
                          <h5 className='text-sm font-semibold text-gray-700'>สรุปวัตถุดิบรวม</h5>
                          {summary.map((ing, idx) => (
                            <div key={idx} className='flex justify-between items-center text-sm border-b border-gray-200 py-2'>
                              <span className='text-gray-700'>{ing.name}</span>
                              <span className='text-gray-600'>
                                {ing.checked}/{ing.total} กรัม
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ color: "#000000", background: "#5cfa6c" }}>
                          <Button
                            onClick={() => handleCheckAllIngredientsForDate(selectedDateForSummary)}
                            className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg'
                            disabled={isSaving === "all" || allIngredientsChecked}>
                            {isSaving === "all" ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {totalPages > 1 && <PaginationComponent totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      </div>
    </div>
  );
};

export default SummaryList;
