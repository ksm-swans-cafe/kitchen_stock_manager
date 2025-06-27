"use client";

import React, { useState, useEffect, useMemo } from "react";

import Calendar from "@/components/ui/Calendar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import {
  Clock,
  User,
  Package,
  Search,
  Filter,
  Download,
  Users,
  Edit2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/share/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/share/ui/pagination";
import { Input } from "@/share/ui/input";
import ResponsiveOrderId from "./ResponsiveOrderId";
import StatusDropdown from "./StatusDropdown";

interface Ingredient {
  ingredient_id?: number;
  ingredient_name: string;
  useItem: number;
  calculatedTotal?: number;
  sourceMenu?: string;
  isChecked?: boolean; // ใช้ใน frontend เพื่อ map กับ ingredient_status
  ingredient_status?: boolean; // ใช้ใน backend
}

interface MenuItem {
  menu_name: string;
  menu_total: number;
  menu_ingredients: Ingredient[];
  status?: string;
  order_number?: string;
}

interface Cart {
  id: string;
  orderNumber: string;
  name: string;
  date: string;
  dateISO: string;
  time: string;
  sets: number;
  price: number;
  status: string;
  createdBy: string;
  menuItems: MenuItem[];
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
    ingredient_status: boolean;
  }[];
  order_number: string;
  cart_delivery_date?: string;
  cart_receive_time?: string;
  cart_customer_tel?: string;
  cart_location_send?: string;
}

interface CartItem extends MenuItem {
  totalPrice?: number;
}

type RawCart = {
  cart_id: string;
  cart_menu_items: string | MenuItem[];
  cart_create_date: string;
  cart_total_price: number;
  cart_status: string;
  cart_order_number: string;
  cart_username: string;
  cart_customer_tel: string;
  cart_location_send: string;
  cart_delivery_date: string;
  cart_export_time: string;
  cart_receive_time: string;
};

interface StatusDropdownProps {
  cartId: string;
  allIngredients: { menuName: string; ingredients: any[] }[];
  defaultStatus: string;
  onStatusChange?: () => void; // เพิ่ม prop นี้
}

const OrderHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // setSortBy
  const [sortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterCreator, setFilterCreator] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMenu, setEditingMenu] = useState<{
    cartId: string;
    menuName: string;
  } | null>(null);
  const [editTotalBox, setEditTotalBox] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Cart[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  // calendar
  const handleOpenDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  // const handleDateSelect = (date: Date) => {
  //   const selectedDateISO = date.toISOString().split("T")[0];
  //   setSelectedDate(date);
  //   setIsDatePickerOpen(false);
  //   setCarts(allCarts.filter((cart) => cart.dateISO === selectedDateISO));
  // };

  const safeParseJSON = (jsonString: string): CartItem[] => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return [];
    }
  };

  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/get/carts");
      if (!response.ok) throw new Error("Failed to fetch carts");
      const data = await response.json();
      console.log("Fetched carts data:", data);

      const menuResponse = await fetch("/api/get/menu-list");
      if (!menuResponse.ok) throw new Error("Failed to fetch menu");
      const menuData = await menuResponse.json();

      const ingredientResponse = await fetch("/api/get/ingredients");
      if (!ingredientResponse.ok)
        throw new Error("Failed to fetch ingredients");
      const ingredientData = await ingredientResponse.json();

      const formattedOrders: Cart[] = data.map((cart: RawCart) => {
        console.log("Processing cart:", cart.cart_create_date);
        const [rawDate, rawTime] = cart.cart_create_date.split("T");
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
        // const formattedDate = date
        //   .toLocaleDateString("th-TH", {
        //     day: "numeric",
        //     month: "short",
        //     year: "numeric",
        //   })
        //   .replace(/ /g, " ");

        const formattedTime = cart.cart_create_date
          .split("T")[1]
          .split(".")[0]
          .slice(0, 5);

        console.log(
          "Processing cart ID:",
          cart.cart_id,
          "cart_menu_items:",
          cart.cart_menu_items
        );
        const menuItems: MenuItem[] =
          typeof cart.cart_menu_items === "string" && cart.cart_menu_items
            ? safeParseJSON(cart.cart_menu_items)
            : Array.isArray(cart.cart_menu_items)
            ? cart.cart_menu_items.filter(
                (item) => item && typeof item.menu_total === "number"
              )
            : [];
        console.log("Parsed menuItems:", menuItems);

        const totalSets = menuItems
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.menu_total === "number"
          )
          .reduce((sum, item) => sum + (item.menu_total || 0), 0);

        const menuDisplayName =
          menuItems.length > 0
            ? menuItems
                .map(
                  (item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`
                )
                .join(" + ")
            : "ไม่มีชื่อเมนู";

            const allIngredients = menuItems.map((menu) => {
              const menuFromDB = menuData.find(
                (m: MenuItem) => m.menu_name === menu.menu_name
              );
              const dbIngredients = Array.isArray(menuFromDB?.menu_ingredients)
                ? menuFromDB.menu_ingredients
                : menu.menu_ingredients || [];
            
              return {
                menuName: menu.menu_name,
                ingredients: dbIngredients.map((dbIng: Ingredient) => {
                  const ingredientFromDB = ingredientData.find(
                    (ing: Ingredient) =>
                      ing.ingredient_name === dbIng.ingredient_name
                  );
                  const ingredientName =
                    ingredientFromDB?.ingredient_name ||
                    `ไม่พบวัตถุดิบ (ID: ${dbIng.ingredient_name})`;
                  return {
                    ...dbIng,
                    ingredient_id: ingredientFromDB?.ingredient_id,
                    ingredient_name: ingredientName || dbIng.ingredient_name,
                    calculatedTotal: dbIng.useItem * (menu.menu_total || 0),
                    sourceMenu: menu.menu_name,
                    isChecked: dbIng.isChecked || false, // เพิ่มการกำหนดค่าเริ่มต้น
                  };
                }),
              };
            });
            
            const orderNumber = `ORD${
              cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"
            }`;
            return {
              id: cart.cart_id || "no-id",
              orderNumber,
              name: menuDisplayName,
              date: formattedDate,
              dateISO: formattedDateISO,
              time: formattedTime, // แก้จาก formatted FormattingTime เป็น formattedTime
              sets: totalSets,
              price: cart.cart_total_price || 0,
              status: cart.cart_status,
              createdBy: cart.cart_username || "ไม่ทราบผู้สร้าง",
              menuItems: menuItems.map((item) => ({ ...item })),
              allIngredients,
              order_number: cart.cart_order_number,
              cart_delivery_date: cart.cart_delivery_date,
              cart_customer_tel: cart.cart_customer_tel,
              cart_location_send: cart.cart_location_send,
            };
      });

      formattedOrders.sort((a, b) => {
        const dateA = new Date(`${a.dateISO}T${a.time}:00`);
        const dateB = new Date(`${b.dateISO}T${b.time}:00`);
        return dateB.getTime() - dateA.getTime();
      });
      setAllCarts(formattedOrders);
      setCarts(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIngredientCheck = async (
    cartId: string,
    menuName: string,
    ingredientName: string
  ) => {
    // Optimistic update
    const previousCarts = [...carts];
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
                          ? { ...ing, isChecked: !ing.isChecked }
                          : ing
                      ),
                      ingredient_status: group.ingredients.every(
                        (ing) => ing.ingredient_name === ingredientName ? !ing.isChecked : ing.isChecked
                      ),
                    }
                  : group
              ),
            }
          : cart
      )
    );
  
    try {
      const response = await fetch(`/api/edit/cart_menu_ingredient_status/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuName,
          ingredientName, // ใช้ ingredientName แทน ingredientId
          isChecked: !carts
            .find((cart) => cart.id === cartId)
            ?.allIngredients.find((group) => group.menuName === menuName)
            ?.ingredients.find((ing) => ing.ingredient_name === ingredientName)?.isChecked,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("PATCH API error:", errorData);
        throw new Error(errorData.error || "Failed to update ingredient status");
      }
    } catch (err) {
      console.error("Error updating ingredient status:", err);
      setError(
        err instanceof Error
          ? `ไม่สามารถอัปเดตสถานะวัตถุดิบ: ${err.message}`
          : "เกิดข้อผิดพลาดในการอัปเดตสถานะวัตถุดิบ"
      );
      setCarts(previousCarts); // Revert optimistic update
    }
  };

  const convertThaiDateToISO = (
    thaiDate: string | undefined
  ): string | null => {
    if (!thaiDate) return null;
    const [day, month, year] = thaiDate.split("/");
    const buddhistYear = parseInt(year, 10);
    const christianYear = buddhistYear - 543;
    return `${christianYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const fetchCalendars = async () => {
    try {
      const response = await fetch("/api/get/carts");
      if (!response.ok) throw new Error("Failed to fetch carts");
      const data = await response.json();

      const events = data
        .map((cart: RawCart) => {
          const deliveryDate = convertThaiDateToISO(cart.cart_delivery_date);
          if (!deliveryDate) return null;

          return {
            title: "●", // ใช้สัญลักษณ์วงกลม (Unicode U+25CF)
            start: deliveryDate,
            backgroundColor: "#ef4444", // สีแดงสำหรับวันที่ต้องส่ง
            borderColor: "#ef4444",
            allDay: true,
            timeZone: "Asia/Bangkok",
            extendedProps: {
              orderId: cart.cart_id,
              status: cart.cart_status,
              // exportTime: cart.cart_export_time || "N/A",
              // receiveTime: cart.cart_receive_time || "N/A",
              customerTel: cart.cart_customer_tel || "N/A",
              location: cart.cart_location_send || "N/A",
            },
          };
        })
        .filter((event: any) => event !== null);

      setCalendarEvents(events);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("ไม่สามารถโหลดข้อมูลปฏิทินได้");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCalendars();
  }, []);

  const handleDateClick = (info: any) => {
    const selectedDate = info.dateStr;
    console.log("Selected Date:", selectedDate); // ตรวจสอบว่า selectedDate เป็น YYYY-MM-DD
    const filteredOrders = allCarts.filter(
      (cart) => cart.dateISO === selectedDate
    );
    console.log("Filtered Orders:", filteredOrders); // ตรวจสอบว่า filteredOrders มีออร์เดอร์หรือว่างเปล่า
    setSelectedOrders(filteredOrders);
    setIsOrderModalOpen(true);
    setSelectedDate(new Date(selectedDate));
    setIsDatePickerOpen(false);
    setCarts(filteredOrders);
    if (filteredOrders.length === 0) {
      setError(
        `ไม่มีออร์เดอร์สำหรับวันที่ ${formatDate(new Date(selectedDate), {
          year: "numeric",
          month: "short",
          day: "numeric",
          locale: "th",
          timeZone: "Asia/Bangkok", // Explicitly set to UTC+7
        })}`
      );
    } else {
      setError(null);
    }
  };

  const handleEditTotalBox = (
    cartId: string,
    menuName: string,
    currentTotal: number
  ) => {
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
    console.log("Preparing to update menu:", cleanedMenuName);

    setIsSaving(cartId);
    try {
      const patchResponse = await fetch(`/api/edit/cart_menu/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuName: menuName, menu_total: editTotalBox }),
      });

      if (!patchResponse.ok) {
        const errorData = await patchResponse.json();
        console.error("PATCH API error:", errorData);
        throw new Error(errorData.error || "Failed to update total box");
      }

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                menuItems: cart.menuItems.map((item) =>
                  item.menu_name === cleanedMenuName
                    ? { ...item, menu_total: editTotalBox }
                    : item
                ),
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
                sets: cart.menuItems.reduce(
                  (sum, item) =>
                    sum +
                    (item.menu_name === cleanedMenuName
                      ? editTotalBox
                      : item.menu_total),
                  0
                ),
              }
            : cart
        )
      );

      alert(`อัปเดตจำนวนกล่องสำหรับ "${cleanedMenuName}" สำเร็จ!`);
      await fetchOrders();
      setEditingMenu(null);
    } catch (err) {
      console.error("Error updating total box:", err);
      setError(
        err instanceof Error
          ? `ไม่สามารถอัปเดตจำนวนกล่อง: ${err.message}`
          : "เกิดข้อผิดพลาดในการอัปเดตจำนวนกล่อง"
      );
      await fetchOrders();
    } finally {
      setIsSaving(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";
      case "completed":
        return "ยืนยันแล้ว";
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
    let filtered = [...carts].filter(
      (cart) => cart.status === "pending" || cart.status === "completed"
    );
    console.log("Carts before filtering:", filtered);

    if (selectedDate) {
      const selectedDateISO = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      filtered = filtered.filter((order) => order.dateISO === selectedDateISO);
    }

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        [order.name, order.id, order.createdBy].some((field) =>
          (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter(
        (order) => getStatusText(order.status) === filterStatus
      );
    }
    if (filterCreator !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    filtered.sort((a, b) => {
      let aVal: string | number = a[sortBy as keyof typeof a] as
        | string
        | number;
      let bVal: string | number = b[sortBy as keyof typeof b] as
        | string
        | number;
      if (sortBy === "date") {
        aVal = a.dateISO;
        bVal = b.dateISO;
      }
      return sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
    console.log("Filtered and Sorted Orders:", filtered);

    return filtered;
  }, [
    carts,
    searchTerm,
    filterStatus,
    filterCreator,
    sortBy,
    sortOrder,
    selectedDate,
  ]);

  const handleSummaryClick = (cart: Cart) => {
    setSelectedCart(cart);
    setIsSummaryModalOpen(true);
  };

  const summarizeIngredients = (cart: Cart) => {
    const ingredientSummary: {
      [key: string]: { checked: number; total: number };
    } = {};

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

    return Object.entries(ingredientSummary).map(
      ([name, { checked, total }]) => ({
        name,
        checked,
        total,
      })
    );
  };

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const headers = [
      "เลขที่ออร์เดอร์",
      "ชื่อเมนู",
      "วันที่",
      "เวลา",
      "จำนวน Set",
      "ราคา",
      "สถานะ",
      "ผู้สร้าง",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedOrders.map((cart) =>
        [
          cart.id,
          cart.name,
          cart.date,
          cart.time,
          cart.sets,
          cart.price,
          getStatusText(cart.status),
          cart.createdBy,
        ].join(",")
      ),
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

    const tableColumn = [
      "Order ID",
      "Menu",
      "Date",
      "Time",
      "Sets",
      "Price",
      "Status",
      "Created By",
    ];
    const tableRows = filteredAndSortedOrders.map((cart) => [
      cart.id,
      cart.name,
      cart.date,
      cart.time,
      cart.sets,
      cart.price,
      getStatusText(cart.status),
      cart.createdBy,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { font: "helvetica", fontSize: 10 },
    });

    doc.save("order_history.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Order History</h2>
        <p className="text-slate-600 mb-4">
          จัดการและติดตามประวัติการสั่งซื้อทั้งหมด
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          <div className="col-span-full xl:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <Input
                placeholder="Enter name, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-10 bg-white border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 rounded-xl shadow-sm:text-sm"
              />
            </div>
          </div>

          <div>
            <Button
              onClick={handleOpenDatePicker}
              className="w-full h-10 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center px-3 text-sm text-slate-600"
            >
              {selectedDate
                ? `วันที่ ${formatDate(selectedDate, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    locale: "th",
                    timeZone: "Asia/Bangkok", // Explicitly set to UTC+7
                  })}`
                : "เลือกวันที่"}
            </Button>

            <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <DialogContent className="max-w-4xl">
                <DialogTitle className="sr-only">Calendar View</DialogTitle>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  timeZone="Asia/Bangkok" // Explicitly set to UTC+7
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventContent={(eventInfo) => (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-xl text-red-500">
                        {eventInfo.event.title}
                      </span>
                    </div>
                  )}
                  height="auto"
                  locale="th"
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
            <Select
              value={sortOrder}
              onValueChange={(val: "asc" | "desc") => setSortOrder(val)}
            >
              <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 shadow-sm">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                avoidCollisions={false}
              >
                <SelectItem value="desc">Latest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                avoidCollisions={false}
              >
                <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                <SelectItem value="ยืนยันแล้ว">ยืนยันแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 shadow-sm">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="All creators" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                avoidCollisions={false}
              >
                <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                {uniqueCreators.map((creator) => (
                  <SelectItem key={creator} value={creator}>
                    {creator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <Button
            onClick={() => {
              setSelectedDate(null);
              setCarts(allCarts);
            }}
            className="h-10 rounded-lg border border-slate-300 shadow-sm"
          >
            ล้างวันที่
          </Button>
          <Button
            onClick={handleExportCSV}
            className="flex items-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>

        <div className="space-y-4">
  {isLoading ? (
    <Card>
      <CardContent className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <span className="text-slate-500">Loading...</span>
      </CardContent>
    </Card>
  ) : paginatedOrders.length === 0 ? (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <span className="text-slate-500">No orders found</span>
      </CardContent>
    </Card>
  ) : (
    <Accordion type="multiple" className="space-y-4">
      {paginatedOrders.map((cart) => (
        <AccordionItem
          key={cart.id}
          value={cart.id}
          className="border-none"
        >
          <Card
            className={`bg-gradient-to-r ${getStatusColor(
              cart.status
            )} p-4 rounded-xl shadow-sm`}
          >
            <AccordionTrigger className="w-full hover:no-underline px-0">
              <div className="flex flex-col gap-3 w-full text-slate-700 text-sm sm:text-base">
                <div>
                  Order ID: {cart.id.slice(0, 8)}... (No:{" "}
                  {String(cart.order_number).padStart(3, "0")})
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="truncate text-sm sm:text-base">
                    Created by:{" "}
                    <span className="font-semibold">
                      {cart.createdBy}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 font-semibold text-black">
                  <div className="flex items-center gap-1 text-sm sm:text-base">
                    <Package className="w-4 h-4" />
                    <span>Total {cart.sets} boxes</span>
                    <span className="text-sm sm:text-base">
                      ฿{cart.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>Date {cart.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{cart.time}</span>
                  </div>
                </div>
                <div className="hidden flex items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] sm:text-xs text-gray-500">
                  <ResponsiveOrderId
                    id={cart.id}
                    maxFontSize={10}
                    minFontSize={10}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <div className="flex justify-center">
              <StatusDropdown
                cartId={cart.id}
                allIngredients={cart.allIngredients}
                defaultStatus={cart.status}
              />
            </div>
            <AccordionContent className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold mb-2 text-emerald-700 flex items-center gap-2">
                    <User className="w-4 h-4" /> Ordered Menus
                  </h4>
                  <Accordion type="multiple" className="space-y-3">
                    {cart.allIngredients.map((menuGroup, groupIdx) => {
                      const totalBox =
                        cart.menuItems.find(
                          (item) =>
                            item.menu_name === menuGroup.menuName
                        )?.menu_total || 0;
                      const isEditingThisMenu =
                        editingMenu?.cartId === cart.id &&
                        editingMenu?.menuName === menuGroup.menuName;
                      // const allIngredientsChecked =
                      //   menuGroup.ingredients.length > 0 &&
                      //   menuGroup.ingredients.every(
                      //     (ing) => ing.isChecked
                      //   );
                      const allIngredientsChecked =
                      menuGroup.ingredients.length > 0 &&
                      menuGroup.ingredients.every((ing) => ing.isChecked);
                      
                      return (
                        <AccordionItem
                          key={groupIdx}
                          value={`menu-${groupIdx}`}
                          className={`rounded-xl border border-slate-200 shadow-sm px-4 py-3 ${
                            allIngredientsChecked
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <AccordionTrigger className="w-full flex items-center justify-between px-2 py-1 hover:no-underline">
                            <span className="truncate text-sm text-gray-700">
                              {menuGroup.menuName}
                            </span>
                            <span className="text-sm font-mono text-blue-600">
                              ({totalBox} boxes)
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-3 space-y-2">
                            {isEditingThisMenu ? (
                              <div className="flex items-center gap-2 mb-3">
                                <Input
                                  type="number"
                                  value={editTotalBox}
                                  onChange={(e) =>
                                    setEditTotalBox(
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 h-8 text-sm rounded-md border-gray-300"
                                  min="0"
                                  aria-label="Edit box quantity"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSaveTotalBox(
                                      cart.id,
                                      menuGroup.menuName
                                    )
                                  }
                                  className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                                  aria-label="Save box quantity"
                                  disabled={isSaving === cart.id}
                                >
                                  {isSaving === cart.id
                                    ? "Saving..."
                                    : "Save"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingMenu(null)}
                                  className="h-8 px-2 text-gray-600 hover:bg-gray-50"
                                  aria-label="Cancel edit"
                                  disabled={isSaving === cart.id}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditTotalBox(
                                      cart.id,
                                      menuGroup.menuName,
                                      totalBox
                                    )
                                  }
                                  className="h-8 px-2 text-blue-600 hover:bg-blue-100"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {menuGroup.ingredients.map((ing, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                                  ing.isChecked
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                } text-sm`}
                              >
                                <span className="text-gray-700">
                                  {ing.ingredient_name ||
                                    `Unknown ingredient`}
                                </span>
                                <div className="flex items-center gap-4">
                                  <span className="text-gray-600">
                                    Use {ing.useItem} g/box × {totalBox}{" "}
                                    ={" "}
                                    <strong className="font-bold text-black">
                                      {ing.calculatedTotal}
                                    </strong>{" "}
                                    g
                                  </span>
                                  <label className="cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={ing.isChecked || false}
                                      onChange={() =>
                                        handleToggleIngredientCheck(
                                          cart.id,
                                          menuGroup.menuName,
                                          ing.ingredient_name
                                        )
                                      }
                                      className="hidden"
                                    />
                                    <span
                                      className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                                        ing.isChecked
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    >
                                      <span
                                        className={`absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                          ing.isChecked
                                            ? "translate-x-5"
                                            : "translate-x-0.5"
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
      ))}
    </Accordion>
  )}
</div>

        <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle>สรุปวัตถุดิบทั้งหมด</DialogTitle>
            {selectedCart && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-700">
                  Order ID: {selectedCart.id.slice(0, 8)}... (No:{" "}
                  {String(selectedCart.order_number).padStart(3, "0")})
                </h4>
                <div className="space-y-2">
                  {summarizeIngredients(selectedCart).map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm border-b border-gray-200 py-2"
                    >
                      <span className="text-gray-700">{ing.name}</span>
                      <span className="text-gray-600">
                        {ing.checked}/{ing.total} กรัม
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg"
                >
                  ปิด
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
