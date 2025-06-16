'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type EmployeeRole = 'admin' | 'employee' | 'customer';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: EmployeeRole | null;
  userName: string | null;
  checkAuth: (preventRedirect?: boolean) => Promise<boolean>; // เปลี่ยนเป็นคืนค่า boolean
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  userName: null,
  checkAuth: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<EmployeeRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = async (preventRedirect = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUserName(data.userName);
        return true;
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        if (!preventRedirect) {
          router.push('/login');
        }
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName(null);
      if (!preventRedirect) {
        router.push('/login');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/post/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        location.href = '/login';
        // router.push('/login');
        // router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      userRole, 
      userName,
      checkAuth, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);