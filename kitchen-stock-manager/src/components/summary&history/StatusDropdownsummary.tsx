"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import useSWR from "swr";
import Swal from "sweetalert2";
import axios from "axios";

import { StatusOption, StatusDropdownProps } from "@/types/interface_summary_orderhistory";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  return res.json();
};

const statusOptions: StatusOption[] = [
  { label: "รอมัดจำ", value: "pending" },
  { label: "ชำระเงินเเล้ว", value: "completed" },
  { label: "ส่งแล้ว", value: "success" },
  { label: "ยกเลิก", value: "cancelled" },
];

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  cartId,
  allIngredients,
  defaultStatus = "pending",
  onUpdated,
  receive_time,
  export_time,
  onOrderSummaryClick,
  cart,
  onPaymentCompleted,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(defaultStatus === "success" || defaultStatus === "cancelled");
  const { userName } = useAuth();
  const pathname = usePathname();
  let pathnameValue: string = "";
  if (pathname === "/home/summarylist") pathnameValue = "summarylist";
  else if (pathname === "/home/orderhistory") pathnameValue = "orderhistory";
  const { mutate: mutateCarts } = useSWR(`/api/get/carts/${pathnameValue}`, fetcher);
  const { mutate: mutateIngredients } = useSWR("/api/get/ingredients", fetcher);

  const isValidTimeFormat = (time: string | undefined): boolean => {
    if (!time) return false;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleSubmit = async (statusToUpdate: string) => {
    try {
      setIsSubmitting(true);

      if (statusToUpdate === "success") {
        const allIngredientsChecked = allIngredients.every((menu) => menu.ingredients.every((ing) => ing.isChecked));

        if (!allIngredientsChecked) {
          Swal.fire({
            icon: "warning",
            title: "วัตถุดิบยังไม่ครบ",
            text: "กรุณาเลือกวัตถุดิบทุกตัวก่อนเปลี่ยนสถานะเป็น 'ส่งแล้ว'",
            confirmButtonText: "ตกลง",
          });
          return false;
        }

        if (!receive_time || !isValidTimeFormat(receive_time)) {
          Swal.fire({
            icon: "error",
            title: "เวลารับไม่ถูกต้อง",
            text: "กรุณากรอกเวลารับอาหารให้ถูกต้อง (รูปแบบ HH:mm)",
            confirmButtonText: "เข้าใจแล้ว",
          });
          return false;
        }

        if (!export_time || !isValidTimeFormat(export_time)) {
          Swal.fire({
            icon: "error",
            title: "เวลาส่งไม่ถูกต้อง",
            text: "กรุณากรอกเวลาส่งอาหารให้ถูกต้อง (รูปแบบ HH:mm)",
            confirmButtonText: "รับทราบ",
          });
          return false;
        }
      }

      const formData = new FormData();
      formData.append("status", statusToUpdate);
      formData.append("last_update", userName ?? "unknown");

      const res = await axios.patch(`/api/edit/cart_status/${cartId}`, formData);

      if (res.status !== 200) {
        const errorData = res.data;
        throw new Error(errorData.error || "Failed to update status");
      }

      await Promise.all([mutateCarts(), mutateIngredients()]);
      onUpdated?.();

      if (statusToUpdate === "success" || statusToUpdate === "cancelled") setIsLocked(true);
      if (statusToUpdate === "completed") {
        onPaymentCompleted?.(cart);
        // ไม่แสดง Swal.fire เพราะจะแสดง popup แทน
      } else {
        Swal.fire({
          icon: "success",
          title: "อัปเดตสถานะสำเร็จ",
          text: `สถานะถูกเปลี่ยนเป็น "${statusOptions.find((o) => o.value === statusToUpdate)?.label}"`,
          showConfirmButton: false,
          timer: 4000,
        });
      }

      setSelectedStatus(statusToUpdate); // อัปเดต state ทันทีหลังสำเร็จ
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: (error as Error).message,
        confirmButtonText: "ตกลง",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const newStatusLabel = statusOptions.find((o) => o.value === newStatus)?.label;
    const currentStatusLabel = statusOptions.find((o) => o.value === selectedStatus)?.label;

    if (newStatus !== selectedStatus) {
      Swal.fire({
        icon: "question",
        title: "ยืนยันการเปลี่ยนสถานะ",
        text: `คุณต้องการเปลี่ยนสถานะจาก "${currentStatusLabel}" เป็น "${newStatusLabel}" หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await handleSubmit(newStatus);
        }
      });
    }
  };

  return (
    <div className='relative inline-flex items-center space-x-2'>
      <div className='relative px-4'>
        <button
          style={{
            background: "#5bd9fc",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
          className='inline-block hover:bg-blue-200 hover:shadow-md rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow'>
          {statusOptions.find((o) => o.value === selectedStatus)?.label}
        </button>
        <select value={selectedStatus} onChange={handleStatusChange} className='absolute inset-0 opacity-0 cursor-pointer' disabled={isLocked || isSubmitting} style={{ background: "#a2e1f2" }}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* <button
        onClick={() => onOrderSummaryClick?.(cart)}
        className='inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed'
        style={{
          color: "#000000",
          background: "#a3e635",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
        สรุปวัตถุดิบของออเดอร์นี้
      </button> */}
    </div>
  );
};

export default StatusDropdown;
