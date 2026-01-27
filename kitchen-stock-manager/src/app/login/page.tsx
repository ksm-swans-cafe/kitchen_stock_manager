"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/share/ui/card";
import { Alert, AlertDescription } from "@/share/ui/alert";
import { api } from "@/lib/api";
import { Employee } from "@/models/employee/Employee";

import { cn } from "@/lib/utils";
import useLoadingDots from "@/lib/hook/Dots";
import "./style.css";

interface LoginState {
  username: string;
  pin: string[];
  loading: boolean;
  error: string;
  setUsername: (username: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  resetPin: () => void;
  updatePinDigit: (value: string, index: number) => void;
}

const useLogin = create<LoginState>((set, get) => ({
  username: "",
  pin: ["", "", "", ""],
  loading: false,
  error: "",
  setUsername: (username: string) => set({ username }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string) => set({ error }),
  resetPin: () => set({ pin: ["", "", "", ""] }),
  updatePinDigit: (value: string, index: number) => {
    const currentPin = get().pin;
    const newPin = [...currentPin];
    newPin[index] = value;
    set({ pin: newPin });
  },
}));

const Login: React.FC = () => {
  const { username, pin, loading, error, setUsername, setLoading, setError, resetPin, updatePinDigit } = useLogin();
  const { checkAuth } = useAuth();
  const dots = useLoadingDots();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handle = {
    PinChange: (value: string, index: number) => {
      if (/^\d?$/.test(value)) {
        updatePinDigit(value, index);
        if (value && index < 3) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    },
    KeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && pin[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    Login: useCallback(async () => {
      const pinCode = pin.join("");
      const pinInt = parseInt(pinCode, 10);
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/auth/user");
        const employees: Employee[] = await response.data;

        let matchedEmployee: Employee | null = null;
        for (const emp of employees) {
          if (emp.employee_username?.toLowerCase() == username.toLowerCase() && emp.employee_pin == pinInt) {
            matchedEmployee = emp;
            break;
          }
        }

        if (matchedEmployee) {
          const token = generateToken();
          const loginResponse = await api.post("/api/auth/login", {
            token,
            username: matchedEmployee.employee_username,
            name: `${matchedEmployee.employee_firstname} ${matchedEmployee.employee_lastname}`,
            role: matchedEmployee.employee_role,
          });

          if (loginResponse.status === 200) {
            await checkAuth(true);
            router.push("/home");
          } else throw new Error("Failed to login");
        } else {
          setError("ชื่อผู้ใช้หรือ PIN ไม่ถูกต้อง");
          resetPin();
          inputRefs.current[0]?.focus();
        }
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ " + error);
      } finally {
        setLoading(false);
      }
    }, [pin, username, router, setLoading, setError, resetPin]),
  };

  useEffect(() => {
    const pinComplete = pin.join("").length === 4 && pin.every((p) => p !== "");
    if (pinComplete) handle.Login();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") handle.Login();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handle.Login, username, pin]);

  return (
    <div className='min-h-screen h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center px-4 relative overflow-hidden'>
      <div className='absolute inset-0 bg-grid-small-black/[0.02] bg-grid-small' />
      <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse' />
      <div className='absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000' />

      <Card className='w-full max-w-lg relative backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl animate-fade-in'>
        {loading && (
          <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg'>
            <div className='flex flex-col items-center space-y-3'>
              <div className='w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin' />
              <p className='text-lg text-muted-foreground font-medium'>กำลังเข้าสู่ระบบ{dots}</p>
            </div>
          </div>
        )}

        <CardHeader className='space-y-2 text-center pb-4'>
          <div className='mx-auto flex items-center justify-center mb-3'>
            <img src='https://hvusvym1gfn5yabw.public.blob.vercel-storage.com/logo/S__3842055-Pzp1LBEQErI3yqCqwKiiCxobjW6Y8K.jpg' className='custom-logo-img cursor-pointer border border-gray-300 rounded-full transition-transform duration-200 transform hover:scale-110 inline-block' alt='Logo' />
          </div>

          <CardTitle className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text'>เข้าสู่ระบบ</CardTitle>
          <CardDescription className='text-lg text-muted-foreground mt-2'>กรอกชื่อผู้ใช้และรหัส PIN เพื่อเข้าสู่ระบบ</CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive' className='animate-fade-in'>
              <AlertDescription className='text-base'>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='username' className=' text-lg font-semibold text-foreground'>
              ชื่อผู้เข้าใช้งาน
            </Label>
            <Input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='กรอกชื่อพนักงาน'
              className='h-12 mt-2 font-semibold text-2xl transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-border/60 hover:border-primary/30'
              disabled={loading}
            />
          </div>

          <div className='space-y-3'>
            <div className='text-lg font-semibold text-foreground flex items-center justify-center'>รหัส PIN</div>
            <div className='flex justify-center space-x-3'>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  type='password'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handle.PinChange(e.target.value, i)}
                  onKeyDown={(e) => handle.KeyDown(e, i)}
                  ref={setInputRef(i)}
                  disabled={loading}
                  className={cn(
                    "w-16 h-16 text-center text-2xl font-bold",
                    "border-2 rounded-full transition-all duration-200",
                    "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
                    "hover:border-primary/50 bg-background/50",
                    digit ? "border-primary bg-primary/5" : "border-border",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                />
              ))}
            </div>
            <p className='text-sm text-muted-foreground text-center'>ใส่ PIN 4 หลักเพื่อเข้าสู่ระบบอัตโนมัติ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
