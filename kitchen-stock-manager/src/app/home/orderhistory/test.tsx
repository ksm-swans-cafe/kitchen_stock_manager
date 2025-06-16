// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent, CardHeader } from '@/share/ui/card';
// // ไม่ได้ถูกเรียกใช้จะขอปิดไว้
// // app/(route)/home/order-history/page.tsx
// // import { useRouter } from 'next/navigation';
// // import { Button } from '@/share/ui/button';
// // import {
// // ArrowLeft, Home, LogOut, Clock, User, Package, CheckCircle, XCircle, AlertCircle,
// // Search, Filter, Download, ArrowUpDown, Calendar, DollarSign, Users, Hash, Star
// // } from 'lucide-react';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from '@/share/ui/select';
// import {
//   Pagination, PaginationContent, PaginationItem, PaginationLink,
//   PaginationNext, PaginationPrevious
// } from '@/share/ui/pagination';
// import { Input } from '@/share/ui/input';

// // เพิ่ม type สำหรับ Order
// interface Ingredient {
//   name: string;
//   quantity: string;
// }

// interface Order {
//   id: string;
//   orderNumber: number;
//   name: string;
//   date: string;
//   time: string;
//   sets: number;
//   price: number;
//   status: 'pending' | 'completed' | 'success' | 'cancelled';
//   createdBy: string;
//   ingredients: Ingredient[];
// }

// const Page = () => {
//   // const router = useRouter();

//   // const currentUser = {
//   //   name: 'สมชาย',
//   //   role: 'เชฟ',
//   // };

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [filterStatus] = useState('ทั้งหมด');
//   // , setFilterStatus
//   const [filterCreator, setFilterCreator] = useState('ทั้งหมด');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await fetch('/api/orders');
//         const data: Order[] = await res.json();
//         setOrders(data);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'pending': return 'รอดำเนินการ';
//       case 'completed': return 'ยืนยันแล้ว';
//       case 'success': return 'เสร็จสิ้น';
//       case 'cancelled': return 'ยกเลิก';
//       default: return 'ไม่ทราบสถานะ';
//     }
//   };

//   const filteredAndSortedOrders = useMemo(() => {
//     let filtered = orders;

//     if (searchTerm) {
//       filtered = filtered.filter(order =>
//         order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.orderNumber?.toString().includes(searchTerm) ||
//         order.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (filterStatus !== 'ทั้งหมด') {
//       filtered = filtered.filter(order => getStatusText(order.status) === filterStatus);
//     }

//     if (filterCreator !== 'ทั้งหมด') {
//       filtered = filtered.filter(order => order.createdBy === filterCreator);
//     }

//     filtered.sort((a, b) => {
//       let aValue: string | number | Date | Ingredient[] = a[sortBy as keyof Order];
//       let bValue: string | number | Date | Ingredient[] = b[sortBy as keyof Order];

//       if (sortBy === 'date') {
//         aValue = new Date(`${a.date} ${a.time}`);
//         bValue = new Date(`${b.date} ${b.time}`);
//       }

      
//       if (Array.isArray(aValue) || Array.isArray(bValue)) {
//         return 0; 
//       }

//       if (aValue > bValue) {
//         return sortOrder === 'asc' ? 1 : -1;
//       } else if (aValue < bValue) {
//         return sortOrder === 'asc' ? -1 : 1;
//       } else {
//         return 0;
//       }
//     });

//     return filtered;
//   }, [orders, searchTerm, filterStatus, filterCreator, sortBy, sortOrder]);

//   const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
//   const paginatedOrders = filteredAndSortedOrders.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const uniqueCreators = useMemo(() => {
//     const creators = [...new Set(orders.map(order => order.createdBy))];
//     return creators;
//   }, [orders]);

//   if (loading) return <p className="p-6">กำลังโหลดข้อมูล...</p>;
//   if (!orders.length) return <p className="p-6">ไม่มีออร์เดอร์</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">ประวัติการสั่งอาหาร</h1>

//       <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Input
//           placeholder="ค้นหา..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         <Select value={sortBy} onValueChange={setSortBy}>
//           <SelectTrigger><SelectValue placeholder="เรียงตาม" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="date">วันที่</SelectItem>
//             <SelectItem value="price">ราคา</SelectItem>
//             <SelectItem value="sets">จำนวน Set</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select value={sortOrder} onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
//           <SelectTrigger><SelectValue placeholder="ลำดับ" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="asc">น้อย → มาก</SelectItem>
//             <SelectItem value="desc">มาก → น้อย</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select value={filterCreator} onValueChange={setFilterCreator}>
//           <SelectTrigger><SelectValue placeholder="ผู้สร้าง" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
//             {uniqueCreators.map((creator) => (
//               <SelectItem key={creator} value={creator}>{creator}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {paginatedOrders.map(order => (
//         <Card key={order.id} className="mb-4">
//           <CardHeader>
//             <div className="flex justify-between">
//               <div>
//                 <h2 className="font-semibold">{order.name}</h2>
//                 <p className="text-sm text-slate-500">{order.date} {order.time}</p>
//               </div>
//               <p className="font-semibold">฿{order.price}</p>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm">ผู้สร้าง: {order.createdBy}</p>
//             <p className="text-sm">สถานะ: {getStatusText(order.status)}</p>
//             <div className="mt-2">
//               <h4 className="text-sm font-bold">วัตถุดิบ:</h4>
//               <ul className="list-disc list-inside text-sm">
//                 {order.ingredients?.map((ing, idx) => (
//                   <li key={idx}>{ing.name} - {ing.quantity}</li>
//                 ))}
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       ))}

//       <div className="flex justify-center mt-6">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious size="default" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, i) => (
//               <PaginationItem key={i}>
//                 <PaginationLink
//                   size="icon"
//                   isActive={currentPage === i + 1}
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext size="default" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   );
// };

// export default Page;





// {lowStockIngredients.length > 0 && (
//         <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5 text-red-500" />
//               <h3 className="font-semibold text-red-800 dark:text-red-200">
//                 แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)
//               </h3>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {lowStockIngredients.map((ingredient) => (
//                 <Badge
//                   key={ingredient.ingredient_id}
//                   variant="destructive"
//                   className="whitespace-nowrap"
//                 >
//                   {ingredient.ingredient_name} ({ingredient.ingredient_total} /{" "}
//                   {ingredient.ingredient_total_alert})
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         </Card>
//       )}




// const lowStockIngredients = allIngredient.filter((ingredient) => {
//     const total = Number(ingredient.ingredient_total) || 0;
//     const alert = Number(ingredient.ingredient_total_alert) || 0;
//     const isLow = total <= alert;
//     // console.log(
//     //   `🔎 ${ingredient.ingredient_name}: total = ${total}, alert = ${alert} → isLow: ${isLow}`
//     // );

//     return isLow;
//   });
