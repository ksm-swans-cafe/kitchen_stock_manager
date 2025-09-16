"use client";
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Employee } from "@/models/employee/employee-model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/share/ui/card";
import { Alert, AlertDescription } from "@/share/ui/alert";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./style.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const apiUrl = "api/get/user";

  const handlePinChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;

      setPin(newPin);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = useCallback(async () => {
    const pinCode = pin.join("");
    const pinInt = parseInt(pinCode, 10);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl);
      const employees: Employee[] = await response.json();

      let matchedEmployee: Employee | null = null;
      for (const emp of employees) {
        if (emp.employee_username?.toLowerCase() == username.toLowerCase() && emp.employee_pin == pinInt) {
          matchedEmployee = emp;
          break;
        }
      }

      if (matchedEmployee) {
        const token = generateToken();
        const loginResponse = await axios.post("/api/post/login", {
          token,
          username: matchedEmployee.employee_username,
          name: `${matchedEmployee.employee_firstname} ${matchedEmployee.employee_lastname}`,
          role: matchedEmployee.employee_role,
        });

        if (loginResponse.status === 200) {
          router.push("/home");
          router.refresh();
        } else {
          throw new Error("Failed to set login cookie");
        }
      } else {
        setError("ชื่อผู้ใช้หรือ PIN ไม่ถูกต้อง");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pin, username, router]);

  useEffect(() => {
    const pinComplete = pin.join("").length === 4 && pin.every((p) => p !== "");
    if (pinComplete) {
      handleLogin();
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleLogin, username, pin]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center px-4 relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute inset-0 bg-grid-small-black/[0.02] bg-grid-small' />
      <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse' />
      <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000' />

      <Card className='w-full max-w-md relative backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl animate-fade-in'>
        {loading && (
          <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin' />
              <p className='text-sm text-muted-foreground font-medium'>กำลังเข้าสู่ระบบ...</p>
            </div>
          </div>
        )}

        <CardHeader className='space-y-2 text-center pb-6'>
          {/* <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ArrowRight className="w-8 h-8 text-primary-foreground" />
          </div> */}
          <div className='mx-auto flex items-center justify-center mb-4'>
            <img
              src='https://hvusvym1gfn5yabw.public.blob.vercel-storage.com/logo/S__3842055-Pzp1LBEQErI3yqCqwKiiCxobjW6Y8K.jpg'
              className='custom-logo-img cursor-pointer border border-gray-300 rounded-full transition-transform duration-200 transform hover:scale-125 inline-block'
              alt='Logo'
            />
          </div>

          <CardTitle className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>เข้าสู่ระบบ</CardTitle>
          <CardDescription className='text-muted-foreground'>กรอกชื่อผู้ใช้และรหัส PIN เพื่อเข้าสู่ระบบ</CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {error && (
            <Alert variant='destructive' className='animate-fade-in'>
              <AlertDescription className='text-sm'>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='username' className='text-sm font-semibold text-foreground'>
              ชื่อ
            </Label>
            <Input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='กรอกชื่อพนักงาน'
              className='h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-border/60 hover:border-primary/30'
              disabled={loading}
            />
          </div>

          <div className=' space-y-3'>
            <div className='่text-sm font-semibold text-foreground flex items-center justify-center'>รหัส PIN</div>
            <div className='flex justify-center space-x-3'>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  type='password'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  ref={setInputRef(i)}
                  disabled={loading}
                  className={cn(
                    "w-14 h-14 text-center text-xl font-bold",
                    "border-2 rounded-full transition-all duration-200",
                    "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
                    "hover:border-primary/50 bg-background/50",
                    digit ? "border-primary bg-primary/5" : "border-border",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                />
              ))}
            </div>
            <p className='text-xs text-muted-foreground text-center'>ใส่ PIN 4 หลักเพื่อเข้าสู่ระบบอัตโนมัติ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
