'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/share/ui/button';
import { Card, CardContent } from '@/share/ui/card';
import { ArrowLeft, Home, LogOut, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Search, Filter, Download, ArrowUpDown, Calendar, Users, Hash, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/share/ui/accordion';
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

interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

interface CartItem {
  menu_name: string;
  price?: number;
  quantity?: number;
  ingredients?: Ingredient[];
}

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
  ingredients: Ingredient[];
}

const OrderHistory: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'sets'>('date');
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
          (acc: { totalPrice: number; totalSets: number }, item: CartItem) => ({
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
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

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
      {/* ... rest of your JSX remains the same ... */}
    </div>
  );
};

export default OrderHistory;