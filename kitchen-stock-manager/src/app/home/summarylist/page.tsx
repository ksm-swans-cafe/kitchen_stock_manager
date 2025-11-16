"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import axios from "axios";
import { Clock, User, Package, FileText, Search, CalendarDays, Filter, Smartphone, Wallet, Map, Download, Users, Edit2, Container } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate, EventInput } from "@fullcalendar/core";

import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";

import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/share/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Input } from "@/share/ui/input";

import ResponsiveOrderId from "@/app/components/ResponsiveOrderId";
import StatusDropdown from "@/app/components/StatusDropdownsummary";
import PaginationComponent from "@/components/ui/Totalpage";

import { fetcher } from "@/lib/utils";

import { Ingredient, MenuItem, Cart, CartItem, RawCart, Lunchbox } from "@/types/interface_summary_orderhistory";


const SummaryList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterCreator, setFilterCreator] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
  const [shouldFetchMenu, setShouldFetchMenu] = useState(false);
  const [availableLunchboxes, setAvailableLunchboxes] = useState<any[]>([]);
  const [availableMenus, setAvailableMenus] = useState<any[]>([]);
  const [availableMenusForLunchbox, setAvailableMenusForLunchbox] = useState<{ [key: string]: any[] }>({});  // เก็บเมนูแยกตามแต่ละ lunchbox
  const [selectedLunchboxName, setSelectedLunchboxName] = useState<string>("");
  const [selectedLunchboxSet, setSelectedLunchboxSet] = useState<string>("");
  const [availableLunchboxSets, setAvailableLunchboxSets] = useState<string[]>([]);
  const [previewLunchbox, setPreviewLunchbox] = useState<{
    lunchbox_name: string;
    lunchbox_set_name: string;
    lunchbox_limit: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Flag to prevent dialog reset during deletion
  const [selectedMenuForLunchbox, setSelectedMenuForLunchbox] = useState<{ [key: number]: string }>({}); // Store selected menu index for each lunchbox
  const [editMenuDialog, setEditMenuDialog] = useState<{
    cart_id: string;
    cart_delivery_date: string;
    cart_receive_time: string;
    cart_export_time: string;
    cart_customer_tel: string;
    cart_customer_name: string;
    cart_location_send: string;
    cart_shipping_cost: number;
    cart_lunchbox: {
      lunchbox_name: string;
      lunchbox_set_name: string;
      lunchbox_limit: number;
      lunchbox_total: number;
      lunchbox_total_cost: number;
      lunchbox_menu: {
        menu_name: string;
        menu_subname: string;
        menu_category: string;
        menu_total: number;
        menu_order_id: number;
        menu_description: string;
        menu_ingredients: {
          useItem: number;
          ingredient_name: string;
          ingredient_status: boolean;
          ingredient_unit?: string;
        }[];
      }[];
    }[];
    menuItems: {
      menu_name: string;
      menu_category: string;
      menu_subname: string;
      menu_total: number;
      menu_order_id: number;
      menu_description: string;
      menu_ingredients: {
        useItem: number;
        ingredient_name: string;
        ingredient_status: boolean;
      }[];
    }[];
    newMenu: {
      menu_name: string;
      menu_total: number;
      menu_description: string;
    };
  } | null>(null);
  const { data: cartsData, error: cartsError, mutate: mutateCarts } = useSWR("/api/get/carts", fetcher, { refreshInterval: 30000 });
  const { data: ingredientData, error: ingredientError } = useSWR("/api/get/ingredients", fetcher, { refreshInterval: 30000 });
  const error = cartsError || ingredientError;
  const isLoading = !cartsData || !ingredientData;
  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);

  const handleSummaryprice = () => {
    router.push("/home/summarylist/summaryprice");
  };

  const handleDatePicker = (action: string) => {
    if (action === "open") return setIsDatePickerOpen(true);
    else if (action === "close") return setIsDatePickerOpen(false);
  };

  const safeParseJSON = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  };

  useEffect(() => {
    if (!cartsData || !ingredientData) return;

    const formatOrders = async () => {
      try {
        const ingredientUnitMap = new globalThis.Map<string, string>();
        ingredientData.forEach((ing: { ingredient_name: string; ingredient_unit: string }) => {
          ingredientUnitMap.set(ing.ingredient_name, ing.ingredient_unit);
        });

        const formattedOrders: Cart[] = cartsData.map((cart: RawCart) => {
          // ตรวจสอบและให้ค่าเริ่มต้น
          if (!cart.cart_create_date) {
            // console.warn(`Cart ${cart.cart_id} has no cart_create_date`);
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
              cart_lunchbox: [],
              cart_delivery_date: cart.cart_delivery_date,
              cart_receive_time: cart.cart_receive_time,
              cart_export_time: cart.cart_export_time,
              cart_customer_tel: cart.cart_customer_tel,
              cart_customer_name: cart.cart_customer_name,
              cart_location_send: cart.cart_location_send,
              cart_shipping_cost: cart.cart_shipping_cost,
            };
          }

          // แก้ไขการแยกวันที่และเวลา - ใช้ space แทน T
          const [rawDate, timePart] = cart.cart_create_date.split(" ");
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

          // แก้ไขการแยกเวลา - ใช้ space และตัดส่วน timezone
          const timeOnly = timePart ? timePart.split("+")[0] : "";
          const formattedTime = timeOnly ? timeOnly.slice(0, 5) : "ไม่ระบุ";

          // ประมวลผล cart_lunchbox
          let cartLunchbox: Lunchbox[] = [];
          if (cart.cart_lunchbox) {
            if (typeof cart.cart_lunchbox === 'string') {
              const parsedLunchbox = safeParseJSON(cart.cart_lunchbox);
              if (parsedLunchbox && Array.isArray(parsedLunchbox)) {
                cartLunchbox = parsedLunchbox;
              }
            } else if (Array.isArray(cart.cart_lunchbox)) {
              cartLunchbox = cart.cart_lunchbox;
            }
          }

          // ประมวลผล menuItems จาก cart_lunchbox
          const menuItems: MenuItem[] = [];
          cartLunchbox.forEach((lunchbox) => {
            lunchbox.lunchbox_menu.forEach((menu) => {
              const menuIngredients = (menu.menu_ingredients || []).map((ing: Ingredient) => ({
                ...ing,
                ingredient_id: ing.ingredient_id || undefined,
                ingredient_name: ing.ingredient_name || "ไม่พบวัตถุดิบ",
                calculatedTotal: ing.useItem * (menu.menu_total || 0),
                sourceMenu: menu.menu_name,
                isChecked: ing.ingredient_status ?? false,
                ingredient_status: ing.ingredient_status ?? false,
                ingredient_unit: ingredientUnitMap.get(ing.ingredient_name?.toString() || "") || "ไม่ระบุหน่วย",
              }));

              menuItems.push({
                menu_name: menu.menu_name,
                menu_subname: menu.menu_subname,
                menu_category: menu.menu_category,
                menu_total: menu.menu_total,
                menu_ingredients: menuIngredients,
                menu_description: menu.menu_description || "",
                menu_order_id: menu.menu_order_id,
              });
            });
          });

          const totalSets = menuItems.reduce((sum, item) => sum + (item.menu_total || 0), 0);

          const menuDisplayName = menuItems.length > 0
            ? menuItems.map((item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`).join(" + ")
            : "ไม่มีชื่อเมนู";

          const allIngredients = menuItems.map((menu) => ({
            menuName: menu.menu_name,
            ingredients: menu.menu_ingredients.map((ing: Ingredient) => ({
              ...ing,
              calculatedTotal: ing.useItem * (menu.menu_total || 0),
              sourceMenu: menu.menu_name,
              isChecked: ing.ingredient_status ?? false,
              ingredient_status: ing.ingredient_status ?? false,
              ingredient_unit: ingredientUnitMap.get(ing.ingredient_name?.toString() || "") || "ไม่ระบุหน่วย",
            })),
            ingredient_status: menu.menu_ingredients.every((ing: Ingredient) => ing.ingredient_status ?? false),
          }));

          const orderNumber = cart.cart_order_number || `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;
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
            menuItems,
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
          const dateA = Time.convertThaiDateToISO(a.cart_delivery_date);
          const dateB = Time.convertThaiDateToISO(b.cart_delivery_date);

          if (!dateA) return 1;
          if (!dateB) return -1;

          const diffA = Math.abs(new Date(dateA).getTime() - new Date().getTime());
          const diffB = Math.abs(new Date(dateB).getTime() - new Date().getTime());

          if (diffA !== diffB) return diffA - diffB;

          const orderNumA = parseInt(a.order_number || "0");
          const orderNumB = parseInt(b.order_number || "0");
          return orderNumB - orderNumA;
        });

        // อัปเดต state ครั้งเดียว
        setAllCarts(formattedOrders);
        setCarts(formattedOrders);
      } catch (err) {
        console.error("Error formatting orders:", err);
      }
    };

    formatOrders();
  }, [cartsData, ingredientData]);

  useEffect(() => {
    if (!cartsData) return;

    const groupedByDate: { [date: string]: RawCart[] } = {};
    const allowedStatuses = ["pending", "completed"];

    cartsData.forEach((cart: RawCart) => {
      if (!allowedStatuses.includes(cart.cart_status)) return;
      const deliveryDate = Time.convertThaiDateToISO(cart.cart_delivery_date);
      if (!deliveryDate) return;
      if (!groupedByDate[deliveryDate]) groupedByDate[deliveryDate] = [];

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
      const response = await axios.patch(`/api/edit/cart_time/${cartId}`, payload);

      if (response.status !== 200) {
        const errorData = response.data;
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
    } finally {
      setIsSaving(null);
    }
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
      const response = await axios.patch(
        `/api/edit/cart-menu/ingredient-status/${cartId}`,
        JSON.stringify({
          menuName,
          ingredientName,
          isChecked: newCheckedStatus,
        })
      );

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.error || "Failed to update ingredient status");
      }

      mutateCarts();
    } catch (err) {
      console.error("Error updating ingredient status:", err);
      setCarts(previousCarts);
    }
  };

  const handleCheck = {
    AllIngredients: async (cartId: string) => {
      const previousCarts = [...carts];
      setIsSaving(cartId);
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
        const response = await axios.patch(`/api/edit/cart-menu/all-ingredients-status/${cartId}`, JSON.stringify({ isChecked: true }));

        if (response.status !== 200) {
          const errorData = response.data;
          throw new Error(errorData.error || "Failed to update all ingredients status");
        }

        mutateCarts();
      } catch (err) {
        console.error("Error updating all ingredients status:", err);
        setCarts(previousCarts);
        if (selectedCartForSummary && selectedCartForSummary.id === cartId) {
          setSelectedCartForSummary(previousCarts.find((cart) => cart.id === cartId) || null);
        }
      } finally {
        setIsSaving(null);
      }
    },
    AllIngredientsForDate: async (date: string) => {
      const previousCarts = [...carts];
      setIsSaving("all");

      const targetCarts = carts.filter((cart) => Time.convertThaiDateToISO(cart.cart_delivery_date) === date);

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
            axios.patch(`/api/edit/cart-menu/all-ingredients-status/${cart.id}`, JSON.stringify({ isChecked: true })).then(async (response) => {
              if (response.status !== 200) {
                const errorData = response.data;
                throw new Error(errorData.error || `Failed to update all ingredients status for cart ${cart.id}`);
              }
            })
          )
        );

        mutateCarts();
      } catch (err) {
        console.error("Error updating all ingredients for date:", err);
        setCarts(previousCarts);
      } finally {
        setIsSaving(null);
      }
    },
  };

  const Time = {
    formatToHHMM: (time: string | undefined): string | undefined => {
      if (!time) return undefined;
      const cleaned = time.replace(/\s*น\.?$/, "").replace(".", ":");
      const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return regex.test(cleaned) ? cleaned : undefined;
    },
    convertThaiDateToISO: (thaiDate: string | undefined): string | null => {
      if (!thaiDate) return null;
      const [day, month, year] = thaiDate.split("/");
      const buddhistYear = parseInt(year, 10);
      const christianYear = buddhistYear - 543;
      return `${christianYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    InMinutes: (timeStr: string | undefined): number => {
      if (!timeStr) return 9999;
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    },
  };

  const handleDateClick = (info: { dateStr: string }) => {
    const selectedDateStr = info.dateStr;
    const filteredOrders = allCarts.filter((cart) => Time.convertThaiDateToISO(cart.cart_delivery_date) === selectedDateStr);
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
    }
  };

  const getStatus = (action: string, status: string) => {
    if (action === "color") {
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
    } else if (action === "text") {
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
    }
  };

  const uniqueCreators = useMemo(() => {
    return [...new Set(carts.map((cart) => cart.createdBy))];
  }, [carts]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...carts].filter((cart) => cart.status === "pending" || cart.status === "completed");

    if (selectedDate) {
      const selectedDateISO = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((order) => Time.convertThaiDateToISO(order.cart_delivery_date) === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => [order.name, order.id, order.createdBy, order.cart_customer_tel, order.cart_customer_name, order.order_number, order.cart_location_send].some((field) => (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter((order) => getStatus("text", order.status) === filterStatus);
    }
    if (filterCreator !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    const groupedByDate = filtered.reduce((acc, cart) => {
      const deliveryDateISO = Time.convertThaiDateToISO(cart.cart_delivery_date) || "no-date";
      if (!acc[deliveryDateISO]) acc[deliveryDateISO] = [];

      acc[deliveryDateISO].push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });

    Object.values(groupedByDate).forEach((orders) => {
      orders.sort((a, b) => {
        const exportTimeA = Time.InMinutes(a.cart_export_time);
        const exportTimeB = Time.InMinutes(b.cart_export_time);
        const receiveTimeA = Time.InMinutes(a.cart_receive_time);
        const receiveTimeB = Time.InMinutes(b.cart_receive_time);

        if (exportTimeA !== exportTimeB) return exportTimeA - exportTimeB;
        if (receiveTimeA !== receiveTimeB) return receiveTimeA - receiveTimeB;

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
      const deliveryDateISO = Time.convertThaiDateToISO(cart.cart_delivery_date);
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

    Object.values(grouped).forEach((orders) => {
      orders.sort((a, b) => {
        const exportTimeA = Time.InMinutes(a.cart_export_time);
        const exportTimeB = Time.InMinutes(b.cart_export_time);
        const receiveTimeA = Time.InMinutes(a.cart_receive_time);
        const receiveTimeB = Time.InMinutes(b.cart_receive_time);

        if (exportTimeA !== exportTimeB) {
          return exportTimeA - exportTimeB;
        }

        if (receiveTimeA !== receiveTimeB) {
          return receiveTimeA - receiveTimeB;
        }

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
      const dateA = Time.convertThaiDateToISO(a[1][0].cart_delivery_date);
      const dateB = Time.convertThaiDateToISO(b[1][0].cart_delivery_date);

      if (!dateA) return 1;
      if (!dateB) return -1;

      const diffA = Math.abs(new Date(dateA).getTime() - currentDate.getTime());
      const diffB = Math.abs(new Date(dateB).getTime() - currentDate.getTime());

      return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
    });

    return [...currentDateGroup, ...sortedOtherDates];
  }, [filteredAndSortedOrders, sortOrder]);

  const summarize = {
    Ingredients: (date: string) => {
      const ingredientSummary: {
        [key: string]: { checked: number; total: number };
      } = {};

      const ordersOnDate = filteredAndSortedOrders.filter((cart) => Time.convertThaiDateToISO(cart.cart_delivery_date) === date);

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
    },
    OrderIngredients: (cart: Cart) => {
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
    },
  };

  const handleSummary = (type: "date" | "order", value: string | Cart) => {
    if (type === "date") setSelectedDateForSummary(value as string);
    else if (type === "order") setSelectedCartForSummary(value as Cart);
    setSummaryDialogType(type);
    setIsSummaryDialogOpen(true);
  };

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
  const paginatedGroupedOrders = groupedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateWithCheck = (cart: { id: string; allIngredients: unknown[] }) => {
    mutateCarts();
  };

  const handleExport = (type: string) => {
    if (type === "csv") {
      const headers = ["เลขที่ออร์เดอร์", "ชื่อเมนู", "คำอธิบายเมนู", "วันที่", "เวลา", "จำนวน Set", "ราคา", "สถานะ", "ผู้สร้าง"];
      const csvContent = [
        headers.join(","),
        ...filteredAndSortedOrders.map((cart) => {
          const menuDescriptions = cart.menuItems.map((item) => item.menu_description || "").join("; ");
          return [cart.id, cart.name, menuDescriptions, cart.date, cart.time, cart.sets, cart.price, getStatus("text", cart.status), cart.createdBy].join(",");
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "order_history.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "pdf") {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(16);
      doc.text("Order History", 14, 20);

      const tableColumn = ["Order ID", "Menu", "Menu Description", "Date", "Time", "Sets", "Price", "Status", "Created By"];

      const tableRows = filteredAndSortedOrders.map((cart) => {
        const menuDescriptions = cart.menuItems.map((item) => item.menu_description || "").join("; ");
        return [cart.id, cart.name, menuDescriptions, cart.date, cart.time, cart.sets, cart.price, getStatus("text", cart.status), cart.createdBy];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows.map((row) => row.map((cell) => (cell === undefined ? "" : cell))),
        startY: 30,
        styles: { font: "helvetica", fontSize: 10 },
      });

      doc.save("order_history.pdf");
    }
  };

  // Fetch lunchboxes when opening edit dialog
  const fetchLunchboxesAndMenus = async () => {
    try {
      const lunchboxRes = await fetch("/api/get/lunchbox");

      if (lunchboxRes.ok) {
        const lunchboxData = await lunchboxRes.json();
        setAvailableLunchboxes(lunchboxData);
      }
    } catch (err) {
      console.error("Failed to fetch lunchboxes:", err);
    }
  };

  // Helper function to calculate lunchbox cost from menu costs
  const calculateLunchboxCost = (lunchboxMenus: any[], lunchboxTotal: number, menusForThisBox: any[]) => {
    // รวมราคาของเมนูทั้งหมดในกล่อง
    const totalMenuCost = lunchboxMenus.reduce((sum, menu) => {
      // หาราคาเมนูจาก menusForThisBox
      const menuData = menusForThisBox.find((m: any) => m.menu_name === menu.menu_name);
      const menuCost = menuData?.menu_cost || menu.menu_cost || 0;
      return sum + Number(menuCost);
    }, 0);

    // ราคารวม = (ราคาเมนูทั้งหมด) × จำนวนกล่อง
    return totalMenuCost * lunchboxTotal;
  };

  // Fetch menus for specific lunchbox using categories API
  const fetchMenusForLunchbox = async (lunchboxName: string, lunchboxSetName: string, lunchboxIdx: number) => {
    try {
      const key = `${lunchboxName}_${lunchboxSetName}_${lunchboxIdx}`;

      // ถ้ามีข้อมูลแล้ว ไม่ต้อง fetch ซ้ำ
      if (availableMenusForLunchbox[key] && availableMenusForLunchbox[key].length > 0) {
        console.log(`✅ มีข้อมูลเมนูสำหรับ ${key} อยู่แล้ว`);
        return;
      }

      console.log(`🔍 กำลังดึงเมนูสำหรับ: ${lunchboxName} - ${lunchboxSetName}`);

      const response = await fetch(
        `/api/get/lunchbox/categories?lunchbox_name=${encodeURIComponent(lunchboxName)}&lunchbox_set_name=${encodeURIComponent(lunchboxSetName)}`
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ดึงเมนูสำเร็จ:`, result);

        if (result.success && result.data) {
          setAvailableMenusForLunchbox(prev => ({
            ...prev,
            [key]: result.data
          }));
        }
      } else {
        console.error(`❌ Failed to fetch menus for ${lunchboxName} - ${lunchboxSetName}`);
      }
    } catch (err) {
      console.error("Failed to fetch menus for lunchbox:", err);
    }
  };

  // Update available sets when lunchbox name changes
  useEffect(() => {
    if (selectedLunchboxName && availableLunchboxes.length > 0) {
      const sets = availableLunchboxes
        .filter((item) => item.lunchbox_name === selectedLunchboxName)
        .map((item) => item.lunchbox_set_name);
      setAvailableLunchboxSets([...new Set(sets)]);
    } else {
      setAvailableLunchboxSets([]);
    }
  }, [selectedLunchboxName, availableLunchboxes]);

  // Update preview when both lunchbox name and set are selected
  useEffect(() => {
    if (selectedLunchboxName && selectedLunchboxSet && availableLunchboxes.length > 0) {
      const selectedData = availableLunchboxes.find(
        (item) => item.lunchbox_name === selectedLunchboxName &&
          item.lunchbox_set_name === selectedLunchboxSet
      );

      if (selectedData) {
        setPreviewLunchbox({
          lunchbox_name: selectedData.lunchbox_name,
          lunchbox_set_name: selectedData.lunchbox_set_name,
          lunchbox_limit: selectedData.lunchbox_limit || 0,
        });
      }
    } else {
      setPreviewLunchbox(null);
    }
  }, [selectedLunchboxName, selectedLunchboxSet, availableLunchboxes]);

  // Auto-fetch menus when lunchbox is added to cart
  useEffect(() => {
    if (editMenuDialog && editMenuDialog.cart_lunchbox && editMenuDialog.cart_lunchbox.length > 0) {
      // ดึงเมนูสำหรับทุกกล่องที่ยังไม่มีข้อมูล
      editMenuDialog.cart_lunchbox.forEach((lunchbox, idx) => {
        const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${idx}`;
        // ดึงเฉพาะที่ยังไม่มีข้อมูล
        if (!availableMenusForLunchbox[key]) {
          fetchMenusForLunchbox(lunchbox.lunchbox_name, lunchbox.lunchbox_set_name, idx);
        }
      });
    }
  }, [editMenuDialog?.cart_lunchbox]);

  // Add new lunchbox to the cart
  const handleAddLunchbox = () => {
    if (!editMenuDialog || !selectedLunchboxName || !selectedLunchboxSet) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกโปรโมชั่นและเซทอาหาร",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const selectedLunchboxData = availableLunchboxes.find(
      (item) => item.lunchbox_name === selectedLunchboxName &&
        item.lunchbox_set_name === selectedLunchboxSet
    );

    if (!selectedLunchboxData) {
      Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลกล่องอาหาร",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const newLunchbox = {
      lunchbox_name: selectedLunchboxName,
      lunchbox_set_name: selectedLunchboxSet,
      lunchbox_limit: selectedLunchboxData.lunchbox_limit || 0,
      lunchbox_total: 1,
      lunchbox_total_cost: 0, // เริ่มต้นเป็น 0 จะคำนวณตอนเพิ่มเมนู
      lunchbox_menu: [],
    };

    setEditMenuDialog((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cart_lunchbox: [...prev.cart_lunchbox, newLunchbox],
      };
    });

    // Reset selection
    setSelectedLunchboxName("");
    setSelectedLunchboxSet("");
    setPreviewLunchbox(null);

    Swal.fire({
      icon: "success",
      title: "เพิ่มกล่องอาหารสำเร็จ!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Remove lunchbox from cart
  const handleRemoveLunchbox = (lunchboxIdx: number) => {
    console.log('🟡 handleRemoveLunchbox เรียก! Index:', lunchboxIdx, 'editMenuDialog:', editMenuDialog);
    if (!editMenuDialog) {
      console.log('❌ editMenuDialog is null!');
      return;
    }

    setIsDeleting(true); // Set flag to prevent dialog reset
    console.log('🟢 กำลังแสดง SweetAlert...');
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบกล่องอาหารนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      customClass: {
        container: 'swal-high-zindex',
        popup: 'swal-high-zindex'
      },
      didOpen: () => {
        console.log('🔵 SweetAlert didOpen เรียก!');
        const container = document.querySelector('.swal2-container');
        const popup = document.querySelector('.swal2-popup');
        const actions = document.querySelector('.swal2-actions');
        const confirmBtn = document.querySelector('.swal2-confirm');
        const cancelBtn = document.querySelector('.swal2-cancel');

        console.log('Element found:', { container: !!container, popup: !!popup, actions: !!actions, confirmBtn: !!confirmBtn, cancelBtn: !!cancelBtn });

        if (container) {
          (container as HTMLElement).style.zIndex = '99999';
          (container as HTMLElement).style.pointerEvents = 'auto';
        }
        if (popup) {
          (popup as HTMLElement).style.zIndex = '100000';
          (popup as HTMLElement).style.pointerEvents = 'auto';
        }
        if (actions) {
          (actions as HTMLElement).style.zIndex = '100001';
          (actions as HTMLElement).style.pointerEvents = 'auto';
        }
        if (confirmBtn) {
          (confirmBtn as HTMLElement).style.zIndex = '100002';
          (confirmBtn as HTMLElement).style.pointerEvents = 'auto';
        }
        if (cancelBtn) {
          (cancelBtn as HTMLElement).style.zIndex = '100002';
          (cancelBtn as HTMLElement).style.pointerEvents = 'auto';
        }
      }
    }).then((result) => {
      console.log('🟣 SweetAlert result:', result);
      if (result.isConfirmed) {
        console.log('✅ ผู้ใช้ยืนยันการลบกล่องอาหาร!');
        console.log('🔧 กำลังเรียก setEditMenuDialog...');

        setEditMenuDialog((prev) => {
          console.log('🔧 setEditMenuDialog callback ถูกเรียก! prev:', prev);
          if (!prev) {
            console.log('❌ prev is null, returning...');
            return prev;
          }

          // Get menus from the lunchbox to be removed
          const removedLunchbox = prev.cart_lunchbox[lunchboxIdx];
          console.log('🔧 removedLunchbox:', removedLunchbox);

          const menuNamesToDecrement = (removedLunchbox?.lunchbox_menu || []).map(m => m.menu_name);
          console.log('🔧 menuNamesToDecrement:', menuNamesToDecrement);

          // Update menuItems: decrease menu_total or remove if total becomes 0
          const updatedMenuItems = prev.menuItems.map(m => {
            if (menuNamesToDecrement.includes(m.menu_name)) {
              console.log(`📝 ลด menu_total ของ "${m.menu_name}" จาก ${m.menu_total} เป็น ${m.menu_total - 1}`);
              return { ...m, menu_total: m.menu_total - 1 };
            }
            return m;
          }).filter(m => m.menu_total > 0); // Remove items with menu_total <= 0

          const updatedState = {
            ...prev,
            cart_lunchbox: prev.cart_lunchbox.filter((_, idx) => idx !== lunchboxIdx),
            menuItems: updatedMenuItems,
          };

          console.log('✨ After delete lunchbox:', {
            removed: removedLunchbox,
            menuNamesToDecrement,
            remainingLunchboxes: updatedState.cart_lunchbox.length,
            remainingMenus: updatedState.menuItems.length,
            newState: updatedState
          });

          return updatedState;
        });

        console.log('🔧 setEditMenuDialog เรียกเสร็จแล้ว!');

        Swal.fire({
          icon: "success",
          title: "ลบแล้ว!",
          text: "กล่องอาหารถูกลบเรียบร้อยแล้ว",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          setIsDeleting(false); // Reset flag after success dialog
        });
      } else {
        setIsDeleting(false); // Reset flag if cancelled
      }
    });
  };

  // Add menu to lunchbox
  const handleAddMenuToLunchbox = async (lunchboxIdx: number, selectedMenu: any) => {
    if (!editMenuDialog || !selectedMenu) return;

    console.log('🟢 handleAddMenuToLunchbox called');
    console.log('🟢 lunchboxIdx:', lunchboxIdx);
    console.log('🟢 selectedMenu:', selectedMenu);

    // ตรวจสอบว่า category นี้เลือกไปแล้วหรือไม่
    const currentLunchbox = editMenuDialog.cart_lunchbox[lunchboxIdx];
    const selectedMenuCategory = selectedMenu.lunchbox_menu_category;

    console.log('🟢 Selected menu category:', selectedMenuCategory);

    // ตรวจสอบจำนวนเมนูที่เลือกแล้ว vs lunchbox_limit
    const currentMenuCount = currentLunchbox.lunchbox_menu?.length || 0;
    const lunchboxLimit = currentLunchbox.lunchbox_limit || 0;

    console.log(`🟢 Current menu count: ${currentMenuCount}/${lunchboxLimit}`);

    if (currentMenuCount >= lunchboxLimit) {
      console.log('❌ Lunchbox is full! Blocking...');
      Swal.fire({
        icon: "warning",
        title: "เลือกเมนูครบแล้ว",
        text: `กล่องนี้เลือกได้สูงสุด ${lunchboxLimit} เมนู (เลือกไปแล้ว ${currentMenuCount} เมนู)`,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    // ตรวจสอบว่ามีเมนูที่เป็น category เดียวกันอยู่แล้วหรือไม่
    const key = `${currentLunchbox.lunchbox_name}_${currentLunchbox.lunchbox_set_name}_${lunchboxIdx}`;
    const menusForThisBox = availableMenusForLunchbox[key] || [];

    const hasSameCategoryMenu = currentLunchbox.lunchbox_menu?.some((existingMenu: any) => {
      // หา category ของเมนูที่มีอยู่แล้ว
      const existingMenuData = menusForThisBox.find((m: any) => m.menu_name === existingMenu.menu_name);
      const existingCategory = existingMenuData?.lunchbox_menu_category;

      console.log(`🟢 Checking existing menu "${existingMenu.menu_name}" (${existingCategory}) vs new menu category (${selectedMenuCategory})`);

      // ถ้า category ตรงกัน แสดงว่ามีเมนูประเภทนี้อยู่แล้ว
      return existingCategory && selectedMenuCategory && existingCategory === selectedMenuCategory;
    }) || false;

    if (hasSameCategoryMenu) {
      console.log('❌ Category already selected! Blocking...');
      Swal.fire({
        icon: "warning",
        title: "เลือกประเภทนี้ไปแล้ว",
        text: `ไม่สามารถเลือกเมนูประเภท "${selectedMenuCategory}" ซ้ำได้ กรุณาลบเมนูเดิมก่อน`,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    console.log('✅ Menu can be added!');

    try {
      // Fetch menu details including ingredients
      const menuRes = await fetch(`/api/get/menu/${selectedMenu.menu_id}`);
      if (!menuRes.ok) throw new Error("Failed to fetch menu details");

      const menuDetails = await menuRes.json();

      // Parse ingredients
      let menuIngredients: any[] = [];
      if (menuDetails.menu_ingredients) {
        if (typeof menuDetails.menu_ingredients === 'string') {
          menuIngredients = JSON.parse(menuDetails.menu_ingredients);
        } else if (Array.isArray(menuDetails.menu_ingredients)) {
          menuIngredients = menuDetails.menu_ingredients;
        }
      }

      const newMenu = {
        menu_name: menuDetails.menu_name || "ไม่ระบุชื่อเมนู",
        menu_subname: menuDetails.menu_subname || "",
        menu_category: menuDetails.menu_category || "",
        menu_total: 1,
        menu_order_id: menuDetails.menu_id || 0,
        menu_description: menuDetails.menu_description || "",
        menu_cost: menuDetails.menu_cost || 0,  // เพิ่มราคาเมนู
        lunchbox_menu_category: selectedMenu.lunchbox_menu_category || "",  // เพิ่ม category จาก lunchbox
        menu_ingredients: menuIngredients.map((ing: any) => ({
          useItem: ing.quantity || ing.useItem || 0,
          ingredient_name: ing.name || ing.ingredient_name || "ไม่ระบุวัตถุดิบ",
          ingredient_status: false,
        })),
      };

      setEditMenuDialog((prev) => {
        if (!prev) return prev;

        // Check if menu already exists in menuItems
        const existingMenuIndex = prev.menuItems.findIndex(m => m.menu_name === newMenu.menu_name);

        let updatedMenuItems;
        if (existingMenuIndex >= 0) {
          // Menu exists, increment menu_total
          updatedMenuItems = prev.menuItems.map((m, idx) =>
            idx === existingMenuIndex
              ? { ...m, menu_total: m.menu_total + 1 }
              : m
          );
          console.log(`📝 เมนู "${newMenu.menu_name}" มีอยู่แล้ว เพิ่ม menu_total จาก ${prev.menuItems[existingMenuIndex].menu_total} เป็น ${prev.menuItems[existingMenuIndex].menu_total + 1}`);
        } else {
          // New menu, add to menuItems
          updatedMenuItems = [...prev.menuItems, {
            menu_name: newMenu.menu_name,
            menu_category: newMenu.menu_category,
            menu_subname: newMenu.menu_subname,
            menu_total: newMenu.menu_total,
            menu_order_id: newMenu.menu_order_id,
            menu_description: newMenu.menu_description,
            menu_ingredients: newMenu.menu_ingredients,
          }];
          console.log(`📝 เพิ่มเมนูใหม่ "${newMenu.menu_name}" เข้า menuItems`);
        }

        // คำนวณราคาใหม่หลังเพิ่มเมนู
        const key = `${prev.cart_lunchbox[lunchboxIdx].lunchbox_name}_${prev.cart_lunchbox[lunchboxIdx].lunchbox_set_name}_${lunchboxIdx}`;
        const menusForThisBox = availableMenusForLunchbox[key] || [];

        return {
          ...prev,
          cart_lunchbox: prev.cart_lunchbox.map((lb, idx) => {
            if (idx === lunchboxIdx) {
              const updatedMenus = [...lb.lunchbox_menu, newMenu];
              const newCost = calculateLunchboxCost(updatedMenus, lb.lunchbox_total, menusForThisBox);
              console.log(`💰 คำนวณราคาใหม่: ${newCost} บาท (เมนู ${updatedMenus.length} รายการ × ${lb.lunchbox_total} กล่อง)`);
              return {
                ...lb,
                lunchbox_menu: updatedMenus,
                lunchbox_total_cost: newCost
              };
            }
            return lb;
          }),
          menuItems: updatedMenuItems,
        };
      });

      Swal.fire({
        icon: "success",
        title: "เพิ่มเมนูสำเร็จ!",
        text: `เพิ่ม ${newMenu.menu_name} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error("Error adding menu:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มเมนูได้",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // Remove menu from lunchbox
  const handleRemoveMenuFromLunchbox = (lunchboxIdx: number, menuIdx: number, menuName: string) => {
    console.log('🟡 handleRemoveMenuFromLunchbox เรียก!', { lunchboxIdx, menuIdx, menuName, editMenuDialog });
    if (!editMenuDialog) {
      console.log('❌ editMenuDialog is null!');
      return;
    }

    setIsDeleting(true); // Set flag to prevent dialog reset
    console.log('🟢 กำลังแสดง SweetAlert...');
    Swal.fire({
      title: "ยืนยันการลบ",
      text: `คุณต้องการลบเมนู ${menuName} หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      customClass: {
        container: 'swal-high-zindex',
        popup: 'swal-high-zindex'
      },
      didOpen: () => {
        console.log('🔵 SweetAlert didOpen เรียก! (Delete Menu)');
        const container = document.querySelector('.swal2-container');
        const popup = document.querySelector('.swal2-popup');
        const actions = document.querySelector('.swal2-actions');
        const confirmBtn = document.querySelector('.swal2-confirm');
        const cancelBtn = document.querySelector('.swal2-cancel');

        console.log('Element found:', { container: !!container, popup: !!popup, actions: !!actions, confirmBtn: !!confirmBtn, cancelBtn: !!cancelBtn });

        if (container) {
          (container as HTMLElement).style.zIndex = '99999';
          (container as HTMLElement).style.pointerEvents = 'auto';
        }
        if (popup) {
          (popup as HTMLElement).style.zIndex = '100000';
          (popup as HTMLElement).style.pointerEvents = 'auto';
        }
        if (actions) {
          (actions as HTMLElement).style.zIndex = '100001';
          (actions as HTMLElement).style.pointerEvents = 'auto';
        }
        if (confirmBtn) {
          (confirmBtn as HTMLElement).style.zIndex = '100002';
          (confirmBtn as HTMLElement).style.pointerEvents = 'auto';
        }
        if (cancelBtn) {
          (cancelBtn as HTMLElement).style.zIndex = '100002';
          (cancelBtn as HTMLElement).style.pointerEvents = 'auto';
        }
      }
    }).then((result) => {
      console.log('🟣 SweetAlert result (Delete Menu):', result);
      if (result.isConfirmed) {
        console.log('✅ ผู้ใช้ยืนยันการลบเมนู!');
        console.log('🔧 กำลังเรียก setEditMenuDialog... (Delete Menu)');

        setEditMenuDialog((prev) => {
          console.log('🔧 setEditMenuDialog callback ถูกเรียก! (Delete Menu) prev:', prev);
          if (!prev) {
            console.log('❌ prev is null, returning... (Delete Menu)');
            return prev;
          }

          // Check if menu exists and its total count
          const menuItem = prev.menuItems.find(m => m.menu_name === menuName);
          let updatedMenuItems;

          if (menuItem && menuItem.menu_total > 1) {
            // Decrease menu_total by 1
            updatedMenuItems = prev.menuItems.map(m =>
              m.menu_name === menuName
                ? { ...m, menu_total: m.menu_total - 1 }
                : m
            );
            console.log(`📝 ลด menu_total ของ "${menuName}" จาก ${menuItem.menu_total} เป็น ${menuItem.menu_total - 1}`);
          } else {
            // Remove menu completely if menu_total is 1 or not found
            updatedMenuItems = prev.menuItems.filter(m => m.menu_name !== menuName);
            console.log(`📝 ลบเมนู "${menuName}" ออกจาก menuItems ทั้งหมด`);
          }

          // คำนวณราคาใหม่หลังลบเมนู
          const key = `${prev.cart_lunchbox[lunchboxIdx].lunchbox_name}_${prev.cart_lunchbox[lunchboxIdx].lunchbox_set_name}_${lunchboxIdx}`;
          const menusForThisBox = availableMenusForLunchbox[key] || [];

          const updatedState = {
            ...prev,
            cart_lunchbox: prev.cart_lunchbox.map((lb, idx) => {
              if (idx === lunchboxIdx) {
                const updatedMenus = (lb.lunchbox_menu || []).filter((_, mIdx) => mIdx !== menuIdx);
                const newCost = calculateLunchboxCost(updatedMenus, lb.lunchbox_total, menusForThisBox);
                console.log(`💰 คำนวณราคาใหม่หลังลบ: ${newCost} บาท (เมนู ${updatedMenus.length} รายการ × ${lb.lunchbox_total} กล่อง)`);
                return {
                  ...lb,
                  lunchbox_menu: updatedMenus,
                  lunchbox_total_cost: newCost
                };
              }
              return lb;
            }),
            menuItems: updatedMenuItems,
          };

          console.log('✨ After delete menu:', {
            lunchboxIdx,
            menuIdx,
            menuName,
            remainingMenusInLunchbox: updatedState.cart_lunchbox[lunchboxIdx]?.lunchbox_menu?.length || 0,
            totalMenuItems: updatedState.menuItems.length,
            newState: updatedState
          });

          return updatedState;
        });

        console.log('🔧 setEditMenuDialog เรียกเสร็จแล้ว! (Delete Menu)');

        Swal.fire({
          icon: "success",
          title: "ลบแล้ว!",
          text: "เมนูถูกลบเรียบร้อยแล้ว",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          setIsDeleting(false); // Reset flag after success dialog
        });
      } else {
        setIsDeleting(false); // Reset flag if cancelled
      }
    });
  };

  const handleEdit = {
    Menu: async (cartId: string, menuItems: MenuItem[], updatedLunchboxes?: any[]) => {
      if (!cartId || !menuItems || !Array.isArray(menuItems) || menuItems.some((m) => !m.menu_name || m.menu_total < 0 || !Array.isArray(m.menu_ingredients) || m.menu_ingredients.some((ing) => !ing.ingredient_name || ing.useItem < 0))) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "กรุณาระบุเมนูและจำนวนกล่องที่ถูกต้อง",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      // console.log("Sending menuItems to API:", JSON.stringify(menuItems, null, 2));

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

        const MenusMap = new globalThis.Map<String, MenuItem>();
        menuItems.forEach((item) => {
          MenusMap.set(item.menu_name, item);
        });
        const updatedMenuItems = menuItems.map((item) => {
          // Use menu_ingredients from the item that was edited by the user
          const menuIngredients = (item.menu_ingredients || []).map((ing: { useItem?: number; quantity?: number; ingredient_name?: string; name?: string; ingredient_status?: boolean }) => {
            const ingredientName = ing.ingredient_name ?? ing.name ?? "ไม่ระบุวัตถุดิบ";
            return {
              useItem: ing.useItem ?? ing.quantity ?? 0,
              ingredient_name: ingredientName,
              ingredient_status: ing.ingredient_status ?? false,
            };
          });

          if (!menuIngredients.every((ing: { ingredient_name: string; useItem: number }) => ing.ingredient_name && ing.useItem >= 0)) {
            throw new Error(`Invalid ingredients for menu: ${item.menu_name}`);
          }

          return {
            menu_name: item.menu_name,
            menu_subname: item.menu_subname,
            menu_category: item.menu_category,
            menu_total: item.menu_total,
            menu_ingredients: menuIngredients,
            menu_description: item.menu_description || "",
          };
        });

        // console.log("[Save] PATCH /api/edit/cart-menu/summary-list", {
        //   url: `/api/edit/cart-menu/summary-list/${cartId}`,
        //   body: { menuItems: updatedMenuItems },
        // });

        const response = await fetch(`/api/edit/cart-menu/summary-list/${cartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuItems: updatedMenuItems }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update menu");
        }

        // Sync cart document via general cart edit endpoint
        // Build lunchbox structure from menuItems
        const foundCart = carts.find((cart) => cart.id === cartId);
        const lunchboxesToUse = updatedLunchboxes || foundCart?.cart_lunchbox || [];
        const cart_lunchboxes = lunchboxesToUse.map((lunchbox: any) => ({
          lunchbox_name: lunchbox.lunchbox_name,
          lunchbox_set: lunchbox.lunchbox_set_name,
          lunchbox_limit: lunchbox.lunchbox_limit || 0,
          lunchbox_quantity: lunchbox.lunchbox_total || 0,
          lunchbox_total_cost: lunchbox.lunchbox_total_cost || 0,
          // Use only menus from this specific lunchbox
          lunchbox_menus: (lunchbox.lunchbox_menu || []).map((menu: any) => ({
            menu_name: menu.menu_name,
            menu_subname: menu.menu_subname,
            menu_category: menu.menu_category,
            menu_total: menu.menu_total,
            menu_description: menu.menu_description,
            menu_ingredients: menu.menu_ingredients,
          })),
        }));

        // console.log("[Save] PATCH /api/edit/cart", {
        //   url: `/api/edit/cart/${cartId}`,
        //   body: { cart_lunchboxes },
        // });
        // console.log("[Save] Updated Menu Items with Ingredients:", JSON.stringify(updatedMenuItems, null, 2));
        try {
          await fetch(`/api/edit/cart/${cartId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart_lunchboxes }),
          });
        } catch (syncErr) {
          console.warn("Warning: secondary sync to /api/edit/cart failed", syncErr);
        }

        setCarts((prevCarts) =>
          prevCarts.map((cart) =>
            cart.id === cartId
              ? {
                ...cart,
                menuItems: updatedMenuItems,
                cart_lunchbox: lunchboxesToUse as any,
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
        setAvailableMenusForLunchbox({});  // Clear เมนูที่โหลดไว้
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
    },
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
            <Button onClick={() => handleExport("csv")} className='h-12 w-full flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg px-4 py-2 text-sm'>
              <Download className='w-4 h-4 mr-2' /> CSV
            </Button>
            <Button onClick={() => handleExport("pdf")} className='h-12 w-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg px-4 py-2 text-sm'>
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
                        <Card className={`bg-gradient-to-r ${getStatus("color", cart.status)} p-4 rounded-xl shadow-sm`}>
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
                                    {/* <Edit2 className='w-4 h-4' /> */}
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
                                <div className='flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base'>
                                  <div className='flex items-center gap-1'>
                                    <Package className='w-4 h-4' />
                                    <span>จำนวนทั้งหมด {cart.sets} กล่อง</span>
                                  </div>
                                  <div className='flex items-center gap-1'>
                                    <Wallet className='w-4 h-4 text-green-400' />
                                    <span>ราคาอาหาร {(() => {
                                      // คำนวณราคาอาหารจากผลรวม lunchbox_total_cost
                                      const foodPrice = cart.cart_lunchbox && cart.cart_lunchbox.length > 0
                                        ? cart.cart_lunchbox.reduce((sum, lunchbox) => sum + (Number(lunchbox.lunchbox_total_cost) || 0), 0)
                                        : cart.price || 0;
                                      return foodPrice.toLocaleString("th-TH");
                                    })()} บาท</span>
                                  </div>
                                  <div className='flex items-center gap-1'>
                                    <Container className='w-4 h-4 text-blue-500' />
                                    <span>ค่าจัดส่ง {Number(cart.cart_shipping_cost || 0).toLocaleString("th-TH")} บาท</span>
                                  </div>
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
                              <div className='hidden items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] sm:text-xs text-gray-500'>
                                <ResponsiveOrderId id={cart.id} maxFontSize={10} minFontSize={10} />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className='flex justify-center mt-2'>
                            <StatusDropdown
                              cartId={cart.id}
                              allIngredients={cart.allIngredients}
                              defaultStatus={cart.status}
                              cart_receive_time={Time.formatToHHMM(cart.cart_receive_time)}
                              cart_export_time={Time.formatToHHMM(cart.cart_export_time)}
                              cart={cart}
                              onUpdated={() => handleUpdateWithCheck(cart)}
                              onOrderSummaryClick={() => handleSummary("order", cart)}
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
                                      onClick={async () => {
                                        setShouldFetchMenu(true);
                                        const currentCart = carts.find((c) => c.id === cart.id);
                                        if (!currentCart) {
                                          Swal.fire({
                                            icon: "error",
                                            title: "เกิดข้อผิดพลาด",
                                            text: "ไม่พบข้อมูลออร์เดอร์",
                                            showConfirmButton: false,
                                            timer: 3000,
                                          });
                                          return;
                                        }

                                        // Extract menuItems from cart_lunchbox
                                        const menuItemsFromLunchbox: any[] = [];
                                        (cart.cart_lunchbox || []).forEach((lunchbox: any) => {
                                          (lunchbox.lunchbox_menu || []).forEach((menu: any) => {
                                            menuItemsFromLunchbox.push({
                                              menu_name: menu.menu_name || "เมนูไม่ระบุ",
                                              menu_category: menu.menu_category || "",
                                              menu_subname: menu.menu_subname || "",
                                              menu_total: menu.menu_total || 0,
                                              menu_order_id: menu.menu_order_id || 0,
                                              menu_description: menu.menu_description || "",
                                              menu_ingredients: Array.isArray(menu.menu_ingredients)
                                                ? menu.menu_ingredients.map((ing: any) => ({
                                                  useItem: ing.useItem ?? 0,
                                                  ingredient_name: ing.ingredient_name ?? "ไม่ระบุวัตถุดิบ",
                                                  ingredient_status: ing.ingredient_status ?? false,
                                                }))
                                                : [],
                                            });
                                          });
                                        });

                                        setEditMenuDialog({
                                          cart_id: cart.id,
                                          cart_delivery_date: cart.cart_delivery_date || "",
                                          cart_receive_time: cart.cart_receive_time || "",
                                          cart_export_time: cart.cart_export_time || "",
                                          cart_customer_tel: cart.cart_customer_tel || "",
                                          cart_customer_name: cart.cart_customer_name || "",
                                          cart_location_send: cart.cart_location_send || "",
                                          cart_shipping_cost: Number(cart.cart_shipping_cost) || 0,
                                          cart_lunchbox: (cart.cart_lunchbox || []) as any,
                                          menuItems: menuItemsFromLunchbox,
                                          newMenu: {
                                            menu_name: "",
                                            menu_total: 1,
                                            menu_description: "",
                                          },
                                        });

                                        // Fetch lunchboxes and menus
                                        await fetchLunchboxesAndMenus();
                                      }}
                                      className='flex items-center gap-2'>
                                      แก้ไขเมนูที่สั่ง
                                      <Edit2 className='w-4 h-4' />
                                    </Button>
                                  </div>
                                </div>
                                <Dialog
                                  open={editMenuDialog !== null}
                                  onOpenChange={(open) => {
                                    console.log('📢 Dialog onOpenChange เรียก! open:', open, 'isDeleting:', isDeleting, 'editMenuDialog:', editMenuDialog);
                                    // Only reset when explicitly closing (not when SweetAlert shows or deleting)
                                    if (!open && editMenuDialog !== null && !isDeleting) {
                                      console.log('🔒 กำลัง reset editMenuDialog...');
                                      setEditMenuDialog(null);
                                      setShouldFetchMenu(false);
                                      setSelectedLunchboxName("");
                                      setSelectedLunchboxSet("");
                                      setPreviewLunchbox(null);
                                      setAvailableMenusForLunchbox({});  // Clear เมนูที่โหลดไว้
                                    } else {
                                      console.log('⛔ ไม่ reset เพราะ: open =', open, ', isDeleting =', isDeleting, ', editMenuDialog =', editMenuDialog);
                                    }
                                  }}>
                                  <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                                    <DialogTitle>
                                      {editMenuDialog && (
                                        <div className='space-y-6'>
                                          <div style={{ color: "#000000" }} className='text-xl font-bold mb-4'>
                                            แก้ไขเมนูสำหรับออร์เดอร์ {editMenuDialog?.cart_id}
                                          </div>
                                          <div style={{ color: "#000000" }} className='bg-gray-100 p-4 rounded-lg'>
                                            <h3 className='font-semibold text-gray-800 mb-2'>ข้อมูลลูกค้า</h3>
                                            <div className='grid grid-cols-2 gap-4 text-sm'>
                                              <div>
                                                <span className='font-medium'>ชื่อ:</span> {editMenuDialog.cart_customer_name}
                                              </div>
                                              <div>
                                                <span className='font-medium'>เบอร์โทร:</span> {editMenuDialog.cart_customer_tel}
                                              </div>
                                              <div>
                                                <span className='font-medium'>สถานที่ส่ง:</span> {editMenuDialog.cart_location_send}
                                              </div>
                                              <div>
                                                <span className='font-medium'>ค่าจัดส่ง:</span> {editMenuDialog.cart_shipping_cost} บาท
                                              </div>
                                              <div>
                                                <span className='font-medium'>วันที่ส่ง:</span> {editMenuDialog.cart_delivery_date}
                                              </div>
                                              <div>
                                                <span className='font-medium'>เวลาส่ง/รับ:</span> {editMenuDialog.cart_export_time} / {editMenuDialog.cart_receive_time}
                                              </div>
                                            </div>
                                          </div>

                                          {/* แสดงข้อมูล cart_lunchbox */}
                                          <div className='space-y-4'>
                                            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                              <h3 className='font-semibold text-gray-800 mb-3'>🍱 เพิ่มกล่องอาหาร</h3>

                                              <div className='grid grid-cols-2 gap-3 mb-3'>
                                                <div className='flex flex-col gap-1'>
                                                  <label className='text-sm font-medium text-gray-700'>ชื่อโปรโมชั่นอาหาร</label>
                                                  <select
                                                    value={selectedLunchboxName}
                                                    onChange={(e) => {
                                                      setSelectedLunchboxName(e.target.value);
                                                      setSelectedLunchboxSet(""); // Reset set when name changes
                                                    }}
                                                    className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                                    <option value="">เลือกโปรโมชั่นอาหาร</option>
                                                    {[...new Set(availableLunchboxes.map(item => item.lunchbox_name))].map((name, idx) => (
                                                      <option key={idx} value={name}>
                                                        {name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>

                                                <div className='flex flex-col gap-1'>
                                                  <label className='text-sm font-medium text-gray-700'>ชื่อเซทอาหาร</label>
                                                  <select
                                                    value={selectedLunchboxSet}
                                                    onChange={(e) => setSelectedLunchboxSet(e.target.value)}
                                                    disabled={!selectedLunchboxName || availableLunchboxSets.length === 0}
                                                    className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'>
                                                    <option value="">{selectedLunchboxName ? "เลือกเซทอาหาร" : "กรุณาเลือกโปรโมชั่นก่อน"}</option>
                                                    {availableLunchboxSets.map((set, idx) => (
                                                      <option key={idx} value={set}>
                                                        {set}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                              </div>

                                              {/* Preview Lunchbox */}
                                              {previewLunchbox && (
                                                <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                                  <h4 className='text-sm font-semibold text-blue-800 mb-2'>
                                                    {previewLunchbox.lunchbox_name} - {previewLunchbox.lunchbox_set_name}
                                                  </h4>
                                                  <p className='text-xs text-blue-600'>
                                                    เลือกได้ {previewLunchbox.lunchbox_limit} อย่าง
                                                  </p>
                                                </div>
                                              )}

                                              <Button
                                                type="button"
                                                size="sm"
                                                className='w-full bg-green-600 hover:bg-green-700 text-white'
                                                onClick={handleAddLunchbox}
                                                disabled={!selectedLunchboxName || !selectedLunchboxSet}>
                                                <Container className='w-4 h-4 mr-1' />
                                                ➕ เพิ่มกล่องอาหาร
                                              </Button>
                                            </div>

                                            {editMenuDialog.cart_lunchbox && editMenuDialog.cart_lunchbox.length > 0 && (
                                              <>
                                                <h3 className='font-semibold text-gray-800'>ข้อมูลกล่องอาหารที่เลือก</h3>
                                                <br />
                                                {editMenuDialog.cart_lunchbox.map((lunchbox, lunchboxIdx) => (
                                                  <div key={`${lunchbox.lunchbox_name}-${lunchbox.lunchbox_set_name}-${lunchboxIdx}`} className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                                                    <div className='flex justify-between items-start mb-3'>
                                                      <div className='flex-1'>
                                                        <div className='flex justify-between items-center mb-3'>
                                                          <h4 className='font-semibold text-blue-800'>
                                                            {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set_name}
                                                          </h4>
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                              console.log('🔴 ปุ่มลบกล่องถูกคลิก! Index:', lunchboxIdx);
                                                              handleRemoveLunchbox(lunchboxIdx);
                                                            }}>
                                                            ลบกล่อง
                                                          </Button>
                                                        </div>
                                                        <div className='grid grid-cols-3 gap-4'>
                                                          {/* จำนวนกล่อง */}
                                                          <div>
                                                            <label className='block text-xs font-medium text-blue-700 mb-1'>จำนวน (กล่อง)</label>
                                                            <input
                                                              type='number'
                                                              min={0}
                                                              className='w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                              value={lunchbox.lunchbox_total}
                                                              onChange={(e) => {
                                                                const newTotal = Number(e.target.value) || 0;
                                                                setEditMenuDialog((prev) => {
                                                                  if (!prev) return prev;

                                                                  // คำนวณราคาจากผลรวมเมนู × จำนวนกล่อง
                                                                  const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${lunchboxIdx}`;
                                                                  const menusForThisBox = availableMenusForLunchbox[key] || [];
                                                                  const newTotalCost = calculateLunchboxCost(lunchbox.lunchbox_menu || [], newTotal, menusForThisBox);

                                                                  console.log(`💰 เปลี่ยนจำนวนกล่อง: ${lunchbox.lunchbox_total} → ${newTotal}, ราคาใหม่: ${newTotalCost} บาท`);

                                                                  // อัปเดต cart_lunchbox และ menu_total ของเมนูทั้งหมดใน lunchbox นี้
                                                                  const updatedCartLunchbox = prev.cart_lunchbox.map((lb, idx) => {
                                                                    if (idx === lunchboxIdx) {
                                                                      return {
                                                                        ...lb,
                                                                        lunchbox_total: newTotal,
                                                                        lunchbox_total_cost: newTotalCost,
                                                                        lunchbox_menu: (lb.lunchbox_menu || []).map(menu => ({
                                                                          ...menu,
                                                                          menu_total: newTotal  // อัปเดต menu_total ของทุกเมนูให้เท่ากับ lunchbox_total
                                                                        }))
                                                                      };
                                                                    }
                                                                    return lb;
                                                                  });

                                                                  // อัปเดต menuItems ที่เกี่ยวข้องด้วย
                                                                  const updatedMenuItems = prev.menuItems.map(menuItem => {
                                                                    // ตรวจสอบว่าเมนูนี้อยู่ใน lunchbox ที่กำลังแก้ไขหรือไม่
                                                                    const isInThisLunchbox = lunchbox.lunchbox_menu?.some(
                                                                      lbMenu => lbMenu.menu_name === menuItem.menu_name
                                                                    );

                                                                    if (isInThisLunchbox) {
                                                                      return {
                                                                        ...menuItem,
                                                                        menu_total: newTotal
                                                                      };
                                                                    }
                                                                    return menuItem;
                                                                  });

                                                                  return {
                                                                    ...prev,
                                                                    cart_lunchbox: updatedCartLunchbox,
                                                                    menuItems: updatedMenuItems
                                                                  };
                                                                });
                                                              }}
                                                            />
                                                          </div>

                                                          {/* ราคา (readonly) */}
                                                          <div>
                                                            <label className='block text-xs font-medium text-blue-700 mb-1'>ราคา (บาท)</label>
                                                            <input
                                                              type='number'
                                                              min={0}
                                                              className='w-full px-3 py-2 border border-blue-300 rounded-md text-sm bg-gray-100 cursor-not-allowed'
                                                              value={lunchbox.lunchbox_total_cost}
                                                              readOnly
                                                            />
                                                          </div>

                                                          {/* จำกัด (readonly) */}
                                                          <div>
                                                            <label className='block text-xs font-medium text-blue-700 mb-1'>จำกัด (กล่อง)</label>
                                                            <input
                                                              type='number'
                                                              min={0}
                                                              className='w-full px-3 py-2 border border-blue-300 rounded-md text-sm bg-gray-100 cursor-not-allowed'
                                                              value={lunchbox.lunchbox_limit}
                                                              readOnly
                                                            />
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className='mt-3'>
                                                      <div className='flex justify-between items-center mb-2'>
                                                        <div>
                                                          <h5 className='font-medium text-blue-800'>เมนูในกล่อง:</h5>
                                                          <p className='text-xs text-gray-600 mt-1'>
                                                            เลือกแล้ว {lunchbox.lunchbox_menu?.length || 0}/{lunchbox.lunchbox_limit} เมนู
                                                          </p>
                                                        </div>

                                                        {/* ปุ่มเพิ่มเมนู */}
                                                        <div className='flex items-center gap-2'>
                                                          <select
                                                            className='px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                                                            value={selectedMenuForLunchbox[lunchboxIdx] || ""}
                                                            disabled={(lunchbox.lunchbox_menu?.length || 0) >= lunchbox.lunchbox_limit}
                                                            onFocus={async () => {
                                                              // ดึงเมนูสำหรับกล่องนี้เมื่อเปิด dropdown
                                                              await fetchMenusForLunchbox(lunchbox.lunchbox_name, lunchbox.lunchbox_set_name, lunchboxIdx);
                                                            }}
                                                            onChange={(e) => {
                                                              console.log('🔵 เลือกเมนู! lunchboxIdx:', lunchboxIdx, 'value:', e.target.value);
                                                              setSelectedMenuForLunchbox(prev => ({
                                                                ...prev,
                                                                [lunchboxIdx]: e.target.value
                                                              }));
                                                            }}>
                                                            {(() => {
                                                              const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${lunchboxIdx}`;
                                                              const menusForThisBox = availableMenusForLunchbox[key] || [];

                                                              // ตรวจสอบจำนวนเมนูที่เลือกแล้ว vs limit
                                                              const currentMenuCount = lunchbox.lunchbox_menu?.length || 0;
                                                              const lunchboxLimit = lunchbox.lunchbox_limit || 0;
                                                              const isFull = currentMenuCount >= lunchboxLimit;

                                                              if (isFull) {
                                                                return <option value="" disabled>เลือกครบแล้ว ({currentMenuCount}/{lunchboxLimit} เมนู)</option>;
                                                              }

                                                              // สร้าง Map ของ categories ที่เลือกไปแล้ว
                                                              const selectedCategories = new Set<string>();
                                                              lunchbox.lunchbox_menu?.forEach((selectedMenu: any) => {
                                                                // หาข้อมูลเมนูจาก availableMenusForLunchbox เพื่อดึง category
                                                                const menuData = menusForThisBox.find((m: any) => m.menu_name === selectedMenu.menu_name);
                                                                if (menuData?.lunchbox_menu_category) {
                                                                  selectedCategories.add(menuData.lunchbox_menu_category);
                                                                }
                                                              });

                                                              console.log('🔍 Dropdown Render - lunchboxIdx:', lunchboxIdx);
                                                              console.log('🔍 Menu count:', currentMenuCount, '/', lunchboxLimit);
                                                              console.log('🔍 Selected categories:', Array.from(selectedCategories));
                                                              console.log('🔍 Available menus:', menusForThisBox.map((m: any) => `${m.menu_name} (${m.lunchbox_menu_category || 'no category'})`));

                                                              const filteredMenus = menusForThisBox.filter((menu: any) => {
                                                                // ตรวจสอบว่า category นี้ถูกเลือกไปแล้วหรือไม่
                                                                const menuCategory = menu.lunchbox_menu_category;
                                                                const isCategorySelected = menuCategory && selectedCategories.has(menuCategory);

                                                                console.log(`🔍 Menu "${menu.menu_name}" (${menuCategory}): category selected = ${isCategorySelected}`);
                                                                return !isCategorySelected;
                                                              });

                                                              console.log('🔍 Filtered menus:', filteredMenus.map((m: any) => m.menu_name));

                                                              if (filteredMenus.length === 0) {
                                                                return <option value="" disabled>ไม่มีเมนูให้เลือก</option>;
                                                              }

                                                              return (
                                                                <>
                                                                  <option value="" disabled>เลือกเมนู</option>
                                                                  {filteredMenus.map((menu: any, idx: number) => {
                                                                    // หา original index จาก menusForThisBox
                                                                    const originalIdx = menusForThisBox.findIndex((m: any) =>
                                                                      m.menu_name === menu.menu_name &&
                                                                      m.menu_subname === menu.menu_subname
                                                                    );
                                                                    return (
                                                                      <option key={idx} value={originalIdx}>
                                                                        {menu.menu_name} {menu.menu_subname ? `(${menu.menu_subname})` : ''}
                                                                      </option>
                                                                    );
                                                                  })}
                                                                </>
                                                              );
                                                            })()}
                                                          </select>
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            className='bg-green-600 hover:bg-green-700 text-white text-xs'
                                                            disabled={(lunchbox.lunchbox_menu?.length || 0) >= lunchbox.lunchbox_limit}
                                                            onClick={() => {
                                                              const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${lunchboxIdx}`;
                                                              const menusForThisBox = availableMenusForLunchbox[key] || [];

                                                              console.log('🔵 กดปุ่มเพิ่มเมนู! lunchboxIdx:', lunchboxIdx);
                                                              console.log('🔵 menusForThisBox:', menusForThisBox);
                                                              console.log('🔵 selectedMenuForLunchbox:', selectedMenuForLunchbox);
                                                              console.log('🔵 selected value for this lunchbox:', selectedMenuForLunchbox[lunchboxIdx]);

                                                              if (menusForThisBox.length === 0) {
                                                                Swal.fire({
                                                                  icon: "warning",
                                                                  title: "ไม่พบเมนูที่สามารถเพิ่มได้",
                                                                  text: "กรุณาคลิกที่ช่องเลือกเมนูเพื่อโหลดรายการเมนู",
                                                                  showConfirmButton: false,
                                                                  timer: 2000,
                                                                });
                                                                return;
                                                              }

                                                              const selectedValue = selectedMenuForLunchbox[lunchboxIdx];
                                                              if (selectedValue && selectedValue !== "") {
                                                                const selectedIdx = parseInt(selectedValue);
                                                                console.log('🔵 selectedIdx:', selectedIdx);
                                                                if (!isNaN(selectedIdx) && selectedIdx >= 0 && selectedIdx < menusForThisBox.length) {
                                                                  console.log('🔵 กำลังเพิ่มเมนู:', menusForThisBox[selectedIdx]);
                                                                  handleAddMenuToLunchbox(lunchboxIdx, menusForThisBox[selectedIdx]);
                                                                  // Clear selection after adding
                                                                  setSelectedMenuForLunchbox(prev => ({
                                                                    ...prev,
                                                                    [lunchboxIdx]: ""
                                                                  }));
                                                                } else {
                                                                  console.log('❌ selectedIdx ไม่ถูกต้อง!');
                                                                  Swal.fire({
                                                                    icon: "error",
                                                                    title: "เกิดข้อผิดพลาด",
                                                                    text: "ไม่สามารถเพิ่มเมนูได้",
                                                                    showConfirmButton: false,
                                                                    timer: 2000,
                                                                  });
                                                                }
                                                              } else {
                                                                console.log('❌ ยังไม่ได้เลือกเมนู!');
                                                                Swal.fire({
                                                                  icon: "warning",
                                                                  title: "กรุณาเลือกเมนู",
                                                                  showConfirmButton: false,
                                                                  timer: 2000,
                                                                });
                                                              }
                                                            }}>
                                                            + เพิ่มเมนู
                                                          </Button>
                                                        </div>
                                                      </div>
                                                      <div className='space-y-2'>
                                                        {lunchbox.lunchbox_menu.map((menu, menuIdx) => (
                                                          <div key={`${menu.menu_name}-${menu.menu_order_id}-${lunchboxIdx}-${menuIdx}`} className='bg-white p-3 rounded border'>
                                                            <div className='flex justify-between items-start mb-2'>
                                                              <div className='flex-1'>
                                                                <div className='font-medium text-gray-800'>
                                                                  {menu.menu_name} ({menu.menu_subname})
                                                                </div>
                                                                <div className='text-sm text-gray-600'>
                                                                  หมวดหมู่: {menu.menu_category}
                                                                </div>
                                                              </div>
                                                              <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                className='text-red-600 hover:text-red-800 hover:bg-red-50'
                                                                onClick={() => {
                                                                  console.log('🔴 ปุ่มลบเมนูถูกคลิก!', { lunchboxIdx, menuIdx, menuName: menu.menu_name });
                                                                  handleRemoveMenuFromLunchbox(lunchboxIdx, menuIdx, menu.menu_name);
                                                                }}>
                                                                ลบ
                                                              </Button>
                                                            </div>
                                                            <div className='text-sm text-gray-500 mt-2'>
                                                              <label className='block text-xs text-gray-600 mb-1'>คำอธิบายเมนู</label>
                                                              {(() => {
                                                                const editableItem = editMenuDialog.menuItems.find((m) => m.menu_name === menu.menu_name);
                                                                const valueDesc = editableItem?.menu_description ?? menu.menu_description ?? "";
                                                                return (
                                                                  <input
                                                                    type='text'
                                                                    className='w-full h-8 px-2 border rounded'
                                                                    placeholder='ระบุคำอธิบายเมนู'
                                                                    value={valueDesc}
                                                                    onChange={(e) => {
                                                                      const newDesc = e.target.value;
                                                                      setEditMenuDialog((prev) => {
                                                                        if (!prev) return prev;
                                                                        return {
                                                                          ...prev,
                                                                          menuItems: prev.menuItems.map((mi) =>
                                                                            mi.menu_name === menu.menu_name ? { ...mi, menu_description: newDesc } : mi
                                                                          ),
                                                                        };
                                                                      });
                                                                    }}
                                                                  />
                                                                );
                                                              })()}
                                                            </div>

                                                            {/* แก้ไขจำนวนกล่องของเมนู */}
                                                            <div className='mt-2 flex items-center gap-2'>
                                                              <span className='text-sm text-gray-700'>จำนวนกล่อง:</span>
                                                              {(() => {
                                                                const editableItem = editMenuDialog.menuItems.find((m) => m.menu_name === menu.menu_name);
                                                                const valueTotal = editableItem?.menu_total ?? menu.menu_total ?? 0;
                                                                return (
                                                                  <input
                                                                    type='number'
                                                                    min={0}
                                                                    className='w-24 h-8 px-2 border rounded'
                                                                    value={valueTotal}
                                                                    onChange={(e) => {
                                                                      const newVal = Number(e.target.value) || 0;
                                                                      setEditMenuDialog((prev) => {
                                                                        if (!prev) return prev;
                                                                        return {
                                                                          ...prev,
                                                                          menuItems: prev.menuItems.map((mi) =>
                                                                            mi.menu_name === menu.menu_name ? { ...mi, menu_total: newVal } : mi
                                                                          ),
                                                                        };
                                                                      });
                                                                    }}
                                                                  />
                                                                );
                                                              })()}
                                                            </div>

                                                            {/* แก้ไขจำนวนวัตถุดิบ */}
                                                            <AccordionContent className='pt-3 space-y-2'>
                                                              {menu.menu_ingredients?.map((ing, idx) => (
                                                                <div
                                                                  key={idx}
                                                                  className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.ingredient_status ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} text-sm`}
                                                                >
                                                                  <span className='text-gray-700'>{ing.ingredient_name || `Unknown ingredient`}</span>

                                                                  <div className='flex items-center gap-4'>
                                                                    <span className='text-gray-600'>
                                                                      ใช้ <input
                                                                        type='number'
                                                                        min={0}
                                                                        className='w-20 h-7 px-2 border rounded text-mi'
                                                                        value={ing.useItem ?? 0}
                                                                        onChange={(e) => {
                                                                          const newUse = Number(e.target.value) || 0;
                                                                          setEditMenuDialog((prev) => {
                                                                            if (!prev) return prev;
                                                                            return {
                                                                              ...prev,
                                                                              menuItems: prev.menuItems.map((mi) =>
                                                                                mi.menu_name === menu.menu_name
                                                                                  ? {
                                                                                    ...mi,
                                                                                    menu_ingredients: mi.menu_ingredients.map((ing) =>
                                                                                      ing.ingredient_name === ing.ingredient_name
                                                                                        ? { ...ing, useItem: newUse }
                                                                                        : ing
                                                                                    ),
                                                                                  }
                                                                                  : mi
                                                                              ),
                                                                            };
                                                                          });
                                                                        }}
                                                                      /> {ing.ingredient_unit || 'หน่วย'} × {menu.menu_total} กล่อง ={" "}
                                                                      <strong className='text-black-600' style={{ color: "#000000" }}>
                                                                        {ing.useItem * menu.menu_total}
                                                                      </strong>{" "}
                                                                      {ing.ingredient_unit || 'หน่วย'}
                                                                    </span>
                                                                  </div>
                                                                </div>
                                                              ))}
                                                            </AccordionContent>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </>
                                            )}
                                          </div>


                                          {/* ปุ่มควบคุม */}
                                          <div className='flex justify-end gap-2 pt-4 border-t'>
                                            <Button
                                              variant='outline'
                                              onClick={() => {
                                                setEditMenuDialog(null);
                                                setShouldFetchMenu(false);
                                                setSelectedLunchboxName("");
                                                setSelectedLunchboxSet("");
                                                setPreviewLunchbox(null);
                                                setAvailableMenusForLunchbox({});  // Clear เมนูที่โหลดไว้
                                                setIsDeleting(false); // Reset flag when closing dialog
                                              }}
                                            >
                                              ยกเลิก
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                // เรียกใช้ฟังก์ชัน handleEdit.Menu
                                                if (editMenuDialog) {
                                                  handleEdit.Menu(editMenuDialog.cart_id, editMenuDialog.menuItems, editMenuDialog.cart_lunchbox);
                                                }
                                              }}
                                              disabled={isSaving !== null}
                                            >
                                              {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogTitle>
                                  </DialogContent>
                                </Dialog>
                                <Accordion type='multiple' className='space-y-3'>
                                  {cart.cart_lunchbox && cart.cart_lunchbox.length > 0 ? (
                                    cart.cart_lunchbox.map((lunchbox, lunchboxIdx) => (
                                      <AccordionItem
                                        key={lunchboxIdx}
                                        value={`lunchbox-${lunchboxIdx}`}
                                        className="rounded-xl border border-blue-200 shadow-sm px-4 py-3 bg-blue-50"
                                      >
                                        <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                          <div className='flex flex-col items-start'>
                                            <span className='truncate text-sm text-blue-800 font-bold'>
                                              📦 {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set_name}
                                            </span>
                                            <span className='truncate text-xs text-blue-600 mt-1'>
                                              จำนวน: {lunchbox.lunchbox_total} กล่อง | ราคา: {lunchbox.lunchbox_total_cost} บาท
                                            </span>
                                          </div>
                                        </AccordionTrigger>

                                        <AccordionContent className='pt-3 space-y-3'>
                                          {lunchbox.lunchbox_menu.map((menu, menuIdx) => {
                                            const allIngredientsChecked = menu.menu_ingredients?.every((ing) => ing.ingredient_status) ?? false;

                                            return (
                                              <AccordionItem
                                                key={menuIdx}
                                                value={`menu-${lunchboxIdx}-${menuIdx}`}
                                                className={`rounded-lg border border-slate-200 shadow-sm px-3 py-2 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                                              >
                                                <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                                  <div className='flex flex-col items-start'>
                                                    <span className='truncate text-sm text-gray-700 font-medium'>
                                                      {menu.menu_name} {menu.menu_subname && `(${menu.menu_subname})`}
                                                    </span>
                                                    <span className='truncate text-xs text-gray-500 mt-1'>
                                                      หมวดหมู่: {menu.menu_category} | จำนวน: {menu.menu_total} กล่อง
                                                    </span>
                                                    {menu.menu_description && (
                                                      <span className='truncate text-xs text-gray-400 mt-1'>
                                                        {menu.menu_description}
                                                      </span>
                                                    )}
                                                  </div>
                                                </AccordionTrigger>
                                                {/* แสดงผลวัตถุดิบ */}
                                                <AccordionContent className='pt-3 space-y-2'>
                                                  <div className='mt-3'>
                                                    <h6 className='text-xs font-medium text-gray-700 mb-1'>วัตถุดิบ:</h6>
                                                    <div className='space-y-1'>
                                                      {(() => {
                                                        const editableItem = editMenuDialog?.menuItems.find((m) => m.menu_name === menu.menu_name);
                                                        const ingredients = editableItem?.menu_ingredients ?? menu.menu_ingredients;
                                                        return ingredients.map((ingredient, ingIdx) => (
                                                          <div key={`${ingredient.ingredient_name}-${lunchboxIdx}-${menuIdx}-${ingIdx}`} className='flex items-center justify-between text-xs text-gray-600'>
                                                            <span>• {ingredient.ingredient_name}</span>
                                                            <div className='flex items-center gap-2'>
                                                              <input
                                                                disabled  
                                                                type='text'
                                                                min={0}
                                                                className='w-20 h-7 px-2 border rounded'
                                                                value={ingredient.useItem ?? 0}
                                                                onChange={(e) => {
                                                                  const newUse = Number(e.target.value) || 0;
                                                                  setEditMenuDialog((prev) => {
                                                                    if (!prev) return prev;
                                                                    return {
                                                                      ...prev,
                                                                      menuItems: prev.menuItems.map((mi) =>
                                                                        mi.menu_name === menu.menu_name
                                                                          ? {
                                                                            ...mi,
                                                                            menu_ingredients: mi.menu_ingredients.map((ing) =>
                                                                              ing.ingredient_name === ingredient.ingredient_name
                                                                                ? { ...ing, useItem: newUse }
                                                                                : ing
                                                                            ),
                                                                          }
                                                                          : mi
                                                                      ),
                                                                    };
                                                                  });
                                                                }}
                                                              />
                                                              <span>หน่วย</span>
                                                              <label className='cursor-pointer'>
                                                                <input
                                                                  type='checkbox'
                                                                  checked={ingredient.ingredient_status || false}
                                                                  onChange={() => handleToggleIngredientCheck(cart.id, menu.menu_name, ingredient.ingredient_name)}
                                                                  className='hidden'
                                                                />
                                                                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${ingredient.ingredient_status ? "bg-green-500" : "bg-red-500"}`}>
                                                                  <span className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${ingredient.ingredient_status ? "translate-x-5" : "translate-x-0.5"}`} />
                                                                </span>
                                                              </label>
                                                            </div>
                                                          </div>
                                                        ));
                                                      })()}
                                                    </div>
                                                  </div>
                                                </AccordionContent>
                                              </AccordionItem>
                                            );
                                          })}
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))
                                  ) : (
                                    // Fallback to old structure if cart_lunchbox is not available
                                    cart.allIngredients.map((menuGroup, groupIdx) => {
                                      const totalBox = cart.menuItems.find((me) => me.menu_name === menuGroup.menuName)?.menu_total || 0;
                                      const allIngredientsChecked = menuGroup.ingredients.every((ing) => ing.isChecked);

                                      return (
                                        <AccordionItem
                                          key={groupIdx}
                                          value={`menu-${groupIdx}`}
                                          className={`rounded-xl border border-slate-200 shadow-sm px-4 py-3 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                                        >
                                          <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                            <div className='flex flex-col items-start'>
                                              <span className='truncate text-sm text-gray-700 font-medium'>{menuGroup.menuName}</span>
                                              {(() => {
                                                const menuItem = cart.menuItems.find((me) => me.menu_name === menuGroup.menuName);
                                                return menuItem?.menu_description ? <span className='truncate text-xs text-gray-500 mt-1'>{menuItem.menu_description}</span> : null;
                                              })()}
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className='pt-3 space-y-2'>
                                            {menuGroup.ingredients.map((ing, idx) => (
                                              <div
                                                key={idx}
                                                className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.isChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} text-sm`}
                                              >
                                                <span className='text-gray-700'>{ing.ingredient_name || `Unknown ingredient`}</span>

                                                <div className='flex items-center gap-4'>
                                                  <span className='text-gray-600'>
                                                    ใช้ {ing.useItem} {ing.ingredient_unit} × {totalBox} กล่อง ={" "}
                                                    <strong className='text-black-600' style={{ color: "#000000" }}>
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
                                                    <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${ing.isChecked ? "bg-green-500" : "bg-red-500"}`}>
                                                      <span className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${ing.isChecked ? "translate-x-5" : "translate-x-0.5"}`} />
                                                    </span>
                                                  </label>
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
                      onClick={() => handleSummary("date", Time.convertThaiDateToISO(orders[0].cart_delivery_date)!)}
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


        <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <DialogContent className='max-w-md max-h-[70vh] overflow-y-auto'>
            <DialogTitle>

              <div className='space-y-4'>
                {summaryDialogType === "order" &&
                  selectedCartForSummary &&
                  (() => {
                    const { summary, allIngredientsChecked } = summarize.OrderIngredients(selectedCartForSummary);
                    return (
                      <>
                        <div className='space-y-2'>
                          <h5 className='text-sm font-semibold text-gray-700'>สรุปวัตถุดิบของออเดอร์: {selectedCartForSummary.orderNumber}</h5>
                          (วันที่ส่ง: {selectedCartForSummary.cart_delivery_date})
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
                          <Button onClick={() => handleCheck.AllIngredients(selectedCartForSummary.id)} className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg' disabled={isSaving === selectedCartForSummary.id || allIngredientsChecked}>
                            {isSaving === selectedCartForSummary.id ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
                          </Button>
                        </div>
                      </>
                    );
                  })()}

                {summaryDialogType === "date" &&
                  selectedDateForSummary &&
                  (() => {
                    const { summary, allIngredientsChecked } = summarize.Ingredients(selectedDateForSummary);
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
                          <Button onClick={() => handleCheck.AllIngredientsForDate(selectedDateForSummary)} className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg' disabled={isSaving === "all" || allIngredientsChecked}>
                            {isSaving === "all" ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
              </div>
            </DialogTitle>
          </DialogContent>
        </Dialog>

        {totalPages > 1 && <PaginationComponent totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      </div>
    </div>
  );
};

export default SummaryList;
