"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import useSWR from "swr";
import Swal from "sweetalert2";
import axios from "axios";

import { StatusOption, StatusDropdownProps } from "@/types/interface_summary_orderhistory";

const statusOptions: StatusOption[] = [
  { label: "รอมัดจำ", value: "pending" },
  { label: "ชำระเงินเเล้ว", value: "completed" },
  { label: "ส่งแล้ว", value: "success" },
  { label: "ยกเลิก", value: "cancelled" },
];

const StatusDropdown: React.FC<StatusDropdownProps> = ({ cartId, allIngredients, defaultStatus = "pending" }) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(defaultStatus === "success" || defaultStatus === "cancelled");

  const { userName } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (selectedStatus === "completed") {
        for (const menu of allIngredients) {
          for (const ingredient of menu.ingredients) {
            if (!ingredient.ingredient_id) continue;

            const res = await axios.get(`/api/get/ingredients/${ingredient.ingredient_id}`);
            if (res.status !== 200) {
              throw new Error(`Failed to get ingredient ${ingredient.ingredient_id}`);
            }
            const data = res.data;
            const currentTotal = data.ingredient_total;

            const remaining = currentTotal - (ingredient.calculatedTotal || 0);

            if (remaining <= 0) {
              const confirmUpdate = window.confirm(`วัตถุดิบ ${ingredient.ingredient_name} ไม่เพียงพอ (เหลือ ${remaining})\nคุณต้องการยืนยันหรือไม่?`);
              if (!confirmUpdate) {
                setIsSubmitting(false);
                return;
              }
            }

            const formData = new FormData();
            formData.append("ingredient_total", String(remaining));
            const updateRes = await axios.patch(`/api/edit/ingredients/${ingredient.ingredient_id}`, formData,);
            if (updateRes.status !== 200) {
              throw new Error(`Failed to update ingredient ${ingredient.ingredient_id}`);
            }
          }
        }
      }

      const formData = new FormData();
      formData.append("status", selectedStatus);
      formData.append("last_update", userName ?? "unknown");

      const res = await axios.patch(`/api/edit/status/${cartId}`, formData);
     
      if (res.status !== 200) {
        const errorData = res.data;
        throw new Error(errorData.error || "Failed to update status");
      }

      if (selectedStatus === "success" || selectedStatus === "cancelled") {
        setIsLocked(true);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='relative inline-flex items-center space-x-2'>
      {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSubmitting ? "กำลังอัปเดต..." : "บันทึก"}
        </button>
      )}

      <div className='relative px-4'>
        <button className='inline-block rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow'>{statusOptions.find((o) => o.value === selectedStatus)?.label}</button>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className='absolute inset-0 opacity-0 cursor-pointer' disabled={isLocked}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StatusDropdown;
