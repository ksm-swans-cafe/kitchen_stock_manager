"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/lib/hooks/usePermission";
import { Loader2, ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // true = ต้องมีทุก permission, false = มีอย่างน้อย 1
  fallbackUrl?: string;
  showAccessDenied?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallbackUrl = "/home",
  showAccessDenied = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  // Combine single permission with array
  const allRequiredPermissions = requiredPermission
    ? [requiredPermission, ...requiredPermissions]
    : requiredPermissions;

  // Check if user has required permissions
  const hasAccess =
    allRequiredPermissions.length === 0 ||
    (requireAll
      ? hasAllPermissions(allRequiredPermissions)
      : hasAnyPermission(allRequiredPermissions));

  useEffect(() => {
    if (!isLoading && !hasAccess && !showAccessDenied) {
      router.push(fallbackUrl);
    }
  }, [isLoading, hasAccess, showAccessDenied, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-gray-600 mb-6">
              คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ
            </p>
            <button
              onClick={() => router.push(fallbackUrl)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

// HOC version for wrapping pages
export function withPermission(
  WrappedComponent: React.ComponentType<any>,
  requiredPermission?: string,
  requiredPermissions?: string[]
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;
