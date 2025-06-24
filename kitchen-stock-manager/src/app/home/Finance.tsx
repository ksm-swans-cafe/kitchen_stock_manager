import React, { useState } from "react";
import { Button } from "@/share/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/share/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/share/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/share/ui/table";
// import { Input } from "@/share/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";
import {
  ArrowLeft,
  Home,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  // Minus,
  BarChart3,
  Target,
  ShoppingCart,
  Package,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Finance: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleSignOut = () => {
    navigate("/");
  };

  // Mock data สำหรับแสดงผล
  const incomeExpenseData = [
    {
      date: "2024-06-20",
      type: "income",
      description: "ขายกาแฟ",
      amount: 1500,
      category: "ยอดขาย",
    },
    {
      date: "2024-06-20",
      type: "expense",
      description: "ซื้อเมล็ดกาแฟ",
      amount: -800,
      category: "วัตถุดิบ",
    },
    {
      date: "2024-06-19",
      type: "income",
      description: "ขายเบเกอรี่",
      amount: 2200,
      category: "ยอดขาย",
    },
    {
      date: "2024-06-19",
      type: "expense",
      description: "ค่าไฟฟ้า",
      amount: -500,
      category: "ค่าใช้จ่าย",
    },
    {
      date: "2024-06-18",
      type: "income",
      description: "ขายน้ำปั่น",
      amount: 1800,
      category: "ยอดขาย",
    },
  ];

  const rawMaterials = [
    {
      id: 1,
      name: "เมล็ดกาแฟ อราบิก้า",
      cost: 800,
      unit: "กก.",
      lastUpdated: "2024-06-20",
    },
    { id: 2, name: "นมสด", cost: 35, unit: "ลิตร", lastUpdated: "2024-06-20" },
    {
      id: 3,
      name: "แป้งสาลี",
      cost: 45,
      unit: "กก.",
      lastUpdated: "2024-06-19",
    },
    { id: 4, name: "น้ำตาล", cost: 25, unit: "กก.", lastUpdated: "2024-06-19" },
  ];

  const salesData = [
    { product: "กาแฟอเมริกาโน่", sold: 45, revenue: 2250, profit: 1350 },
    { product: "กาแฟลาเต้", sold: 32, revenue: 1920, profit: 1152 },
    { product: "ครัวซองต์", sold: 28, revenue: 1400, profit: 840 },
    { product: "น้ำปั่นสตรอเบอรี่", sold: 22, revenue: 1320, profit: 792 },
  ];

  const budgetData = [
    { category: "วัตถุดิบ", budget: 50000, used: 35000, remaining: 15000 },
    {
      category: "ค่าใช้จ่ายดำเนินงาน",
      budget: 20000,
      used: 15500,
      remaining: 4500,
    },
    { category: "การตลาด", budget: 10000, used: 6000, remaining: 4000 },
    { category: "บำรุงรักษา", budget: 5000, used: 2000, remaining: 3000 },
  ];

  const totalIncome = incomeExpenseData
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = Math.abs(
    incomeExpenseData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0)
  );
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Menu Bar */}
      <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <span className="text-xl md:text-2xl">SWANS</span>{" "}
            <span className="text-sm md:text-lg font-medium">
              CAFE & BISTRO
            </span>
          </h1>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Finance Management</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 shadow-sm hover:shadow-md transition-all text-xs md:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="w-full bg-secondary/20 border-b border-border/50">
        <div className="p-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Dashboard</span>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <span>/</span>
            <DollarSign className="w-4 h-4" />
            <span>Finance</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                รายรับรวม
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ฿{totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +12% จากเดือนที่แล้ว
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                รายจ่ายรวม
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                ฿{totalExpense.toLocaleString()}
              </div>
              <p className="text-xs text-red-600 mt-1">+5% จากเดือนที่แล้ว</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                กำไรสุทธิ
              </CardTitle>
              <Calculator className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                ฿{netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 mt-1">+18% จากเดือนที่แล้ว</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="income-expense" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="income-expense">รายรับ-รายจ่าย</TabsTrigger>
            <TabsTrigger value="raw-materials">ต้นทุนวัตถุดิบ</TabsTrigger>
            <TabsTrigger value="profit-loss">กำไร-ขาดทุน</TabsTrigger>
            <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
            <TabsTrigger value="budget">งบประมาณ</TabsTrigger>
          </TabsList>

          {/* รายรับ-รายจ่าย */}
          <TabsContent value="income-expense">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      รายรับและรายจ่าย
                    </CardTitle>
                    <CardDescription>ติดตามการเงินประจำวัน</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">วันนี้</SelectItem>
                        <SelectItem value="week">สัปดาห์นี้</SelectItem>
                        <SelectItem value="month">เดือนนี้</SelectItem>
                        <SelectItem value="year">ปีนี้</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      เพิ่มรายการ
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>รายการ</TableHead>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead className="text-right">จำนวนเงิน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeExpenseData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.type === "income" ? "รายรับ" : "รายจ่าย"}
                          </span>
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ฿{Math.abs(item.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ต้นทุนวัตถุดิบ */}
          <TabsContent value="raw-materials">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      การจัดการต้นทุนวัตถุดิบ
                    </CardTitle>
                    <CardDescription>
                      ติดตามราคาและต้นทุนวัตถุดิบ
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    เพิ่มวัตถุดิบ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อวัตถุดิบ</TableHead>
                      <TableHead>ราคาต่อหน่วย</TableHead>
                      <TableHead>หน่วย</TableHead>
                      <TableHead>อัพเดทล่าสุด</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          {material.name}
                        </TableCell>
                        <TableCell>฿{material.cost}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell>{material.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            แก้ไข
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* กำไร-ขาดทุน */}
          <TabsContent value="profit-loss">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    รายงานกำไร-ขาดทุน
                  </CardTitle>
                  <CardDescription>สรุปผลการดำเนินงาน</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium">รายรับรวม</span>
                    <span className="text-green-600 font-bold">
                      ฿{totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="font-medium">ต้นทุนขาย</span>
                    <span className="text-red-600 font-bold">
                      ฿{Math.round(totalExpense * 0.6).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">ค่าใช้จ่ายดำเนินงาน</span>
                    <span className="text-gray-600 font-bold">
                      ฿{Math.round(totalExpense * 0.4).toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium text-lg">กำไรสุทธิ</span>
                    <span className="text-blue-600 font-bold text-lg">
                      ฿{netProfit.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>เปรียบเทียบรายเดือน</CardTitle>
                  <CardDescription>กำไร-ขาดทุน 6 เดือนย้อนหลัง</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["มิ.ย.", "พ.ค.", "เม.ย.", "มี.ค.", "ก.พ.", "ม.ค."].map(
                      (month, index) => (
                        <div
                          key={month}
                          className="flex justify-between items-center"
                        >
                          <span>{month} 2024</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-16 h-2 rounded ${
                                index === 0 ? "bg-blue-500" : "bg-gray-200"
                              }`}
                            ></div>
                            <span className="w-20 text-right">
                              ฿{(netProfit - index * 500).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ยอดขาย */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      การติดตามยอดขาย
                    </CardTitle>
                    <CardDescription>สินค้าที่ขายดีและผลกำไร</CardDescription>
                  </div>
                  <Select defaultValue="today">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">วันนี้</SelectItem>
                      <SelectItem value="week">สัปดาห์นี้</SelectItem>
                      <SelectItem value="month">เดือนนี้</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สินค้า</TableHead>
                      <TableHead>จำนวนขาย</TableHead>
                      <TableHead>รายรับ</TableHead>
                      <TableHead>กำไร</TableHead>
                      <TableHead className="text-right">อัตรากำไร</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.product}
                        </TableCell>
                        <TableCell>{item.sold} ชิ้น</TableCell>
                        <TableCell>฿{item.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">
                          ฿{item.profit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {Math.round((item.profit / item.revenue) * 100)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* งบประมาณ */}
          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      การจัดการงบประมาณ
                    </CardTitle>
                    <CardDescription>
                      ติดตามการใช้จ่ายตามงบประมาณ
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    ตั้งงบประมาณ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetData.map((budget, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.category}</span>
                        <span className="text-sm text-muted-foreground">
                          ฿{budget.used.toLocaleString()} / ฿
                          {budget.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            budget.used / budget.budget > 0.8
                              ? "bg-red-500"
                              : budget.used / budget.budget > 0.6
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${(budget.used / budget.budget) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          เหลือ: ฿{budget.remaining.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          ใช้ไป:{" "}
                          {Math.round((budget.used / budget.budget) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finance;
