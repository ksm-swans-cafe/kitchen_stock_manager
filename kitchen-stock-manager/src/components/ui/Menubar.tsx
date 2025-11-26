// components/Menubar.tsx
"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/share/ui/button";
import { LogOut } from "lucide-react";

export default function Menubar() {
  const pathname = usePathname();
  const { userRole, userName, logout, isLoading, checkAuth } = useAuth();
  const isLoginPage = pathname === "/login";
  const router = useRouter();

  const getRoleName = (role: string | null) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "employee":
        return "Employee";
      case "customer":
        return "Customer";
      default:
        return "Guest";
    }
  };

  useEffect(() => {
    if (isLoading) {
      checkAuth();
    }
  });

  const renderRoleSpecificMenu = () => {
    switch (userRole) {
      case "admin":
        return (
          <div
          // className="flex space-x-2"
          >
            {/* <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/admin/users'}>
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/admin/settings'}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button> */}
          </div>
        );
      case "employee":
        return (
          <div
          // className="flex space-x-2"
          >
            {/* <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/orders'}>
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </Button> */}
          </div>
        );
      case "customer":
        return (
          <div
          // className="flex space-x-2"
          >
            {/* <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/my-orders'}>
              <ShoppingCart className="w-4 h-4" />
              <span>My Orders</span>
            </Button> */}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoginPage) {
    return (
      <div
      // className="w-full p-4 bg-blue-600 text-white text-center"
      >
        {/* <h1 className="text-xl font-bold">SWANS CAFE & BISTRO</h1> */}
      </div>
    );
  }

  return (
    <div className='w-full bg-card/90 backdrop-blur-sm border-b border-border shadow-sm'>
      <div className='mx-auto max-w-[1200px] px-4 flex justify-between items-center py-3'>
        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-2'>
            <img
              src='https://hvusvym1gfn5yabw.public.blob.vercel-storage.com/logo/S__3842055-Pzp1LBEQErI3yqCqwKiiCxobjW6Y8K.jpg'
              alt='Home Icon'
              className='w-12 h-12 cursor-pointer border border-gray-300 rounded-full transition-transform duration-200 transform hover:scale-125 inline-block'
              onClick={() => router.push("/home")}
            />

            {/* สำหรับหน้าจอขนาดกลางขึ้นไป */}
            <div className='hidden md:flex flex-col items-start'>
              <span className='text-base font-medium text-foreground'>{userName || "Guest"}</span>
              <span className='text-base text-muted-foreground'>{getRoleName(userRole)}</span>
            </div>

            {/* สำหรับหน้าจอขนาดเล็ก (มือถือ) */}
            <div className='md:hidden flex flex-col items-start'>
              <span className='text-sm font-medium text-foreground'>{userName ? userName.split(" ")[0] : "Guest"}</span>
              <span className='text-xs text-muted-foreground'>{getRoleName(userRole)}</span>
            </div>
          </div>

          {!isLoading && renderRoleSpecificMenu()}
        </div>

        {!isLoading && (
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 hover:bg-gray-200 hover:duration-300 rounded-md' style={{ color: "black" }}>
              <Button variant='outline' size='sm' onClick={logout} className='flex items-center space-x-1 hover:bg-accent hover:text-accent-foreground text-base font-medium group'>
                <LogOut className='w-5 h-5 group-hover:translate-x-2 transition-transform duration-500' />
                <span className='hidden sm:inline'>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
