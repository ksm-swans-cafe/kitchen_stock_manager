"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navigatebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

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

  const pathSegments = pathname.split("/").filter(Boolean);
  const isOrderPage = pathname.startsWith("/home/order") && 
                     !pathname.startsWith("/home/orderhistory");
  const isHomePage = pathname === "/home";

  const formatName = (segment: string) =>
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <nav
      className={`w-full bg-gray-200 py-3 px-4 ${
        isScrolled ? "fixed top-0 left-0 right-0 z-50 shadow-md animate-slideDown" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px] relative">
        <ul className="flex gap-2 items-center text-gray-700 flex-wrap">
          {!isHomePage && (
            <li>
              <button 
                onClick={goBack}
                className="mr-2 bg-gray-300 hover:bg-gray-400 rounded-full p-1 transition-colors"
                aria-label="ย้อนกลับ"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </li>
          )}
          
          <li>
            <Link
              href="/home"
              className={pathname === "/home" ? "font-bold" : "font-bold"}
            >
              Home
            </Link>
          </li>

          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");

            if (href === "/home") return null;

            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <li className="hidden sm:inline font-bold">{">"}</li>
                <li>
                  <span className="font-bold">
                    {isLast ? (
                      formatName(segment)
                    ) : (
                      <Link href={href} className="text-sm sm:text-base">
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
          <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
            {isOrderPage && (
              <Link
                href="/home/order/cart"
                className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors inline-flex items-center justify-center"
                aria-label="ตะกร้าสินค้า"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </Link>
            )}
            {!isOrderPage && (
              <button
                onClick={scrollToTop}
                className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors"
                aria-label="เลื่อนขึ้นด้านบน"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}