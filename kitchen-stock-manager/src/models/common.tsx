import { LucideIcon } from "lucide-react";

export interface MenuHome {
  id: string;
  title: string;
  icon: LucideIcon;
  color: {
    bg: string;
    hover: string;
    icon: string;
  };
  onClick: () => void;
  hasBadge: boolean;
  badgeText: string;
}

export type EmployeeRole = "admin" | "employee" | "customer" | "developer" | string;

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: EmployeeRole | EmployeeRole[] | null;
  userRoles: string[];
  userName: string | null;
  userPermissions: string[];
  checkAuth: (preventRedirect?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
};