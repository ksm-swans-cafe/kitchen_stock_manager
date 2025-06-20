"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Plus, ShoppingCart, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/share/ui/badge";
import { ingredient } from "@/models/menu_card/MenuCard-model";

export default function Page() {
  const router = useRouter();
  const [allIngredient, setAllIngredient] = useState<ingredient[]>([]);

  useEffect(() => {
    const navEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navEntry.type !== "reload") {
      location.reload();
    }
  }, []);

  // 🔥 คำนวณวัตถุดิบใกล้หมดแบบ real-time
  const lowStockIngredients = allIngredient.filter((ingredient) => {
    const total = Number(ingredient.ingredient_total) || 0;
    const alert = Number(ingredient.ingredient_total_alert) || 0;
    return total <= alert;
  });
  const [showAll, setShowAll] = useState(false); // state ควบคุม
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await fetch("/api/get/ingredients");
        if (!res.ok) throw new Error("Failed to fetch ingredients");
        const data = await res.json();

        setAllIngredient(data);

        // แจ้งเตือนแบบ toast เมื่อมีวัตถุดิบใกล้หมด
        const lowStock = data.filter(
          (item: ingredient) =>
            Number(item.ingredient_total) > Number(item.ingredient_total_alert)
        );
        if (lowStock.length > 0) {
          toast.warning(
            `🔔 แจ้งเตือน: วัตถุดิบใกล้หมด ${lowStock.length} รายการ`
          );
        }
      } catch (error) {
        console.error("Error loading ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  const handleAddIngredients = () => {
    router.push("/home/ingredients");
  };

  const handleOrder = () => {
    router.push("/home/order");
  };

  const handleOrderHistory = () => {
    router.push("/home/orderhistory");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      {/* 🔴 Card แจ้งเตือนวัตถุดิบใกล้หมด */}
      {lowStockIngredients.length > 0 && (
        <Card className="fixed left-1/2 -translate-x-1/2 z-40 w-[80%] p-4 border-red-200 bg-red-50 dark:bg-red-900/20 shadow-lg rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm sm:text-base">
                แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {(showAll
                ? lowStockIngredients
                : lowStockIngredients.slice(0, 4)
              ).map((ingredient) => (
                <Badge
                  key={ingredient.ingredient_id}
                  variant="destructive"
                  className="whitespace-nowrap text-xs sm:text-sm"
                >
                  {ingredient.ingredient_name} ({ingredient.ingredient_total} /{" "}
                  {ingredient.ingredient_total_alert})
                </Badge>
              ))}
              {lowStockIngredients.length > 4 &&
                (!showAll ? (
                  <div className="px-2 text-sm py-0.5 w-fit text-white shadow bg-red-600 rounded-md hover:bg-gray-200 hover:text-black border">
                  <button
                    onClick={() => setShowAll(true)}
                    >
                    แสดงทั้งหมด
                  </button>
                    </div>
                ) : (
                  <div className="px-2 text-sm py-0.5 w-fit text-white shadow bg-red-600 rounded-md hover:bg-gray-200 hover:text-black border">
                  <button
                    onClick={() => setShowAll(false)}
                    >
                    ย่อ
                  </button>
                    </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* เมนูหลัก */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* {lowStockIngredients.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockIngredients.slice(0, 4).map((ingredient) => (
                      <Badge
                        key={ingredient.ingredient_id}
                        variant="destructive"
                        className="whitespace-nowrap"
                      >
                        {ingredient.ingredient_name} ({ingredient.ingredient_total}{" "}
                        / {ingredient.ingredient_total_alert})
                      </Badge>
                    ))}
                    {lowStockIngredients.length > 4 && (
                      <Badge variant="destructive" className="whitespace-nowrap">
                        ...
                      </Badge>
                    )}
                </div>
              </div>
            </Card>
          )} */}
          {/* Add Ingredients */}
          <Card className="group hover:shadow-xl transition-all ...">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleAddIngredients}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-base">Add Ingredients</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order */}
          <Card className="group hover:shadow-xl transition-all ...">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleOrder}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-base">Order</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="group hover:shadow-xl transition-all ...">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleOrderHistory}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-base">Order History</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
