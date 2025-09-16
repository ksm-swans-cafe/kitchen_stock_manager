"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Button } from "@/share/ui/button";
import { Card, CardContent } from "@/share/ui/card";
import { Plus, ShoppingCart, History, AlertTriangle, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/share/ui/badge";
import { ingredient } from "@/models/menu_card/MenuCard-model";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch ingredients");
  return res.json();
};

export default function Page() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [showFullList, setShowFullList] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const handleAddIngredients = () => router.push("/home/ingredients");
  const handleOrder = () => router.push("/home/order");
  const handleSummaryList = () => router.push("/home/summarylist");
  const handleOrderHistory = () => router.push("/home/orderhistory");
  const handleFinance = () => router.push("/home/finance");

  const {
    data: allIngredient = [],
    error,
    isLoading,
  } = useSWR("/api/get/ingredients", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
    onSuccess: (data) => {
      const lowStock = data.filter((item: ingredient) => Number(item.ingredient_total) <= Number(item.ingredient_total_alert));
      if (lowStock.length > 0) {
        toast.warning(`🔔 แจ้งเตือน: วัตถุดิบใกล้หมด ${lowStock.length} รายการ`);
      }
    },
  });

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry.type !== "reload") {
      mutate("/api/get/ingredients", undefined, { revalidate: false }); // 🧹 Clear cache
      location.reload(); // 🔄 Reload page
    }
  }, []);

  const lowStockIngredients = allIngredient.filter((item: ingredient) => {
    const total = Number(item.ingredient_total) || 0;
    const alert = Number(item.ingredient_total_alert) || 0;
    return total <= alert;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) setShowAll(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  if (isLoading) return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
  if (error) return <div className='min-h-screen flex items-center justify-center'>Failed to load ingredients. Please try again.</div>;
  
  return (
    <div className='min-h-screen pt-[140px] bg-gradient-to-br from-background via-secondary/10 to-background p-4'>
      {lowStockIngredients.length > 0 && (
        <div className='fixed bottom-6 right-6 z-50'>
          <div className='relative'>
            <span className='absolute -top-1 -right-1 flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-red-600'></span>
            </span>
            <Button
              onClick={() => setShowAll((prev) => !prev)}
              className='bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transition'
              title={`วัตถุดิบใกล้หมด (${lowStockIngredients.length} รายการ)`}>
              <AlertTriangle className='w-5 h-5' />
            </Button>
          </div>
          {showAll && (
            <div ref={popupRef} className='absolute bottom-[70px] right-0 w-[300px] sm:w-[360px] bg-red-50 border border-red-300 shadow-lg rounded-lg p-4 backdrop-blur-md'>
              <h3 className='text-sm font-semibold text-red-800 mb-2'>วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)</h3>
              <div className='flex flex-col gap-2 mb-2 max-h-[200px] overflow-y-auto'>
                {(showFullList ? lowStockIngredients : lowStockIngredients.slice(0, 4)).map(
                  (ingredient: { ingredient_id: string; ingredient_name: string; ingredient_total: number; ingredient_total_alert: number }) => (
                    <Badge key={ingredient.ingredient_id} variant='destructive' className='text-xs w-fit'>
                      {ingredient.ingredient_name} ({ingredient.ingredient_total} / {ingredient.ingredient_total_alert})
                    </Badge>
                  )
                )}
              </div>
              {lowStockIngredients.length > 4 && (
                <button onClick={() => setShowFullList((prev) => !prev)} className='text-sm font-medium text-red-600 hover:underline'>
                  {showFullList ? "ย่อ" : "แสดงทั้งหมด"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* เมนูหลัก */}
      <div className='flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]'>
        <div className='w-full max-w-md flex flex-col gap-6'>
          <Card className='group hover:shadow-xl transition-all'>
            <CardContent className='p-0'>
              <Button variant='ghost' onClick={handleAddIngredients} className='w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent'>
                <div className='w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center'>
                  <Plus className='w-6 h-6 text-green-600' />
                </div>
                <span className='text-base'>เพิ่มวัตถุดิบ</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order */}
          <Card className='group hover:shadow-xl transition-all'>
            <CardContent className='p-0'>
              <Button variant='ghost' onClick={handleOrder} className='w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent'>
                <div className='w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center'>
                  <ShoppingCart className='w-6 h-6 text-blue-600' />
                </div>
                <span className='text-base'>คำสั่งซื้อ</span>
              </Button>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all'>
            <CardContent className='p-0'>
              <Button variant='ghost' onClick={handleSummaryList} className='w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent'>
                <div className='w-12 h-12 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center'>
                  <FileText className='w-6 h-6 text-purple-600' />
                </div>
                <span className='text-base'>สรุปรายการ</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className='group hover:shadow-xl transition-all'>
            <CardContent className='p-0'>
              <Button variant='ghost' onClick={handleOrderHistory} className='w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent'>
                <div className='w-12 h-12 bg-gray-700/10 group-hover:bg-gray-500/20 rounded-xl flex items-center justify-center'>
                  <History className='w-6 h-6 text-gray-600' />
                </div>
                <span className='text-base'>ประวัติการสั่งอาหาร</span>
              </Button>
            </CardContent>
          </Card>

          {/* Finance Card */}
          <Card className='group hover:shadow-xl transition-all'>
            <CardContent className='relative p-0'>
              <div className='absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md z-10'>Demo</div>
              <Button variant='ghost' className='w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent' onClick={handleFinance}>
                <div className='w-12 h-12 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-xl flex items-center justify-center'>
                  <DollarSign className='w-6 h-6 text-amber-600' />
                </div>
                <span className='text-base'>การเงิน</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
