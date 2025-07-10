"use client";

import React, { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate, EventInput } from "@fullcalendar/core";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { BsCashStack } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import {
    Clock,
    User,
    Package,
    FileText,
    Search,
    CalendarDays,
    Filter,
    Smartphone,
    Wallet,
    Map,
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
import { useRouter } from "next/navigation";
import { Ingredient, MenuItem, Cart, CartItem, RawCart } from "@/types/interface_summary_orderhistory"; // Assuming you have a types file

const OrderHistory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    // setSortBy
    const [sortBy] = useState("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
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

    const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<Cart[]>([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedDateForSummary, setSelectedDateForSummary] = useState<
        string | null
    >(null);

    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
    // calendar
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

    const handleorderhistoryprice = () => {
        router.push("/home/orderhistory");
    };

    const [allCarts, setAllCarts] = useState<Cart[]>([]);
    const [carts, setCarts] = useState<Cart[]>([]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch carts
            const response = await fetch("/api/get/carts");
            if (!response.ok) throw new Error("Failed to fetch carts");
            const cartData = await response.json();
    
            // Fetch menu list
            const menuResponse = await fetch("/api/get/menu-list");
            if (!menuResponse.ok) throw new Error("Failed to fetch menu");
            const menuData = await menuResponse.json();
    
            // Fetch ingredients
            const ingredientResponse = await fetch("/api/get/ingredients");
            if (!ingredientResponse.ok) throw new Error("Failed to fetch ingredients");
            const ingredientData = await ingredientResponse.json();
    
            // สร้าง Map สำหรับ ingredient_unit เพื่อให้ง่ายต่อการค้นหา
            const ingredientUnitMap = new globalThis.Map<string, string>();
            ingredientData.forEach((ing: any) => {
                ingredientUnitMap.set(ing.ingredient_name.toString(), ing.ingredient_unit);
            });
    
            const formattedOrders: Cart[] = cartData.map((cart: RawCart) => {
                const [rawDate] = cart.cart_create_date.split("T");
                const [year, month, day] = rawDate.split("-");
                const dateObjectForLocale = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day)
                );
                const formattedDate = dateObjectForLocale
                    .toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    .replace(/ /g, " ");
    
                const date = new Date(cart.cart_create_date);
                const formattedDateISO = date.toISOString().split("T")[0];
                const formattedTime = cart.cart_create_date
                    .split("T")[1]
                    .split(".")[0]
                    .slice(0, 5);
    
                const menuItems: MenuItem[] =
                    typeof cart.cart_menu_items === "string" && cart.cart_menu_items
                        ? safeParseJSON(cart.cart_menu_items)
                        : Array.isArray(cart.cart_menu_items)
                            ? cart.cart_menu_items.filter(
                                  (item) => item && typeof item.menu_total === "number"
                              )
                            : [];
    
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
                    ingredient_status: menu.menu_ingredients.every(
                        (ing: Ingredient) => ing.ingredient_status ?? false
                    ),
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
                    menuItems: menuItems.map((item) => ({ ...item })),
                    allIngredients,
                    order_number: cart.cart_order_number,
                    cart_delivery_date: cart.cart_delivery_date,
                    cart_receive_time: cart.cart_receive_time,
                    cart_export_time: cart.cart_export_time,
                    cart_customer_tel: cart.cart_customer_tel,
                    cart_customer_name: cart.cart_customer_name,
                    cart_location_send: cart.cart_location_send,
                };
            });
    
            setAllCarts(formattedOrders);
            setCarts(formattedOrders);
            // อัปเดต calendarEvents หรือ state อื่น ๆ ตามต้องการ
        } catch (error) {
            // setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
            if (error instanceof Error) {
                setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
            } else {
                setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + String(error));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันจัดรูปแบบเวลาโดยอัตโนมัติ
    const formatInputTime = (value: string): string => {
        // ลบตัวอักษรที่ไม่ใช่ตัวเลขหรือจุด
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

            const groupedByDate: { [date: string]: RawCart[] } = {};

            const allowedStatuses = ["cancelled", "success"];

            data.forEach((cart: RawCart) => {

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
                // color: "#ef4444",
                borderColor: "#ef4444",
                // textColor: "#ffffff",
                timeZone: "Asia/Bangkok",
                extendedProps: {
                    carts,
                },
            }));

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

    const handleDateClick = (info: { dateStr: string }) => {
        const selectedDateStr = info.dateStr;
        console.log("Selected Date:", selectedDateStr);
        const filteredOrders = allCarts.filter(
            (cart) =>
                convertThaiDateToISO(cart.cart_delivery_date) === selectedDateStr
        );
        console.log("Filtered Orders:", filteredOrders);
        setSelectedOrders(filteredOrders);
        setIsOrderModalOpen(true);
        setSelectedDate(new Date(selectedDateStr));
        setIsDatePickerOpen(false);
        setCarts(filteredOrders);
        if (filteredOrders.length === 0) {
            setError(
                `ไม่มีออร์เดอร์สำหรับวันที่ ${formatDate(new Date(selectedDateStr), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    locale: "th",
                    timeZone: "Asia/Bangkok",
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
        let filtered = [...carts].filter(
            (cart) => cart.status === "success" || cart.status === "cancelled"
        );

        if (selectedDate) {
            const selectedDateISO = selectedDate.toISOString().split("T")[0];
            filtered = filtered.filter(
                (order) =>
                    convertThaiDateToISO(order.cart_delivery_date) === selectedDateISO
            );
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

        // Group by delivery date and sort orders within each date by order_number
        const groupedByDate = filtered.reduce((acc, cart) => {
            const deliveryDateISO =
                convertThaiDateToISO(cart.cart_delivery_date) || "no-date";
            if (!acc[deliveryDateISO]) {
                acc[deliveryDateISO] = [];
            }
            acc[deliveryDateISO].push(cart);
            return acc;
        }, {} as { [key: string]: Cart[] });

        // Sort orders within each date by order_number (ascending)
        Object.values(groupedByDate).forEach((orders) => {
            orders.sort((a, b) => {
                const orderNumA = parseInt(a.order_number || "0");
                const orderNumB = parseInt(b.order_number || "0");
                return orderNumA - orderNumB;
            });
        });

        // Sort dates based on sortOrder
        const currentDate = new Date();
        const sortedDates = Object.keys(groupedByDate).sort((dateA, dateB) => {
            if (dateA === "no-date") return 1;
            if (dateB === "no-date") return -1;
            const diffA = Math.abs(new Date(dateA).getTime() - currentDate.getTime());
            const diffB = Math.abs(new Date(dateB).getTime() - currentDate.getTime());
            return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
        });

        // Flatten the sorted groups back into a single array
        const sortedOrders = sortedDates.flatMap((date) => groupedByDate[date]);

        console.log("Filtered and Sorted Orders:", sortedOrders);
        return sortedOrders;
    }, [carts, searchTerm, filterStatus, filterCreator, selectedDate, sortOrder]);

    const groupedOrders = useMemo(() => {
        // สร้าง grouped orders โดยจัดกลุ่มตามวันที่จัดส่ง
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

        const currentDate = new Date();
        const currentDateISO = currentDate.toISOString().split("T")[0]; // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
        const currentDateDisplay = currentDate
            .toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            .replace(/ /g, " "); // วันที่ปัจจุบันในรูปแบบ th-TH (เช่น "3 ก.ค. 2568")

        // แยกกลุ่มวันที่ปัจจุบันและวันที่อื่นๆ
        const currentDateGroup: [string, Cart[]][] = grouped[currentDateDisplay]
            ? [[currentDateDisplay, grouped[currentDateDisplay]]]
            : [];
        const otherDateGroups = Object.entries(grouped).filter(
            ([date]) => date !== currentDateDisplay
        );

        // เรียงลำดับวันที่อื่นๆ ตาม sortOrder
        const sortedOtherDates = otherDateGroups.sort((a, b) => {
            const dateA = convertThaiDateToISO(a[1][0].cart_delivery_date);
            const dateB = convertThaiDateToISO(b[1][0].cart_delivery_date);

            if (!dateA) return 1;
            if (!dateB) return -1;

            const diffA = Math.abs(new Date(dateA).getTime() - currentDate.getTime());
            const diffB = Math.abs(new Date(dateB).getTime() - currentDate.getTime());

            return sortOrder === "asc" ? diffA - diffB : diffB - diffA;
        });

        // รวมวันที่ปัจจุบัน (ถ้ามี) เข้ากับวันที่อื่นๆ โดยให้วันที่ปัจจุบันอยู่อันดับแรก
        return [...currentDateGroup, ...sortedOtherDates];
    }, [filteredAndSortedOrders, sortOrder]);
    const summarizeIngredients = (date: string) => {
        const ingredientSummary: {
            [key: string]: { checked: number; total: number };
        } = {};

        const ordersOnDate = filteredAndSortedOrders.filter(
            (cart) => convertThaiDateToISO(cart.cart_delivery_date) === date
        );

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

        const allIngredientsChecked = ordersOnDate.every((cart) =>
            cart.allIngredients.every((menuGroup) =>
                menuGroup.ingredients.every((ing) => ing.isChecked)
            )
        );

        return {
            summary: Object.entries(ingredientSummary).map(
                ([name, { checked, total }]) => ({
                    name,
                    checked,
                    total,
                })
            ),
            allIngredientsChecked,
        };
    };

    // Modified handleSummaryClick function
    const handleSummaryClick = (date: string) => {
        setSelectedDateForSummary(date);
        setIsSummaryModalOpen(true);
    };

    const handleToggleIngredientCheck = async (
        cartId: string,
        menuName: string,
        ingredientName: string
    ) => {
        const previousCarts = [...carts];
        const currentCart = carts.find((cart) => cart.id === cartId);
        const currentIngredient = currentCart?.allIngredients
            .find((group) => group.menuName === menuName)
            ?.ingredients.find((ing) => ing.ingredient_name === ingredientName);

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
                                    ingredient_status: group.ingredients.every((ing) =>
                                        ing.ingredient_name === ingredientName
                                            ? newCheckedStatus
                                            : ing.isChecked
                                    ),
                                }
                                : group
                        ),
                    }
                    : cart
            )
        );
    }

    const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
    const paginatedGroupedOrders = groupedOrders.slice(
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

    const router = useRouter();
    const handleUpdate = () => router.refresh();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">สรุปรายการ</h2>
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
                                : "เลือกวันที่ที่ต้องการ"}
                        </Button>

                        <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <DialogContent className="max-w-4xl">
                                <DialogTitle className="sr-only">Calendar View</DialogTitle>
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    timeZone="Asia/Bangkok"
                                    events={calendarEvents}
                                    dateClick={handleDateClick}
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
                                <SelectItem value="asc">เรียงจากใหม่ไปเก่า</SelectItem>
                                <SelectItem value="desc">เรียงจากเก่าไปใหม่</SelectItem>
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
                                <SelectItem value="รอมัดจำ">รอมัดจำ</SelectItem>
                                <SelectItem value="ชำระเงินเเล้ว">ชำระเงินเเล้ว</SelectItem>
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
                        onClick={handleorderhistoryprice}
                        className="h-10 rounded-lg border border-slate-300 shadow-sm"
                    >
                        ไปหน้าประวัติการสั่งซื้อ
                    </Button>
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

                <div className="space-y-6">
                    {isLoading ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <span className="text-slate-500">Loading...</span>
                            </CardContent>
                        </Card>
                    ) : groupedOrders.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                <span className="text-slate-500">No orders found</span>
                            </CardContent>
                        </Card>
                    ) : (
                        groupedOrders.map(([date, orders], index) => (
                            <div
                                key={`date-${index}`}
                                className="space-y-4 bg-blue-50 rounded-xl shadow-sm"
                            >
                                <h3 className="text-lg font-bold text-blue-700 text-center px-4 py-3">
                                    วันที่ส่งอาหาร {date} ( จำนวน {orders.length} รายการ)
                                </h3>
                                <div className="space-y-4">
                                    {orders.map((cart) => (
                                        <Accordion
                                            key={cart.id}
                                            type="multiple"
                                            defaultValue={[]}
                                            className="border-none m-4"
                                        >
                                            <AccordionItem value={cart.id} className="border-none">
                                                <Card
                                                    className={`bg-gradient-to-r ${getStatusColor(
                                                        cart.status
                                                    )} p-4 rounded-xl shadow-sm`}
                                                >
                                                    <div className="flex w-full items-center">
                                                        <div className="ml-auto flex items-center gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <BsCashStack className="w-6 h-6" />
                                                                <span>
                                                                    เวลาส่งอาหาร{" "}
                                                                    {cart.cart_export_time || "ไม่ระบุ"} น.
                                                                </span>
                                                                <FaWallet className="w-4 h-4 ml-4" />
                                                                <span>
                                                                    เวลารับอาหาร{" "}
                                                                    {cart.cart_receive_time || "ไม่ระบุ"} น.
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <AccordionTrigger className="w-full hover:no-underline px-0">
                                                        <div className="flex flex-col gap-3 w-full text-slate-700 text-sm sm:text-base font-bold">
                                                            <div>
                                                                รายการคำสั่งซื้อหมายเลข{" "}
                                                                {String(cart.order_number).padStart(3, "0")}
                                                            </div>
                                                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                                                <FileText className="w-4 h-4 text-blue-500" />
                                                                <span className="truncate text-sm sm:text-base">
                                                                    ผู้สร้างรายการคำสั่งซื้อ:{" "}
                                                                    <span className="">{cart.createdBy}</span>
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 font-normal text-black">
                                                                <div className="flex items-center gap-1 text-sm sm:text-base">
                                                                    <Package className="w-4 h-4" />
                                                                    <span>จำนวนทั้งหมด {cart.sets} กล่อง</span>
                                                                    <Wallet className="w-4 h-4 text-green-400" />
                                                                    <span className="text-sm sm:text-base font-normal">
                                                                        ราคาทั้งหมด {cart.price.toLocaleString()}{" "}
                                                                        บาท
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row sm:justify-between font-normal sm:items-center gap-1 sm:gap-4 text-black">
                                                                <div className="flex items-center gap-1 text-sm sm:text-base">
                                                                    <Map className="w-4 h-4 text-red-600" />
                                                                    <span>
                                                                        สถานที่จัดส่ง {cart.cart_location_send}{" "}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="font-normal flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-black">
                                                                <div className="flex items-center gap-1 text-sm sm:text-base">
                                                                    <User className="w-4 h-4" />
                                                                    <span>
                                                                        ส่งถึงคุณ {cart.cart_customer_name}
                                                                    </span>
                                                                    <Smartphone className="w-4 h-4" />
                                                                    <span>เบอร์ {cart.cart_customer_tel} </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-normal text-black">
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarDays className="w-4 h-4" />
                                                                    <span>วันที่สั่งอาหาร {cart.date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>เวลา {cart.time} น.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-3 w-full text-slate-700 text-sm sm:text-base font-bold">
                                                                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-normal text-black">
                                                                    <div className="flex flex-col gap-3 w-full text-slate-700 text-sm sm:text-base font-bold"></div>
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
                                                    <div className="flex justify-center mt-2">
                                                        <StatusDropdown
                                                            cartId={cart.id}
                                                            allIngredients={cart.allIngredients}
                                                            defaultStatus={cart.status}
                                                        // onUpdated={handleUpdate}
                                                        />
                                                    </div>
                                                    <AccordionContent className="mt-4">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-sm font-bold mb-2 text-emerald-700 flex items-center gap-2">
                                                                    <User className="w-4 h-4" /> เมนูที่สั่ง
                                                                </h4>
                                                                <Accordion
                                                                    type="multiple"
                                                                    className="space-y-3"
                                                                >
                                                                    {cart.allIngredients.map(
                                                                        (menuGroup, groupIdx) => {
                                                                            const totalBox =
                                                                                cart.menuItems.find(
                                                                                    (item) =>
                                                                                        item.menu_name ===
                                                                                        menuGroup.menuName
                                                                                )?.menu_total || 0;
                                                                            const isEditingThisMenu =
                                                                                editingMenu?.cartId === cart.id &&
                                                                                editingMenu?.menuName ===
                                                                                menuGroup.menuName;
                                                                            const allIngredientsChecked =
                                                                                menuGroup.ingredients.every(
                                                                                    (ing) => ing.isChecked
                                                                                );

                                                                            return (
                                                                                <AccordionItem
                                                                                    key={groupIdx}
                                                                                    value={`menu-${groupIdx}`}
                                                                                    className={`rounded-xl border border-slate-200 shadow-sm px-4 py-3 ${allIngredientsChecked
                                                                                        ? "bg-green-50 border-green-200"
                                                                                        : "bg-red-50 border-red-200"
                                                                                        }`}
                                                                                >
                                                                                    <AccordionTrigger className="w-full flex items-center justify-between px-2 py-1 hover:no-underline">
                                                                                        <span className="truncate text-sm text-gray-700">
                                                                                            {menuGroup.menuName}
                                                                                        </span>
                                                                                        <span className="text-sm font-mono text-blue-600">
                                                                                            (จำนวน {totalBox} กล่อง)
                                                                                        </span>
                                                                                    </AccordionTrigger>
                                                                                    <AccordionContent className="pt-3 space-y-2">
                                                                                        {menuGroup.ingredients.map(
                                                                                            (ing, idx) => (
                                                                                                <div
                                                                                                    key={idx}
                                                                                                    className={`flex items-center justify-between rounded-lg px-3 py-2 border ${ing.isChecked
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
                                                                                                            ใช้ {ing.ingredient_unit} บาท ×{" "}
                                                                                                            {totalBox} กล่อง ={" "}
                                                                                                            <strong
                                                                                                                className="text-black-600"
                                                                                                                style={{
                                                                                                                    color: "#000000",
                                                                                                                }}
                                                                                                            >
                                                                                                                {ing.calculatedTotal}
                                                                                                            </strong>{" "}
                                                                                                            {ing.ingredient_unit}
                                                                                                        </span>
                                                                                                        <label className="cursor-pointer">
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                checked={
                                                                                                                    ing.isChecked || false
                                                                                                                }
                                                                                                                onChange={() =>
                                                                                                                    handleToggleIngredientCheck(
                                                                                                                        cart.id,
                                                                                                                        menuGroup.menuName,
                                                                                                                        ing.ingredient_name
                                                                                                                    )
                                                                                                                }
                                                                                                                className="hidden"
                                                                                                            />
                                                                                                            
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                    </AccordionContent>
                                                                                </AccordionItem>
                                                                            );
                                                                        }
                                                                    )}
                                                                </Accordion>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </Card>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                                <div className="flex justify-center m-4">
                                    <div>
                                        <Button
                                            // variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleSummaryClick(
                                                    convertThaiDateToISO(orders[0].cart_delivery_date)!
                                                )
                                            }
                                            className="h-9 px-4 rounded-xl border border-emerald-500 text-emerald-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md mb-4"
                                            style={{ color: "#000000", background: "#fcf22d" }}
                                        >
                                            📦 สรุปวัตถุดิบทั้งหมด
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogTitle className="text-lg font-bold ">
                            <div style={{ color: "#000000" }} className="mb-4">
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
                                    const { summary, allIngredientsChecked } =
                                        summarizeIngredients(selectedDateForSummary);
                                    return (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold text-gray-700">
                                                    สรุปวัตถุดิบรวม
                                                </h5>
                                                {summary.map((ing, idx) => (
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
                                            <div style={{ color: "#000000", background: "#5cfa6c" }}>
                                                <Button
                                                    // onClick={() =>
                                                    //   handleCheckAllIngredientsForDate(
                                                    //     selectedDateForSummary
                                                    //   )
                                                    // }
                                                    className="w-full bg-green-100 hover:bg-green-200 text-green-800 rounded-lg"
                                                    disabled={isSaving === "all"}
                                                >
                                                    {isSaving === "all"
                                                        ? "กำลังบันทึก..."
                                                        : "เลือกวัตถุดิบทั้งหมด"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })()}
                        </DialogTitle>
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
