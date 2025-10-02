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

export type EmployeeRole = "admin" | "employee" | "customer";

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: EmployeeRole | null;
  userName: string | null;
  checkAuth: (preventRedirect?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
};