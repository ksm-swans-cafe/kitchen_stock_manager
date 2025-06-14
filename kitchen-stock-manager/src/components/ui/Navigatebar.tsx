"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Navigatebar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) return null;

  return (
    <nav className="w-full p-4 bg-gray-200">
      <ul className="flex gap-4">
        {pathname === "/home/order" && <li>Home</li>}
        <li>Order History</li>
        <li>Profile</li>
      </ul>
    </nav>
  );
}
