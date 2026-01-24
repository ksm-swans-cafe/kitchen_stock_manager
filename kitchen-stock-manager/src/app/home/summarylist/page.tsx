"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import axios from "axios";
import * as XLSX from "xlsx";
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
import { Loading } from "@/components/loading/loading";

import SummaryIcon from "@/assets/summarylist.png";

import { fetcher } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";

import { Ingredient, MenuItem, Cart, CartItem, RawCart, Lunchbox } from "@/types/interface_summary_orderhistory";

const SummaryList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userName } = useAuth();
  const filterCartId = searchParams.get('cartId'); // รับ cartId จาก query parameter สำหรับ filter จาก dashboard
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
  const [availableMenusForLunchbox, setAvailableMenusForLunchbox] = useState<{ [key: string]: any[] }>({}); // เก็บเมนูแยกตามแต่ละ lunchbox ชื่อ
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
    id: string;
    order_number: string;
    delivery_date: string;
    receive_time: string;
    export_time: string;
    customer_tel: string;
    customer_name: string;
    location_send: string;
    shipping_cost: number;
    lunchbox: {
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
  const [editMenuDialogTimes, setEditMenuDialogTimes] = useState<{
    exportHour: string;
    exportMinute: string;
    receiveHour: string;
    receiveMinute: string;
  } | null>(null);
  const { data: cartsData, error: cartsError, mutate: mutateCarts } = useSWR("/api/get/carts/summarylist", fetcher, { refreshInterval: 30000 });

  const { data: ingredientData, error: ingredientError } = useSWR("/api/get/ingredients", fetcher, { refreshInterval: 30000 });
  const error = cartsError || ingredientError;
  const isLoading = !cartsData || !ingredientData;
  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCopyText, setPaymentCopyText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [selectedPaymentCart, setSelectedPaymentCart] = useState<Cart | null>(null);

  // เลื่อนหน้าจอขึ้นด้านบนทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  const handleSummaryprice = () => {
    router.push("/home/summarylist/summaryprice");
  };

  const handleDatePicker = (action: string) => {
    if (action === "open") return setIsDatePickerOpen(true);
    else if (action === "close") return setIsDatePickerOpen(false);
  };

  const safeParseJSON = (jsonString: string | any): any => {
    try {
      // ถ้าเป็น object หรือ array อยู่แล้ว ให้ return ตรงๆ
      if (typeof jsonString === "object" && jsonString !== null) {
        return jsonString;
      }
      // ถ้าเป็น string ให้ parse
      if (typeof jsonString === "string") {
        return JSON.parse(jsonString);
      }
      return null;
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
          if (!cart.create_date) {
            // console.warn(`Cart ${cart.id} has no create_date`);
            return {
              id: cart.id || "no-id",
              orderNumber: `ORD${cart.id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`,
              name: "ไม่มีข้อมูลวันที่",
              date: "ไม่ระบุ",
              dateISO: "",
              time: "ไม่ระบุ",
              sets: 0,
              price: cart.total_price || 0,
              status: cart.status,
              createdBy: cart.username || "ไม่ทราบผู้สร้าง",
              menuItems: [],
              allIngredients: [],
              order_number: cart.order_number,
              lunchbox: [],
              delivery_date: cart.delivery_date,
              receive_time: cart.receive_time,
              export_time: cart.export_time,
              customer_tel: cart.customer_tel,
              customer_name: cart.customer_name,
              location_send: cart.location_send,
              shipping_cost: cart.shipping_cost,
            };
          }

          // Normalize datetime string to support both "YYYY-MM-DD HH:mm" และ ISO "YYYY-MM-DDTHH:mm"
          const normalizedDateTime = cart.create_date.replace("T", " ");
          const [rawDate, timePartWithZone] = normalizedDateTime.split(" ");
          const [year, month, day] = rawDate.split("-");
          const dateObjectForLocale = new Date(Number(year), Number(month) - 1, Number(day));
          const formattedDate = Number.isNaN(dateObjectForLocale.getTime())
            ? "ไม่ระบุ"
            : dateObjectForLocale
              .toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              .replace(/ /g, " ");

          const date = new Date(cart.create_date);
          const formattedDateISO = Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];

          // แก้ไขการแยกเวลา - รองรับทั้ง +timezone และ Z
          let formattedTime = "ไม่ระบุ";
          if (timePartWithZone) {
            const timeOnly = timePartWithZone.split("+")[0].replace("Z", "").slice(0, 5);
            if (timeOnly) {
              formattedTime = timeOnly;
            }
          } else if (!Number.isNaN(date.getTime())) {
            formattedTime = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }).trim();
          }

          // ประมวลผล lunchbox
          let cartLunchbox: Lunchbox[] = [];
          if (cart.lunchbox) {
            if (typeof cart.lunchbox === "string") {
              const parsedLunchbox = safeParseJSON(cart.lunchbox);
              if (parsedLunchbox && Array.isArray(parsedLunchbox)) {
                cartLunchbox = parsedLunchbox;
              }
            } else if (Array.isArray(cart.lunchbox)) {
              cartLunchbox = cart.lunchbox;
            }
          }

          // ประมวลผล menuItems จาก lunchbox
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

          const menuDisplayName = menuItems.length > 0 ? menuItems.map((item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`).join(" + ") : "ไม่มีชื่อเมนู";

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

          const orderNumber = cart.order_number || `ORD${cart.id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;
          return {
            id: cart.id || "no-id",
            orderNumber,
            name: menuDisplayName,
            date: formattedDate,
            dateISO: formattedDateISO,
            time: formattedTime,
            sets: totalSets,
            price: cart.total_price || 0,
            status: cart.status,
            createdBy: cart.username || "ไม่ทราบผู้สร้าง",
            menuItems,
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
          const dateA = Time.convertThaiDateToISO(a.delivery_date);
          const dateB = Time.convertThaiDateToISO(b.delivery_date);

          if (!dateA) return 1;
          if (!dateB) return -1;

          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only

          const dateAObj = new Date(dateA);
          dateAObj.setHours(0, 0, 0, 0);
          const dateBObj = new Date(dateB);
          dateBObj.setHours(0, 0, 0, 0);

          const currentTime = currentDate.getTime();
          const timeA = dateAObj.getTime();
          const timeB = dateBObj.getTime();

          // วันปัจจุบันมาก่อน
          const isAToday = timeA === currentTime;
          const isBToday = timeB === currentTime;
          if (isAToday && !isBToday) return -1;
          if (!isAToday && isBToday) return 1;

          // วันที่ >= วันปัจจุบัน: เรียงจากน้อยไปมาก (15, 16, 17...)
          // วันที่ < วันปัจจุบัน: เรียงจากน้อยไปมาก (12, 13, 14...)
          if (timeA >= currentTime && timeB >= currentTime) {
            // ทั้งคู่เป็นวันที่ข้างหน้า - เรียงจากน้อยไปมาก
            if (timeA !== timeB) return timeA - timeB;
          } else if (timeA < currentTime && timeB < currentTime) {
            // ทั้งคู่เป็นวันที่ย้อนหลัง - เรียงจากน้อยไปมาก
            if (timeA !== timeB) return timeA - timeB;
          } else {
            // หนึ่งข้างหน้า หนึ่งย้อนหลัง - วันที่ข้างหน้ามาก่อน
            if (timeA >= currentTime) return -1;
            if (timeB >= currentTime) return 1;
          }

          // ถ้าวันที่เท่ากัน เรียงตาม order_number
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
      if (!allowedStatuses.includes(cart.status)) return;
      const deliveryDate = Time.convertThaiDateToISO(cart.delivery_date);
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
        export_time: exportTime,
        receive_time: receiveTime,
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

    // ตรวจสอบสถานะก่อน - อนุญาตให้เลือกวัตถุดิบได้เฉพาะเมื่อสถานะเป็น "completed" (ชำระเงินแล้ว)
    if (currentCart?.status !== "completed") {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถเลือกวัตถุดิบได้",
        text: "กรุณาเปลี่ยนสถานะเป็น 'ชำระเงินแล้ว' ก่อนเลือกวัตถุดิบ",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

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
      const currentCart = carts.find((cart) => cart.id === cartId);

      // ตรวจสอบสถานะก่อน - อนุญาตให้เลือกวัตถุดิบได้เฉพาะเมื่อสถานะเป็น "completed" (ชำระเงินแล้ว)
      if (currentCart?.status !== "completed") {
        Swal.fire({
          icon: "warning",
          title: "ไม่สามารถเลือกวัตถุดิบได้",
          text: "กรุณาเปลี่ยนสถานะเป็น 'ชำระเงินแล้ว' ก่อนเลือกวัตถุดิบ",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

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

        // ปิด dialog หลังจากเลือกวัตถุดิบทั้งหมดเสร็จ
        setIsSummaryDialogOpen(false);

        // แสดงข้อความสำเร็จ
        Swal.fire({
          icon: "success",
          title: "เลือกวัตถุดิบทั้งหมดเรียบร้อย!",
          showConfirmButton: false,
          timer: 2000,
        });
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

      const targetCarts = carts.filter((cart) => Time.convertThaiDateToISO(cart.delivery_date) === date);

      // ตรวจสอบว่ามี cart ที่ยังไม่ได้ชำระเงินหรือไม่
      const unpaidCarts = targetCarts.filter((cart) => cart.status !== "completed");

      if (unpaidCarts.length > 0) {
        const unpaidOrderNumbers = unpaidCarts.map((cart) => cart.order_number).join(", ");
        Swal.fire({
          icon: "warning",
          title: "มีออเดอร์ที่ยังไม่ได้ชำระเงิน",
          text: `ออเดอร์หมายเลข: ${unpaidOrderNumbers} ยังไม่ได้ชำระเงิน กรุณาเปลี่ยนสถานะเป็น 'ชำระเงินแล้ว' ก่อนเลือกวัตถุดิบ`,
          showConfirmButton: true,
        });
        return;
      }

      setIsSaving("all");

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
          targetCarts.map(async (cart) => {
            const response = await axios.patch(`/api/edit/cart-menu/all-ingredients-status/${cart.id}`, JSON.stringify({ isChecked: true }));
            if (response.status !== 200) {
              const errorData = response.data;
              throw new Error(errorData.error || `Failed to update all ingredients status for cart ${cart.id}`);
            }
          })
        );

        mutateCarts();

        // ปิด dialog หลังจากเลือกวัตถุดิบทั้งหมดเสร็จ
        setIsSummaryDialogOpen(false);

        // แสดงข้อความสำเร็จ
        Swal.fire({
          icon: "success",
          title: "เลือกวัตถุดิบทั้งหมดเรียบร้อย!",
          text: `อัปเดตวัตถุดิบสำหรับ ${targetCarts.length} ออเดอร์เรียบร้อยแล้ว`,
          showConfirmButton: false,
          timer: 2000,
        });
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
    const filteredOrders = allCarts.filter((cart) => Time.convertThaiDateToISO(cart.delivery_date) === selectedDateStr);
    setSelectedOrders(filteredOrders);
    setIsOrderModalOpen(true);
    setSelectedDate(new Date(selectedDateStr));
    setIsDatePickerOpen(false);
    setCarts(filteredOrders);
    if (filteredOrders.length === 0) {
      console.error(
        `ไม่มีออเดอร์สำหรับวันที่ ${formatDate(new Date(selectedDateStr), {
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

    // Filter ด้วย cartId จาก dashboard (ถ้ามี)
    if (filterCartId) {
      filtered = filtered.filter((order) => order.id === filterCartId);
    }

    if (selectedDate) {
      const selectedDateISO = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((order) => Time.convertThaiDateToISO(order.delivery_date) === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) => [order.name, order.id, order.createdBy, order.customer_tel, order.customer_name, order.order_number, order.location_send].some((field) => (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter((order) => getStatus("text", order.status) === filterStatus);
    }
    if (filterCreator !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    const groupedByDate = filtered.reduce((acc, cart) => {
      const deliveryDateISO = Time.convertThaiDateToISO(cart.delivery_date) || "no-date";
      if (!acc[deliveryDateISO]) acc[deliveryDateISO] = [];

      acc[deliveryDateISO].push(cart);
      return acc;
    }, {} as { [key: string]: Cart[] });

    Object.values(groupedByDate).forEach((orders) => {
      orders.sort((a, b) => {
        const exportTimeA = Time.InMinutes(a.export_time);
        const exportTimeB = Time.InMinutes(b.export_time);
        const receiveTimeA = Time.InMinutes(a.receive_time);
        const receiveTimeB = Time.InMinutes(b.receive_time);

        if (exportTimeA !== exportTimeB) return exportTimeA - exportTimeB;
        if (receiveTimeA !== receiveTimeB) return receiveTimeA - receiveTimeB;

        const orderNumA = parseInt(a.order_number || "0");
        const orderNumB = parseInt(b.order_number || "0");
        return orderNumA - orderNumB;
      });
    });

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTime = currentDate.getTime();

    const sortedDates = Object.keys(groupedByDate).sort((dateA, dateB) => {
      if (dateA === "no-date") return 1;
      if (dateB === "no-date") return -1;

      const dateAObj = new Date(dateA);
      dateAObj.setHours(0, 0, 0, 0);
      const dateBObj = new Date(dateB);
      dateBObj.setHours(0, 0, 0, 0);

      const timeA = dateAObj.getTime();
      const timeB = dateBObj.getTime();

      // วันปัจจุบันมาก่อน
      const isAToday = timeA === currentTime;
      const isBToday = timeB === currentTime;
      if (isAToday && !isBToday) return -1;
      if (!isAToday && isBToday) return 1;

      // วันที่ >= วันปัจจุบัน: เรียงจากน้อยไปมาก
      if (timeA >= currentTime && timeB >= currentTime) {
        return timeA - timeB;
      }
      // วันที่ < วันปัจจุบัน: เรียงจากน้อยไปมาก
      if (timeA < currentTime && timeB < currentTime) {
        return timeA - timeB;
      }
      // หนึ่งข้างหน้า หนึ่งย้อนหลัง - วันที่ข้างหน้ามาก่อน
      if (timeA >= currentTime) return -1;
      if (timeB >= currentTime) return 1;
      return 0;
    });

    return sortedDates.flatMap((date) => groupedByDate[date]);
  }, [carts, searchTerm, filterStatus, filterCreator, selectedDate, sortOrder, filterCartId]);

  const groupedOrders = useMemo(() => {
    const grouped = filteredAndSortedOrders.reduce((acc, cart) => {
      const deliveryDateISO = Time.convertThaiDateToISO(cart.delivery_date);
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
        const exportTimeA = Time.InMinutes(a.export_time);
        const exportTimeB = Time.InMinutes(b.export_time);
        const receiveTimeA = Time.InMinutes(a.receive_time);
        const receiveTimeB = Time.InMinutes(b.receive_time);

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
    currentDate.setHours(0, 0, 0, 0);
    const currentTime = currentDate.getTime();

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
      const dateA = Time.convertThaiDateToISO(a[1][0].delivery_date);
      const dateB = Time.convertThaiDateToISO(b[1][0].delivery_date);

      if (!dateA) return 1;
      if (!dateB) return -1;

      const dateAObj = new Date(dateA);
      dateAObj.setHours(0, 0, 0, 0);
      const dateBObj = new Date(dateB);
      dateBObj.setHours(0, 0, 0, 0);

      const timeA = dateAObj.getTime();
      const timeB = dateBObj.getTime();

      // วันที่ >= วันปัจจุบัน: เรียงจากน้อยไปมาก
      if (timeA >= currentTime && timeB >= currentTime) {
        return timeA - timeB;
      }
      // วันที่ < วันปัจจุบัน: เรียงจากน้อยไปมาก
      if (timeA < currentTime && timeB < currentTime) {
        return timeA - timeB;
      }
      // หนึ่งข้างหน้า หนึ่งย้อนหลัง - วันที่ข้างหน้ามาก่อน
      if (timeA >= currentTime) return -1;
      if (timeB >= currentTime) return 1;
      return 0;
    });

    return [...currentDateGroup, ...sortedOtherDates];
  }, [filteredAndSortedOrders, sortOrder]);

  const summarize = {
    Ingredients: (date: string) => {
      const ingredientSummary: {
        [key: string]: { checked: number; total: number };
      } = {};

      const ordersOnDate = filteredAndSortedOrders.filter((cart) => Time.convertThaiDateToISO(cart.delivery_date) === date);

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

  const generatePaymentCopyText = (cart: Cart): string => {
    const customerName = cart.customer_name || "ไม่ระบุ";
    const channelAccess = (cart as any).channel_access || "ไม่ระบุ";
    const orderName = (cart as any).order_name || customerName;
    const deliveryDate = cart.delivery_date || "ไม่ระบุ";
    const exportTime = cart.export_time || "ไม่ระบุ";
    const receiveTime = cart.receive_time || "ไม่ระบุ";
    const locationSend = cart.location_send || "ไม่ระบุ";
    const shippingCost = cart.shipping_cost || "0";
    const shippingBy = (cart as any).shipping_by || "ไม่ระบุ";
    const receiveName = (cart as any).receive_name || customerName;
    const customerTel = cart.customer_tel || "ไม่ระบุ";
    const invoiceTex = cart.invoice_tex || "ไม่ระบุ";

    // คำนวณราคาอาหารจาก lunchbox
    let totalFoodCost = 0;
    let lunchboxList = "";
    let totalBoxes = 0;

    if (cart.lunchbox && cart.lunchbox.length > 0) {
      cart.lunchbox.forEach((lunchbox, idx) => {
        const lunchboxTotalCost = Number(lunchbox.lunchbox_total_cost) || 0;
        const lunchboxTotal = Number(lunchbox.lunchbox_total) || 0;
        totalBoxes += lunchboxTotal;
        totalFoodCost += lunchboxTotalCost;

        lunchboxList += `${idx + 1}.${lunchbox.lunchbox_name} - ${lunchbox.lunchbox_set_name}\n`;
        if (lunchbox.lunchbox_menu && lunchbox.lunchbox_menu.length > 0) {
          lunchbox.lunchbox_menu.forEach((menu) => {
            const menuCost = Number(menu.menu_cost) || 0;
            lunchboxList += `      + ${menu.menu_name}\n`;
            lunchboxList += `      เซ็ตละ ${menuCost.toLocaleString("th-TH")} บาท\n`;
          });
        }
        lunchboxList += `      จำนวน ${lunchboxTotal} กล่อง\n`;
        lunchboxList += `      รวม ${lunchboxTotalCost.toLocaleString("th-TH")} บาท\n`;
      });
    } else {
      // ถ้าไม่มี lunchbox ให้ใช้ราคาจาก price
      totalFoodCost = cart.price || 0;
      totalBoxes = cart.sets || 0;
    }

    const shippingCostNum = Number(shippingCost.replace(/[^\d]/g, "")) || 0;
    const totalCost = totalFoodCost + shippingCostNum;

    return `📌รับออเดอร์ คุณ ${orderName} 
ช่องทางที่สั่ง : ${channelAccess}
ผู้รับออเดอร์ : แอดมิน${userName || "ไม่ระบุ"}

✅ รายละเอียดสำหรับจัดส่ง
1.วันที่รับสินค้า : ${deliveryDate}
2.เวลาส่งสินค้า : ${exportTime}
3.เวลารับสินค้า : ${receiveTime}
4.สถานที่จัดส่ง : ${locationSend}
5.ค่าจัดส่ง ${shippingCostNum.toLocaleString("th-TH")} บาท ส่งโดย ${shippingBy}
6.ชื่อผู้รับสินค้า : ${receiveName}
7.เบอร์โทร : ${customerTel}
8.ออกบิลในนาม : ${customerName}
9.ที่อยู่ : ${locationSend}
10.เลขประจำตัวผู้เสียภาษี : ${invoiceTex}

✅รายการอาหาร ${totalBoxes} กล่อง 
      ${lunchboxList}
รวมค่าอาหาร ${totalFoodCost.toLocaleString("th-TH")} บาท

✅รวมทั้งหมด ${totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
`;
  };

  const handlePaymentCompleted = (cart: Cart) => {
    const copyText = generatePaymentCopyText(cart);
    setPaymentCopyText(copyText);
    setSelectedPaymentCart(cart);
    setShowPaymentModal(true);
    // Auto copy to clipboard
    navigator.clipboard.writeText(copyText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      // ถ้า copy ไม่ได้ ไม่เป็นไร
    });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(paymentCopyText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFinishPayment = () => {
    setShowPaymentModal(false);
    setPaymentCopyText("");
    setSelectedPaymentCart(null);
    setIsCopied(false);
  };

  const handleExport = (type: string) => {
    if (type === "csv") {
      const headers = ["เลขที่ออเดอร์", "ชื่อเมนู", "คำอธิบายเมนู", "วันที่", "เวลา", "จำนวน Set", "ราคา", "สถานะ", "ผู้สร้าง"];
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
    } else if (type === "excel") {
      const worksheetData = filteredAndSortedOrders.map((cart) => {
        const foodPrice = cart.lunchbox && cart.lunchbox.length > 0 ? cart.lunchbox.reduce((sum, lunchbox) => sum + (Number(lunchbox.lunchbox_total_cost) || 0), 0) : cart.price || 0;
        const menuDescriptions = cart.menuItems.map((item) => item.menu_description || "").join("; ");
        return {
          เลขที่ออเดอร์: cart.id,
          ชื่อเมนู: cart.name,
          คำอธิบายเมนู: menuDescriptions,
          วันที่: cart.date,
          เวลา: cart.time,
          "จำนวน Set": cart.sets,
          "ราคาอาหาร": foodPrice,
          "ค่าส่ง": Number(cart.shipping_cost || 0),
          สถานะ: getStatus("text", cart.status),
          ผู้สร้าง: cart.createdBy,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      const timestamp = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `order_history_${timestamp}.xlsx`);
    }
  };

  const handleExportOrder = (cart: Cart) => {
    const worksheetData = cart.menuItems.map((item) => ({
      รหัสออเดอร์: cart.order_number || cart.id,
      ชื่อเมนู: item.menu_name,
      คำอธิบายเมนู: item.menu_description || "",
      "จำนวน Set": item.menu_total,
      ลูกค้า: cart.customer_name,
      เบอร์โทร: cart.customer_tel,
      สถานที่จัดส่ง: cart.location_send,
      วันที่ส่ง: cart.delivery_date,
      เวลาส่ง: cart.export_time,
      เวลารับ: cart.receive_time,
      สถานะ: getStatus("text", cart.status),
    }));

    if (worksheetData.length === 0) {
      worksheetData.push({
        รหัสออเดอร์: cart.order_number || cart.id,
        ชื่อเมนู: "ไม่มีข้อมูลเมนู",
        คำอธิบายเมนู: "",
        "จำนวน Set": 0,
        ลูกค้า: cart.customer_name,
        เบอร์โทร: cart.customer_tel,
        สถานที่จัดส่ง: cart.location_send,
        วันที่ส่ง: cart.delivery_date,
        เวลาส่ง: cart.export_time,
        เวลารับ: cart.receive_time,
        สถานะ: getStatus("text", cart.status),
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order");
    const fileName = `order_${(cart.order_number || cart.id).toString().replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
        return;
      }

      const response = await fetch(`/api/get/lunchbox/categories?lunchbox_name=${encodeURIComponent(lunchboxName)}&lunchbox_set_name=${encodeURIComponent(lunchboxSetName)}`);

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          setAvailableMenusForLunchbox((prev) => ({
            ...prev,
            [key]: result.data,
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
      const sets = availableLunchboxes.filter((item) => item.lunchbox_name === selectedLunchboxName).map((item) => item.lunchbox_set_name);
      setAvailableLunchboxSets([...new Set(sets)]);
    } else {
      setAvailableLunchboxSets([]);
    }
  }, [selectedLunchboxName, availableLunchboxes]);

  // Update preview when both lunchbox name and set are selected
  useEffect(() => {
    if (selectedLunchboxName && selectedLunchboxSet && availableLunchboxes.length > 0) {
      const selectedData = availableLunchboxes.find((item) => item.lunchbox_name === selectedLunchboxName && item.lunchbox_set_name === selectedLunchboxSet);

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
    if (editMenuDialog && editMenuDialog.lunchbox && editMenuDialog.lunchbox.length > 0) {
      // ดึงเมนูสำหรับทุกกล่องที่ยังไม่มีข้อมูล
      editMenuDialog.lunchbox.forEach((lunchbox, idx) => {
        const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${idx}`;
        // ดึงเฉพาะที่ยังไม่มีข้อมูล
        if (!availableMenusForLunchbox[key]) {
          fetchMenusForLunchbox(lunchbox.lunchbox_name, lunchbox.lunchbox_set_name, idx);
        }
      });
    }
  }, [editMenuDialog?.lunchbox]);

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

    const selectedLunchboxData = availableLunchboxes.find((item) => item.lunchbox_name === selectedLunchboxName && item.lunchbox_set_name === selectedLunchboxSet);

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
        lunchbox: [newLunchbox, ...prev.lunchbox],
      };
    });

    // Reset selection
    setSelectedLunchboxName("");
    setSelectedLunchboxSet("");
    setPreviewLunchbox(null);
    setSelectedMenuForLunchbox({});
    setAvailableMenusForLunchbox({});

    Swal.fire({
      icon: "success",
      title: "เพิ่มกล่องอาหารสำเร็จ!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Remove lunchbox from cart
  const handleRemoveLunchbox = (lunchboxIdx: number) => {
    if (!editMenuDialog) {
      return;
    }

    setIsDeleting(true); // Set flag to prevent dialog reset

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
        container: "swal-high-zindex",
        popup: "swal-high-zindex",
      },
      didOpen: () => {
        const container = document.querySelector(".swal2-container");
        const popup = document.querySelector(".swal2-popup");
        const actions = document.querySelector(".swal2-actions");
        const confirmBtn = document.querySelector(".swal2-confirm");
        const cancelBtn = document.querySelector(".swal2-cancel");

        if (container) {
          (container as HTMLElement).style.zIndex = "99999";
          (container as HTMLElement).style.pointerEvents = "auto";
        }
        if (popup) {
          (popup as HTMLElement).style.zIndex = "100000";
          (popup as HTMLElement).style.pointerEvents = "auto";
        }
        if (actions) {
          (actions as HTMLElement).style.zIndex = "100001";
          (actions as HTMLElement).style.pointerEvents = "auto";
        }
        if (confirmBtn) {
          (confirmBtn as HTMLElement).style.zIndex = "100002";
          (confirmBtn as HTMLElement).style.pointerEvents = "auto";
        }
        if (cancelBtn) {
          (cancelBtn as HTMLElement).style.zIndex = "100002";
          (cancelBtn as HTMLElement).style.pointerEvents = "auto";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMenuDialog((prev) => {
          if (!prev) {
            return prev;
          }

          // Get menus from the lunchbox to be removed
          const removedLunchbox = prev.lunchbox[lunchboxIdx];

          const menuNamesToDecrement = (removedLunchbox?.lunchbox_menu || []).map((m) => m.menu_name);

          // Update menuItems: decrease menu_total or remove if total becomes 0
          const updatedMenuItems = prev.menuItems
            .map((m) => {
              if (menuNamesToDecrement.includes(m.menu_name)) {
                return { ...m, menu_total: m.menu_total - 1 };
              }
              return m;
            })
            .filter((m) => m.menu_total > 0); // Remove items with menu_total <= 0

          const updatedState = {
            ...prev,
            lunchbox: prev.lunchbox.filter((_, idx) => idx !== lunchboxIdx),
            menuItems: updatedMenuItems,
          };

          return updatedState;
        });

        Swal.fire({
          icon: "success",
          title: "ลบแล้ว!",
          text: "กล่องอาหารถูกลบเรียบร้อยแล้ว",
          showConfirmButton: false,
          timer: 1500,
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

    // ตรวจสอบว่า category นี้เลือกไปแล้วหรือไม่
    const currentLunchbox = editMenuDialog.lunchbox[lunchboxIdx];
    const selectedMenuCategory = selectedMenu.lunchbox_menu_category;

    // ตรวจสอบจำนวนเมนูที่เลือกแล้ว vs lunchbox_limit
    const currentMenuCount = currentLunchbox.lunchbox_menu?.length || 0;
    const lunchboxLimit = currentLunchbox.lunchbox_limit ?? 0;
    const isUnlimited = lunchboxLimit <= 0;

    if (!isUnlimited && currentMenuCount >= lunchboxLimit) {
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
    // แต่ถ้าเป็น Custom (lunchbox_limit = 0) ให้เลือกซ้ำได้
    const key = `${currentLunchbox.lunchbox_name}_${currentLunchbox.lunchbox_set_name}_${lunchboxIdx}`;
    const menusForThisBox = availableMenusForLunchbox[key] || [];

    // ถ้าเป็น Custom unlimited ให้ข้ามการตรวจสอบ category ซ้ำ
    if (!isUnlimited) {
      const hasSameCategoryMenu =
        currentLunchbox.lunchbox_menu?.some((existingMenu: any) => {
          // หา category ของเมนูที่มีอยู่แล้ว
          const existingMenuData = menusForThisBox.find((m: any) => m.menu_name === existingMenu.menu_name);
          const existingCategory = existingMenuData?.lunchbox_menu_category;

          // ถ้า category ตรงกัน แสดงว่ามีเมนูประเภทนี้อยู่แล้ว
          return existingCategory && selectedMenuCategory && existingCategory === selectedMenuCategory;
        }) || false;

      if (hasSameCategoryMenu) {
        Swal.fire({
          icon: "warning",
          title: "เลือกประเภทนี้ไปแล้ว",
          text: `ไม่สามารถเลือกเมนูประเภท "${selectedMenuCategory}" ซ้ำได้ กรุณาลบเมนูเดิมก่อน`,
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }
    } else {
    }

    try {
      // Fetch menu details including ingredients
      const menuRes = await fetch(`/api/get/menu/${selectedMenu.menu_id}`);
      if (!menuRes.ok) throw new Error("Failed to fetch menu details");

      const menuDetails = await menuRes.json();

      // Parse ingredients
      let menuIngredients: any[] = [];
      if (menuDetails.menu_ingredients) {
        if (typeof menuDetails.menu_ingredients === "string") {
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
        menu_cost: menuDetails.menu_cost || 0, // เพิ่มราคาเมนู
        lunchbox_menu_category: selectedMenu.lunchbox_menu_category || "", // เพิ่ม category จาก lunchbox
        menu_ingredients: menuIngredients.map((ing: any) => ({
          useItem: ing.quantity || ing.useItem || 0,
          ingredient_name: ing.name || ing.ingredient_name || "ไม่ระบุวัตถุดิบ",
          ingredient_status: false,
        })),
      };

      // ตรวจสอบว่าต้องเพิ่มข้าวอัตโนมัติหรือไม่ (ก่อน set state)
      // ใช้ key และ menusForThisBox ที่ประกาศไว้แล้วด้านบน
      const autoAddRiceCategories = ["พะเเนง", "คั่วกลิ้ง", "ทอดกระเทียม", "กะเพรา", "ผัดผงกะหรี่", "พริกแกง"];

      // ฟังก์ชันลบ zero-width characters และ whitespace ทั้งหมด
      const cleanString = (str: string) => {
        if (!str) return "";
        // ใช้วิธีลบอักขระที่ไม่ต้องการโดยตรงจาก character codes
        // ลบ zero-width characters ทั้งหมด (ครอบคลุมทุกประเภท)
        // \u200B = zero-width space (8203)
        // \u200C = zero-width non-joiner (8204)
        // \u200D = zero-width joiner (8205)
        // \uFEFF = zero-width no-break space (65279)
        // \u2060 = word joiner (8288)
        // \u180E = mongolian vowel separator (6158)
        return str
          .split("")
          .filter((char: string) => {
            const code = char.charCodeAt(0);
            // เก็บเฉพาะอักขระที่ไม่ใช่ zero-width characters และ whitespace
            return !(
              (
                code === 0x200b || // zero-width space
                code === 0x200c || // zero-width non-joiner
                code === 0x200d || // zero-width joiner
                code === 0xfeff || // zero-width no-break space
                code === 0x2060 || // word joiner
                code === 0x180e || // mongolian vowel separator
                code === 0x0020 || // space
                code === 0x00a0 || // non-breaking space
                code === 0x1680 || // ogham space mark
                code === 0x2000 || // en quad
                code === 0x2001 || // em quad
                code === 0x2002 || // en space
                code === 0x2003 || // em space
                code === 0x2004 || // three-per-em space
                code === 0x2005 || // four-per-em space
                code === 0x2006 || // six-per-em space
                code === 0x2007 || // figure space
                code === 0x2008 || // punctuation space
                code === 0x2009 || // thin space
                code === 0x200a || // hair space
                code === 0x2028 || // line separator
                code === 0x2029 || // paragraph separator
                code === 0x202f || // narrow no-break space
                code === 0x205f || // medium mathematical space
                code === 0x3000
              ) // ideographic space
            );
          })
          .join("")
          .trim(); // trim อีกครั้งเพื่อความแน่ใจ
      };

      // ฟังก์ชัน normalize สระ แ และ เ ให้เป็นรูปแบบเดียวกัน
      const normalizeVowels = (str: string) => {
        if (!str) return str;
        // แปลง "เ" 2 ตัวติดกันเป็น "แ" 1 ตัว (3648, 3648 -> 3649)
        // และ normalize สระ แ ให้เป็นรูปแบบมาตรฐาน
        return str
          .replace(/\u0E40\u0E40/g, "\u0E41") // เ 2 ตัว -> แ
          .replace(/\u0E41/g, "\u0E41"); // แ -> แ (เพื่อความแน่ใจ)
      };

      // ฟังก์ชัน normalize category เพื่อรองรับความแตกต่างของตัวอักษร
      const normalizeCategory = (cat: string) => {
        if (!cat) return cat;
        // ลบ zero-width space และอักขระพิเศษทั้งหมด แล้วแปลง "ผัดพริกแกงใต้" เป็น "พริกแกง"
        const cleaned = cleanString(cat);
        const normalized = normalizeVowels(cleaned);
        return normalized.replace(/ผัดพริกแกงใต้/g, "พริกแกง").replace(/ผัดพริกเเกงใต้/g, "พริกแกง");
      };

      const normalizedSelectedCategory = normalizeCategory(selectedMenuCategory);

      // Clean และ normalize สระทั้งสองแบบ
      const trimmedSelectedCategory = normalizeVowels(cleanString(selectedMenuCategory || ""));
      const trimmedNormalizedCategory = normalizeVowels(cleanString(normalizedSelectedCategory || ""));

      // Debug: ตรวจสอบว่า cleanString และ normalizeVowels ทำงานถูกต้องหรือไม่
      const trimmedSelectedChars = trimmedSelectedCategory.split("");
      const trimmedSelectedCharCodes = trimmedSelectedChars.map((c: string) => c.charCodeAt(0));
      const hasZeroWidthInTrimmed = trimmedSelectedCharCodes.some((code: number) => code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff || code === 0x2060 || code === 0x180e);

      // ตรวจสอบว่ามีสระ เ 2 ตัวหรือไม่
      const hasDoubleE = selectedMenuCategory?.includes("\u0E40\u0E40") || false;
      const normalizedPhrikKaeng = normalizeVowels("พริกแกง");
      const normalizedPhrikEKaeng = normalizeVowels("พริกเเกง");

      // เปรียบเทียบโดยลบ zero-width space และ whitespace ทั้งหมด
      // และ normalize สระ แ และ เ ให้เป็นรูปแบบเดียวกัน
      // และตรวจสอบว่า category มีคำที่ต้องการอยู่หรือไม่ (เพื่อรองรับกรณีที่มีอักขระพิเศษ)
      const comparisonResults = autoAddRiceCategories.map((cat) => {
        const trimmedCat = normalizeVowels(cleanString(cat));
        const exactMatch = trimmedCat === trimmedSelectedCategory || trimmedCat === trimmedNormalizedCategory;
        const includesMatch = trimmedSelectedCategory?.includes(trimmedCat) || trimmedNormalizedCategory?.includes(trimmedCat) || trimmedCat.includes(trimmedSelectedCategory || "") || trimmedCat.includes(trimmedNormalizedCategory || "");
        return {
          original: cat,
          trimmed: trimmedCat,
          trimmedLength: trimmedCat.length,
          selectedLength: trimmedSelectedCategory.length,
          normalizedLength: trimmedNormalizedCategory.length,
          exactMatch,
          includesMatch,
          match: exactMatch || includesMatch,
        };
      });

      const isInAutoAddList = comparisonResults.some((r) => r.match);

      // Debug logs - ตรวจสอบรายละเอียดเพิ่มเติม
      const directCheck = autoAddRiceCategories.includes("พริกแกง");
      const selectedCheck = autoAddRiceCategories.some((cat) => normalizeVowels(cleanString(cat)) === trimmedSelectedCategory);
      const normalizedCheck = autoAddRiceCategories.some((cat) => normalizeVowels(cleanString(cat)) === trimmedNormalizedCategory);

      // ตรวจสอบความยาวและ character codes
      const selectedLength = selectedMenuCategory?.length;
      const normalizedLength = normalizedSelectedCategory?.length;
      const phrikKaengLength = "พริกแกง".length;
      const selectedChars = selectedMenuCategory?.split("");
      const normalizedChars = normalizedSelectedCategory?.split("");
      const phrikKaengChars = "พริกแกง".split("");
      const selectedCharCodes = selectedChars?.map((c: string) => c.charCodeAt(0));
      const normalizedCharCodes = normalizedChars?.map((c: string) => c.charCodeAt(0));
      const phrikKaengCharCodes = phrikKaengChars.map((c: string) => c.charCodeAt(0));

      // หาอักขระที่แตกต่าง
      const diffChars = selectedChars?.filter((c: string, i: number) => {
        const phrikChar = phrikKaengChars[i];
        return c !== phrikChar && c.charCodeAt(0) !== 32 && c.charCodeAt(0) !== 160; // ไม่ใช่ space
      });

      // นับจำนวนเมนูในหมวดหมู่ที่กำหนด (รวมเมนูใหม่ที่กำลังจะเพิ่ม)
      const countAutoAddRiceMenus =
        (currentLunchbox.lunchbox_menu || []).filter((menu: any) => {
          const menuData = menusForThisBox.find((m: any) => m.menu_name === menu.menu_name);
          const menuCategory = normalizeCategory(menuData?.lunchbox_menu_category || "");
          return autoAddRiceCategories.includes(menuCategory);
        }).length + 1; // +1 เพราะกำลังจะเพิ่มเมนูใหม่

      // หาเมนูข้าวที่มีอยู่แล้ว
      const existingRiceMenu = currentLunchbox.lunchbox_menu?.find((menu: any) => {
        const menuData = menusForThisBox.find((m: any) => m.menu_name === menu.menu_name);
        return menuData?.lunchbox_menu_category === "ข้าว";
      });

      const shouldAddOrUpdateRice =
        lunchboxLimit <= 0 && // Custom unlimited
        isInAutoAddList; // Category อยู่ในรายการที่ต้องเพิ่มข้าว

      // Fetch ข้าวอัตโนมัติถ้าต้องการ
      let autoRiceMenu: any = null;
      let riceMenuDetails: any = null;

      if (shouldAddOrUpdateRice) {
        const riceMenu = menusForThisBox.find((m: any) => m.lunchbox_menu_category === "ข้าว");
        if (riceMenu) {
          try {
            const riceMenuRes = await fetch(`/api/get/menu/${riceMenu.menu_id}`);
            if (riceMenuRes.ok) {
              riceMenuDetails = await riceMenuRes.json();
              let riceIngredients: any[] = [];
              if (riceMenuDetails.menu_ingredients) {
                if (typeof riceMenuDetails.menu_ingredients === "string") {
                  riceIngredients = JSON.parse(riceMenuDetails.menu_ingredients);
                } else if (Array.isArray(riceMenuDetails.menu_ingredients)) {
                  riceIngredients = riceMenuDetails.menu_ingredients;
                }
              }

              // ถ้ามีข้าวอยู่แล้ว ให้ใช้ข้อมูลเดิม แต่อัปเดตจำนวน
              if (existingRiceMenu) {
                autoRiceMenu = {
                  ...existingRiceMenu,
                  menu_total: countAutoAddRiceMenus, // อัปเดตจำนวนให้เท่ากับจำนวนเมนูในหมวดหมู่
                };
              } else {
                // ถ้ายังไม่มีข้าว ให้สร้างใหม่
                autoRiceMenu = {
                  menu_name: riceMenuDetails.menu_name || "ไม่ระบุชื่อเมนู",
                  menu_subname: riceMenuDetails.menu_subname || "",
                  menu_category: riceMenuDetails.menu_category || "",
                  menu_total: countAutoAddRiceMenus, // ตั้งจำนวนให้เท่ากับจำนวนเมนูในหมวดหมู่
                  menu_order_id: riceMenuDetails.menu_id || 0,
                  menu_description: riceMenuDetails.menu_description || "",
                  menu_cost: riceMenuDetails.menu_cost || 0,
                  lunchbox_menu_category: "ข้าว",
                  menu_ingredients: riceIngredients.map((ing: any) => ({
                    useItem: ing.quantity || ing.useItem || 0,
                    ingredient_name: ing.name || ing.ingredient_name || "ไม่ระบุวัตถุดิบ",
                    ingredient_status: false,
                  })),
                };
              }
            }
          } catch (riceErr) {
            console.error("Error adding auto rice:", riceErr);
          }
        }
      }

      setEditMenuDialog((prev) => {
        if (!prev) return prev;

        // Check if menu already exists in menuItems
        const existingMenuIndex = prev.menuItems.findIndex((m) => m.menu_name === newMenu.menu_name);

        let updatedMenuItems;
        if (existingMenuIndex >= 0) {
          // Menu exists, increment menu_total
          updatedMenuItems = prev.menuItems.map((m, idx) => (idx === existingMenuIndex ? { ...m, menu_total: m.menu_total + 1 } : m));
        } else {
          // New menu, add to menuItems
          updatedMenuItems = [
            ...prev.menuItems,
            {
              menu_name: newMenu.menu_name,
              menu_category: newMenu.menu_category,
              menu_subname: newMenu.menu_subname,
              menu_total: newMenu.menu_total,
              menu_order_id: newMenu.menu_order_id,
              menu_description: newMenu.menu_description,
              menu_ingredients: newMenu.menu_ingredients,
            },
          ];
        }

        // เพิ่ม/อัปเดตข้าวเข้า menuItems ถ้ามี
        if (autoRiceMenu) {
          const existingRiceIndex = updatedMenuItems.findIndex((m) => m.menu_name === autoRiceMenu.menu_name);
          if (existingRiceIndex >= 0) {
            // อัปเดตจำนวนข้าวให้เท่ากับจำนวนเมนูในหมวดหมู่ที่กำหนด
            updatedMenuItems = updatedMenuItems.map((m, idx) => (idx === existingRiceIndex ? { ...m, menu_total: autoRiceMenu.menu_total } : m));
          } else {
            // เพิ่มข้าวใหม่
            updatedMenuItems = [
              ...updatedMenuItems,
              {
                menu_name: autoRiceMenu.menu_name,
                menu_category: autoRiceMenu.menu_category,
                menu_subname: autoRiceMenu.menu_subname,
                menu_total: autoRiceMenu.menu_total,
                menu_order_id: autoRiceMenu.menu_order_id,
                menu_description: autoRiceMenu.menu_description,
                menu_ingredients: autoRiceMenu.menu_ingredients,
              },
            ];
          }
        }

        // สร้างรายการเมนูสุดท้าย (รวมข้าวถ้ามี)
        let finalMenus = [newMenu, ...currentLunchbox.lunchbox_menu];

        if (autoRiceMenu) {
          // หาว่ามีข้าวอยู่ใน lunchbox_menu แล้วหรือไม่
          const existingRiceMenuIndex = finalMenus.findIndex((menu: any) => {
            const menuData = menusForThisBox.find((m: any) => m.menu_name === menu.menu_name);
            return menuData?.lunchbox_menu_category === "ข้าว";
          });

          if (existingRiceMenuIndex >= 0) {
            // อัปเดตจำนวนข้าวที่มีอยู่แล้ว
            finalMenus[existingRiceMenuIndex] = {
              ...finalMenus[existingRiceMenuIndex],
              menu_total: autoRiceMenu.menu_total,
            };
          } else {
            // เพิ่มข้าวใหม่
            finalMenus = [...finalMenus, autoRiceMenu];
          }
        }

        const newCost = calculateLunchboxCost(finalMenus, currentLunchbox.lunchbox_total, menusForThisBox);

        return {
          ...prev,
          lunchbox: prev.lunchbox.map((lb, idx) => {
            if (idx === lunchboxIdx) {
              return {
                ...lb,
                lunchbox_menu: finalMenus,
                lunchbox_total_cost: newCost,
              };
            }
            return lb;
          }),
          menuItems: updatedMenuItems,
        };
      });

      const riceMessage = autoRiceMenu ? (existingRiceMenu ? ` และอัปเดตข้าวเป็น ${autoRiceMenu.menu_total} อัน` : ` และเพิ่มข้าวอัตโนมัติ ${autoRiceMenu.menu_total} อัน`) : "";

      Swal.fire({
        icon: "success",
        title: "เพิ่มเมนูสำเร็จ!",
        text: `เพิ่ม ${newMenu.menu_name} เรียบร้อยแล้ว${riceMessage}`,
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
    if (!editMenuDialog) {
      return;
    }

    setIsDeleting(true); // Set flag to prevent dialog reset

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
        container: "swal-high-zindex",
        popup: "swal-high-zindex",
      },
      didOpen: () => {
        const container = document.querySelector(".swal2-container");
        const popup = document.querySelector(".swal2-popup");
        const actions = document.querySelector(".swal2-actions");
        const confirmBtn = document.querySelector(".swal2-confirm");
        const cancelBtn = document.querySelector(".swal2-cancel");

        if (container) {
          (container as HTMLElement).style.zIndex = "99999";
          (container as HTMLElement).style.pointerEvents = "auto";
        }
        if (popup) {
          (popup as HTMLElement).style.zIndex = "100000";
          (popup as HTMLElement).style.pointerEvents = "auto";
        }
        if (actions) {
          (actions as HTMLElement).style.zIndex = "100001";
          (actions as HTMLElement).style.pointerEvents = "auto";
        }
        if (confirmBtn) {
          (confirmBtn as HTMLElement).style.zIndex = "100002";
          (confirmBtn as HTMLElement).style.pointerEvents = "auto";
        }
        if (cancelBtn) {
          (cancelBtn as HTMLElement).style.zIndex = "100002";
          (cancelBtn as HTMLElement).style.pointerEvents = "auto";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMenuDialog((prev) => {
          if (!prev) {
            return prev;
          }

          // Check if menu exists and its total count
          const menuItem = prev.menuItems.find((m) => m.menu_name === menuName);
          let updatedMenuItems;

          if (menuItem && menuItem.menu_total > 1) {
            // Decrease menu_total by 1
            updatedMenuItems = prev.menuItems.map((m) => (m.menu_name === menuName ? { ...m, menu_total: m.menu_total - 1 } : m));
          } else {
            // Remove menu completely if menu_total is 1 or not found
            updatedMenuItems = prev.menuItems.filter((m) => m.menu_name !== menuName);
          }

          // คำนวณราคาใหม่หลังลบเมนู
          const key = `${prev.lunchbox[lunchboxIdx].lunchbox_name}_${prev.lunchbox[lunchboxIdx].lunchbox_set_name}_${lunchboxIdx}`;
          const menusForThisBox = availableMenusForLunchbox[key] || [];

          const updatedState = {
            ...prev,
            lunchbox: prev.lunchbox.map((lb, idx) => {
              if (idx === lunchboxIdx) {
                const updatedMenus = (lb.lunchbox_menu || []).filter((_, mIdx) => mIdx !== menuIdx);
                const newCost = calculateLunchboxCost(updatedMenus, lb.lunchbox_total, menusForThisBox);

                return {
                  ...lb,
                  lunchbox_menu: updatedMenus,
                  lunchbox_total_cost: newCost,
                };
              }
              return lb;
            }),
            menuItems: updatedMenuItems,
          };

          return updatedState;
        });

        Swal.fire({
          icon: "success",
          title: "ลบแล้ว!",
          text: "เมนูถูกลบเรียบร้อยแล้ว",
          showConfirmButton: false,
          timer: 1500,
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
      // เตรียมข้อมูลเมนูให้ปลอดภัยก่อนตรวจสอบ:
      // - ถ้าเมนูไหนไม่มีวัตถุดิบที่ valid เลย ให้เติมวัตถุดิบเริ่มต้น "ข้าว" useItem = 1
      //   เพื่อหลีกเลี่ยง error และให้บันทึกลงหลังบ้านได้
      const normalizedMenuItems: MenuItem[] = (menuItems || []).map((m) => {
        const rawIngredients = Array.isArray(m.menu_ingredients) ? m.menu_ingredients : [];

        // กรองเฉพาะวัตถุดิบที่มีชื่อและจำนวน > 0
        const validIngredients = rawIngredients.filter((ing: any) => ing && typeof ing.ingredient_name === "string" && ing.ingredient_name.trim() !== "" && typeof ing.useItem === "number" && ing.useItem > 0);

        // ถ้าไม่มีวัตถุดิบที่ valid เลย ให้เติมวัตถุดิบ default
        const finalIngredients =
          validIngredients.length > 0
            ? validIngredients
            : [
              {
                ingredient_name: "ข้าว",
                useItem: 1,
                ingredient_status: false,
              },
            ];

        return {
          ...m,
          menu_ingredients: finalIngredients as any,
        };
      });

      // ตรวจสอบความถูกต้องของข้อมูลหลังจาก normalize แล้ว
      if (!cartId || !normalizedMenuItems || !Array.isArray(normalizedMenuItems) || normalizedMenuItems.some((m) => !m.menu_name || m.menu_total < 0 || !Array.isArray(m.menu_ingredients) || m.menu_ingredients.some((ing) => !ing.ingredient_name || ing.useItem < 0))) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "กรุณาระบุเมนูและจำนวนกล่องที่ถูกต้อง",
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

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
        normalizedMenuItems.forEach((item) => {
          MenusMap.set(item.menu_name, item);
        });
        const updatedMenuItems = normalizedMenuItems.map((item) => {
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
        const lunchboxesToUse = updatedLunchboxes || foundCart?.lunchbox || [];

        // สร้าง Map ของ updatedMenuItems เพื่อค้นหาข้อมูลที่อัปเดตแล้วได้เร็วขึ้น
        const updatedMenuMap = new globalThis.Map(updatedMenuItems.map((item) => [item.menu_name, item]));

        const lunchboxes = lunchboxesToUse.map((lunchbox: any) => ({
          lunchbox_name: lunchbox.lunchbox_name,
          lunchbox_set: lunchbox.lunchbox_set_name,
          lunchbox_limit: lunchbox.lunchbox_limit || 0,
          lunchbox_quantity: lunchbox.lunchbox_total || 0,
          lunchbox_total_cost: lunchbox.lunchbox_total_cost || 0,
          // ใช้ข้อมูลจาก updatedMenuItems ที่ผู้ใช้แก้ไขแล้ว แทนที่จะใช้ข้อมูลเดิม
          lunchbox_menus: (lunchbox.lunchbox_menu || []).map((menu: any) => {
            // หาเมนูที่ตรงกันจาก updatedMenuItems
            const updatedMenu = updatedMenuMap.get(menu.menu_name);

            // ถ้าเจอเมนูที่อัปเดตแล้ว ให้ใช้ข้อมูลใหม่ ไม่เช่นนั้นใช้ข้อมูลเดิม
            if (updatedMenu) {
              return {
                menu_name: updatedMenu.menu_name,
                menu_subname: updatedMenu.menu_subname,
                menu_category: updatedMenu.menu_category,
                menu_total: updatedMenu.menu_total,
                menu_description: updatedMenu.menu_description,
                menu_ingredients: updatedMenu.menu_ingredients,
              };
            }

            // ถ้าไม่เจอ ใช้ข้อมูลเดิม (กรณีที่เมนูไม่ได้ถูกแก้ไข)
            return {
              menu_name: menu.menu_name,
              menu_subname: menu.menu_subname,
              menu_category: menu.menu_category,
              menu_total: menu.menu_total,
              menu_description: menu.menu_description,
              menu_ingredients: menu.menu_ingredients,
            };
          }),
        }));

        console.log("✅ [API #2] กำลังส่งข้อมูลไปยัง PATCH /api/edit/cart");
        console.log("🔗 URL:", `/api/edit/cart/${cartId}`);
        console.log("📦 Body:", JSON.stringify({ lunchboxes }, null, 2));

        try {
          await fetch(`/api/edit/cart/${cartId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lunchboxes }),
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
                lunchbox: lunchboxesToUse as any,
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
        setEditMenuDialogTimes(null);
        setShouldFetchMenu(false);
        setAvailableMenusForLunchbox({}); // Clear เมนูที่โหลดไว้
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

  // ฟังก์ชันล้าง filter cartId
  const handleClearCartIdFilter = () => {
    router.push('/home/summarylist');
  };

  return (
    <>
      {/* Payment Success Modal */}
      {showPaymentModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='flex w-full items-center justify-center p-4 border-b bg-green-50 rounded-t-lg'>
              <div className='flex items-center gap-2 text-xl font-bold text-green-700'>
                <svg className='!w-5 !h-5 text-green-600' viewBox='0 0 117 117' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
                  <g fill='none' fillRule='evenodd' id='Page-1' stroke='none' strokeWidth='1'>
                    <g fillRule='nonzero' id='correct'>
                      <path
                        d='M34.5,55.1 C32.9,53.5 30.3,53.5 28.7,55.1 C27.1,56.7 27.1,59.3 28.7,60.9 L47.6,79.8 C48.4,80.6 49.4,81 50.5,81 C50.6,81 50.6,81 50.7,81 C51.8,80.9 52.9,80.4 53.7,79.5 L101,22.8 C102.4,21.1 102.2,18.5 100.5,17 C98.8,15.6 96.2,15.8 94.7,17.5 L50.2,70.8 L34.5,55.1 Z'
                        fill='#17AB13'
                        id='Shape'
                      />
                      <path
                        d='M89.1,9.3 C66.1,-5.1 36.6,-1.7 17.4,17.5 C-5.2,40.1 -5.2,77 17.4,99.6 C28.7,110.9 43.6,116.6 58.4,116.6 C73.2,116.6 88.1,110.9 99.4,99.6 C118.7,80.3 122,50.7 107.5,27.7 C106.3,25.8 103.8,25.2 101.9,26.4 C100,27.6 99.4,30.1 100.6,32 C113.1,51.8 110.2,77.2 93.6,93.8 C74.2,113.2 42.5,113.2 23.1,93.8 C3.7,74.4 3.7,42.7 23.1,23.3 C39.7,6.8 65,3.9 84.8,16.2 C86.7,17.4 89.2,16.8 90.4,14.9 C91.6,13 91,10.5 89.1,9.3 Z'
                        fill='#4A4A4A'
                        id='Shape'
                      />
                    </g>
                  </g>
                </svg>
                <p>รายการทั้งหมด</p>
              </div>
            </div>

            {/* Content */}
            <div className='p-4 flex-1 overflow-y-auto'>
              <p className='text-gray-700 mb-4'>กรุณาคัดลอกข้อความด้านล่างเพื่อส่งให้ลูกค้า:</p>
              <div className='overflow-y-auto border-2 py-2 pl-4 border-gray-300 rounded-xl bg-gray-50 overflow-x-hidden'>
                <textarea id='copy-textarea' value={paymentCopyText} readOnly className='w-full resize-none text-sm overflow-y-visible select-none outline-none focus:outline-none' rows={15} />
              </div>

              {/* ปุ่มคัดลอก */}
              <div className='mt-4 flex justify-end gap-2'>
                <button
                  onClick={handleCopyText}
                  className={`w-auto px-4 py-2 rounded-lg font-semibold transition-all ${isCopied ? "!bg-green-600 !text-white" : "!bg-gray-500 !text-white hover:!bg-gray-600"}`}>
                  {isCopied ? (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                      คัดลอกสำเร็จแล้ว!
                    </span>
                  ) : (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                      คัดลอกข้อความ
                    </span>
                  )}
                </button>
              </div>

              <p className='text-xs text-gray-500 mt-2 text-center'>💡 หากปุ่มคัดลอกไม่ทำงาน กรุณาเลือกข้อความในช่องด้านบนแล้วกด Ctrl+C (หรือ Cmd+C บน Mac)</p>
            </div>

            {/* Footer */}
            <div className='p-4 border-t bg-gray-50 rounded-b-lg'>
              <div className='w-full flex justify-center items-center'>
                <button onClick={handleFinishPayment} className='w-auto px-4 py-3 !bg-green-600 !text-white rounded-lg font-semibold hover:!bg-green-700 transition-colors'>
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-2'>สรุปรายการ</h2>
        <p className='text-slate-600 mb-4'>จัดการและติดตามประวัติการสั่งซื้อทั้งหมด</p>

        {/* แสดง Filter Banner เมื่อมี cartId filter จาก dashboard */}
        {filterCartId && (
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-blue-600' />
              <span className='text-blue-800 text-sm'>กำลังแสดงผลเฉพาะออเดอร์ที่เลือกจากหน้าแดชบอร์ด</span>
            </div>
            <Button 
              onClick={handleClearCartIdFilter}
              variant='outline' 
              size='sm'
              className='text-blue-600 border-blue-300 hover:bg-blue-100'
            >
              แสดงทั้งหมด
            </Button>
          </div>
        )}

        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>{error.message}</div>}

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
          <div className='flex flex-col sm:flex-row flex-center gap-2'>
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
            <Loading context='หน้าสรุปรายการ' icon={SummaryIcon.src} />
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
                                  🕒
                                  <span>เวลาส่งอาหาร {cart.export_time || "ไม่ระบุ"} น.</span>
                                  🕒
                                  <span>เวลารับอาหาร {cart.receive_time || "ไม่ระบุ"} น.</span>
                                  <span className='cursor-pointer ml-2' onClick={() => handleEditTimes(cart.id, cart.export_time || "", cart.receive_time || "")}>
                                    {/* <Edit2 className='w-4 h-4' /> */}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <AccordionTrigger className='w-full hover:no-underline px-0'>
                            <div className='flex flex-col gap-3 w-full text-slate-700 text-base font-bold'>
                              <div>รายการคำสั่งซื้อหมายเลข {String(cart.order_number).padStart(3, "0")}</div>
                              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 font-normal text-black'>
                                <div className='flex flex-col sm:flex-row sm:items-center gap-2 text-base'>
                                  <div className='flex items-center gap-2'>
                                    📦 
                                    <span>จำนวนทั้งหมด {cart.sets} กล่อง</span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    💵
                                    <span>
                                      ราคาอาหาร{" "}
                                      {(() => {
                                        const foodPrice = cart.lunchbox && cart.lunchbox.length > 0
                                          ? cart.lunchbox.reduce((sum, lunchbox) => sum + (Number(lunchbox.lunchbox_total_cost) || 0), 0)
                                          : cart.price || 0;
                                        return foodPrice.toLocaleString("th-TH");
                                      })()}{" "}
                                      บาท
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    🚚
                                    <span>ค่าจัดส่ง {Number(cart.shipping_cost || 0).toLocaleString("th-TH")} บาท</span>
                                  </div>
                                </div>
                              </div>
                              <div className='flex flex-col sm:flex-row sm:justify-between font-normal sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-2 text-base'>
                                  📍
                                  <span>สถานที่จัดส่ง {cart.location_send} </span>
                                </div>
                              </div>
                              <div className='font-normal flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-black'>
                                <div className='flex items-center gap-2 text-base'>
                                  👤
                                  <span>ส่งถึงคุณ {cart.customer_name}</span>
                                  <div className="flex items-center gap-2 ml-2 sm:ml-4">
                                    📞
                                    <span>เบอร์ {cart.customer_tel} </span>
                                  </div>
                                </div>
                              </div>
                              <div className='flex flex-wrap items-center gap-4 text-base font-normal text-black'>
                                <div className='flex items-center gap-2'>
                                  📅
                                  <span>วันที่สั่งอาหาร {cart.date}</span>
                                </div>
                              </div>
                              {(cart.invoice_tex || cart.customer_name || cart.location_send) && (
                                <div className='flex flex-col gap-2 text-base font-normal text-black border-t pt-2 mt-2'>
                                  {cart.invoice_tex && (
                                    <div className='flex items-center gap-2'>
                                      📄
                                      <span>เลขกำกับภาษี: {cart.invoice_tex}</span>
                                    </div>
                                  )}
                                  {cart.customer_name && (
                                    <div className='flex items-center gap-2'>
                                      👤
                                      <span>ออกบิลในนาม: {cart.customer_name}</span>
                                    </div>
                                  )}
                                  {cart.location_send && (
                                    <div className='flex items-center gap-2'>
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

                          <div className='flex justify-center mt-2 gap-2 flex-wrap'>
                            <StatusDropdown
                              cartId={cart.id}
                              allIngredients={cart.allIngredients}
                              defaultStatus={cart.status}
                              receive_time={Time.formatToHHMM(cart.receive_time)}
                              export_time={Time.formatToHHMM(cart.export_time)}
                              cart={cart}
                              onUpdated={() => handleUpdateWithCheck(cart)}
                              onOrderSummaryClick={() => handleSummary("order", cart)}
                              onPaymentCompleted={handlePaymentCompleted}
                            />
                            <Button
                              onClick={() => handlePaymentCompleted(cart)}
                              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-bold rounded-full shadow'
                              style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}>
                              📋
                            </Button>
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
                                            text: "ไม่พบข้อมูลออเดอร์",
                                            showConfirmButton: false,
                                            timer: 3000,
                                          });
                                          return;
                                        }

                                        // Extract menuItems from lunchbox
                                        const menuItemsFromLunchbox: any[] = [];
                                        (cart.lunchbox || []).forEach((lunchbox: any) => {
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
                                          id: cart.id,
                                          order_number: cart.order_number || "",
                                          delivery_date: cart.delivery_date || "",
                                          receive_time: cart.receive_time || "",
                                          export_time: cart.export_time || "",
                                          customer_tel: cart.customer_tel || "",
                                          customer_name: cart.customer_name || "",
                                          location_send: cart.location_send || "",
                                          shipping_cost: Number(cart.shipping_cost) || 0,
                                          lunchbox: (cart.lunchbox || []) as any,
                                          menuItems: menuItemsFromLunchbox,
                                          newMenu: {
                                            menu_name: "",
                                            menu_total: 1,
                                            menu_description: "",
                                          },
                                        });

                                        // Initialize time editing state
                                        const parseTime = (time: string) => {
                                          if (!time) return { hour: "00", minute: "00" };
                                          const [hour, minute] = time.split(":").map((h) => h.padStart(2, "0"));
                                          return { hour: hour || "00", minute: minute || "00" };
                                        };

                                        const exportParsed = parseTime(cart.export_time || "");
                                        const receiveParsed = parseTime(cart.receive_time || "");

                                        setEditMenuDialogTimes({
                                          exportHour: exportParsed.hour,
                                          exportMinute: exportParsed.minute,
                                          receiveHour: receiveParsed.hour,
                                          receiveMinute: receiveParsed.minute,
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
                                    // Only reset when explicitly closing (not when SweetAlert shows or deleting)
                                    if (!open && editMenuDialog !== null && !isDeleting) {
                                      setEditMenuDialog(null);
                                      setEditMenuDialogTimes(null);
                                      setShouldFetchMenu(false);
                                      setSelectedLunchboxName("");
                                      setSelectedLunchboxSet("");
                                      setPreviewLunchbox(null);
                                      setAvailableMenusForLunchbox({}); // Clear เมนูที่โหลดไว้
                                    } else {
                                    }
                                  }}>
                                  <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                                    <DialogTitle>
                                      {editMenuDialog && (
                                        <div className='space-y-6'>
                                          <div style={{ color: "#000000" }} className='text-xl font-bold mb-4'>
                                            แก้ไขเมนูสำหรับออเดอร์ {editMenuDialog?.order_number || editMenuDialog?.id}
                                          </div>
                                          <div style={{ color: "#000000" }} className='bg-gray-100 p-4 rounded-lg'>
                                            <h3 className='font-semibold text-gray-800 mb-2'>ข้อมูลลูกค้า</h3>
                                            <div className='grid grid-cols-2 gap-4 text-sm'>
                                              <div>
                                                <span className='font-medium'>ชื่อ:</span> {editMenuDialog.customer_name}
                                              </div>
                                              <div>
                                                <span className='font-medium'>เบอร์โทร:</span> {editMenuDialog.customer_tel}
                                              </div>
                                              <div>
                                                <span className='font-medium'>สถานที่ส่ง:</span> {editMenuDialog.location_send}
                                              </div>
                                              <div>
                                                <span className='font-medium'>ค่าจัดส่ง:</span> {editMenuDialog.shipping_cost} บาท
                                              </div>
                                              <div>
                                                <span className='font-medium'>วันที่ส่ง:</span> {editMenuDialog.delivery_date}
                                              </div>
                                              <div className='col-span-2'>
                                                {/* <span className='font-medium'>เวลาส่ง/รับ:</span> */}
                                                <div className='flex items-center gap-4 mt-2'>
                                                  <div className='flex items-center gap-2'>
                                                    <span className='text-sm'>เวลาส่ง:</span>
                                                    <select
                                                      value={editMenuDialogTimes?.exportHour || "00"}
                                                      onChange={(e) =>
                                                        setEditMenuDialogTimes((prev) =>
                                                          prev
                                                            ? { ...prev, exportHour: e.target.value }
                                                            : { exportHour: e.target.value, exportMinute: "00", receiveHour: "00", receiveMinute: "00" }
                                                        )
                                                      }
                                                      className='border rounded px-2 py-1 text-sm'>
                                                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                                                        <option key={h} value={h}>
                                                          {h}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    :
                                                    <select
                                                      value={editMenuDialogTimes?.exportMinute || "00"}
                                                      onChange={(e) =>
                                                        setEditMenuDialogTimes((prev) =>
                                                          prev
                                                            ? { ...prev, exportMinute: e.target.value }
                                                            : { exportHour: "00", exportMinute: e.target.value, receiveHour: "00", receiveMinute: "00" }
                                                        )
                                                      }
                                                      className='border rounded px-2 py-1 text-sm'>
                                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                                                        <option key={m} value={m}>
                                                          {m}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                  <div className='flex items-center gap-2'>
                                                    <span className='text-sm'>เวลารับ:</span>
                                                    <select
                                                      value={editMenuDialogTimes?.receiveHour || "00"}
                                                      onChange={(e) =>
                                                        setEditMenuDialogTimes((prev) =>
                                                          prev
                                                            ? { ...prev, receiveHour: e.target.value }
                                                            : { exportHour: "00", exportMinute: "00", receiveHour: e.target.value, receiveMinute: "00" }
                                                        )
                                                      }
                                                      className='border rounded px-2 py-1 text-sm'>
                                                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                                                        <option key={h} value={h}>
                                                          {h}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    :
                                                    <select
                                                      value={editMenuDialogTimes?.receiveMinute || "00"}
                                                      onChange={(e) =>
                                                        setEditMenuDialogTimes((prev) =>
                                                          prev
                                                            ? { ...prev, receiveMinute: e.target.value }
                                                            : { exportHour: "00", exportMinute: "00", receiveHour: "00", receiveMinute: e.target.value }
                                                        )
                                                      }
                                                      className='border rounded px-2 py-1 text-sm'>
                                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                                                        <option key={m} value={m}>
                                                          {m}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* แสดงข้อมูล lunchbox */}
                                          <div className='space-y-4'>
                                            <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                                              <h3 className='font-semibold text-gray-800 mb-3' style={{ color: "#000000" }}>🍱 เพิ่มกล่องอาหาร</h3>

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
                                                    <option value=''>เลือกโปรโมชั่นอาหาร</option>
                                                    {[...new Set(availableLunchboxes.map((item) => item.lunchbox_name))].map((name, idx) => (
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
                                                    <option value=''>{selectedLunchboxName ? "เลือกเซทอาหาร" : "กรุณาเลือกโปรโมชั่นก่อน"}</option>
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
                                                  <p className='text-xs text-blue-600'>เลือกได้ {previewLunchbox.lunchbox_limit} อย่าง</p>
                                                </div>
                                              )}

                                              <Button type='button' size='sm' className='w-full bg-green-600 hover:bg-green-700 text-white' style={{ color: "#000000" }} onClick={handleAddLunchbox} disabled={!selectedLunchboxName || !selectedLunchboxSet}>
                                                <Container className='w-4 h-4 mr-1' />➕ เพิ่มกล่องอาหาร
                                              </Button>
                                            </div>

                                            {editMenuDialog.lunchbox && editMenuDialog.lunchbox.length > 0 && (
                                              <>
                                                <h3 className='font-semibold text-gray-800'>ข้อมูลกล่องอาหารที่เลือก</h3>
                                                <br />
                                                {editMenuDialog.lunchbox.map((lunchbox, lunchboxIdx) => (
                                                  <div key={`${lunchbox.lunchbox_name}-${lunchbox.lunchbox_set_name}-${lunchboxIdx}`} className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                                                    <div className='flex justify-between items-start mb-3'>
                                                      <div className='flex-1'>
                                                        <div className='flex justify-between items-center mb-3'>
                                                          <h4 className='font-semibold text-blue-800'>
                                                            {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set_name}
                                                          </h4>
                                                          <Button
                                                            type='button'
                                                            size='sm'
                                                            style={{ color: "#000000" }}
                                                            variant='destructive'
                                                            onClick={() => {
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

                                                                  // อัปเดต lunchbox และ menu_total ของเมนูทั้งหมดใน lunchbox นี้
                                                                  const updatedCartLunchbox = prev.lunchbox.map((lb, idx) => {
                                                                    if (idx === lunchboxIdx) {
                                                                      return {
                                                                        ...lb,
                                                                        lunchbox_total: newTotal,
                                                                        lunchbox_total_cost: newTotalCost,
                                                                        lunchbox_menu: (lb.lunchbox_menu || []).map((menu) => ({
                                                                          ...menu,
                                                                          menu_total: newTotal, // อัปเดต menu_total ของทุกเมนูให้เท่ากับ lunchbox_total
                                                                        })),
                                                                      };
                                                                    }
                                                                    return lb;
                                                                  });

                                                                  // อัปเดต menuItems ที่เกี่ยวข้องด้วย
                                                                  const updatedMenuItems = prev.menuItems.map((menuItem) => {
                                                                    // ตรวจสอบว่าเมนูนี้อยู่ใน lunchbox ที่กำลังแก้ไขหรือไม่
                                                                    const isInThisLunchbox = lunchbox.lunchbox_menu?.some((lbMenu) => lbMenu.menu_name === menuItem.menu_name);

                                                                    if (isInThisLunchbox) {
                                                                      return {
                                                                        ...menuItem,
                                                                        menu_total: newTotal,
                                                                      };
                                                                    }
                                                                    return menuItem;
                                                                  });

                                                                  return {
                                                                    ...prev,
                                                                    lunchbox: updatedCartLunchbox,
                                                                    menuItems: updatedMenuItems,
                                                                  };
                                                                });
                                                              }}
                                                            />
                                                          </div>

                                                          {/* ราคา (readonly) */}
                                                          <div>
                                                            <label className='block text-xs font-medium text-blue-700 mb-1'>ราคา (บาท)</label>
                                                            <input type='number' min={0} className='w-full px-3 py-2 border border-blue-300 rounded-md text-sm bg-gray-100 cursor-not-allowed' value={lunchbox.lunchbox_total_cost} readOnly />
                                                          </div>

                                                          {/* จำกัด (readonly) */}
                                                          <div>
                                                            <label className='block text-xs font-medium text-blue-700 mb-1'>จำกัด (กล่อง)</label>
                                                            <input type='number' min={0} className='w-full px-3 py-2 border border-blue-300 rounded-md text-sm bg-gray-100 cursor-not-allowed' value={lunchbox.lunchbox_limit} readOnly />
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className='mt-3'>
                                                      <div className='flex justify-between items-center mb-2'>
                                                        <div>
                                                          <h5 className='font-medium text-blue-800'>เมนูในกล่อง:</h5>
                                                          <p className='text-xs text-gray-600 mt-1'>
                                                            เลือกแล้ว {lunchbox.lunchbox_limit && lunchbox.lunchbox_limit > 0 ? `${lunchbox.lunchbox_menu?.length || 0}/${lunchbox.lunchbox_limit} เมนู` : `${lunchbox.lunchbox_menu?.length || 0} เมนู (ไม่จำกัด)`}
                                                          </p>
                                                        </div>

                                                        {/* ปุ่มเพิ่มเมนู */}
                                                        <div className='flex items-center gap-2'>
                                                          <select
                                                            className='px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                                                            value={selectedMenuForLunchbox[lunchboxIdx] || ""}
                                                            disabled={lunchbox.lunchbox_limit > 0 && (lunchbox.lunchbox_menu?.length || 0) >= lunchbox.lunchbox_limit}
                                                            onFocus={async () => {
                                                              // ดึงเมนูสำหรับกล่องนี้เมื่อเปิด dropdown
                                                              await fetchMenusForLunchbox(lunchbox.lunchbox_name, lunchbox.lunchbox_set_name, lunchboxIdx);
                                                            }}
                                                            onChange={(e) => {
                                                              setSelectedMenuForLunchbox((prev) => ({
                                                                ...prev,
                                                                [lunchboxIdx]: e.target.value,
                                                              }));
                                                            }}>
                                                            {(() => {
                                                              const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${lunchboxIdx}`;
                                                              const menusForThisBox = availableMenusForLunchbox[key] || [];

                                                              // ตรวจสอบจำนวนเมนูที่เลือกแล้ว vs limit
                                                              const currentMenuCount = lunchbox.lunchbox_menu?.length || 0;
                                                              const lunchboxLimit = lunchbox.lunchbox_limit ?? 0;
                                                              const isUnlimited = lunchboxLimit <= 0;
                                                              const isFull = !isUnlimited && currentMenuCount >= lunchboxLimit;

                                                              if (isFull) {
                                                                return (
                                                                  <option value='' disabled>
                                                                    เลือกครบแล้ว ({currentMenuCount}/{lunchboxLimit} เมนู)
                                                                  </option>
                                                                );
                                                              }

                                                              // สร้าง Map ของ categories ที่เลือกไปแล้ว
                                                              // แต่ถ้าเป็น Custom unlimited ให้ไม่กรอง category ซ้ำ
                                                              const selectedCategories = new Set<string>();
                                                              if (!isUnlimited) {
                                                                lunchbox.lunchbox_menu?.forEach((selectedMenu: any) => {
                                                                  // หาข้อมูลเมนูจาก availableMenusForLunchbox เพื่อดึง category
                                                                  const menuData = menusForThisBox.find((m: any) => m.menu_name === selectedMenu.menu_name);
                                                                  if (menuData?.lunchbox_menu_category) {
                                                                    selectedCategories.add(menuData.lunchbox_menu_category);
                                                                  }
                                                                });
                                                              }

                                                              const filteredMenus = menusForThisBox.filter((menu: any) => {
                                                                // ถ้าเป็น Custom unlimited ให้ไม่กรอง category ซ้ำ
                                                                if (isUnlimited) {
                                                                  return true;
                                                                }
                                                                // ตรวจสอบว่า category นี้ถูกเลือกไปแล้วหรือไม่
                                                                const menuCategory = menu.lunchbox_menu_category;
                                                                const isCategorySelected = menuCategory && selectedCategories.has(menuCategory);
                                                                return !isCategorySelected;
                                                              });

                                                              if (filteredMenus.length === 0) {
                                                                return (
                                                                  <option value='' disabled>
                                                                    ไม่มีเมนูให้เลือก
                                                                  </option>
                                                                );
                                                              }

                                                              return (
                                                                <>
                                                                  <option value='' disabled>
                                                                    เลือกเมนู
                                                                  </option>
                                                                  {filteredMenus.map((menu: any, idx: number) => {
                                                                    // หา original index จาก menusForThisBox
                                                                    const originalIdx = menusForThisBox.findIndex((m: any) => m.menu_name === menu.menu_name && m.menu_subname === menu.menu_subname);
                                                                    return (
                                                                      <option key={idx} value={originalIdx}>
                                                                        {menu.menu_name} {menu.menu_subname ? `(${menu.menu_subname})` : ""}
                                                                      </option>
                                                                    );
                                                                  })}
                                                                </>
                                                              );
                                                            })()}
                                                          </select>
                                                          <Button
                                                            type='button'
                                                            size='sm'
                                                            style={{ color: "#000000" }}
                                                            className='bg-green-600 hover:bg-green-700 text-white text-xs'
                                                            disabled={lunchbox.lunchbox_limit > 0 && (lunchbox.lunchbox_menu?.length || 0) >= lunchbox.lunchbox_limit}
                                                            onClick={() => {
                                                              const key = `${lunchbox.lunchbox_name}_${lunchbox.lunchbox_set_name}_${lunchboxIdx}`;
                                                              const menusForThisBox = availableMenusForLunchbox[key] || [];

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
                                                                if (!isNaN(selectedIdx) && selectedIdx >= 0 && selectedIdx < menusForThisBox.length) {
                                                                  handleAddMenuToLunchbox(lunchboxIdx, menusForThisBox[selectedIdx]);
                                                                  // Clear selection after adding
                                                                  setSelectedMenuForLunchbox((prev) => ({
                                                                    ...prev,
                                                                    [lunchboxIdx]: "",
                                                                  }));
                                                                } else {
                                                                  Swal.fire({
                                                                    icon: "error",
                                                                    title: "เกิดข้อผิดพลาด",
                                                                    text: "ไม่สามารถเพิ่มเมนูได้",
                                                                    showConfirmButton: false,
                                                                    timer: 2000,
                                                                  });
                                                                }
                                                              } else {
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
                                                                <div className='text-sm text-gray-600'>หมวดหมู่: {menu.menu_category}</div>
                                                              </div>
                                                              <Button
                                                                type='button'
                                                                size='sm'
                                                                variant='ghost'
                                                                className='text-red-600 hover:text-red-800 hover:bg-red-50'
                                                                onClick={() => {
                                                                  handleRemoveMenuFromLunchbox(lunchboxIdx, menuIdx, menu.menu_name);
                                                                }}>
                                                                ลบ
                                                              </Button>
                                                            </div>
                                                            <div className='text-sm text-gray-500 mt-2'>
                                                              <label className='block text-sm text-gray-600 mb-1 ' style={{ color: "#000000" }}>คำอธิบายเมนู</label>
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
                                                                          menuItems: prev.menuItems.map((mi) => (mi.menu_name === menu.menu_name ? { ...mi, menu_description: newDesc } : mi)),
                                                                        };
                                                                      });
                                                                    }}
                                                                  />
                                                                );
                                                              })()}
                                                            </div>

                                                            {/* แก้ไขจำนวนกล่องของเมนู */}
                                                            <div className='mt-2 flex items-center gap-2'>
                                                              <span className='text-sm text-gray-700' style={{ color: "#000000" }}>จำนวนกล่อง:</span>
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
                                                                          menuItems: prev.menuItems.map((mi) => (mi.menu_name === menu.menu_name ? { ...mi, menu_total: newVal } : mi)),
                                                                        };
                                                                      });
                                                                    }}
                                                                  />
                                                                );
                                                              })()}
                                                            </div>

                                                            {/* แก้ไขจำนวนวัตถุดิบ */}
                                                            <div className='mt-3'>
                                                              <h6 className='text-sm font-medium text-gray-700 mb-1' style={{ color: "#000000" }}>วัตถุดิบ:</h6>
                                                              <div className='space-y-1'>
                                                                {(() => {
                                                                  const editableItem = editMenuDialog.menuItems.find((m) => m.menu_name === menu.menu_name);
                                                                  const ingredients = editableItem?.menu_ingredients ?? menu.menu_ingredients;
                                                                  return ingredients.map((ingredient, ingIdx) => (
                                                                    <div key={`${ingredient.ingredient_name}-${lunchboxIdx}-${menuIdx}-${ingIdx}`} className='flex items-center justify-between text-xs text-gray-600'>
                                                                      <span>• {ingredient.ingredient_name}</span>
                                                                      <div className='flex items-center gap-2'>
                                                                        <input
                                                                          type='number'
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
                                                                                      menu_ingredients: mi.menu_ingredients.map((ing) => (ing.ingredient_name === ingredient.ingredient_name ? { ...ing, useItem: newUse } : ing)),
                                                                                    }
                                                                                    : mi
                                                                                ),
                                                                              };
                                                                            });
                                                                          }}
                                                                        />
                                                                        <span>หน่วย</span>
                                                                      </div>
                                                                    </div>
                                                                  ));
                                                                })()}
                                                              </div>
                                                            </div>
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
                                              style={{ color: "#000000" }}  
                                              variant='outline'
                                              onClick={() => {
                                                setEditMenuDialog(null);
                                                setEditMenuDialogTimes(null);
                                                setShouldFetchMenu(false);
                                                setSelectedLunchboxName("");
                                                setSelectedLunchboxSet("");
                                                setPreviewLunchbox(null);
                                                setAvailableMenusForLunchbox({}); // Clear เมนูที่โหลดไว้
                                                setIsDeleting(false); // Reset flag when closing dialog
                                              }}>
                                              ยกเลิก
                                            </Button>
                                            <Button
                                              style={{ color: "#000000" }}  
                                              onClick={async () => {
                                                // เรียกใช้ฟังก์ชัน handleEdit.Menu
                                                if (editMenuDialog) {
                                                  console.log("🚀 [BEFORE SAVE] ข้อมูลที่จะส่งไปยัง handleEdit.Menu:");
                                                  console.log("📦 id:", editMenuDialog.id);
                                                  console.log("📋 menuItems:", JSON.stringify(editMenuDialog.menuItems, null, 2));
                                                  console.log("🍱 lunchbox:", JSON.stringify(editMenuDialog.lunchbox, null, 2));

                                                  // Save times if they were changed
                                                  if (editMenuDialogTimes) {
                                                    const exportTime = `${editMenuDialogTimes.exportHour}:${editMenuDialogTimes.exportMinute}`;
                                                    const receiveTime = `${editMenuDialogTimes.receiveHour}:${editMenuDialogTimes.receiveMinute}`;
                                                    
                                                    // Check if times changed
                                                    const timesChanged = 
                                                      exportTime !== editMenuDialog.export_time || 
                                                      receiveTime !== editMenuDialog.receive_time;

                                                    if (timesChanged) {
                                                      try {
                                                        const payload = {
                                                          export_time: exportTime,
                                                          receive_time: receiveTime,
                                                        };
                                                        const response = await axios.patch(`/api/edit/cart_time/${editMenuDialog.id}`, payload);

                                                        if (response.status !== 200) {
                                                          const errorData = response.data;
                                                          throw new Error(errorData.error || "Failed to update times");
                                                        }
                                                      } catch (err) {
                                                        console.error("Error updating times:", err);
                                                        Swal.fire({
                                                          icon: "error",
                                                          title: "เกิดข้อผิดพลาด",
                                                          text: err instanceof Error ? err.message : "ไม่สามารถอัปเดตเวลาได้",
                                                          showConfirmButton: false,
                                                          timer: 3000,
                                                        });
                                                        return;
                                                      }
                                                    }
                                                  }

                                                  handleEdit.Menu(editMenuDialog.id, editMenuDialog.menuItems, editMenuDialog.lunchbox);
                                                }
                                              }}
                                              disabled={isSaving !== null}>
                                              {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogTitle>
                                  </DialogContent>
                                </Dialog>
                                <Accordion type='multiple' className='space-y-3'>
                                  {cart.lunchbox && cart.lunchbox.length > 0
                                    ? cart.lunchbox.map((lunchbox, lunchboxIdx) => (
                                      <AccordionItem key={lunchboxIdx} value={`lunchbox-${lunchboxIdx}`} className='rounded-xl border border-blue-200 shadow-sm px-4 py-3 bg-blue-50'>
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
                                              <AccordionItem key={menuIdx} value={`menu-${lunchboxIdx}-${menuIdx}`} className={`rounded-lg border border-slate-200 shadow-sm px-3 py-2 ${allIngredientsChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                                <AccordionTrigger className='w-full flex items-center justify-between px-2 py-1 hover:no-underline'>
                                                  <div className='flex flex-col items-start'>
                                                    <span className='truncate text-sm text-gray-700 font-medium'>
                                                      {menu.menu_name} {menu.menu_subname && `(${menu.menu_subname})`}
                                                    </span>
                                                    <span className='truncate text-xs text-gray-500 mt-1'>
                                                      หมวดหมู่: {menu.menu_category} | จำนวน: {menu.menu_total} กล่อง
                                                    </span>
                                                    {menu.menu_description && <span className='truncate text-xs text-gray-400 mt-1'>{menu.menu_description}</span>}
                                                  </div>
                                                </AccordionTrigger>

                                                <AccordionContent className='pt-3 space-y-2'>
                                                  {menu.menu_ingredients?.map((ing, idx) => (
                                                    <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.ingredient_status ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} text-sm`}>
                                                      <span className='text-gray-700'>{ing.ingredient_name || `Unknown ingredient`}</span>

                                                      <div className='flex items-center gap-4'>
                                                        <span className='text-gray-600'>
                                                          ใช้ {ing.useItem} {ing.ingredient_unit || "หน่วย"} × {menu.menu_total} กล่อง ={" "}
                                                          <strong className='text-black-600' style={{ color: "#000000" }}>
                                                            {ing.useItem * menu.menu_total}
                                                          </strong>{" "}
                                                          {ing.ingredient_unit || "หน่วย"}
                                                        </span>

                                                        <label className={`${cart.status === "completed" ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                                                          <input type='checkbox' checked={ing.ingredient_status || false} onChange={() => handleToggleIngredientCheck(cart.id, menu.menu_name, ing.ingredient_name)} className='hidden' disabled={cart.status !== "completed"} />
                                                          <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${ing.ingredient_status ? "bg-green-500" : "bg-red-500"} ${cart.status !== "completed" ? "opacity-50" : ""}`}>
                                                            <span className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${ing.ingredient_status ? "translate-x-5" : "translate-x-0.5"}`} />
                                                          </span>
                                                        </label>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </AccordionContent>
                                              </AccordionItem>
                                            );
                                          })}
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))
                                    : // Fallback to old structure if lunchbox is not available
                                    cart.allIngredients.map((menuGroup, groupIdx) => {
                                      const totalBox = cart.menuItems.find((me) => me.menu_name === menuGroup.menuName)?.menu_total || 0;
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
                                          </AccordionTrigger>

                                          <AccordionContent className='pt-3 space-y-2'>
                                            {menuGroup.ingredients.map((ing, idx) => (
                                              <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.isChecked ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} text-sm`}>
                                                <span className='text-gray-700'>{ing.ingredient_name || `Unknown ingredient`}</span>

                                                <div className='flex items-center gap-4'>
                                                  <span className='text-gray-600'>
                                                    ใช้ {ing.useItem} {ing.ingredient_unit} × {totalBox} กล่อง ={" "}
                                                    <strong className='text-black-600' style={{ color: "#000000" }}>
                                                      {ing.calculatedTotal}
                                                    </strong>{" "}
                                                    {ing.ingredient_unit}
                                                  </span>

                                                  <label className={`${cart.status === "completed" ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                                                    <input type='checkbox' checked={ing.isChecked || false} onChange={() => handleToggleIngredientCheck(cart.id, menuGroup.menuName, ing.ingredient_name)} className='hidden' disabled={cart.status !== "completed"} />
                                                    <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${ing.isChecked ? "bg-green-500" : "bg-red-500"} ${cart.status !== "completed" ? "opacity-50" : ""}`}>
                                                      <span className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${ing.isChecked ? "translate-x-5" : "translate-x-0.5"}`} />
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
                    {/* <Button
                      size='sm'
                      onClick={() => handleSummary("date", Time.convertThaiDateToISO(orders[0].delivery_date)!)}
                      className='h-9 px-4 rounded-xl border border-emerald-500 text-emerald-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md mb-4'
                      style={{ color: "#000000", background: "#fcf22d" }}>
                      📦 สรุปวัตถุดิบทั้งหมด
                    </Button> */}
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
                          (วันที่ส่ง: {selectedCartForSummary.delivery_date})
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
                            onClick={() => handleCheck.AllIngredients(selectedCartForSummary.id)}
                            className='w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg'
                            disabled={isSaving === selectedCartForSummary.id || allIngredientsChecked || selectedCartForSummary.status !== "completed"}>
                            {selectedCartForSummary.status !== "completed" ? "ต้องชำระเงินก่อนเลือกวัตถุดิบ" : isSaving === selectedCartForSummary.id ? "กำลังบันทึก..." : "เลือกวัตถุดิบทั้งหมด"}
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
    </>
  );
};

// Wrapper component ที่ใช้ Suspense boundary สำหรับ useSearchParams
const SummaryListPage: React.FC = () => {
  return (
    <Suspense fallback={<Loading context='หน้าสรุปรายการ' icon={SummaryIcon.src} />}>
      <SummaryList />
    </Suspense>
  );
};

export default SummaryListPage;
