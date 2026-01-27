"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import { Clock, User, Package, FileText, Search, CalendarDays, Filter, Smartphone, Wallet, Map as MapIcon, Download, Users, Edit2, Container } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { api } from "@/lib/api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate, EventInput } from "@fullcalendar/core";

import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/share/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Input } from "@/share/ui/input";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PaginationComponent from "@/components/ui/Totalpage";
import ResponsiveOrderId from "@/components/summary&history/ResponsiveOrderId";
import StatusDropdown from "@/components/summary&history/StatusOrderhistory";
import { Loading } from "@/components/loading/loading";

import HistoryIcon from "@/assets/history.png";

import { fetcher } from "@/lib/utils";

import { Ingredient, MenuItem, Cart, CartItem, RawCart } from "@/types/interface_summary_orderhistory";

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
  const [isExcelMonthDialogOpen, setIsExcelMonthDialogOpen] = useState(false);
  const [selectedMonthForExcel, setSelectedMonthForExcel] = useState<string>("");

  const { data: cartsData, error: cartsError, mutate: mutateCarts } = useSWR("/api/cart/lists?page=orderhistory", fetcher, { refreshInterval: 30000 });
  const { data: menuData, error: menuError } = useSWR("/api/menu/lists", fetcher);
  const { data: ingredientData, error: ingredientError } = useSWR("/api/ingredient/lists", fetcher, { refreshInterval: 30000 });

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
          if (!cart.create_date) {
            console.warn(`Cart ${cart.id} has no create_date`);

            // Parse lunchbox for fallback case
            let cartLunchboxFallback: any[] = [];
            if (cart.lunchbox) {
              if (typeof cart.lunchbox === "string") {
                try {
                  cartLunchboxFallback = JSON.parse(cart.lunchbox);
                } catch (e) {
                  console.error("Failed to parse lunchbox:", e);
                  cartLunchboxFallback = [];
                }
              } else if (Array.isArray(cart.lunchbox)) {
                cartLunchboxFallback = cart.lunchbox;
              }
            }

            // คำนวณจำนวนกล่องทั้งหมดจาก lunchbox (รวม lunchbox_total)
            const totalBoxesFromLunchboxFallback = cartLunchboxFallback.reduce((sum: number, lunchbox: any) => {
              return sum + (Number(lunchbox.lunchbox_total) || 0);
            }, 0);

            // ใช้ total_cost_lunchbox สำหรับราคารวม (แปลงจาก string เป็น number)
            // ถ้าไม่มี total_cost_lunchbox ให้คำนวณจาก lunchbox แทน
            let totalPriceFallback = 0;
            if (cart.total_cost_lunchbox && cart.total_cost_lunchbox.trim() !== "") {
              totalPriceFallback = Number(cart.total_cost_lunchbox.replace(/[^\d.-]/g, "")) || 0;
            } else if (cartLunchboxFallback && cartLunchboxFallback.length > 0) {
              // คำนวณราคารวมจาก lunchbox
              totalPriceFallback = cartLunchboxFallback.reduce((sum: number, lunchbox: any) => {
                return sum + (Number(lunchbox.lunchbox_total_cost) || 0);
              }, 0);
            }

            return {
              id: cart.id || "no-id",
              orderNumber: `ORD${cart.id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`,
              name: "ไม่มีข้อมูลวันที่",
              date: "ไม่ระบุ",
              dateISO: "",
              time: "ไม่ระบุ",
              sets: totalBoxesFromLunchboxFallback,
              price: totalPriceFallback,
              status: cart.status,
              createdBy: cart.username || "ไม่ทราบผู้สร้าง",
              menuItems: [],
              allIngredients: [],
              order_number: cart.order_number,
              delivery_date: cart.delivery_date,
              receive_time: cart.receive_time,
              export_time: cart.export_time,
              customer_tel: cart.customer_tel,
              customer_name: cart.customer_name,
              location_send: cart.location_send,
              shipping_cost: cart.shipping_cost,
              invoice_tex: cart.invoice_tex,
              lunchbox: cartLunchboxFallback,
            };
          }

          // แก้ไขการแยกวันที่และเวลา - ใช้ space แทน T
          const [rawDate, timePart] = cart.create_date.split(" ");
          const [year, month, day] = rawDate.split("-");
          const dateObjectForLocale = new Date(Number(year), Number(month) - 1, Number(day));
          const formattedDate = dateObjectForLocale.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, " ");
          const date = new Date(cart.create_date);
          const formattedDateISO = date.toISOString().split("T")[0];

          // แก้ไขการแยกเวลา - ใช้ space และตัดส่วน timezone
          const timeOnly = timePart ? timePart.split("+")[0] : "";
          const formattedTime = timeOnly ? timeOnly.slice(0, 5) : "ไม่ระบุ";

          const menuItems: MenuItem[] = typeof cart.menu_items === "string" && cart.menu_items ? safeParseJSON(cart.menu_items) : Array.isArray(cart.menu_items) ? cart.menu_items.filter((item) => item && typeof item.menu_total === "number") : [];

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

          const orderNumber = `ORD${cart.id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;

          // Parse lunchbox if it's a string
          let cartLunchbox: any[] = [];
          if (cart.lunchbox) {
            if (typeof cart.lunchbox === "string") {
              try {
                cartLunchbox = JSON.parse(cart.lunchbox);
              } catch (e) {
                console.error("Failed to parse lunchbox:", e);
                cartLunchbox = [];
              }
            } else if (Array.isArray(cart.lunchbox)) {
              cartLunchbox = cart.lunchbox;
            }
          }

          // คำนวณจำนวนกล่องทั้งหมดจาก lunchbox (รวม lunchbox_total)
          const totalBoxesFromLunchbox = cartLunchbox.reduce((sum: number, lunchbox: any) => {
            return sum + (Number(lunchbox.lunchbox_total) || 0);
          }, 0);
          
          // ใช้ totalBoxesFromLunchbox ถ้ามีข้อมูลจาก lunchbox มิฉะนั้นใช้ totalSets (fallback)
          const finalSets = totalBoxesFromLunchbox > 0 ? totalBoxesFromLunchbox : totalSets;

          // ใช้ total_cost_lunchbox สำหรับราคารวม (แปลงจาก string เป็น number)
          // ถ้าไม่มี total_cost_lunchbox ให้คำนวณจาก lunchbox แทน
          let totalPrice = 0;
          if (cart.total_cost_lunchbox && cart.total_cost_lunchbox.trim() !== "") {
            totalPrice = Number(cart.total_cost_lunchbox.replace(/[^\d.-]/g, "")) || 0;
          } else if (cartLunchbox && cartLunchbox.length > 0) {
            // คำนวณราคารวมจาก lunchbox
            totalPrice = cartLunchbox.reduce((sum: number, lunchbox: any) => {
              return sum + (Number(lunchbox.lunchbox_total_cost) || 0);
            }, 0);
          }

          return {
            id: cart.id || "no-id",
            orderNumber,
            name: menuDisplayName,
            date: formattedDate,
            dateISO: formattedDateISO,
            time: formattedTime,
            sets: finalSets,
            price: totalPrice,
            status: cart.status,
            createdBy: cart.username || "ไม่ทราบผู้สร้าง",
            menuItems: menuItems.map((item) => ({
              ...item,
              menu_description: item.menu_description || undefined,
            })),
            allIngredients,
            order_number: cart.order_number,
            delivery_date: cart.delivery_date,
            receive_time: cart.receive_time,
            export_time: cart.export_time,
            customer_tel: cart.customer_tel,
            customer_name: cart.customer_name,
            location_send: cart.location_send,
            shipping_cost: cart.shipping_cost,
            invoice_tex: cart.invoice_tex,
            lunchbox: cartLunchbox,
          };
        });

        formattedOrders.sort((a, b) => {
          const dateA = convertThaiDateToISO(a.delivery_date);
          const dateB = convertThaiDateToISO(b.delivery_date);

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
        setError(err instanceof Error ? `ไม่สามารถจัดรูปแบบออเดอร์: ${err.message}` : "เกิดข้อผิดพลาดในการจัดรูปแบบออเดอร์");
      }
    };

    formatOrders();
  }, [cartsData, ingredientData]);
  useEffect(() => {
    if (!cartsData) return;

    const groupedByDate: { [date: string]: RawCart[] } = {};
    const allowedStatuses = ["success", "cancelled"];

    cartsData.forEach((cart: RawCart) => {
      if (!allowedStatuses.includes(cart.status)) return;
      const deliveryDate = convertThaiDateToISO(cart.delivery_date);
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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

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
    const filteredOrders = allCarts.filter((cart) => convertThaiDateToISO(cart.delivery_date) === selectedDateStr);
    setSelectedOrders(filteredOrders);
    setIsOrderModalOpen(true);
    setSelectedDate(new Date(selectedDateStr));
    setIsDatePickerOpen(false);
    setCarts(filteredOrders);
    if (filteredOrders.length === 0) {
      setError(`ไม่มีออเดอร์สำหรับวันที่ ${formatDate(new Date(selectedDateStr), { year: "numeric", month: "short", day: "numeric", locale: "th", timeZone: "Asia/Bangkok" })}`);
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
      const patchResponse = await api.patch(`/api/cart/menu/${cartId}`, {
        menu_name: menuName,
        menu_total: editTotalBox,
      });

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                menuItems: cart.menuItems.map((item) => (item.menu_name === cleanedMenuName ? { ...item, menu_total: editTotalBox } : item)),
                allIngredients: cart.allIngredients.map((group) => (group.menuName === cleanedMenuName ? { ...group, ingredients: group.ingredients.map((ing) => ({ ...ing, calculatedTotal: ing.useItem * editTotalBox })) } : group)),
                sets: cart.menuItems.reduce((sum, item) => sum + (item.menu_name === cleanedMenuName ? editTotalBox : item.menu_total), 0),
              }
            : cart
        )
      );
      Swal.fire({ icon: "success", title: "อัปเดตจำนวนกล่องเรียบร้อย!", text: `เมนู: ${cleanedMenuName}, จำนวนกล่อง: ${editTotalBox}`, showConfirmButton: false, timer: 3000 });
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
    setEditingTimes({ cartId, exportTime: formatToThaiTime(exportTime), receiveTime: formatToThaiTime(receiveTime) });
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
        export_time: exportTime,
        receive_time: receiveTime,
      };
      const response = await api.patch(`/api/cart/time/${cartId}`, {
        export_time: exportTime,
        receive_time: receiveTime,
      });

      mutateCarts();
      setEditingTimes(null);
      Swal.fire({ icon: "success", title: "อัปเดตเวลาเรียบร้อย!", text: `เวลาส่ง: ${exportTime}, เวลารับ: ${receiveTime}`, showConfirmButton: false, timer: 3000 });
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

    const targetCarts = carts.filter((cart) => convertThaiDateToISO(cart.delivery_date) === date);

    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        targetCarts.some((target) => target.id === cart.id)
          ? {
              ...cart,
              // อัปเดต lunchbox ถ้ามี
              lunchbox:
                cart.lunchbox && cart.lunchbox.length > 0
                  ? cart.lunchbox.map((lunchbox: any) => ({
                      ...lunchbox,
                      lunchbox_menu:
                        lunchbox.lunchbox_menu?.map((menu: any) => ({
                          ...menu,
                          menu_ingredients:
                            menu.menu_ingredients?.map((ing: any) => ({
                              ...ing,
                              ingredient_status: true,
                            })) || [],
                        })) || [],
                    }))
                  : cart.lunchbox,
              // อัปเดต allIngredients สำหรับ fallback
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
      filtered = filtered.filter((order) => convertThaiDateToISO(order.delivery_date) === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => [order.name, order.id, order.createdBy, order.customer_tel, order.customer_name, order.order_number, order.location_send].some((field) => (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter((order) => getStatusText(order.status) === filterStatus);
    }
    if (filterCreator !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    const groupedByDate = filtered.reduce((acc, cart) => {
      const deliveryDateISO = convertThaiDateToISO(cart.delivery_date) || "no-date";
      if (!acc[deliveryDateISO]) {
        acc[deliveryDateISO] = [];
      }
      acc[deliveryDateISO].push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });

    Object.values(groupedByDate).forEach((orders) => {
      orders.sort((a, b) => {
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
      const deliveryDateISO = convertThaiDateToISO(cart.delivery_date);
      const dateDisplay = deliveryDateISO ? new Date(deliveryDateISO).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, " ") : "ไม่มีวันที่จัดส่ง";
      (acc[dateDisplay] = acc[dateDisplay] || []).push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });
    const currentDate = new Date();
    const currentDateDisplay = currentDate.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, " ");

    const currentDateGroup: [string, Cart[]][] = grouped[currentDateDisplay] ? [[currentDateDisplay, grouped[currentDateDisplay]]] : [];
    const otherDateGroups = Object.entries(grouped).filter(([date]) => date !== currentDateDisplay);

    const sortedOtherDates = otherDateGroups.sort((a, b) => {
      const dateA = convertThaiDateToISO(a[1][0].delivery_date);
      const dateB = convertThaiDateToISO(b[1][0].delivery_date);

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

    const ordersOnDate = filteredAndSortedOrders.filter((cart) => convertThaiDateToISO(cart.delivery_date) === date);

    // สร้าง ingredientUnitMap จาก ingredientData
    const ingredientUnitMap = new Map<string, string>();
    if (ingredientData) {
      ingredientData.forEach((ing: any) => {
        ingredientUnitMap.set(ing.ingredient_name.toString(), ing.ingredient_unit);
      });
    }

    ordersOnDate.forEach((cart) => {
      // ตรวจสอบว่ามี lunchbox หรือไม่
      if (cart.lunchbox && cart.lunchbox.length > 0) {
        // ใช้ข้อมูลจาก lunchbox
        cart.lunchbox.forEach((lunchbox: any) => {
          if (lunchbox.lunchbox_menu && Array.isArray(lunchbox.lunchbox_menu)) {
            lunchbox.lunchbox_menu.forEach((menu: any) => {
              if (menu.menu_ingredients && Array.isArray(menu.menu_ingredients)) {
                menu.menu_ingredients.forEach((ing: any) => {
                  const ingredientName = ing.ingredient_name;
                  if (!ingredientName) return;

                  if (!ingredientSummary[ingredientName]) {
                    ingredientSummary[ingredientName] = {
                      checked: 0,
                      total: 0,
                      unit: ingredientUnitMap.get(ingredientName) || "ไม่ระบุหน่วย",
                    };
                  }

                  // คำนวณ total จาก useItem × menu_total
                  const totalAmount = (ing.useItem || 0) * (menu.menu_total || 0);
                  ingredientSummary[ingredientName].total += totalAmount;

                  // ตรวจสอบ ingredient_status
                  if (ing.ingredient_status) {
                    ingredientSummary[ingredientName].checked += totalAmount;
                  }
                });
              }
            });
          }
        });
      } else {
        // Fallback: ใช้ข้อมูลจาก allIngredients (แบบเดิม)
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
      }
    });

    // ตรวจสอบว่าวัตถุดิบทั้งหมดถูกเช็คแล้วหรือยัง
    const allIngredientsChecked = ordersOnDate.every((cart) => {
      if (cart.lunchbox && cart.lunchbox.length > 0) {
        // ตรวจสอบจาก lunchbox
        return cart.lunchbox.every((lunchbox: any) => {
          if (lunchbox.lunchbox_menu && Array.isArray(lunchbox.lunchbox_menu)) {
            return lunchbox.lunchbox_menu.every((menu: any) => {
              if (menu.menu_ingredients && Array.isArray(menu.menu_ingredients)) {
                return menu.menu_ingredients.every((ing: any) => ing.ingredient_status);
              }
              return true;
            });
          }
          return true;
        });
      } else {
        // Fallback: ตรวจสอบจาก allIngredients
        return cart.allIngredients.every((menuGroup) => menuGroup.ingredients.every((ing) => ing.isChecked));
      }
    });

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

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
  const paginatedGroupedOrders = groupedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ["เลขที่ออเดอร์", "ชื่อเมนู", "คำอธิบายเมนู", "วันที่", "เวลา", "จำนวน Set", "ราคา", "สถานะ", "ผู้สร้าง"];
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

  // ฟังก์ชันสำหรับดึงรายการเดือนที่มีข้อมูล (เฉพาะ status success หรือ cancelled)
  const getAvailableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    // กรองเฉพาะ cart ที่มี status เป็น success หรือ cancelled (เหมือนกับที่ใช้ใน handleExportExcel)
    const validCarts = allCarts.filter((cart) => cart.status === "success" || cart.status === "cancelled");

    validCarts.forEach((cart) => {
      if (cart.delivery_date) {
        const isoDate = convertThaiDateToISO(cart.delivery_date);
        if (isoDate) {
          const date = new Date(isoDate);
          // ตรวจสอบว่า date ถูกต้อง
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12
            const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
            monthSet.add(monthKey);
          }
        }
      }
    });

    // แปลงเป็น array และเรียงลำดับ
    return Array.from(monthSet)
      .sort()
      .reverse() // เรียงจากใหม่ไปเก่า
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const thaiMonthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        const thaiYear = parseInt(year) + 543;
        return {
          value: monthKey,
          label: `${thaiMonthNames[parseInt(month) - 1]} ${thaiYear}`,
        };
      });
  }, [allCarts]);

  // ฟังก์ชันแปลง delivery_date (รูปแบบไทย) เป็นรูปแบบที่อ่านง่าย
  const formatDeliveryDate = (thaiDate: string | undefined): string => {
    if (!thaiDate) return "ไม่ระบุ";
    const isoDate = convertThaiDateToISO(thaiDate);
    if (!isoDate) return "ไม่ระบุ";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "ไม่ระบุ";
    const thaiMonthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    return `${day} ${thaiMonthNames[month]} ${year}`;
  };

  // ฟังก์ชันแปลง delivery_date เป็นรูปแบบ DD/MM/YYYY สำหรับ Excel export (ปี พ.ศ.)
  const formatDeliveryDateForExcel = (thaiDate: string | undefined): string => {
    if (!thaiDate) return "";
    const isoDate = convertThaiDateToISO(thaiDate);
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = (date.getFullYear() + 543).toString(); // แปลงเป็นปี พ.ศ.
    return `${day}/${month}/${year}`;
  };

  // ฟังก์ชันแปลง create_date (รูปแบบ ISO) เป็นรูปแบบที่อ่านง่าย
  const formatCreateDate = (isoDateString: string | undefined): string => {
    if (!isoDateString) return "ไม่ระบุ";
    // แปลง ISO date string โดยแทนที่ 'T' ด้วย space
    const normalizedDate = isoDateString.replace("T", " ");
    const [rawDate, timePart] = normalizedDate.split(" ");
    if (!rawDate) return "ไม่ระบุ";

    const [year, month, day] = rawDate.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(date.getTime())) return "ไม่ระบุ";

    const thaiMonthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const thaiYear = Number(year) + 543; // แปลงเป็นปี พ.ศ.
    return `${Number(day)} ${thaiMonthNames[Number(month) - 1]} ${thaiYear}`;
  };

  const handleExportExcelForDate = async (dateISO: string, orders: Cart[]) => {
    // กรองเฉพาะ orders ที่มี status success หรือ cancelled
    let ordersToExport = orders.filter((cart) => cart.status === "success" || cart.status === "cancelled");

    // เรียงข้อมูลตามวันที่จัดส่งจากน้อยไปมาก (วันที่เก่าก่อน วันที่ใหม่มาหลัง)
    ordersToExport.sort((a, b) => {
      const dateA = convertThaiDateToISO(a.delivery_date);
      const dateB = convertThaiDateToISO(b.delivery_date);

      if (!dateA) return 1; // วันที่ไม่มีข้อมูลไปท้ายสุด
      if (!dateB) return -1; // วันที่ไม่มีข้อมูลไปท้ายสุด

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      // เรียงตามวันที่จากน้อยไปมาก (วันที่เก่าก่อน)
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // ถ้าวันที่เท่ากัน เรียงตาม order_number จากน้อยไปมาก
      const orderNumA = parseInt(a.order_number || "0");
      const orderNumB = parseInt(b.order_number || "0");
      return orderNumA - orderNumB;
    });

    if (ordersToExport.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "ไม่มีข้อมูล",
        text: "ไม่มีรายการออเดอร์สำหรับวันที่นี้",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const worksheetData = ordersToExport.flatMap((cart, orderIndex) => {
      const foodPrice =
        cart.lunchbox && cart.lunchbox.length > 0
          ? cart.lunchbox.reduce((sum: number, lunchbox: any) => sum + (Number(lunchbox.lunchbox_total_cost) || 0), 0)
          : cart.price || 0;
      
      const formattedDeliveryDate = formatDeliveryDateForExcel(cart.delivery_date);
      const orderNumber = orderIndex + 1; // ลำดับ order (1, 2, 3, ...)

      // ดึงเมนูทั้งหมดจาก lunchbox เพื่อแยกเป็น row ละ 1 เมนู
      const menuRows: any[] = [];

      if (cart.lunchbox && cart.lunchbox.length > 0) {
        // วน loop ผ่าน lunchbox และ lunchbox_menu เพื่อสร้าง row ใหม่สำหรับแต่ละ menu
        cart.lunchbox.forEach((lunchbox: any) => {
          if (lunchbox.lunchbox_menu && Array.isArray(lunchbox.lunchbox_menu)) {
            const lunchboxTotalCost = Number(lunchbox.lunchbox_total_cost || 0);
            // คำนวณ total sets ใน lunchbox นี้
            const totalSetsInLunchbox = lunchbox.lunchbox_menu.reduce((sum: number, menu: any) => {
              return sum + (Number(menu.menu_total) || 0);
            }, 0);
            
            lunchbox.lunchbox_menu.forEach((menu: any, menuIdx: number) => {
              if (menu.menu_name) {
                // ใช้ menu_cost จาก lunchbox_menu โดยตรง
                const menuCost = Number(menu.menu_cost) || 0;
                
                menuRows.push({
                  "ลำดับ": "",
                  "ชื่อ": "",
                  "ชื่อเมนู": menu.menu_name,
                  "วันที่จัดส่ง": formattedDeliveryDate,
                  "จำนวน Set": menu.menu_total || 0,
                  "ราคาอาหาร": menuCost,
                  "ค่าส่ง": Number(cart.shipping_cost || 0),
                });
              }
            });
          }
        });
      }

      // ถ้าไม่มี lunchbox หรือไม่มีเมนู ให้ใช้ข้อมูลเดิม
      if (menuRows.length === 0) {
        menuRows.push({
          "ลำดับ": orderNumber,
          "ชื่อ": cart.customer_name || "",
          "ชื่อเมนู": cart.name || "ไม่มีชื่อเมนู",
          "วันที่จัดส่ง": formattedDeliveryDate,
          "จำนวน Set": cart.sets,
          "ราคาอาหาร": foodPrice,
          "ค่าส่ง": Number(cart.shipping_cost || 0),
        });
      }

      // จัดกลุ่มตามชื่อเมนูและรวมจำนวน Set
      const menuGroupMap = new Map<string, any>();
      menuRows.forEach((row) => {
        const menuName = row["ชื่อเมนู"];
        if (menuGroupMap.has(menuName)) {
          // ถ้ามีชื่อเมนูซ้ำ ให้รวมจำนวน Set และราคา
          const existingRow = menuGroupMap.get(menuName);
          existingRow["จำนวน Set"] = (existingRow["จำนวน Set"] || 0) + (row["จำนวน Set"] || 0);
          existingRow["ราคาอาหาร"] = (Number(existingRow["ราคาอาหาร"]) || 0) + (Number(row["ราคาอาหาร"]) || 0);
        } else {
          // ถ้ายังไม่มี ให้เพิ่มเข้าไป
          menuGroupMap.set(menuName, {
            ...row,
          });
        }
      });

      // แปลง Map กลับเป็น array
      const groupedMenuRows = Array.from(menuGroupMap.values());
      
      // แสดงลำดับ, ชื่อ และค่าส่งแค่ใน row แรกของแต่ละ order
      if (groupedMenuRows.length > 0) {
        groupedMenuRows[0]["ลำดับ"] = orderNumber;
        groupedMenuRows[0]["ชื่อ"] = cart.customer_name || "";
        groupedMenuRows[0]["ค่าส่ง"] = Number(cart.shipping_cost || 0);
        // ลบลำดับ, ชื่อ และค่าส่งออกจาก row อื่นๆ
        for (let i = 1; i < groupedMenuRows.length; i++) {
          groupedMenuRows[i]["ลำดับ"] = "";
          groupedMenuRows[i]["ชื่อ"] = "";
          groupedMenuRows[i]["ค่าส่ง"] = "";
        }
      }

      // เพิ่ม row สรุปของแต่ละ order ที่ท้ายสุด (แสดงราคาอาหาร)
      groupedMenuRows.push({
        "ลำดับ": "",
        "ชื่อ": "",
        "ชื่อเมนู": "รวม",
        "วันที่จัดส่ง": "",
        "จำนวน Set": "",
        "ราคาอาหาร": foodPrice,
        "ค่าส่ง": Number(cart.shipping_cost || 0),
      });

      return groupedMenuRows;
    });

    // คำนวณราคาอาหารรวมของทุก order (จาก row สรุปที่มี "ชื่อเมนู" = "รวม")
    const totalFoodPrice = worksheetData.reduce((sum, row) => {
      if (row["ชื่อเมนู"] === "รวม") {
        return sum + (Number(row["ราคาอาหาร"]) || 0);
      }
      return sum;
    }, 0);

    // คำนวณค่าจัดส่งรวมของทุก order (จาก row สรุปที่มี "ชื่อเมนู" = "รวม")
    const totalShippingCost = worksheetData.reduce((sum, row) => {
      if (row["ชื่อเมนู"] === "รวม") {
        return sum + (Number(row["ค่าส่ง"]) || 0);
      }
      return sum;
    }, 0);

    // เพิ่ม row สรุปที่ท้ายสุด
    const summaryRow = {
      "ลำดับ": "",
      "ชื่อ": "",
      "ชื่อเมนู": "รวม",
      "วันที่จัดส่ง": "",
      "จำนวน Set": "",
      "ราคาอาหาร": totalFoodPrice,
      "ค่าส่ง": totalShippingCost,
    };

    // เพิ่ม row สรุปเข้าไปใน worksheetData
    worksheetData.push(summaryRow);

    // ตั้งชื่อไฟล์ตามวันที่
    const date = new Date(dateISO);
    const thaiMonthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543;
    const fileName = `order_history_${day}_${thaiMonthNames[month]}_${year}`;

    // ใช้ ExcelJS สำหรับการสร้าง Excel พร้อม styling
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // กำหนด headers
    const headers = Object.keys(worksheetData[0] || {});
    worksheet.addRow(headers);

    // กำหนด style ให้ header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // หา index ของ column ราคาอาหารและค่าส่ง
    const priceFoodIndex = headers.indexOf("ราคาอาหาร");
    const shippingCostIndex = headers.indexOf("ค่าส่ง");

    // เพิ่มข้อมูล rows
    worksheetData.forEach((row, index) => {
      const rowData = headers.map((header) => row[header] ?? "");
      const addedRow = worksheet.addRow(rowData);

      // ถ้าเป็น row สรุป (row ที่มี "ชื่อเมนู" = "รวม") ให้กำหนด styling
      if (row["ชื่อเมนู"] === "รวม") {
        // ตรวจสอบว่าเป็น row สรุปรวมทั้งหมด (row สุดท้าย) หรือ row สรุปแต่ละ order
        const isTotalSummaryRow = index === worksheetData.length - 1;
        const fillColor = isTotalSummaryRow ? "FF006400" : "FF228B22"; // สีเขียวแก่สำหรับรวมทั้งหมด, สีเขียวสำหรับแต่ละ order

        // กำหนดสีให้ทุก cell ใน row
        addedRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
          cell.font = {
            color: { argb: "FFFFFFFF" },
            bold: true,
          };
        });
      }
    });

    // Format คอลัมน์ ราคาอาหารและค่าส่งให้มี comma สำหรับทุก cell ที่เป็นตัวเลข
    if (priceFoodIndex !== -1) {
      worksheet.getColumn(priceFoodIndex + 1).numFmt = "#,##0";
    }
    if (shippingCostIndex !== -1) {
      worksheet.getColumn(shippingCostIndex + 1).numFmt = "#,##0";
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = 15;
      }
    });

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Export สำเร็จ",
      text: `ดาวน์โหลดไฟล์ Excel สำหรับวันที่ ${day} ${thaiMonthNames[month]} ${year} เรียบร้อยแล้ว`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleExportExcel = async (selectedMonth?: string) => {
    // กรองข้อมูลตามเดือนที่เลือก (ใช้ delivery_date)
    let ordersToExport = allCarts.filter((cart) => cart.status === "success" || cart.status === "cancelled");

    if (selectedMonth) {
      ordersToExport = ordersToExport.filter((cart) => {
        if (!cart.delivery_date) return false;
        const isoDate = convertThaiDateToISO(cart.delivery_date);
        if (!isoDate) return false;
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
        return monthKey === selectedMonth;
      });
    }

    // เรียงข้อมูลตามวันที่จัดส่งจากน้อยไปมาก (วันที่เก่าก่อน วันที่ใหม่มาหลัง)
    ordersToExport.sort((a, b) => {
      const dateA = convertThaiDateToISO(a.delivery_date);
      const dateB = convertThaiDateToISO(b.delivery_date);

      if (!dateA) return 1; // วันที่ไม่มีข้อมูลไปท้ายสุด
      if (!dateB) return -1; // วันที่ไม่มีข้อมูลไปท้ายสุด

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      // เรียงตามวันที่จากน้อยไปมาก (วันที่เก่าก่อน)
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // ถ้าวันที่เท่ากัน เรียงตาม order_number จากน้อยไปมาก
      const orderNumA = parseInt(a.order_number || "0");
      const orderNumB = parseInt(b.order_number || "0");
      return orderNumA - orderNumB;
    });

    const worksheetData = ordersToExport.flatMap((cart, orderIndex) => {
      const foodPrice =
        cart.lunchbox && cart.lunchbox.length > 0
          ? cart.lunchbox.reduce((sum: number, lunchbox: any) => sum + (Number(lunchbox.lunchbox_total_cost) || 0), 0)
          : cart.price || 0;
      
      const formattedDeliveryDate = formatDeliveryDateForExcel(cart.delivery_date);
      const orderNumber = orderIndex + 1; // ลำดับ order (1, 2, 3, ...)

      // ดึงเมนูทั้งหมดจาก lunchbox เพื่อแยกเป็น row ละ 1 เมนู
      const menuRows: any[] = [];

      if (cart.lunchbox && cart.lunchbox.length > 0) {
        // วน loop ผ่าน lunchbox และ lunchbox_menu เพื่อสร้าง row ใหม่สำหรับแต่ละ menu
        cart.lunchbox.forEach((lunchbox: any) => {
          if (lunchbox.lunchbox_menu && Array.isArray(lunchbox.lunchbox_menu)) {
            const lunchboxTotalCost = Number(lunchbox.lunchbox_total_cost || 0);
            // คำนวณ total sets ใน lunchbox นี้
            const totalSetsInLunchbox = lunchbox.lunchbox_menu.reduce((sum: number, menu: any) => {
              return sum + (Number(menu.menu_total) || 0);
            }, 0);
            
            lunchbox.lunchbox_menu.forEach((menu: any, menuIdx: number) => {
              if (menu.menu_name) {
                // ใช้ menu_cost จาก lunchbox_menu โดยตรง
                const menuCost = Number(menu.menu_cost) || 0;
                
                menuRows.push({
                  "ลำดับ": "",
                  "ชื่อ": "",
                  "ชื่อเมนู": menu.menu_name,
                  "วันที่จัดส่ง": formattedDeliveryDate,
                  "จำนวน Set": menu.menu_total || 0,
                  "ราคาอาหาร": menuCost,
                  "ค่าส่ง": Number(cart.shipping_cost || 0),
                });
              }
            });
          }
        });
      }

      // ถ้าไม่มี lunchbox หรือไม่มีเมนู ให้ใช้ข้อมูลเดิม
      if (menuRows.length === 0) {
        menuRows.push({
          "ลำดับ": orderNumber,
          "ชื่อ": cart.customer_name || "",
          "ชื่อเมนู": cart.name || "ไม่มีชื่อเมนู",
          "วันที่จัดส่ง": formattedDeliveryDate,
          "จำนวน Set": cart.sets,
          "ราคาอาหาร": foodPrice,
          "ค่าส่ง": Number(cart.shipping_cost || 0),
        });
      }

      // จัดกลุ่มตามชื่อเมนูและรวมจำนวน Set
      const menuGroupMap = new Map<string, any>();
      menuRows.forEach((row) => {
        const menuName = row["ชื่อเมนู"];
        if (menuGroupMap.has(menuName)) {
          // ถ้ามีชื่อเมนูซ้ำ ให้รวมจำนวน Set และราคา
          const existingRow = menuGroupMap.get(menuName);
          existingRow["จำนวน Set"] = (existingRow["จำนวน Set"] || 0) + (row["จำนวน Set"] || 0);
          existingRow["ราคาอาหาร"] = (Number(existingRow["ราคาอาหาร"]) || 0) + (Number(row["ราคาอาหาร"]) || 0);
        } else {
          // ถ้ายังไม่มี ให้เพิ่มเข้าไป
          menuGroupMap.set(menuName, {
            ...row,
          });
        }
      });

      // แปลง Map กลับเป็น array
      const groupedMenuRows = Array.from(menuGroupMap.values());
      // แสดงลำดับ, ชื่อ และค่าส่งแค่ใน row แรกของแต่ละ order
      if (groupedMenuRows.length > 0) {
        groupedMenuRows[0]["ลำดับ"] = orderNumber;
        groupedMenuRows[0]["ชื่อ"] = cart.customer_name || "";
        groupedMenuRows[0]["ค่าส่ง"] = Number(cart.shipping_cost || 0);
        // ลบลำดับ, ชื่อ และค่าส่งออกจาก row อื่นๆ
        for (let i = 1; i < groupedMenuRows.length; i++) {
          groupedMenuRows[i]["ลำดับ"] = "";
          groupedMenuRows[i]["ชื่อ"] = "";
          groupedMenuRows[i]["ค่าส่ง"] = "";
        }
      }
      // เพิ่ม row สรุปของแต่ละ order ที่ท้ายสุด (แสดงราคาอาหาร)
      groupedMenuRows.push({
        "ลำดับ": "",
        "ชื่อ": "",
        "ชื่อเมนู": "รวม",
        "วันที่จัดส่ง": "",
        "จำนวน Set": "",
        "ราคาอาหาร": foodPrice,
        "ค่าส่ง": Number(cart.shipping_cost || 0),
      });

      return groupedMenuRows;
    });

    // คำนวณราคาอาหารรวมของทุก order (จาก row สรุปที่มี "ชื่อเมนู" = "รวม")
    const totalFoodPrice = worksheetData.reduce((sum, row) => {
      if (row["ชื่อเมนู"] === "รวม") {
        return sum + (Number(row["ราคาอาหาร"]) || 0);
      }
      return sum;
    }, 0);

    // คำนวณค่าจัดส่งรวมของทุก order (จาก row สรุปที่มี "ชื่อเมนู" = "รวม")
    const totalShippingCost = worksheetData.reduce((sum, row) => {
      if (row["ชื่อเมนู"] === "รวม") {
        return sum + (Number(row["ค่าส่ง"]) || 0);
      }
      return sum;
    }, 0);

    // เพิ่ม row สรุปที่ท้ายสุด
    const summaryRow = {
      "ลำดับ": "",
      "ชื่อ": "",
      "ชื่อเมนู": "รวม",
      "วันที่จัดส่ง": "",
      "จำนวน Set": "",
      "ราคาอาหาร": totalFoodPrice,
      "ค่าส่ง": totalShippingCost,
    };

    // เพิ่ม row สรุปเข้าไปใน worksheetData
    worksheetData.push(summaryRow);

    // ตั้งชื่อไฟล์ตามเดือนที่เลือก
    let fileName = `order_history`;
    if (selectedMonth) {
      const selectedMonthData = getAvailableMonths.find((m) => m.value === selectedMonth);
      if (selectedMonthData) {
        fileName = `order_history_${selectedMonthData.label.replace(/\s+/g, "_")}`;
      }
    } else {
      const timestamp = new Date().toISOString().split("T")[0];
      fileName = `order_history_${timestamp}`;
    }

    // ใช้ ExcelJS สำหรับการสร้าง Excel พร้อม styling
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // กำหนด headers
    const headers = Object.keys(worksheetData[0] || {});
    worksheet.addRow(headers);

    // กำหนด style ให้ header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // หา index ของ column ราคาอาหารและค่าส่ง
    const priceFoodIndex = headers.indexOf("ราคาอาหาร");
    const shippingCostIndex = headers.indexOf("ค่าส่ง");

    // เพิ่มข้อมูล rows
    worksheetData.forEach((row, index) => {
      const rowData = headers.map((header) => row[header] ?? "");
      const addedRow = worksheet.addRow(rowData);

      // ถ้าเป็น row สรุป (row ที่มี "ชื่อเมนู" = "รวม") ให้กำหนด styling
      if (row["ชื่อเมนู"] === "รวม") {
        // ตรวจสอบว่าเป็น row สรุปรวมทั้งหมด (row สุดท้าย) หรือ row สรุปแต่ละ order
        const isTotalSummaryRow = index === worksheetData.length - 1;
        const fillColor = isTotalSummaryRow ? "FF006400" : "FF228B22"; // สีเขียวแก่สำหรับรวมทั้งหมด, สีเขียวสำหรับแต่ละ order

        // กำหนดสีให้ทุก cell ใน row
        addedRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
          cell.font = {
            color: { argb: "FFFFFFFF" },
            bold: true,
          };
        });
      }
    });

    // Format คอลัมน์ ราคาอาหารและค่าส่งให้มี comma สำหรับทุก cell ที่เป็นตัวเลข
    if (priceFoodIndex !== -1) {
      worksheet.getColumn(priceFoodIndex + 1).numFmt = "#,##0";
    }
    if (shippingCostIndex !== -1) {
      worksheet.getColumn(shippingCostIndex + 1).numFmt = "#,##0";
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = 15;
      }
    });

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    setIsExcelMonthDialogOpen(false);
    setSelectedMonthForExcel("");
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
              <Input placeholder='ค้นหาชื่อ, รหัสคำสั่ง, สถานที่ส่ง...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pr-10 h-10 bg-white border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 rounded-xl shadow-sm:text-sm' />
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
                    timeZone: "Asia/Bangkok",
                  })}`
                : "เลือกวันที่ที่ต้องการ"}
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
            <Button onClick={() => setIsExcelMonthDialogOpen(true)} className='h-12 w-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2 text-gray-400' /> Excel
            </Button>
          </div>
        </div>

        <div className='space-y-6'>
          {isLoading ? (
            <Loading context='หน้าประวัติการสั่งซื้อ' icon={HistoryIcon.src} color='green' />
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
                                        setEditingTimes((prev) => (prev ? { ...prev, exportTime: formattedValue } : prev));
                                      }}
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
                                        setEditingTimes((prev) => (prev ? { ...prev, receiveTime: formattedValue } : prev));
                                      }}
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
                                  🕒
                                  <span>เวลาส่งอาหาร {cart.export_time || "ไม่ระบุ"} น.</span>
                                  🕒
                                  <span>เวลารับอาหาร {cart.receive_time || "ไม่ระบุ"} น.</span>
                                  <span className='cursor-pointer ml-2' onClick={() => handleEditTimes(cart.id, cart.export_time || "", cart.receive_time || "")}></span>
                                </div>
                              )}
                            </div>
                          </div>
                          <AccordionTrigger className='w-full hover:no-underline px-0'>
                            <div className='flex flex-col gap-3 w-full text-slate-700 text-base font-bold'>
                              <div>รายการคำสั่งซื้อหมายเลข {String(cart.order_number).padStart(3, "0")}</div>
                              {/* <div className='flex items-center gap-2 font-medium text-slate-800'>
                                <FileText className='w-4 h-4 text-blue-500' />
                                <span className='truncate text-base'>
                                  ผู้สร้างรายการคำสั่งซื้อ: <span className=''>{cart.createdBy}</span>
                                </span> 
                              </div> */}
                              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 font-normal text-black'>
                                <div className='flex items-center gap-1 text-base'>
                                📦 
                                  <span>จำนวนทั้งหมด {cart.sets} กล่อง</span>
                                  💵
                                  <span className='text-base font-normal'>ราคาทั้งหมด {cart.price.toLocaleString()} บาท</span>
                                  🚚
                                  <span className='font-medium'>ค่าจัดส่ง {Number(cart.shipping_cost || 0).toLocaleString("th-TH")} บาท</span>
                                </div>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:justify-between font-normal sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-1 text-base'>
                                  📍
                                  <span>สถานที่จัดส่ง {cart.location_send} </span>
                                </div>
                              </div>
                              <div className='font-normal flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-1 text-base'>
                                  👤
                                  <span>ส่งถึงคุณ {cart.customer_name}</span>
                                  📞
                                  <span>เบอร์ {cart.customer_tel} </span>
                                </div>
                              </div>
                              <div className='flex flex-wrap items-center gap-4 text-base font-normal text-black'>
                                <div className='flex items-center gap-1'>
                                  📅
                                  <span>วันที่สั่งอาหาร {cart.date}</span>
                                </div>
                                
                              </div>
                              {(cart.invoice_tex || cart.customer_name || cart.location_send) && (
                                <div className='flex flex-col gap-2 text-base font-normal text-black border-t pt-2 mt-2'>
                                  {cart.invoice_tex && (
                                    <div className='flex items-center gap-1'>
                                      📄
                                      <span>เลขกำกับภาษี: {cart.invoice_tex}</span>
                                    </div>
                                  )}
                                  {cart.customer_name && (
                                    <div className='flex items-center gap-1'>
                                      👤
                                      <span>ออกบิลในนาม: {cart.customer_name}</span>
                                    </div>
                                  )}
                                  {cart.location_send && (
                                    <div className='flex items-center gap-1'>
                                      📍
                                      <span>ที่อยู่: {cart.location_send}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className='hidden items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] sm:text-xs text-gray-500'>
                                <ResponsiveOrderId id={cart.id} maxFontSize={10} minFontSize={10} />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className='flex justify-center mt-2'>
                            <StatusDropdown cartId={cart.id} allIngredients={cart.allIngredients} defaultStatus={cart.status} receive_time={formatToHHMM(cart.receive_time)} export_time={formatToHHMM(cart.export_time)} cart={cart} onUpdated={() => handleUpdateWithCheck(cart)} />
                          </div>
                          <AccordionContent className='mt-4'>
                            <div className='grid md:grid-cols-2 gap-6'>
                              <div>
                                <h4 className='text-sm font-bold mb-2 text-emerald-700 flex items-center gap-2'>
                                  <User className='w-4 h-4' /> เมนูที่สั่ง
                                </h4>
                                <Accordion type='multiple' className='space-y-3'>
                                  {cart.lunchbox && cart.lunchbox.length > 0
                                    ? cart.lunchbox.map((lunchbox: any, lunchboxIdx: number) => (
                                        <AccordionItem key={lunchboxIdx} value={`lunchbox-${lunchboxIdx}`} className='rounded-xl border border-blue-200 shadow-sm px-4 py-3 bg-blue-50'>
                                          <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                            <div className='flex flex-col items-start flex-1'>
                                              <span className='truncate text-sm text-blue-800 font-bold'>
                                                📦 {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set_name}
                                              </span>
                                              <div className='flex gap-4 mt-2'>
                                                <div className='text-xs text-blue-700'>
                                                  <span className='font-medium'>จำนวน:</span> {lunchbox.lunchbox_total} กล่อง
                                                </div>
                                                <div className='text-xs text-blue-700'>
                                                  <span className='font-medium'>ราคา:</span> {lunchbox.lunchbox_total_cost} บาท
                                                </div>
                                              </div>
                                            </div>
                                          </AccordionTrigger>

                                          <AccordionContent className='pt-3 space-y-2'>
                                            <h5 className='font-medium text-blue-800 mb-2 text-xs'>เมนูในกล่อง:</h5>
                                            {lunchbox.lunchbox_menu.map((menu: any, menuIdx: number) => {
                                              const allIngredientsChecked = menu.menu_ingredients?.every((ing: any) => ing.ingredient_status) ?? false;

                                              return (
                                                <div key={menuIdx} className={`rounded-lg border p-3 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                                  <div className='mb-2'>
                                                    <div className='font-medium text-gray-800 text-sm'>
                                                      {menu.menu_name} {menu.menu_subname && `(${menu.menu_subname})`}
                                                    </div>
                                                    <div className='text-xs text-gray-600 mt-1'>
                                                      หมวดหมู่: {menu.menu_category} | จำนวน: {menu.menu_total} กล่อง
                                                    </div>
                                                    {menu.menu_description && <div className='text-xs text-gray-500 mt-1'>{menu.menu_description}</div>}
                                                  </div>

                                                  <div className='space-y-1 mt-2'>
                                                    <h6 className='text-xs font-medium text-gray-700 mb-1'>วัตถุดิบ:</h6>
                                                    {menu.menu_ingredients?.map((ing: any, idx: number) => (
                                                      <div key={idx} className='flex items-center justify-between text-xs text-gray-600 py-1'>
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
                                    : // Fallback to old structure if lunchbox is not available
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
                                      })}
                                </Accordion>
                              </div>
                            </div>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  <div className='flex justify-center gap-3 m-4'>
                    {/* <Button
                      size='sm'
                      onClick={() => handleSummaryClick(convertThaiDateToISO(orders[0].delivery_date)!)}
                      className='h-9 px-4 rounded-xl border border-emerald-500 text-emerald-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md mb-4'
                      style={{ color: "#000000", background: "#fcf22d" }}>
                      📦 สรุปวัตถุดิบทั้งหมด
                    </Button> */}
                    <Button
                      size='sm'
                      onClick={() => {
                        const dateISO = convertThaiDateToISO(orders[0].delivery_date);
                        if (dateISO) {
                          handleExportExcelForDate(dateISO, orders);
                        }
                      }}
                      className='h-9 px-4 rounded-xl border border-blue-500 text-blue-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md mb-4 flex items-center gap-2'
                      style={{ color: "#ffffff", background: "#3b82f6" }}>
                      <Download className='w-4 h-4' /> Download Excel
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
          <DialogContent className='max-w-md max-h-[90vh] flex flex-col'>
            <DialogTitle className='text-lg font-bold shrink-0'>
              <div style={{ color: "#000000" }} className='mb-4'>
                สรุปวัตถุดิบทั้งหมดของวันที่{" "}
                {selectedDateForSummary &&
                  new Date(selectedDateForSummary).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
              </div>
            </DialogTitle>
            {selectedDateForSummary &&
              (() => {
                const { summary } = summarizeIngredients(selectedDateForSummary);
                return (
                  <div className='flex flex-col flex-1 min-h-0 space-y-4'>
                    <div className='flex-1 overflow-y-auto space-y-2 pr-2'>
                      <h5 className='text-sm font-semibold text-gray-700 sticky top-0 bg-white pb-2 z-10'>สรุปวัตถุดิบรวม</h5>
                      <div className='space-y-0'>
                        {summary.map((ing, idx) => (
                          <div key={idx} className='flex justify-between items-center text-sm border-b border-gray-200 py-2'>
                            <span className='text-gray-700 flex-1'>{ing.name}</span>
                            <span className='text-gray-600 ml-4 whitespace-nowrap'>
                              {ing.checked}/{ing.total} {ing.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='shrink-0 pt-2 border-t border-gray-200'>
                      <Button onClick={() => setIsSummaryModalOpen(false)} className='w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg'>
                        ปิด
                      </Button>
                    </div>
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>

        {/* Dialog สำหรับเลือกเดือนก่อน Export Excel */}
        <Dialog open={isExcelMonthDialogOpen} onOpenChange={setIsExcelMonthDialogOpen}>
          <DialogContent className='max-w-lg'>
            <div className='space-y-4'>
              <DialogTitle className='text-xl mb-4 text-black !font-bold'>เลือกเดือนสำหรับ Export Excel</DialogTitle>
              <div className='flex flex-col gap-2'>
                {/* <label className='text-sm font-medium text-gray-700'>เลือกเดือน</label> */}
                <Select value={selectedMonthForExcel} onValueChange={setSelectedMonthForExcel}>
                  <SelectTrigger style={{ color: "#000000" }} className='w-full !bg-gray-100'>
                    <SelectValue placeholder='เลือกเดือนที่ต้องการ' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>ทั้งหมด</SelectItem>
                    {getAvailableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-end gap-2 pt-4 '>
                <Button
                  variant='default'
                  style={{ color: "#000000", borderColor: "#808080", borderWidth: "1px" }}
                  className=' !bg-green-400'
                  onClick={() => {
                    if (selectedMonthForExcel && selectedMonthForExcel !== "all") {
                      handleExportExcel(selectedMonthForExcel);
                    } else {
                      handleExportExcel();
                    }
                  }}>
                  Export Excel
                </Button>
                <Button
                  variant='outline'
                  style={{ color: "#000000", borderColor: "#808080", borderWidth: "1px" }}
                  className=' !bg-red-400'
                  onClick={() => {
                    setIsExcelMonthDialogOpen(false);
                    setSelectedMonthForExcel("");
                  }}>
                  ยกเลิก
                </Button>

              </div>
            </div>
          </DialogContent>
        </Dialog>

        {totalPages > 1 && <PaginationComponent totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      </div>
    </div>
  );
};

export default OrderHistory;
