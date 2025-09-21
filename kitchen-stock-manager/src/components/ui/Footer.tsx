// pages/footer.tsx
"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

const FooterPage: React.FC = () => {
  const pathname = usePathname();
  const { isLoading, checkAuth } = useAuth();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading) {
      checkAuth();
    }
  });

  if (isLoginPage) {
    return null;
  }

  return (
    <div>
      <footer className='py-4 bg-card/90 backdrop-blur-sm border-t border-border'>
        <div className='mx-auto max-w-[1200px] px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0'>
            {/* ข้อมูลระบบ */}
            <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
              <span>© 2024 Kitchen Stock Manager</span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterPage;
