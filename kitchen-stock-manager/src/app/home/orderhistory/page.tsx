'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/share/ui/button';
import { Card, CardContent, CardHeader } from '@/share/ui/card';
import { ArrowLeft, Home, LogOut, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Search, Filter, Download, ArrowUpDown, Calendar, DollarSign, Users, Hash, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/share/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/share/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/share/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/share/ui/pagination';
import { Input } from '@/share/ui/input';

interface Cart {
  cart_id: string;
  cart_username: string;
  cart_menu_items: string | CartItem[]; // อาจเป็น JSON string หรือ array
  cart_create_date: string;
}

interface CartItem {
  menu_name: string;
  price?: number;
  quantity?: number;
  ingredients?: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

const OrderHistory: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  interface Order {
    id: string;
    orderNumber: string;
    name: string;
    date: string;
    time: string;
    sets: number;
    price: number;
    status: string; // 'pending', 'completed', 'success', 'cancelled'
    createdBy: string; // ชื่อผู้สร้างออร์เดอร์
    ingredients: Array<{
      name: string;
      quantity: string;
      unit?: string; // อาจมีหรือไม่มี
    }>;
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterCreator, setFilterCreator] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = {
    name: 'ผู้ใช้งาน',
    role: 'เชฟ',
  };

const fetchOrders = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/get/carts');
    if (!response.ok) throw new Error('Failed to fetch carts');
    
    const data = await response.json();
    
    const formattedOrders: Order[] = data.map((cart: any) => {
      // ตรวจสอบและแปลง cart_menu_items จาก JSON string เป็น object (ถ้าจำเป็น)
      const menuItems: CartItem[] = 
        typeof cart.cart_menu_items === 'string' 
          ? JSON.parse(cart.cart_menu_items) 
          : cart.cart_menu_items || [];
      
      const firstItem = menuItems[0] || {};

      // คำนวณราคารวมและจำนวนเซ็ต
      const { totalPrice, totalSets } = menuItems.reduce(
        (acc, item) => ({
          totalPrice: acc.totalPrice + (item.price || 0) * (item.quantity || 1),
          totalSets: acc.totalSets + (item.quantity || 1)
        }),
        { totalPrice: 0, totalSets: 0 }
      );

      // สร้าง orderNumber จาก 5 ตัวแรกของ cart_id
      const orderNumber = `ORD${cart.cart_id?.slice(0, 5)?.toUpperCase() || 'XXXXX'}`;

      return {
        id: cart.cart_id || 'no-id',
        orderNumber,
        name: menuItems.length > 1
          ? `${firstItem.menu_name || 'ไม่มีชื่อเมนู'} + ${menuItems.length - 1} รายการ`
          : firstItem.menu_name || 'ไม่มีชื่อเมนู',
        date: cart.cart_create_date
          ? new Date(cart.cart_create_date).toLocaleDateString('th-TH')
          : 'ไม่มีวันที่',
        time: cart.cart_create_date
          ? new Date(cart.cart_create_date).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'ไม่มีเวลา',
        sets: totalSets,
        price: totalPrice,
        status: 'completed', // ตั้งค่าเริ่มต้นเนื่องจากข้อมูลไม่มี field status
        createdBy: cart.cart_username || 'ไม่ทราบผู้สร้าง',
        ingredients: firstItem.ingredients || [] // ตั้งค่าเริ่มต้นหากไม่มีข้อมูลวัตถุดิบ
      };
    });

    setOrders(formattedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSignOut = () => router.push('/');
  const handleBackToDashboard = () => router.push('/dashboard');
  const handleHomeClick = () => router.push('/dashboard');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'completed':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'completed':
        return 'ยืนยันแล้ว';
      case 'success':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-50 to-yellow-50 border-amber-200';
      case 'completed':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'success':
        return 'from-emerald-50 to-teal-50 border-emerald-200';
      case 'cancelled':
        return 'from-rose-50 to-red-50 border-rose-200';
      default:
        return 'from-slate-50 to-gray-50 border-slate-200';
    }
  };

  const uniqueCreators = useMemo(() => {
    return [...new Set(orders.map((order) => order.createdBy))];
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        [order.name, order.id, order.createdBy].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        ) || order.orderNumber.toString().includes(searchTerm)
      );
    }

    if (filterStatus !== 'ทั้งหมด') {
      filtered = filtered.filter(
        (order) => getStatusText(order.status) === filterStatus
      );
    }

    if (filterCreator !== 'ทั้งหมด') {
      filtered = filtered.filter((order) => order.createdBy === filterCreator);
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];

      if (sortBy === 'date') {
        aVal = new Date(`${a.date} ${a.time}`);
        bVal = new Date(`${b.date} ${b.time}`);
      }

      return sortOrder === 'asc'
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });

    return filtered;
  }, [orders, searchTerm, filterStatus, filterCreator, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const headers = ['เลขที่ออร์เดอร์', 'ชื่อเมนู', 'วันที่', 'เวลา', 'จำนวน Set', 'ราคา', 'สถานะ', 'ผู้สร้าง'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedOrders.map((order) => [
        order.id,
        order.name,
        order.date,
        order.time,
        order.sets,
        order.price,
        getStatusText(order.status),
        order.createdBy,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'order_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('ประวัติคำสั่งซื้อ (Order History)', 14, 20);

    const tableColumn = ['เลขที่ออร์เดอร์', 'ชื่อเมนู', 'วันที่', 'เวลา', 'จำนวน Set', 'ราคา', 'สถานะ', 'ผู้สร้าง'];
    const tableRows = filteredAndSortedOrders.map(order => [
      order.id,
      order.name,
      order.date,
      order.time,
      order.sets,
      order.price,
      getStatusText(order.status),
      order.createdBy,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
    });

    doc.save('order_history.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/30 shadow-md">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-black tracking-tight">
            SWANS <span className="text-sm font-medium text-slate-700">CAFE & BISTRO</span>
          </h1>
          <div className="flex items-center space-x-3 text-sm">
            <span className="font-semibold bg-blue-100 px-3 py-1.5 rounded-full text-blue-800">{currentUser.role}</span>
            <span className="font-semibold">{currentUser.name}</span>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" /> ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between bg-white/80 border-b border-slate-200">
        <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
        </Button>
        <div className="flex items-center space-x-2 text-sm">
          <Home className="w-4 h-4 text-slate-500" />
          <button onClick={handleHomeClick} className="text-blue-600 font-medium">Home</button>
          <span className="text-slate-400">/</span>
          <span className="font-semibold">Order History</span>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Order History</h2>
        <p className="text-slate-600 mb-4">จัดการและติดตามประวัติการสั่งซื้อทั้งหมด</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <Input
                placeholder="ค้นหาตามชื่อเมนู, เลขออร์เดอร์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 rounded-xl shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 rounded-lg border-slate-300 shadow-sm">
                <ArrowUpDown className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">วันที่</SelectItem>
                <SelectItem value="price">ราคา</SelectItem>
                <SelectItem value="sets">จำนวน Set</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
              <SelectTrigger className="h-10 rounded-lg border-slate-300 shadow-sm">
                <SelectValue placeholder="ลำดับ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">น้อย → มาก</SelectItem>
                <SelectItem value="desc">มาก → น้อย</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Status */}
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10 rounded-lg border-slate-300 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ทั้งหมด">สถานะทั้งหมด</SelectItem>
                <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                <SelectItem value="ยืนยันแล้ว">ยืนยันแล้ว</SelectItem>
                <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Creator */}
          <div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="h-10 rounded-lg border-slate-300 shadow-sm">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="ผู้สร้างทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ทั้งหมด">ผู้สร้างทั้งหมด</SelectItem>
                {uniqueCreators.map((creator) => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <Button onClick={handleExportCSV} className="flex items-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg px-4 py-2">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="flex items-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg px-4 py-2">
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
              </CardContent>
            </Card>
          ) : paginatedOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">ไม่พบออร์เดอร์</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {paginatedOrders.map((order) => (
                <AccordionItem key={order.id} value={order.id} className="border-none">
                  <Card className={`bg-gradient-to-r ${getStatusColor(order.status)} p-4 rounded-xl`}>
                    <AccordionTrigger className="flex items-center justify-between w-full hover:no-underline gap-4">
                      <div className="flex flex-col md:flex-row justify-between w-full items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-white rounded-xl shadow">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-left">{order.name}</h3>
                            <div className="flex gap-1 flex-wrap text-xs text-slate-600">
                              <span className="flex items-center gap-0.5">
                                <Hash className="w-3 h-3" /> {order.id}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-3 h-3" /> {order.date}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {order.time}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Package className="w-3 h-3" /> {order.sets} Set
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-auto">
                          <p className="text-xl font-bold">฿{order.price.toLocaleString()}</p>
                          <span className="inline-block mt-1 bg-white px-3 py-1 rounded-full text-xs font-medium text-black shadow-sm">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" /> วัตถุดิบที่ใช้
                          </h4>
                          {order.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm mb-2">
                              <span className="font-medium text-black">{ing.name}</span>
                              <span className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700">{ing.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> ข้อมูลออร์เดอร์
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                              <span>จำนวน Set</span>
                              <span className="text-slate-700">{order.sets} Set</span>
                            </div>
                            <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                              <span>วันที่สั่ง</span>
                              <span className="text-slate-700">{order.date}</span>
                            </div>
                            <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                              <span>เวลาที่สั่ง</span>
                              <span className="text-slate-700">{order.time}</span>
                            </div>
                            <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                              <span>ผู้สร้างออร์เดอร์</span>
                              <span className="text-slate-700">{order.createdBy}</span>
                            </div>
                            <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                              <span>สถานะ</span>
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-black bg-yellow-100">
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;