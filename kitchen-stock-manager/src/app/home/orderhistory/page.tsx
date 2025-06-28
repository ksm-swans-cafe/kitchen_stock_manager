"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { CheckCircle, Clock, History} from "lucide-react";
import { toast } from "sonner";
// import { Badge } from "@/share/ui/badge";
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

  const handlenotsuccess = () => {
    router.push("/home/orderhistory/notsuccess");
  };

  const handlesuccess = () => {
    router.push("/home/orderhistory/success");
  };

  const handlesumary = () => {
    router.push("/home/orderhistory/sumary");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      {/* เมนูหลัก */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* {lowStockIngredients.length > 0 && (
          )} */}
          {/* Add Ingredients */}
          {/* ยังไม่เสร็จ */}
<Card className="group hover:shadow-xl transition-all">
  <CardContent className="p-0">
    <Button
      variant="ghost"
      onClick={handlenotsuccess}
      className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
    >
      <div className="w-12 h-12 bg-yellow-500/10 group-hover:bg-yellow-500/20 rounded-xl flex items-center justify-center">
        <Clock className="w-6 h-6 text-yellow-600" /> {/* เปลี่ยนจาก Plus */}
      </div>
      <span className="text-base"> ยังไม่เสร็จ </span>
    </Button>
  </CardContent>
</Card>

{/* เสร็จแล้ว */}
<Card className="group hover:shadow-xl transition-all">
  <CardContent className="p-0">
    <Button
      variant="ghost"
      onClick={handlesuccess}
      className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
    >
      <div className="w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-green-600" /> {/* เปลี่ยนจาก ShoppingCart */}
      </div>
      <span className="text-base"> เสร็จแล้ว </span>
    </Button>
  </CardContent>
</Card>


          {/* Order History */}
          <Card className="group hover:shadow-xl transition-all ...">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handlesumary}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-base"> สรุปวัตถุดิบรายวัน </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
