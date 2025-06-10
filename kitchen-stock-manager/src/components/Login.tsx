'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';


const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

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
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const pinCode = pin.join('');
    const pinInt = parseInt(pinCode, 10);
    setLoading(true);
    setError('');

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (username.toLowerCase() === 'boss' && pinInt === 1234) {
        alert(`ยินดีต้อนรับคุณ BOSS NAJA`);
      } else if (username.toLowerCase() === 'sunny' && pinInt === 5678) {
        alert(`ยินดีต้อนรับคุณ ACE SUNNY`);
      } else {
        setError('ชื่อหรือ PIN ไม่ถูกต้อง');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pin.includes('') && username) {
      handleLogin();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-small-black/[0.02] bg-grid-small" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl animate-fade-in">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">กำลังเข้าสู่ระบบ...</p>
            </div>
          </div>
        )}

        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ArrowRight className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            เข้าสู่ระบบ
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            กรอกชื่อผู้ใช้และรหัส PIN เพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-foreground">
              ชื่อพนักงาน
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อพนักงาน"
              className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-border/60 hover:border-primary/30"
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              รหัส PIN
            </Label>
            <div className="flex justify-center space-x-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  type="password"
                  inputMode="numeric"
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
            <p className="text-xs text-muted-foreground text-center">
              ใส่ PIN 4 หลักเพื่อเข้าสู่ระบบอัตโนมัติ
            </p>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading || !username || pin.includes('')}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
