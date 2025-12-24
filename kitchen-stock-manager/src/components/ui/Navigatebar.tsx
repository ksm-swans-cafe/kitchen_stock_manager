"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";

// สร้าง mapping สำหรับแปลง path เป็นชื่อภาษาไทย
const pathNameMap: Record<string, string> = {
  home: "หน้าหลัก",
  order: "สั่งอาหาร",
  cart: "ตะกร้าสินค้า",
  menu: "เมนูอาหาร",
  "menu-picker": "เลือกเมนูอาหาร",
  orderhistory: "ประวัติการสั่งอาหาร",
  // "orderhistoryprice": "ราคาประวัติการสั่งซื้อ",
  menulists: "จัดการรายการเมนูอาหาร",
  ingredients: "วัตถุดิบ",
  finance: "การเงิน",
  summarylist: "สรุปรายการ",
  // "summaryprice": "ราคาสรุปรายการ",
};

export default function Navigatebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { userName } = useAuth();

  const items = useCartStore((state: { items: { menu_total: number }[] }) => state.items);
  const selected_lunchboxes = useCartStore((state: { selected_lunchboxes: { quantity: number }[] }) => state.selected_lunchboxes);

  React.useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.2;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (!pathname || !isMounted) return <nav></nav>;
  if (pathname === "/login") return <nav></nav>;

  // Hide Navigatebar if not logged in
  if (!userName) {
    return <nav></nav>;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const isOrderPage = pathname.startsWith("/home/order") && !pathname.startsWith("/home/orderhistory");
  const isHomePage = pathname === "/home";

  const formatName = (segment: string) => {
    if (pathNameMap[segment]) {
      return pathNameMap[segment];
    }
    return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goBack = () => {
    router.back();
  };

  // นับจำนวนจากเมนูปกติ
  const itemsQuantity = items.reduce((sum: number, item: { menu_total: number }) => sum + item.menu_total, 0);
  // นับจำนวนชุดอาหารที่เลือก (นับเป็นชุด ไม่นับ quantity)
  const lunchboxesQuantity = selected_lunchboxes.length;
  // รวมจำนวนทั้งหมด
  const totalQuantity = itemsQuantity + lunchboxesQuantity;

  return (
    <nav className='w-full bg-gray-200 py-3 px-4 sticky top-0 z-40 shadow-sm'>
      <div className='mx-auto max-w-[1200px] relative'>
        <ul className='flex gap-2 items-center text-gray-700 flex-wrap'>
          {!isHomePage && (
            <li>
              <button onClick={goBack} className='mr-2 bg-gray-300 hover:bg-gray-400 rounded-full p-1 transition-colors' aria-label='ย้อนกลับ'>
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M15 18l-6-6 6-6' />
                </svg>
              </button>
            </li>
          )}

          <li>
            <Link href='/home' className={pathname === "/home" ? "font-bold" : "font-bold"}>
              หน้าหลัก
            </Link>
          </li>

          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");

            if (href === "/home") return null;

            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <li className='hidden sm:inline font-bold'>{">"}</li>
                <li>
                  <span className='font-bold'>
                    {isLast ? (
                      formatName(segment)
                    ) : (
                      <Link href={href} className='text-sm sm:text-base'>
                        {formatName(segment)}
                      </Link>
                    )}
                  </span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        {(isOrderPage || isScrolled) && (
          <div className='absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex gap-2'>
            {isOrderPage && (
              <Link href='/home/order/cart' className='bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors inline-flex items-center justify-center' aria-label='ตะกร้าสินค้า'>
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                  <circle cx='9' cy='21' r='1'></circle>
                  <circle cx='20' cy='21' r='1'></circle>
                  <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6'></path>
                </svg>

                {/* badge แสดงจำนวน */}
                {totalQuantity > 0 && (
                  <span
                    className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                      animate-pulse
                    '
                    aria-live='polite'
                    aria-atomic='true'>
                    {totalQuantity}
                  </span>
                )}
              </Link>
            )}
            {!isOrderPage && (
              <button onClick={scrollToTop} className='bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors' aria-label='เลื่อนขึ้นด้านบน'>
                <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M18 15l-6-6-6 6' />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
