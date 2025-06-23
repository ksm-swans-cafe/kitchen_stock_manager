"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import {
  ArrowLeft,
  Home,
  LogOut,
  Clock,
  User,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Calendar,
  Users,
  Hash,
  Star,
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
import superjson from "superjson";
import ResponsiveOrderId from "./ResponsiveOrderId";
import StatusDropdown from "./StatusDropdown";

interface Ingredient {
  ingredient_id?: number;
  ingredient_name: string;
  useItem: number;
  calculatedTotal?: number;
  sourceMenu?: string;
}

interface MenuItem {
  menu_name: string;
  menu_total: number;
  ingredients: Ingredient[];
  status: string;
  order_number: string;
}

interface CartItem extends MenuItem {
  totalPrice?: number;
}

interface Cart {
  id: string;
  orderNumber: string;
  name: string;
  date: string;
  time: string;
  sets: number;
  price: number;
  status: string;
  createdBy: string;
  menuItems: CartItem[];
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
  }[];
  order_number: string;
}

const OrderHistory: React.FC = () => {
  const router = useRouter();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
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
  const [isSaving, setIsSaving] = useState<string | null>(null); // เพิ่มสถานะการบันทึก

  const safeParseJSON = (jsonString: string): CartItem[] => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return [];
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/get/carts");
      if (!response.ok) throw new Error("Failed to fetch carts");

      const data = await response.json();

      const menuResponse = await fetch("/api/get/menu-list");
      if (!menuResponse.ok) throw new Error("Failed to fetch menu");
      const menuData = await menuResponse.json();

      const ingredientResponse = await fetch("/api/get/ingredients");
      if (!ingredientResponse.ok) throw new Error("Failed to fetch ingredients");
      const ingredientData = await ingredientResponse.json();

      const formattedOrders: Cart[] = data.map((cart: any) => {
        const menuItems: MenuItem[] =
          typeof cart.cart_menu_items === "string"
            ? safeParseJSON(cart.cart_menu_items)
            : cart.cart_menu_items || [];

        const totalSets = menuItems.reduce(
          (sum, item) => sum + (item.menu_total || 0),
          0
        );
        const menuDisplayName =
          menuItems.length > 0
            ? menuItems
                .map((item) => `${item.menu_name} จำนวน ${item.menu_total} กล่อง`)
                .join(" + ")
            : "ไม่มีชื่อเมนู";

        const allIngredients = menuItems.map((menu) => {
          const menuFromDB = menuData.find(
            (m: any) => m.menu_name === menu.menu_name
          );
          const dbIngredients = Array.isArray(menuFromDB?.menu_ingredients)
            ? menuFromDB.menu_ingredients
            : menu.ingredients || [];

          return {
            menuName: menu.menu_name,
            ingredients: dbIngredients.map((dbIng: any) => {
              const ingredientFromDB = ingredientData.find(
                (ing: any) => ing.ingredient_name === dbIng.ingredient_name
              );
              const ingredientName =
                ingredientFromDB?.ingredient_name ||
                `ไม่พบวัตถุดิบ (ID: ${dbIng.ingredient_name})`;
              return {
                ...dbIng,
                ingredient_id: ingredientFromDB?.ingredient_id,
                ingredient_name: ingredientName || dbIng.ingredient_name,
                calculatedTotal: dbIng.useItem * menu.menu_total,
                sourceMenu: menu.menu_name,
              };
            }),
          };
        });

        const orderNumber = `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || "XXXXX"}`;
        const date = new Date(cart.cart_create_date);
        const formattedDate = date
          .toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, " ");
        const formattedTime = cart.cart_create_date
          .split("T")[1]
          .split(".")[0]
          .slice(0, 5);
        return {
          id: cart.cart_id || "no-id",
          orderNumber,
          name: menuDisplayName,
          date: formattedDate,
          time: formattedTime,
          sets: totalSets,
          price: cart.cart_total_price || 0,
          status: cart.cart_status,
          order_number: cart.cart_order_number,
          createdBy: cart.cart_username || "ไม่ทราบผู้สร้าง",
          menuItems: menuItems.map((item) => ({ ...item })),
          allIngredients,
        };
      });

      formattedOrders.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSignOut = () => router.push("/login");
  const handleBackToDashboard = () => router.push("/home");
  const handleHomeClick = () => router.push("/home");
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
    // เรียก API GET เพื่อดึง cart_menu_items
    // const getResponse = await fetch(`/api/get/cart_menu/${cartId}`);
    // if (!getResponse.ok) {
    //   const errorData = await getResponse.json();
    //   throw new Error(errorData.error || "Failed to fetch cart data");
    // }

    // const { menuItems } = await getResponse.json();
    // console.log("Fetched menuItems:", menuItems);

    // // ตรวจสอบว่า menuName มีอยู่ใน menuItems
    // const menuExists = menuItems.some(
    //   (item: any) => item.menu_name === cleanedMenuName
    // );
    // if (!menuExists) {
    //   setError(`เมนู "${cleanedMenuName}" ไม่พบในตะกร้า`);
    //   await fetchOrders();
    //   return;
    // }

    // เรียก API PATCH เพื่ออัปเดต
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

    // อัปเดต state ใน frontend
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

    // เพิ่มการแจ้งเตือนเมื่อบันทึกสำเร็จ
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "completed":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
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
    let filtered = [...carts];

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
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];

      if (sortBy === "date") {
        aVal = new Date(`${a.date} ${a.time}`);
        bVal = new Date(`${b.date} ${b.time}`);
      }

      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [carts, searchTerm, filterStatus, filterCreator, sortBy, sortOrder]);

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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-10 rounded-lg border border-slate-300 shadow-sm">
                <ArrowUpDown className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={false}>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="sets">Sets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={sortOrder}
              onValueChange={(val: "asc" | "desc") => setSortOrder(val)}
            >
              <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 shadow-sm">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={false}>
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
              <SelectContent side="bottom" align="start" avoidCollisions={false}>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 shadow-sm">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="All creators" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" avoidCollisions={false}>
                <SelectItem value="All">All creators</SelectItem>
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
                          Order {String(cart.order_number).padStart(3, "0")}
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
                            <Calendar className="w-4 h-4" />
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

                              return (
                                <AccordionItem
                                  key={groupIdx}
                                  value={`menu-${groupIdx}`}
                                  className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3"
                                >
                                  <AccordionTrigger className="w-full flex items-center justify-between px-2 py-1 hover:no-underline">
                                    <span className="truncate text-sm text-gray-700">
                                      {menuGroup.menuName}
                                    </span>
                                    {isEditingThisMenu ? (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <Input
                                          type="number"
                                          value={editTotalBox}
                                          onChange={(e) =>
                                            setEditTotalBox(Number(e.target.value))
                                          }
                                          className="w-20 h-8 text-sm rounded-md border-gray-300"
                                          min="0"
                                          aria-label="Edit box quantity"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveTotalBox(
                                              cart.id,
                                              menuGroup.menuName
                                            );
                                          }}
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
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingMenu(null);
                                          }}
                                          className="h-8 px-2 text-gray-600 hover:bg-gray-50"
                                          aria-label="Cancel edit"
                                          disabled={isSaving === cart.id}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 ml-auto mr-2">
                                        <span className="text-sm font-mono text-blue-600">
                                          ({totalBox} boxes)
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTotalBox(
                                              cart.id,
                                              menuGroup.menuName,
                                              totalBox
                                            );
                                          }}
                                          className="h-8 px-2 text-blue-600 hover:bg-blue-100"
                                          aria-label="Edit box quantity"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-3 space-y-2">
                                    {menuGroup.ingredients.map((ing, idx) => (
                                      <div
                                          key={idx}
                                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 text-sm"
                                        >
                                          <span className="text-gray-700">
                                            {ing.ingredient_name ||
                                              `Unknown ingredient (ID: ${ing.ingredient_id})`}
                                          </span>
                                          <span className="text-gray-600">
                                            Use {ing.useItem} g/box × {totalBox} ={" "}
                                            <strong className="font-bold text-black">
                                              {ing.calculatedTotal}
                                            </strong>{" "}
                                            g
                                          </span>
                                        </div>
                                      ))}
                                </AccordionContent>
                              </AccordionItem>
                            )})}
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
                      setCurrentPage(Math.min(totalPages, currentPage + 1))}
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