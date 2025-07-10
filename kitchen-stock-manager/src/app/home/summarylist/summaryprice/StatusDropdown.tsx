"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Ingredient, StatusOption, StatusDropdownProps } from "@/types/interface_summary_orderhistory";

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
      window.location.reload();
    }
  };

  return (
    <div className="relative inline-flex items-center space-x-2">
      {/* {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#5cfa6c" ,boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",}}
        >
          {isSubmitting ? "กำลังอัปเดต..." : "บันทึก"}
        </button>
      )} */}

      <div className="relative px-4">
        <button
          style={{
            background: "#5bd9fc",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
          className="inline-block rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow"
        >
          {statusOptions.find((o) => o.value === selectedStatus)?.label}
        </button>
      </div>
    </div>
  );
};

export default StatusDropdown;
