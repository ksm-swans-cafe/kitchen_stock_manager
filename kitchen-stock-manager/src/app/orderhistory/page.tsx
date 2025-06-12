'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader } from "@/share/ui/card";
import { ArrowLeft, Home, LogOut, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Search, Filter, Download, ArrowUpDown, Calendar, Users, Hash, Star } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/share/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/share/ui/pagination";
import { Input } from "@/share/ui/input";

const mockOrderHistory = [
  {
    id: 'ORD001',
    orderNumber: 1,
    name: 'ข้าวผัด - 5 Set',
    date: '2024-06-10',
    time: '14:30',
    sets: 5,
    price: 1150,
    status: 'pending',
    createdBy: 'สมชาย',
    ingredients: [
      { name: 'ข้าว', quantity: '2.5 กก', unit: 'กิโลกรัม' },
      { name: 'ไข่', quantity: '10 ฟอง', unit: 'ฟอง' },
      { name: 'น้ำมันพืช', quantity: '500 มล', unit: 'มิลลิลิตร' }
    ]
  },
  {
    id: 'ORD002',
    orderNumber: 2,
    name: 'ส้มตำ - 3 Set',
    date: '2024-06-09',
    time: '13:15',
    sets: 3,
    price: 615,
    status: 'completed',
    createdBy: 'สมหญิง',
    ingredients: [
      { name: 'มะละกอ', quantity: '1.5 กก', unit: 'กิโลกรัม' },
      { name: 'มะเขือเทศ', quantity: '300 กรัม', unit: 'กรัม' },
      { name: 'ถั่วฝักยาว', quantity: '200 กรัม', unit: 'กรัม' }
    ]
  },
  {
    id: 'ORD003',
    orderNumber: 3,
    name: 'ต้มยำกุ้ง - 2 Set',
    date: '2024-06-08',
    time: '12:45',
    sets: 2,
    price: 480,
    status: 'success',
    createdBy: 'สมศักดิ์',
    ingredients: [
      { name: 'กุ้ง', quantity: '800 กรัม', unit: 'กรัม' },
      { name: 'เห็ด', quantity: '400 กรัม', unit: 'กรัม' },
      { name: 'ใบมะกรูด', quantity: '20 ใบ', unit: 'ใบ' }
    ]
  },
  {
    id: 'ORD004',
    orderNumber: 4,
    name: 'แกงเขียวหวาน - 1 Set',
    date: '2024-06-07',
    time: '11:20',
    sets: 1,
    price: 250,
    status: 'cancelled',
    createdBy: 'สมปอง',
    ingredients: [
      { name: 'เนื้อไก่', quantity: '500 กรัม', unit: 'กรัม' },
      { name: 'มะเขือ', quantity: '300 กรัม', unit: 'กรัม' },
      { name: 'กะทิ', quantity: '400 มล', unit: 'มิลลิลิตร' }
    ]
  }
];

const OrderHistory: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState(mockOrderHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterCreator, setFilterCreator] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const currentUser = { name: 'ผู้ใช้งาน', role: 'เชฟ' };

  const handleSignOut = () => router.push('/');
  const handleBackToDashboard = () => router.push('/dashboard');
  const handleHomeClick = () => router.push('/dashboard');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'completed': return 'ยืนยันแล้ว';
      case 'success': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const uniqueCreators = useMemo(() => [...new Set(orders.map(o => o.createdBy))], [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(o => o.name.includes(searchTerm) || o.id.includes(searchTerm));
    }
    if (filterStatus !== 'ทั้งหมด') {
      filtered = filtered.filter(o => getStatusText(o.status) === filterStatus);
    }
    if (filterCreator !== 'ทั้งหมด') {
      filtered = filtered.filter(o => o.createdBy === filterCreator);
    }
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];
      if (sortBy === 'date') {
        aVal = new Date(a.date + ' ' + a.time);
        bVal = new Date(b.date + ' ' + b.time);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return filtered;
  }, [orders, searchTerm, filterStatus, filterCreator, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ['เลขที่ออร์เดอร์', 'ชื่อเมนู', 'วันที่', 'เวลา', 'จำนวน Set', 'ราคา', 'สถานะ', 'ผู้สร้าง'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedOrders.map(o => [o.id, o.name, o.date, o.time, o.sets, o.price, getStatusText(o.status), o.createdBy].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'order_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBackToDashboard}><ArrowLeft className="mr-2 h-4 w-4" /> กลับ</Button>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleHomeClick}><Home className="mr-2 h-4 w-4" /> Home</Button>
          <Button variant="destructive" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ</Button>
        </div>
      </div>

      <div className="mb-4">
        <Input placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger><ArrowUpDown className="mr-2 h-4 w-4" /> <SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">วันที่</SelectItem>
            <SelectItem value="price">ราคา</SelectItem>
            <SelectItem value="sets">จำนวน Set</SelectItem>
            <SelectItem value="orderNumber">เลขออร์เดอร์</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">น้อยไปมาก</SelectItem>
            <SelectItem value="desc">มากไปน้อย</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
            <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
            <SelectItem value="ยืนยันแล้ว">ยืนยันแล้ว</SelectItem>
            <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
            <SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCreator} onValueChange={setFilterCreator}>
          <SelectTrigger><Users className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
            {uniqueCreators.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Button onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="space-y-4">
        {paginatedOrders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{order.name}</h3>
                  <p className="text-sm text-muted-foreground">{order.date} {order.time}</p>
                </div>
                <span className="text-sm font-medium">{getStatusText(order.status)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <p>ราคา: ฿{order.price}</p>
                <p>จำนวน Set: {order.sets}</p>
                <p>ผู้สร้าง: {order.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
