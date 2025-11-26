"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { create } from "zustand";
import { toast } from "sonner";
import {
  Plus,
  ShoppingCart,
  History,
  AlertTriangle,
  FileText,
  DollarSign,
} from "lucide-react";

import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Badge } from "@/share/ui/badge";

import { DetailIngredient } from "@/models/menu_card/MenuCard";
import { MenuHome } from "@/models/common";
import { fetcher } from "@/lib/utils";
import useLoadingDots from "@/lib/hook/Dots";

interface UseShowProps {
  showAll: boolean;
  showFullList: boolean;
  setShowAll: (value: boolean) => void;
  setShowFullList: (value: boolean) => void;
}

const useShow = create<UseShowProps>((set, get) => ({
  showAll: false,
  showFullList: false,
  setShowAll: (value) => set({ showAll: value }),
  setShowFullList: (value) => set({ showFullList: value }),
}));

export default function Page() {
  const router = useRouter();
  const { showAll, showFullList, setShowAll, setShowFullList } = useShow();
  const popupRef = useRef<HTMLDivElement>(null);
  const dots = useLoadingDots();
  const menuItems: MenuHome[] = [
    {
      id: "add-ingredients",
      title: "เพิ่มวัตถุดิบ",
      icon: Plus,
      color: {
        bg: "bg-green-500/10",
        hover: "group-hover:bg-green-500/20",
        icon: "text-green-600",
      },
      onClick: () => router.push("/home/ingredients"),
      hasBadge: false,
      badgeText: "",
    },
    {
      id: "order",
      title: "คำสั่งซื้อ",
      icon: ShoppingCart,
      color: {
        bg: "bg-blue-500/10",
        hover: "group-hover:bg-blue-500/20",
        icon: "text-blue-600",
      },
      onClick: () => router.push("/home/order"),
      hasBadge: false,
      badgeText: "",
    },
    {
      id: "summary-list",
      title: "สรุปรายการ",
      icon: FileText,
      color: {
        bg: "bg-purple-500/10",
        hover: "group-hover:bg-purple-500/20",
        icon: "text-purple-600",
      },
      onClick: () => router.push("/home/summarylist"),
      hasBadge: false,
      badgeText: "",
    },
    {
      id: "order-history",
      title: "ประวัติการสั่งอาหาร",
      icon: History,
      color: {
        bg: "bg-gray-700/10",
        hover: "group-hover:bg-gray-500/20",
        icon: "text-gray-600",
      },
      onClick: () => router.push("/home/orderhistory"),
      hasBadge: false,
      badgeText: "",
    },
    {
      id: "finance",
      title: "การเงิน",
      icon: DollarSign,
      color: {
        bg: "bg-amber-500/10",
        hover: "group-hover:bg-amber-500/20",
        icon: "text-amber-600",
      },
      onClick: () => router.push("/home/finance"),
      hasBadge: true,
      badgeText: "Demo",
    },
  ];

  const {
    data: allIngredient = [],
    error,
    isLoading,
  } = useSWR("/api/get/ingredients", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
    onSuccess: (data) => {
      const lowStock = data.filter(
        (item: DetailIngredient) =>
          Number(item.ingredient_total) <= Number(item.ingredient_total_alert),
      );
      if (lowStock.length > 0) {
        toast.warning(
          `🔔 แจ้งเตือน: วัตถุดิบใกล้หมด ${lowStock.length} รายการ`,
        );
      }
    },
  });

  useEffect(() => {
    const navEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navEntry.type !== "reload") {
      mutate("/api/get/ingredients", undefined, { revalidate: false });
      location.reload();
    }
  }, []);

  const lowStockIngredients = allIngredient.filter((item: DetailIngredient) => {
    const total = Number(item.ingredient_total) || 0;
    const alert = Number(item.ingredient_total_alert) || 0;
    return total <= alert;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node))
        setShowAll(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowAll]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        กำลังโหลดหน้า Website{dots}
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        เกิดข้อผิดพลาดในการโหลดข้อมูลวัตถุดิบ, กรุณาลองใหม่อีกครั้ง
      </div>
    );

  return (
    <div className="min-h-screen pt-[160px] bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      {/* Low Stock Alert */}
      {lowStockIngredients.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <Button
              onClick={() => setShowAll(!showAll)}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl transition"
              title={`วัตถุดิบใกล้หมด (${lowStockIngredients.length} รายการ)`}
            >
              <AlertTriangle className="w-6 h-6" />
            </Button>
          </div>
          {showAll && (
            <div
              ref={popupRef}
              className="absolute bottom-[80px] right-0 w-[320px] sm:w-[380px] bg-red-50 border border-red-300 shadow-lg rounded-lg p-5 backdrop-blur-md"
            >
              <h3 className="text-base font-semibold text-red-800 mb-3">
                วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)
              </h3>
              <div className="flex flex-col gap-2 mb-2 max-h-[200px] overflow-y-auto">
                {(showFullList
                  ? lowStockIngredients
                  : lowStockIngredients.slice(0, 4)
                ).map(
                  (ingredient: {
                    ingredient_id: string;
                    ingredient_name: string;
                    ingredient_total: number;
                    ingredient_total_alert: number;
                  }) => (
                    <Badge
                      key={ingredient.ingredient_id}
                      variant="destructive"
                      className="text-sm w-fit"
                    >
                      {ingredient.ingredient_name} (
                      {ingredient.ingredient_total} /{" "}
                      {ingredient.ingredient_total_alert})
                    </Badge>
                  ),
                )}
              </div>
              {lowStockIngredients.length > 4 && (
                <button
                  onClick={() => setShowFullList(!showFullList)}
                  className="text-base font-medium text-red-600 hover:underline"
                >
                  {showFullList ? "ย่อ" : "แสดงทั้งหมด"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Menu */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-xl flex flex-col gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-xl transition-all"
            >
              <CardContent className="relative p-0">
                {item.hasBadge && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-md z-10">
                    {item.badgeText}
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={item.onClick}
                  className="w-full h-24 ml-2 flex items-center justify-start space-x-5 px-7 text-foreground font-semibold hover:bg-transparent"
                >
                  <div
                    className={`w-14 h-14 ${item.color.bg} ${item.color.hover} rounded-xl flex items-center justify-center`}
                  >
                    <item.icon className={`w-7 h-7 ${item.color.icon}`} />
                  </div>
                  <span className="text-lg">{item.title}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
