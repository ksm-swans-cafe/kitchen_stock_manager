"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import { Clock, User, Package, FileText, Search, CalendarDays, Filter, Smartphone, Wallet, Map as MapIcon, Download, Users, Edit2, Container } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate, EventInput } from "@fullcalendar/core";

import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/share/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Input } from "@/share/ui/input";

import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import PaginationComponent from "@/components/ui/Totalpage";
import ResponsiveOrderId from "@/app/components/ResponsiveOrderId";
import StatusDropdown from "@/app/components/StatusOrderhistory";

import { Ingredient, MenuItem, Cart, CartItem, RawCart } from "@/types/interface_summary_orderhistory";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  return res.json();
};

const OrderHistory = () => {
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedDateForSummary, setSelectedDateForSummary] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTimes, setEditingTimes] = useState<{
    cartId: string;
    exportTime: string;
    receiveTime: string;
  } | null>(null);

  const { data: cartsData, error: cartsError, mutate: mutateCarts } = useSWR("/api/get/carts", fetcher, { refreshInterval: 30000 });
  const { data: menuData, error: menuError } = useSWR("/api/get/menu/list", fetcher);
  const { data: ingredientData, error: ingredientError } = useSWR("/api/get/ingredients", fetcher, { refreshInterval: 30000 });

  const combinedError = cartsError || menuError || ingredientError;
  const isLoading = !cartsData || !menuData || !ingredientData;

  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);

  const safeParseJSON = (jsonString: string): CartItem[] => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return [];
    }
  };

  useEffect(() => {
    if (!cartsData || !ingredientData) return;

    const formatOrders = async () => {
      try {
        const ingredientUnitMap = new Map<string, string>();
        ingredientData.forEach((ing: any) => {
          ingredientUnitMap.set(ing.ingredient_name.toString(), ing.ingredient_unit);
        });

        const formattedOrders: Cart[] = cartsData.map((cart: RawCart) => {
          if (!cart.cart_create_date) {
            console.warn(`Cart ${cart.cart_id} has no cart_create_date`);
            
            // Parse cart_lunchbox for fallback case
            let cartLunchboxFallback: any[] = [];
            if (cart.cart_lunchbox) {
              if (typeof cart.cart_lunchbox === "string") {
                try {
                  cartLunchboxFallback = JSON.parse(cart.cart_lunchbox);
                } catch (e) {
                  console.error("Failed to parse cart_lunchbox:", e);
                  cartLunchboxFallback = [];
                }
              } else if (Array.isArray(cart.cart_lunchbox)) {
                cartLunchboxFallback = cart.cart_lunchbox;
              }
            }
            
            return {
              id: cart.cart_id || "no-id",
              orderNumber: `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`,
              name: "ไม่มีข้อมูลวันที่",
              date: "ไม่ระบุ",
              dateISO: "",
              time: "ไม่ระบุ",
              sets: 0,
              price: cart.cart_total_price || 0,
              status: cart.cart_status,
              createdBy: cart.cart_username || "ไม่ทราบผู้สร้าง",
              menuItems: [],
              allIngredients: [],
              order_number: cart.cart_order_number,
              cart_delivery_date: cart.cart_delivery_date,
              cart_receive_time: cart.cart_receive_time,
              cart_export_time: cart.cart_export_time,
              cart_customer_tel: cart.cart_customer_tel,
              cart_customer_name: cart.cart_customer_name,
              cart_location_send: cart.cart_location_send,
              cart_shipping_cost: cart.cart_shipping_cost,
              cart_lunchbox: cartLunchboxFallback,
            };
          }

          // แก้ไขการแยกวันที่และเวลา - ใช้ space แทน T
          const [rawDate, timePart] = cart.cart_create_date.split(" ");
          const [year, month, day] = rawDate.split("-");
          const dateObjectForLocale = new Date(Number(year), Number(month) - 1, Number(day));
          const formattedDate = dateObjectForLocale
            .toLocaleDateString("th-TH", {day: "numeric",month: "short",year: "numeric",})
            .replace(/ /g, " ");
          const date = new Date(cart.cart_create_date);
          const formattedDateISO = date.toISOString().split("T")[0];

          // แก้ไขการแยกเวลา - ใช้ space และตัดส่วน timezone
          const timeOnly = timePart ? timePart.split("+")[0] : "";
          const formattedTime = timeOnly ? timeOnly.slice(0, 5) : "ไม่ระบุ";

          const menuItems: MenuItem[] = typeof cart.cart_menu_items === "string" && cart.cart_menu_items ? safeParseJSON(cart.cart_menu_items) : Array.isArray(cart.cart_menu_items) ? cart.cart_menu_items.filter((item) => item && typeof item.menu_total === "number") : [];

          const totalSets = menuItems.filter((item) => item && typeof item === "object" && typeof item.menu_total === "number").reduce((sum, item) => sum + (item.menu_total || 0), 0);

          const menuDisplayName = menuItems.length > 0 ? menuItems.map((item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`).join(" + ") : "ไม่มีชื่อเมนู";

          const allIngredients = menuItems.map((menu) => ({
            menuName: menu.menu_name,
            ingredients: menu.menu_ingredients.map((dbIng: Ingredient) => ({
              ...dbIng,
              ingredient_id: dbIng.ingredient_id || undefined,
              ingredient_name: dbIng.ingredient_name || "ไม่พบวัตถุดิบ",
              calculatedTotal: dbIng.useItem * (menu.menu_total || 0),
              sourceMenu: menu.menu_name,
              isChecked: dbIng.ingredient_status ?? false,
              ingredient_status: dbIng.ingredient_status ?? false,
              ingredient_unit: ingredientUnitMap.get(dbIng.ingredient_name?.toString() || "") || "ไม่ระบุหน่วย",
            })),
            ingredient_status: menu.menu_ingredients.every((ing: Ingredient) => ing.ingredient_status ?? false),
          }));

          const orderNumber = `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;
          
          // Parse cart_lunchbox if it's a string
          let cartLunchbox: any[] = [];
          if (cart.cart_lunchbox) {
            if (typeof cart.cart_lunchbox === "string") {
              try {
                cartLunchbox = JSON.parse(cart.cart_lunchbox);
              } catch (e) {
                console.error("Failed to parse cart_lunchbox:", e);
                cartLunchbox = [];
              }
            } else if (Array.isArray(cart.cart_lunchbox)) {
              cartLunchbox = cart.cart_lunchbox;
            }
          }
          
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
              menu_description: item.menu_description || undefined,
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
            cart_lunchbox: cartLunchbox,
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
        setError(err instanceof Error ? `ไม่สามารถจัดรูปแบบออร์เดอร์: ${err.message}` : "เกิดข้อผิดพลาดในการจัดรูปแบบออร์เดอร์");
      }
    };

    formatOrders();
  }, [cartsData, ingredientData]);
  useEffect(() => {
    if (!cartsData) return;

    const groupedByDate: { [date: string]: RawCart[] } = {};
    const allowedStatuses = ["success", "cancelled"];

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

  const convertThaiDateToISO = (thaiDate: string | undefined): string | null => {
    if (!thaiDate) return null;
    const [day, month, year] = thaiDate.split("/");
    const buddhistYear = parseInt(year, 10);
    const christianYear = buddhistYear - 543;
    return `${christianYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleDatePicker = (action: string) => {
    if (action === "open") return setIsDatePickerOpen(true);
    else if (action === "close") return setIsDatePickerOpen(false);
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
      setError(`ไม่มีออร์เดอร์สำหรับวันที่ ${formatDate(new Date(selectedDateStr), {year: "numeric",month: "short",day: "numeric",locale: "th",timeZone: "Asia/Bangkok",})}`);
    } else {
      setError(null);
    }
  };

  const handleEditTotalBox = (cartId: string, menuName: string, currentTotal: number) => {
    setEditingMenu({ cartId, menuName });
    setEditTotalBox(currentTotal);
  };

  const handleSaveTotalBox = async (cartId: string, menuName: string) => {
    if (editTotalBox < 0) {
      setError("จำนวนกล่องต้องไม่น้อยกว่า 0");
      return;
    }
    if (!menuName) {
      setError("ชื่อเมนูไม่ถูกต้อง");
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
                    ? {...group,ingredients: group.ingredients.map((ing) => ({...ing,calculatedTotal: ing.useItem * editTotalBox,})),}: group),sets: cart.menuItems.reduce((sum, item) => sum + (item.menu_name === cleanedMenuName ? editTotalBox : item.menu_total), 0),}: cart));
      Swal.fire({icon: "success",title: "อัปเดตจำนวนกล่องเรียบร้อย!",text: `เมนู: ${cleanedMenuName}, จำนวนกล่อง: ${editTotalBox}`, showConfirmButton: false,timer: 3000,});
      mutateCarts();
      setEditingMenu(null);
    } catch (err) {
      console.error("Error updating total box:", err);
      setError(err instanceof Error ? `ไม่สามารถอัปเดตจำนวนกล่อง: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตจำนวนกล่อง");
    } finally {
      setIsSaving(null);
    }
  };

  const handleEditTimes = (cartId: string, exportTime: string, receiveTime: string) => {
    const formatToThaiTime = (time: string) => (time ? time.replace(":", ".") + " น." : "00.00 น.");
    setEditingTimes({cartId, exportTime: formatToThaiTime(exportTime),receiveTime: formatToThaiTime(receiveTime),});};

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

  const formatToHHMM = (time: string | undefined): string | undefined => {
    if (!time) return undefined;
    const cleaned = time.replace(/\s*น\.?$/, "").replace(".", ":");
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(cleaned) ? cleaned : undefined;
  };

  const handleSaveTimes = async (cartId: string) => {
    if (!editingTimes) {
      setError("ไม่พบข้อมูลเวลาที่กำลังแก้ไข");
      return;
    }

    const parseThaiTime = (thaiTime: string): string | null => {
      const regex = /^([0-1]?[0-9]|2[0-3])\.[0-5][0-9](\s*น\.?)?$/;
      if (!regex.test(thaiTime)) return null;
      return thaiTime.replace(/\s*น\.?$/, "").replace(".", ":");
    };

    const exportTime = parseThaiTime(editingTimes.exportTime);
    const receiveTime = parseThaiTime(editingTimes.receiveTime);

    if (!exportTime || !receiveTime) {
      setError("เวลาส่งหรือรับอาหารต้องอยู่ในรูปแบบ HH.mm หรือ HH.mm น. (เช่น 14.00 หรือ 14.00 น.)");
      return;
    }

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
      Swal.fire({icon: "success",title: "อัปเดตเวลาเรียบร้อย!",text: `เวลาส่ง: ${exportTime}, เวลารับ: ${receiveTime}`,showConfirmButton: false,timer: 3000,});
    } catch (err) {
      console.error("Error updating times:", err);
      setError(err instanceof Error ? `ไม่สามารถอัปเดตเวลา: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตเวลา");
    } finally {
      setIsSaving(null);
    }
  };

  const handleCheckAllIngredientsForDate = async (date: string) => {
    const previousCarts = [...carts];
    setIsSaving("all");

    const targetCarts = carts.filter((cart) => convertThaiDateToISO(cart.cart_delivery_date) === date);

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
      setIsSummaryModalOpen(false);
    } catch (err) {
      console.error("Error updating all ingredients for date:", err);
      setError(err instanceof Error ? `ไม่สามารถอัปเดตสถานะวัตถุดิบทั้งหมดสำหรับวันที่: ${err.message}` : "เกิดข้อผิดพลาดในการอัปเดตสถานะวัตถุดิบทั้งหมดสำหรับวันที่");
      setCarts(previousCarts);
    } finally {
      setIsSaving(null);
    }
  };

  const handleSummaryClick = (date: string) => {
    setSelectedDateForSummary(date);
    setIsSummaryModalOpen(true);
  };

  const getStatusText = (status: string) => {
    switch (status) {
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
    let filtered = [...carts].filter((cart) => cart.status === "success" || cart.status === "cancelled");

    if (selectedDate) {
      const selectedDateISO = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((order) => convertThaiDateToISO(order.cart_delivery_date) === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => [order.name, order.id, order.createdBy, order.cart_customer_tel, order.cart_customer_name, order.order_number, order.cart_location_send].some((field) => (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())));
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

    Object.values(groupedByDate).forEach((orders) => {
      orders.sort((a, b) => { const orderNumA = parseInt(a.order_number || "0");  const orderNumB = parseInt(b.order_number || "0");  return orderNumA - orderNumB; }); });

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
            .toLocaleDateString("th-TH", {  day: "numeric", month: "short",  year: "numeric",  })  .replace(/ /g, " "): "ไม่มีวันที่จัดส่ง";(acc[dateDisplay] = acc[dateDisplay] || []).push(cart);return acc;}, {} as { [key: string]: Cart[] });
    const currentDate = new Date();
    const currentDateDisplay = currentDate
      .toLocaleDateString("th-TH", {  day: "numeric",  month: "short",  year: "numeric",}).replace(/ /g, " ");

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
      [key: string]: { checked: number; total: number; unit: string };
    } = {};

    const ordersOnDate = filteredAndSortedOrders.filter((cart) => convertThaiDateToISO(cart.cart_delivery_date) === date);

    ordersOnDate.forEach((cart) => {
      cart.allIngredients.forEach((menuGroup) => {
        menuGroup.ingredients.forEach((ing) => {
          if (!ingredientSummary[ing.ingredient_name]) {
            ingredientSummary[ing.ingredient_name] = {  checked: 0,  total: 0,  unit: ing.ingredient_unit || "ไม่ระบุหน่วย",  };}
          const totalGrams = ing.calculatedTotal || 0;
          ingredientSummary[ing.ingredient_name].total += totalGrams;
          if (ing.isChecked) {
            ingredientSummary[ing.ingredient_name].checked += totalGrams;
          }});});});

    const allIngredientsChecked = ordersOnDate.every((cart) => cart.allIngredients.every((menuGroup) => menuGroup.ingredients.every((ing) => ing.isChecked)));

    return {
      summary: Object.entries(ingredientSummary).map(([name, { checked, total, unit }]) => ({name,checked,total,unit,})),allIngredientsChecked,};};

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
  const paginatedGroupedOrders = groupedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ["เลขที่ออร์เดอร์", "ชื่อเมนู", "คำอธิบายเมนู", "วันที่", "เวลา", "จำนวน Set", "ราคา", "สถานะ", "ผู้สร้าง"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedOrders.map((cart) => {
        const menuDescriptions = cart.menuItems.map((item) => item.menu_description || "").join("; ");
        return [
          cart.id,
          `"${cart.name.replace(/"/g, '""')}"`, // ป้องกัน comma ในชื่อเมนู
          `"${menuDescriptions.replace(/"/g, '""')}"`, // ป้องกัน comma ในคำอธิบายเมนู
          cart.date,
          cart.time,
          cart.sets,
          cart.price,
          getStatusText(cart.status),
          cart.createdBy,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "order_history.csv";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  // ...existing code...

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Order History", 14, 20);

    const tableColumn = ["Order ID", "Menu", "Menu Description", "Date", "Time", "Sets", "Price", "Status", "Created By"];
    const tableRows = filteredAndSortedOrders.map((cart) => {
      const menuDescriptions = cart.menuItems.map((item) => item.menu_description || "").join("; ");
      return [cart.id, cart.name, menuDescriptions, cart.date, cart.time, cart.sets, cart.price, getStatusText(cart.status), cart.createdBy];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { font: "helvetica", fontSize: 10 },
    });

    doc.save("order_history.pdf");
  };

  const handleUpdateWithCheck = (cart: { id: string; allIngredients: any[] }) => {
    const allIngredientsChecked = cart.allIngredients.every((menuGroup) => menuGroup.ingredients.every((ing: any) => ing.isChecked));

    if (!allIngredientsChecked) {
      Swal.fire({
        icon: "success",
        title: "เปลี่ยนสถานะสำเร็จ",
        text: "ระบบได้เปลี่ยนสถานะเรียบร้อย",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    mutateCarts();
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-2'>สรุปรายการ</h2>
        <p className='text-slate-600 mb-4'>จัดการและติดตามประวัติการสั่งซื้อทั้งหมด</p>

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>{error}</div>}

        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6'>
          <div className='col-span-full xl:col-span-2'>
            <div className='relative'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none' />
              <Input placeholder='ค้นหาชื่อ, รหัสคำสั่ง, สถานที่ส่ง...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pr-10 h-10 bg-white border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 rounded-xl shadow-sm:text-sm'
              />
            </div>
          </div>

          <div>
            <Button onClick={() => handleDatePicker("open")} className='w-full h-10 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center px-3 text-sm text-slate-600'>
              {selectedDate
                ? `วันที่ ${formatDate(selectedDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    locale: "th",
                    timeZone: "Asia/Bangkok",})}`: "เลือกวันที่ที่ต้องการ"}
            </Button>

            <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <DialogContent className='max-w-4xl'>
                <DialogTitle className='sr-only'>เลือกวันที่จัดส่ง</DialogTitle>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView='dayGridMonth'
                  timeZone='Asia/Bangkok'
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  height='auto'
                  contentHeight='auto'
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
                  footerToolbar={{
                    start: "",
                    center: "",
                    end: "custom1",
                  }}
                  customButtons={{
                    custom1: {
                      text: "ล้างวันที่",
                      click: function () {
                        setSelectedDate(null);
                        setCarts(allCarts);
                        handleDatePicker("close");
                      },
                    },
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Select value={sortOrder} onValueChange={(val: "asc" | "desc") => setSortOrder(val)}>
              <SelectTrigger className='w-full h-10 rounded-lg border-slate-300 shadow-sm  '>
                <Filter className='w-4 h-4 mr-2 text-slate-500' />
                <SelectValue placeholder='Order' className='' />
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
                <SelectItem value='เสร็จสิ้น'>เสร็จสิ้น</SelectItem>
                <SelectItem value='ยกเลิก'>ยกเลิก</SelectItem>
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
          <div className='flex flex-center justify-self-end text-red-400'>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSortOrder("asc");
                setSelectedDate(null);
                setFilterCreator("ทั้งหมด");
                setFilterStatus("ทั้งหมด");
                setCarts(allCarts);
              }}
              className='h-12 w-35 text-sm'>
              [ X ] ล้างฟิลเตอร์
            </Button>
          </div>
          <div className='flex flex-center'>
            <Button onClick={handleExportCSV} className='h-12 w-full flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2 text-gray-400' /> CSV
            </Button>
            <Button onClick={handleExportPDF} className='h-12 w-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2 text-gray-400' /> PDF
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
          ) : combinedError ? (
            <Card>
              <CardContent className='text-center py-12'>
                <span className='text-red-500'>เกิดข้อผิดพลาด: {combinedError.message}</span>
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
                                    <Input
                                      type='text'
                                      value={editingTimes?.exportTime || ""}
                                      onChange={(e) => {
                                        const formattedValue = formatInputTime(e.target.value);
                                        setEditingTimes((prev) => prev? {...prev,exportTime: formattedValue,}: prev);}}
                                      placeholder='14.00'
                                      className='w-24 h-8 text-sm rounded-md border-gray-300'
                                      aria-label='Edit export time'
                                      required
                                    />
                                    <FaWallet className='w-4 h-4' />
                                    <span>เวลารับอาหาร</span>
                                    <Input
                                      type='text'
                                      value={editingTimes?.receiveTime || ""}
                                      onChange={(e) => {
                                        const formattedValue = formatInputTime(e.target.value);
                                        setEditingTimes((prev) => prev? {...prev,receiveTime: formattedValue,}: prev);}}
                                      placeholder='19.00'
                                      className='w-24 h-8 text-sm rounded-md border-gray-300'
                                      aria-label='Edit receive time'
                                      required
                                    />
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
                                  <Container className='w-4 h-4 text-blue-500' />
                                  <span className='font-medium'>ค่าจัดส่ง {Number(cart.cart_shipping_cost || 0).toLocaleString("th-TH")} บาท</span>
                                </div>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:justify-between font-normal sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-1 text-sm sm:text-base'>
                                  <MapIcon className='w-4 h-4 text-red-600' />
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
                              </div>
                              <div className='hidden flex items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] sm:text-xs text-gray-500'>
                                <ResponsiveOrderId id={cart.id} maxFontSize={10} minFontSize={10} />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className='flex justify-center mt-2'>
                            <StatusDropdown cartId={cart.id} allIngredients={cart.allIngredients} defaultStatus={cart.status} cart_receive_time={formatToHHMM(cart.cart_receive_time)} cart_export_time={formatToHHMM(cart.cart_export_time)} cart={cart} onUpdated={() => handleUpdateWithCheck(cart)} />
                          </div>
                          <AccordionContent className='mt-4'>
                            <div className='grid md:grid-cols-2 gap-6'>
                              <div>
                                <h4 className='text-sm font-bold mb-2 text-emerald-700 flex items-center gap-2'>
                                  <User className='w-4 h-4' /> เมนูที่สั่ง
                                </h4>
                                <Accordion type='multiple' className='space-y-3'>
                                  {cart.cart_lunchbox && cart.cart_lunchbox.length > 0 ? (
                                    cart.cart_lunchbox.map((lunchbox: any, lunchboxIdx: number) => (
                                      <AccordionItem 
                                        key={lunchboxIdx} 
                                        value={`lunchbox-${lunchboxIdx}`} 
                                        className="rounded-xl border border-blue-200 shadow-sm px-4 py-3 bg-blue-50"
                                      >
                                        <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                          <div className='flex flex-col items-start flex-1'>
                                            <span className='truncate text-sm text-blue-800 font-bold'>
                                              📦 {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set_name}
                                            </span>
                                            <div className='grid grid-cols-3 gap-2 mt-2 w-full'>
                                              <div className='text-xs text-blue-700'>
                                                <span className='font-medium'>จำนวน:</span> {lunchbox.lunchbox_total} กล่อง
                                              </div>
                                              <div className='text-xs text-blue-700'>
                                                <span className='font-medium'>ราคา:</span> {lunchbox.lunchbox_total_cost} บาท
                                              </div>
                                              <div className='text-xs text-blue-700'>
                                                <span className='font-medium'>จำกัด:</span> {lunchbox.lunchbox_limit} กล่อง
                                              </div>
                                            </div>
                                          </div>
                                        </AccordionTrigger>
                                        
                                        <AccordionContent className='pt-3 space-y-2'>
                                          <h5 className='font-medium text-blue-800 mb-2 text-xs'>เมนูในกล่อง:</h5>
                                          {lunchbox.lunchbox_menu.map((menu: any, menuIdx: number) => {
                                            const allIngredientsChecked = menu.menu_ingredients?.every((ing: any) => ing.ingredient_status) ?? false;
                                            
                                            return (
                                              <div 
                                                key={menuIdx} 
                                                className={`rounded-lg border p-3 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                                              >
                                                <div className='mb-2'>
                                                  <div className='font-medium text-gray-800 text-sm'>
                                                    {menu.menu_name} {menu.menu_subname && `(${menu.menu_subname})`}
                                                  </div>
                                                  <div className='text-xs text-gray-600 mt-1'>
                                                    หมวดหมู่: {menu.menu_category} | จำนวน: {menu.menu_total} กล่อง
                                                  </div>
                                                  {menu.menu_description && (
                                                    <div className='text-xs text-gray-500 mt-1'>
                                                      {menu.menu_description}
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                <div className='space-y-1 mt-2'>
                                                  <h6 className='text-xs font-medium text-gray-700 mb-1'>วัตถุดิบ:</h6>
                                                  {menu.menu_ingredients?.map((ing: any, idx: number) => (
                                                    <div 
                                                      key={idx} 
                                                      className='flex items-center justify-between text-xs text-gray-600 py-1'
                                                    >
                                                      <span>• {ing.ingredient_name}</span>
                                                      <div style={{ color: "#000000" }} className='flex items-center gap-2'>
                                                        <span>
                                                          {ing.useItem} หน่วย × {menu.menu_total} กล่อง = <strong style={{ color: "#000000" }}>{ing.useItem * menu.menu_total}</strong> หน่วย
                                                        </span>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))
                                  ) : (
                                    // Fallback to old structure if cart_lunchbox is not available
                                    cart.allIngredients.map((menuGroup, groupIdx) => {
                                      const totalBox = cart.menuItems.find((item) => item.menu_name === menuGroup.menuName)?.menu_total || 0;
                                      const allIngredientsChecked = menuGroup.ingredients.every((ing) => ing.isChecked);

                                      return (
                                        <AccordionItem key={groupIdx} value={`menu-${groupIdx}`} className={`rounded-xl border border-slate-200 shadow-sm px-4 py-3 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                          <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                            <div className='flex flex-col items-start'>
                                              <span className='truncate text-sm text-gray-700 font-medium'>{menuGroup.menuName}</span>
                                              {(() => {
                                                const menuItem = cart.menuItems.find((me) => me.menu_name === menuGroup.menuName);
                                                return menuItem?.menu_description ? <span className='truncate text-xs text-gray-500 mt-1'>{menuItem.menu_description}</span> : null;
                                              })()}
                                            </div>
                                            <span className='text-sm font-mono text-blue-600'>(จำนวน {totalBox} กล่อง)</span>
                                          </AccordionTrigger>
                                          <AccordionContent className='pt-3 space-y-2'>
                                            {menuGroup.ingredients.map((ing, idx) => (
                                              <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.isChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} text-sm`}>
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
                                                </div>
                                              </div>
                                            ))}
                                          </AccordionContent>
                                        </AccordionItem>
                                      );
                                    })
                                  )}
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

        <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
          <DialogContent className='max-w-md'>
            <DialogTitle className='text-lg font-bold'>
              <div style={{ color: "#000000" }} className='mb-4'>
                สรุปวัตถุดิบทั้งหมดของวันที่{" "}
                {selectedDateForSummary &&
                  new Date(selectedDateForSummary).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
              </div>
              {selectedDateForSummary &&
                (() => {
                  const { summary, allIngredientsChecked } = summarizeIngredients(selectedDateForSummary);
                  return (
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <h5 className='text-sm font-semibold text-gray-700'>สรุปวัตถุดิบรวม</h5>
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
                        <Button onClick={() => handleCheckAllIngredientsForDate(selectedDateForSummary)} className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg' disabled={isSaving === "all" || allIngredientsChecked}>
                          {isSaving === "all" ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
            </DialogTitle>
          </DialogContent>
        </Dialog>

        {totalPages > 1 && <PaginationComponent totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      </div>
    </div>
  );
};

export default OrderHistory;
