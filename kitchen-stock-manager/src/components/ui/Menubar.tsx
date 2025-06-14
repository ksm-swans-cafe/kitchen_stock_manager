// components/Menubar.tsx
'use client';

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/share/ui/button";
import { LogOut, Home, Users, ShoppingCart, Settings, User } from "lucide-react";

export default function Menubar() {
  const pathname = usePathname();
  const { userRole, userName, logout, isLoading, checkAuth } = useAuth();
  const isLoginPage = pathname === "/login";

  const getRoleName = (role: string | null) => {
    switch(role) {
      case 'admin': return 'Administrator';
      case 'employee': return 'Employee';
      case 'customer': return 'Customer';
      default: return 'Guest';
    }
  };

    useEffect(() =>{
        if (isLoading) {
            checkAuth();
        }
    })

  const renderRoleSpecificMenu = () => {
    switch(userRole) {
      case 'admin':
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/admin/users'}>
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/admin/settings'}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </div>
        );
      case 'employee':
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/orders'}>
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </Button>
          </div>
        );
      case 'customer':
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.location.href = '/my-orders'}>
              <ShoppingCart className="w-4 h-4" />
              <span>My Orders</span>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoginPage) {
    return (
      <div className="w-full p-4 bg-blue-600 text-white text-center">
        <h1 className="text-xl font-bold">SWANS CAFE & BISTRO</h1>
      </div>
    );
  }

  return (
    <div className="w-full bg-card/90 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-primary" onClick={() => window.location.href = '/'} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              SWANS
            </h1>
          </div>
          
          {!isLoading && renderRoleSpecificMenu()}
        </div>

        {!isLoading && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">
                {userName || 'Guest'}
              </span>
              <span className="text-xs text-muted-foreground">
                {getRoleName(userRole)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0"
                title="Profile"
                onClick={() => window.location.href = '/profile'}
              >
                <User className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}