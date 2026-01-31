"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { PERMISSIONS, DEVELOPER_ONLY_PERMISSIONS } from "@/lib/permissions";

export type PermissionKey = keyof typeof PERMISSIONS;

interface UsePermissionReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  userPermissions: string[];
  isLoading: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { userRoles, userPermissions, isLoading } = useAuth();

  // Normalize roles to lowercase for comparison
  const normalizedRoles = userRoles.map((r) => r.toLowerCase());

  // Check if user has specific roles (case-insensitive)
  const isAdmin = normalizedRoles.some((r) => r === "admin" || r === "adm,in");
  const isDeveloper = normalizedRoles.some((r) => r === "developer" || r === "dev");

  // Get all permissions (from context or default based on role)
  const permissions = userPermissions.length > 0 ? userPermissions : [];

  // Check single permission
  const hasPermission = (permission: string): boolean => {
    // Developer has all permissions
    if (isDeveloper) return true;
    
    // Admin has all permissions except developer-only
    if (isAdmin) {
      const isDeveloperOnly = DEVELOPER_ONLY_PERMISSIONS.includes(permission as any);
      return !isDeveloperOnly;
    }

    return permissions.includes(permission);
  };

  // Check if user has any of the permissions
  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => hasPermission(p));
  };

  // Check if user has all permissions
  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every((p) => hasPermission(p));
  };

  // Shorthand methods for common actions
  const canView = (resource: string): boolean => hasPermission(`view:${resource}`);
  const canCreate = (resource: string): boolean => hasPermission(`create:${resource}`);
  const canEdit = (resource: string): boolean => hasPermission(`edit:${resource}`);
  const canDelete = (resource: string): boolean => hasPermission(`delete:${resource}`);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isDeveloper,
    userPermissions: permissions,
    isLoading,
  };
}

export default usePermission;
