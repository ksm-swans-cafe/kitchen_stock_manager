"use client";

import Calendar from "react-calendar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Edit, Eye, Trash2, Download } from "lucide-react";
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
  BarChart3,
  Target,
  ShoppingCart,
  Package,
  Calculator,
  Search,
} from "lucide-react";
import DailyOrderSummary from "@/components/ui/DailyOrderSummary";

const Finance: React.FC = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSignOut = () => {
    router.push("/");
  };

  // Enhanced mock data
  const incomeExpenseData = [
    {
      id: 1,
      date: "2024-06-20",
      time: "14:30",
      type: "income",
      description: "ขายกาแฟและเบเกอรี่",
      amount: 1500,
      category: "ยอดขาย",
      paymentMethod: "เงินสด",
      customerCount: 8,
    },
    {
      id: 2,
      date: "2024-06-20",
      time: "09:15",
      type: "expense",
      description: "ซื้อเมล็ดกาแฟ อราบิก้า",
      amount: -800,
      category: "วัตถุดิบ",
      supplier: "บริษัท ABC จำกัด",
      quantity: "5 กก.",
    },
    {
      id: 3,
      date: "2024-06-19",
      time: "16:45",
      type: "income",
      description: "ขายเบเกอรี่และเครื่องดื่ม",
      amount: 2200,
      category: "ยอดขาย",
      paymentMethod: "บัตรเครดิต",
      customerCount: 12,
    },
    {
      id: 4,
      date: "2024-06-19",
      time: "10:00",
      type: "expense",
      description: "ค่าไฟฟ้าประจำเดือน",
      amount: -500,
      category: "ค่าใช้จ่าย",
      supplier: "การไฟฟ้านครหลวง",
      invoiceNo: "INV-2024-001",
    },
    {
      id: 5,
      date: "2024-06-18",
      time: "13:20",
      type: "income",
      description: "ขายน้ำปั่นและขนม",
      amount: 1800,
      category: "ยอดขาย",
      paymentMethod: "โอนผ่านแอป",
      customerCount: 15,
    },
    {
      id: 6,
      date: "2024-06-18",
      time: "08:30",
      type: "expense",
      description: "ซื้อนมสดและครีม",
      amount: -350,
      category: "วัตถุดิบ",
      supplier: "ฟาร์มนมสด XYZ",
      quantity: "10 ลิตร",
    },
  ];

  const rawMaterials = [
    {
      id: 1,
      name: "เมล็ดกาแฟ อราบิก้า",
      cost: 800,
      unit: "กก.",
      stock: 25,
      minStock: 10,
      lastUpdated: "2024-06-20",
      supplier: "บริษัท ABC จำกัด",
      status: "ปกติ",
    },
    {
      id: 2,
      name: "นมสด",
      cost: 35,
      unit: "ลิตร",
      stock: 45,
      minStock: 20,
      lastUpdated: "2024-06-20",
      supplier: "ฟาร์มนมสด XYZ",
      status: "ปกติ",
    },
    {
      id: 3,
      name: "แป้งสาลี",
      cost: 45,
      unit: "กก.",
      stock: 8,
      minStock: 15,
      lastUpdated: "2024-06-19",
      supplier: "โรงสีข้าว DEF",
      status: "ต่ำ",
    },
    {
      id: 4,
      name: "น้ำตาล",
      cost: 25,
      unit: "กก.",
      stock: 30,
      minStock: 10,
      lastUpdated: "2024-06-19",
      supplier: "บริษัท GHI จำกัด",
      status: "ปกติ",
    },
    {
      id: 5,
      name: "โกโก้ผง",
      cost: 120,
      unit: "กก.",
      stock: 5,
      minStock: 8,
      lastUpdated: "2024-06-18",
      supplier: "บริษัท JKL จำกัด",
      status: "ต่ำ",
    },
    {
      id: 6,
      name: "สตรอเบอรี่",
      cost: 80,
      unit: "กก.",
      stock: 12,
      minStock: 5,
      lastUpdated: "2024-06-20",
      supplier: "ฟาร์มผลไม้ MNO",
      status: "ปกติ",
    },
  ];

  const salesData = [
    {
      id: 1,
      product: "กาแฟอเมริกาโน่",
      sold: 45,
      revenue: 2250,
      cost: 900,
      profit: 1350,
      category: "เครื่องดื่มร้อน",
      trend: "+12%",
    },
    {
      id: 2,
      product: "กาแฟลาเต้",
      sold: 32,
      revenue: 1920,
      cost: 768,
      profit: 1152,
      category: "เครื่องดื่มร้อน",
      trend: "+8%",
    },
    {
      id: 3,
      product: "ครัวซองต์",
      sold: 28,
      revenue: 1400,
      cost: 560,
      profit: 840,
      category: "เบเกอรี่",
      trend: "+15%",
    },
    {
      id: 4,
      product: "น้ำปั่นสตรอเบอรี่",
      sold: 22,
      revenue: 1320,
      cost: 528,
      profit: 792,
      category: "เครื่องดื่มเย็น",
      trend: "+5%",
    },
    {
      id: 5,
      product: "เค้กช็อกโกแลต",
      sold: 18,
      revenue: 900,
      cost: 360,
      profit: 540,
      category: "เบเกอรี่",
      trend: "-3%",
    },
    {
      id: 6,
      product: "กาแฟคาปูชิโน่",
      sold: 25,
      revenue: 1500,
      cost: 625,
      profit: 875,
      category: "เครื่องดื่มร้อน",
      trend: "+10%",
    },
  ];

  const budgetData = [
    {
      id: 1,
      category: "วัตถุดิบ",
      budget: 50000,
      used: 35000,
      remaining: 15000,
      percentage: 70,
      status: "ปกติ",
      lastUpdate: "2024-06-20",
    },
    {
      id: 2,
      category: "ค่าใช้จ่ายดำเนินงาน",
      budget: 20000,
      used: 15500,
      remaining: 4500,
      percentage: 77.5,
      status: "ระวัง",
      lastUpdate: "2024-06-19",
    },
    {
      id: 3,
      category: "การตลาด",
      budget: 10000,
      used: 6000,
      remaining: 4000,
      percentage: 60,
      status: "ปกติ",
      lastUpdate: "2024-06-18",
    },
    {
      id: 4,
      category: "บำรุงรักษา",
      budget: 5000,
      used: 2000,
      remaining: 3000,
      percentage: 40,
      status: "ปกติ",
      lastUpdate: "2024-06-17",
    },
    {
      id: 5,
      category: "ค่าเช่า",
      budget: 25000,
      used: 25000,
      remaining: 0,
      percentage: 100,
      status: "เต็ม",
      lastUpdate: "2024-06-01",
    },
    {
      id: 6,
      category: "เงินเดือนพนักงาน",
      budget: 45000,
      used: 42000,
      remaining: 3000,
      percentage: 93,
      status: "เกือบเต็ม",
      lastUpdate: "2024-06-15",
    },
  ];

  // Enhanced calculations
  const totalIncome = incomeExpenseData
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = Math.abs(
    incomeExpenseData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0)
  );
  const netProfit = totalIncome - totalExpense;
  const profitMargin =
    totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";

  // Filter functions
  const filteredIncomeExpense = incomeExpenseData.filter((item) => {
    const matchesSearch = item.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ปกติ":
        return "text-green-600 bg-green-50";
      case "ต่ำ":
        return "text-orange-600 bg-orange-50";
      case "ระวัง":
        return "text-yellow-600 bg-yellow-50";
      case "เต็ม":
        return "text-red-600 bg-red-50";
      case "เกือบเต็ม":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
        {/* Main Content */}
        <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-800">
                  รายรับรวม
                </CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-700">
                  ฿{totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  +12% จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-red-800">
                  รายจ่ายรวม
                </CardTitle>
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-red-700">
                  ฿{totalExpense.toLocaleString()}
                </div>
                <p className="text-xs text-red-600 mt-1">+5% จากเดือนที่แล้ว</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">
                  กำไรสุทธิ
                </CardTitle>
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-blue-700">
                  ฿{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  +18% จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-purple-800">
                  อัตรากำไร
                </CardTitle>
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-purple-700">
                  {profitMargin}%
                </div>
                <p className="text-xs text-purple-600 mt-1">เป้าหมาย 35%</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="daily-summary" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 min-w-max lg:min-w-0">
                <TabsTrigger
                  value="daily-summary"
                  className="text-xs sm:text-sm"
                >
                  สรุปรายวัน
                </TabsTrigger>
                <TabsTrigger
                  value="income-expense"
                  className="text-xs sm:text-sm"
                >
                  รายรับ-รายจ่าย
                </TabsTrigger>
                <TabsTrigger
                  value="raw-materials"
                  className="text-xs sm:text-sm"
                >
                  ต้นทุนวัตถุดิบ
                </TabsTrigger>
                <TabsTrigger value="profit-loss" className="text-xs sm:text-sm">
                  กำไร-ขาดทุน
                </TabsTrigger>
                <TabsTrigger value="sales" className="text-xs sm:text-sm">
                  ยอดขาย
                </TabsTrigger>
                <TabsTrigger value="budget" className="text-xs sm:text-sm">
                  งบประมาณ
                </TabsTrigger>
              </TabsList>
            </div>

            {/* สรุปรายวัน */}
            <TabsContent value="daily-summary">
              <DailyOrderSummary />
            </TabsContent>

            {/* Enhanced รายรับ-รายจ่าย */}
            <TabsContent value="income-expense">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        รายรับและรายจ่าย
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        ติดตามการเงินประจำวันแบบละเอียด
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <div className="flex gap-2">
                        <div className="relative flex-grow sm:flex-grow-0">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="ค้นหารายการ..."
                            className="pl-8 text-sm w-full sm:w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select
                          value={filterType}
                          onValueChange={setFilterType}
                        >
                          <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="income">รายรับ</SelectItem>
                            <SelectItem value="expense">รายจ่าย</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={selectedPeriod}
                          onValueChange={setSelectedPeriod}
                        >
                          <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">วันนี้</SelectItem>
                            <SelectItem value="week">สัปดาห์นี้</SelectItem>
                            <SelectItem value="month">เดือนนี้</SelectItem>
                            <SelectItem value="year">ปีนี้</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="whitespace-nowrap">
                          <PlusCircle className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">เพิ่มรายการ</span>
                          <span className="sm:hidden">เพิ่ม</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            วันที่/เวลา
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            ประเภท
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            รายการ
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            หมวดหมู่
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            รายละเอียด
                          </TableHead>
                          <TableHead className="text-right text-xs sm:text-sm">
                            จำนวนเงิน
                          </TableHead>
                          <TableHead className="text-center text-xs sm:text-sm">
                            จัดการ
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncomeExpense.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs sm:text-sm">
                              <div>
                                <div>{item.date}</div>
                                <div className="text-muted-foreground text-xs">
                                  {item.time}
                                </div>
                              </div>
                            </TableCell>
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
                            <TableCell className="text-xs sm:text-sm">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {item.category}
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.type === "income" ? (
                                <div>
                                  <div>วิธีชำระ: {item.paymentMethod}</div>
                                  <div className="text-muted-foreground">
                                    ลูกค้า: {item.customerCount} คน
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div>ผู้จำหน่าย: {item.supplier}</div>
                                  <div className="text-muted-foreground">
                                    {item.quantity && `จำนวน: ${item.quantity}`}
                                    {item.invoiceNo &&
                                      `ใบแจ้งหนี้: ${item.invoiceNo}`}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium text-xs sm:text-sm ${
                                item.amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ฿{Math.abs(item.amount).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                    <Card className="bg-green-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            ฿{totalIncome.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            รายรับรวม
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            ฿{totalExpense.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            รายจ่ายรวม
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            ฿{netProfit.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            กำไรสุทธิ
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced ต้นทุนวัตถุดิบ */}
            <TabsContent value="raw-materials">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        การจัดการต้นทุนวัตถุดิบ
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        ติดตามราคา สต็อก และต้นทุนวัตถุดิบ
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">ส่งออก</span>
                      </Button>
                      <Button size="sm">
                        <PlusCircle className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">เพิ่มวัตถุดิบ</span>
                        <span className="sm:hidden">เพิ่ม</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  วันที่/เวลา
</TableHead>
<TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  ประเภท
</TableHead>
<TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  รายการ
</TableHead>
<TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  หมวดหมู่
</TableHead>
<TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  รายละเอียด
</TableHead>
<TableHead className="text-xs sm:text-sm font-semibold text-black dark:text-white">
  จำนวนเงิน
</TableHead>
<TableHead className="text-xs :text-sm font-semibold text-black dark:text-white">
  จัดการ
</TableHead>


                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rawMaterials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {material.name}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              ฿{material.cost}/{material.unit}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <div>
                                <div>
                                  {material.stock} {material.unit}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ขั้นต่ำ: {material.minStock}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                  material.status
                                )}`}
                              >
                                {material.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {material.supplier}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {material.lastUpdated}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                >
                                  แก้ไข
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                >
                                  สั่งซื้อ
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Stock Alert Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                    <Card className="bg-green-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {
                              rawMaterials.filter(
                                (item) => item.status === "ปกติ"
                              ).length
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            สถานะปกติ
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {
                              rawMaterials.filter(
                                (item) => item.status === "ต่ำ"
                              ).length
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            สต็อกต่ำ
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            ฿
                            {rawMaterials
                              .reduce(
                                (sum, item) => sum + item.cost * item.stock,
                                0
                              )
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            มูลค่าสต็อก
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {rawMaterials.length}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            รายการทั้งหมด
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced กำไร-ขาดทุน */}
            <TabsContent value="profit-loss">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      รายงานกำไร-ขาดทุน
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      สรุปผลการดำเนินงานรายละเอียด
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm sm:text-base">
                          รายรับรวม
                        </span>
                        <div className="text-xs text-muted-foreground">
                          จากการขาย
                        </div>
                      </div>
                      <span className="text-green-600 font-bold text-sm sm:text-base">
                        ฿{totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm sm:text-base">
                          ต้นทุนขาย
                        </span>
                        <div className="text-xs text-muted-foreground">
                          วัตถุดิบและการผลิต
                        </div>
                      </div>
                      <span className="text-red-600 font-bold text-sm sm:text-base">
                        ฿{Math.round(totalExpense * 0.6).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm sm:text-base">
                          กำไรขั้นต้น
                        </span>
                        <div className="text-xs text-muted-foreground">
                          รายรับ - ต้นทุนขาย
                        </div>
                      </div>
                      <span className="text-yellow-600 font-bold text-sm sm:text-base">
                        ฿
                        {(
                          totalIncome - Math.round(totalExpense * 0.6)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm sm:text-base">
                          ค่าใช้จ่ายดำเนินงาน
                        </span>
                        <div className="text-xs text-muted-foreground">
                          เช่า ไฟฟ้า เงินเดือน
                        </div>
                      </div>
                      <span className="text-gray-600 font-bold text-sm sm:text-base">
                        ฿{Math.round(totalExpense * 0.4).toLocaleString()}
                      </span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-base sm:text-lg">
                          กำไรสุทธิ
                        </span>
                        <div className="text-xs text-muted-foreground">
                          อัตรากำไร: {profitMargin}%
                        </div>
                      </div>
                      <span className="text-blue-600 font-bold text-base sm:text-lg">
                        ฿{netProfit.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      เปรียบเทียบรายเดือน
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      กำไร-ขาดทุน 6 เดือนย้อนหลัง
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["มิ.ย.", "พ.ค.", "เม.ย.", "มี.ค.", "ก.พ.", "ม.ค."].map(
                        (month, index) => {
                          const monthProfit = netProfit - index * 500;
                          const isPositive = monthProfit > 0;
                          return (
                            <div
                              key={month}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm sm:text-base">
                                {month} 2024
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-12 sm:w-16 bg-gray-100 rounded h-2">
                                  <div
                                    className={`h-2 rounded ${
                                      index === 0
                                        ? "bg-blue-500"
                                        : isPositive
                                        ? "bg-green-400"
                                        : "bg-red-400"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.abs(monthProfit) / 100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span
                                  className={`w-16 sm:w-20 text-right text-sm ${
                                    isPositive
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ฿{monthProfit.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Enhanced ยอดขาย */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        การติดตามยอดขาย
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        สินค้าที่ขายดีและผลกำไรแบบละเอียด
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="today">
                        <SelectTrigger className="w-[120px] sm:w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">วันนี้</SelectItem>
                          <SelectItem value="week">สัปดาห์นี้</SelectItem>
                          <SelectItem value="month">เดือนนี้</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">ส่งออก</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            สินค้า
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            หมวดหมู่
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            จำนวนขาย
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            รายรับ
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            ต้นทุน
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            กำไร
                          </TableHead>
                          <TableHead className="text-center text-xs sm:text-sm">
                            อัตรากำไร
                          </TableHead>
                          <TableHead className="text-center text-xs sm:text-sm">
                            แนวโน้ม
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {item.product}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {item.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {item.sold} ชิ้น
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              ฿{item.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-red-600 text-xs sm:text-sm">
                              ฿{item.cost.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600 text-xs sm:text-sm">
                              ฿{item.profit.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                {Math.round((item.profit / item.revenue) * 100)}
                                %
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`text-xs font-medium ${
                                  item.trend.startsWith("+")
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {item.trend}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Sales Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                    <Card className="bg-blue-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-blue-600">
                            {salesData.reduce(
                              (sum, item) => sum + item.sold,
                              0
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ชิ้น
                          </div>
                          <div className="text-xs text-muted-foreground">
                            รวมขาย
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            ฿
                            {salesData
                              .reduce((sum, item) => sum + item.revenue, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            รายรับรวม
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-purple-600">
                            ฿
                            {salesData
                              .reduce((sum, item) => sum + item.profit, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            กำไรรวม
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-orange-600">
                            {Math.round(
                              (salesData.reduce(
                                (sum, item) => sum + item.profit,
                                0
                              ) /
                                salesData.reduce(
                                  (sum, item) => sum + item.revenue,
                                  0
                                )) *
                                100
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            อัตรากำไรเฉลี่ย
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced งบประมาณ */}
            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        การจัดการงบประมาณ
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        ติดตามการใช้จ่ายตามงบประมาณแบบละเอียด
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">ดูรายเดือน</span>
                      </Button>
                      <Button size="sm">
                        <PlusCircle className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">ตั้งงบประมาณ</span>
                        <span className="sm:hidden">เพิ่ม</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {budgetData.map((budget) => (
                      <div
                        key={budget.id}
                        className="space-y-3 p-4 border rounded-lg bg-gradient-to-r from-background to-secondary/20"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm sm:text-base">
                              {budget.category}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                budget.status
                              )}`}
                            >
                              {budget.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            อัพเดท: {budget.lastUpdate}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span>
                            ฿{budget.used.toLocaleString()} / ฿
                            {budget.budget.toLocaleString()}
                          </span>
                          <span className="font-medium">
                            {budget.percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              budget.percentage > 90
                                ? "bg-red-500"
                                : budget.percentage > 75
                                ? "bg-orange-500"
                                : budget.percentage > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(budget.percentage, 100)}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs sm:text-sm">
                          <span className="text-green-600">
                            เหลือ: ฿{budget.remaining.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {budget.remaining > 0
                              ? `สามารถใช้ได้อีก ${(
                                  (budget.remaining / budget.budget) *
                                  100
                                ).toFixed(1)}%`
                              : "เกินงบแล้ว"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Budget Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                    <Card className="bg-blue-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-blue-600">
                            ฿
                            {budgetData
                              .reduce((sum, item) => sum + item.budget, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            งบประมาณรวม
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-orange-600">
                            ฿
                            {budgetData
                              .reduce((sum, item) => sum + item.used, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ใช้ไปแล้ว
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            ฿
                            {budgetData
                              .reduce((sum, item) => sum + item.remaining, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            คงเหลือ
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-purple-600">
                            {Math.round(
                              (budgetData.reduce(
                                (sum, item) => sum + item.used,
                                0
                              ) /
                                budgetData.reduce(
                                  (sum, item) => sum + item.budget,
                                  0
                                )) *
                                100
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ใช้ไปเฉลี่ย
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Finance;
