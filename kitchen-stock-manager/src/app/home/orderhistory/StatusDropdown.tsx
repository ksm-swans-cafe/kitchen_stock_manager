"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

type Ingredient = {
  ingredient_id?: number;
  ingredient_name: string;
  useItem: number;
  calculatedTotal?: number;
  sourceMenu?: string;
};

type StatusOption = {
  label: string;
  value: string;
};

const statusOptions: StatusOption[] = [
  { label: "รอมัดจำ", value: "pending" },
  { label: "ชำระเงินเเล้ว", value: "completed" },
  { label: "ส่งแล้ว", value: "success" },
  { label: "ยกเลิก", value: "cancelled" },
];

type StatusDropdownProps = {
  cartId: string;
  allIngredients: {
    menuName: string;
    ingredients: Ingredient[];
  }[];
  defaultStatus?: string;
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  cartId,
  allIngredients,
  defaultStatus = "pending",
}) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(
    defaultStatus === "success" || defaultStatus === "cancelled"
  );

  const { userName } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // ถ้าเลือก completed → จัดการ ingredients ก่อน
      if (selectedStatus === "completed") {
        for (const menu of allIngredients) {
          for (const ingredient of menu.ingredients) {
            if (!ingredient.ingredient_id) continue;

            // GET ปริมาณคงเหลือ
            const res = await fetch(
              `/api/get/ingredients/${ingredient.ingredient_id}`
            );
            if (!res.ok) {
              throw new Error(
                `Failed to get ingredient ${ingredient.ingredient_id}`
              );
            }
            const data = await res.json();
            const currentTotal = data.ingredient_total;

            // ลบออกตาม calculatedTotal
            const remaining = currentTotal - (ingredient.calculatedTotal || 0);

            // ถ้าติดลบหรือหมด → ยืนยัน
            if (remaining <= 0) {
              const confirmUpdate = window.confirm(
                `วัตถุดิบ ${ingredient.ingredient_name} ไม่เพียงพอ (เหลือ ${remaining})\nคุณต้องการยืนยันหรือไม่?`
              );
              if (!confirmUpdate) {
                setIsSubmitting(false);
                return;
              }
            }

            // PATCH กลับไปเก็บคงเหลือใหม่
            const formData = new FormData();
            formData.append("ingredient_total", String(remaining));
            const updateRes = await fetch(
              `/api/edit/ingredients/${ingredient.ingredient_id}`,
              {
                method: "PATCH",
                body: formData,
              }
            );
            if (!updateRes.ok) {
              throw new Error(
                `Failed to update ingredient ${ingredient.ingredient_id}`
              );
            }
          }
        }
      }

      // PATCH cart status ทุกกรณี
      const formData = new FormData();
      formData.append("cart_status", selectedStatus);
      formData.append("cart_last_update", userName ?? "unknown");

      const res = await fetch(`/api/edit/cart_status/${cartId}`, {
        // แก้ไขตรงนี้
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Lock ปุ่มถ้า success หรือ cancelled
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
    <div className="relative inline-flex items-center space-x-2">
      {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "กำลังอัปเดต..." : "บันทึก"}
        </button>
      )}

      <div className="relative px-4">
        <button className="inline-block rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow">
          {statusOptions.find((o) => o.value === selectedStatus)?.label}
        </button>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isLocked}
        >
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
