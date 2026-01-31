"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { EmployeeRole, AuthContextType } from "@/models/common";
import api from "@/lib/axios";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  userRoles: [],
  userName: null,
  userPermissions: [],
  checkAuth: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<EmployeeRole | EmployeeRole[] | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const router = useRouter();

  const checkAuth = async (preventRedirect = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        // Support both old (role) and new (roles) format
        const roles = data.roles || (data.role ? [data.role] : []);
        setUserRole(data.role || roles);
        setUserRoles(roles);
        setUserName(data.userName);
        setUserPermissions(data.permissions || []);
        return true;
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserRoles([]);
        setUserName(null);
        setUserPermissions([]);
        if (!preventRedirect) {
          router.push("/login");
        }
        return false;
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserRoles([]);
      setUserName(null);
      setUserPermissions([]);
      if (!preventRedirect) {
        router.push("/login");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post("/api/post/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserRoles([]);
        setUserName(null);
        setUserPermissions([]);
        location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userRole,
        userRoles,
        userName,
        userPermissions,
        checkAuth,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
