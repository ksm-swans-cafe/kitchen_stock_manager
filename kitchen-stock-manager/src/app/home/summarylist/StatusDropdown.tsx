"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  // Ingredient,
  StatusOption,
  StatusDropdownProps,
} from "@/types/interface_summary_orderhistory";
import Swal from "sweetalert2";
import { Button } from "@/share/ui/button";

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
  cart_receive_time,
  cart_export_time,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(
    defaultStatus === "success" || defaultStatus === "cancelled"
  );

  const { userName } = useAuth();

  // ฟังก์ชันตรวจสอบรูปแบบเวลา (HH:mm)
  const isValidTimeFormat = (time: string | undefined): boolean => {
    if (!time) return false;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // ตรวจสอบเมื่อเปลี่ยนเป็นสถานะ "success"
      if (selectedStatus === "success") {
        const allIngredientsChecked = allIngredients.every((menu) =>
          menu.ingredients.every((ing) => ing.isChecked)
        );

        if (!allIngredientsChecked) {
          Swal.fire({
            icon: "warning",
            title: "วัตถุดิบยังไม่ครบ",
            text: "กรุณาเลือกวัตถุดิบทุกตัวก่อนเปลี่ยนสถานะเป็น 'ส่งแล้ว'",
            confirmButtonText: "ตกลง",
          });
          setIsSubmitting(false);
          return;
        }

        if (!cart_receive_time || !isValidTimeFormat(cart_receive_time)) {
          Swal.fire({
            icon: "error",
            title: "เวลารับไม่ถูกต้อง",
            text: "กรุณากรอกเวลารับอาหารให้ถูกต้อง (รูปแบบ HH:mm)",
            confirmButtonText: "เข้าใจแล้ว",
          });
          setIsSubmitting(false);
          return;
        }

        if (!cart_export_time || !isValidTimeFormat(cart_export_time)) {
          Swal.fire({
            icon: "error",
            title: "เวลาส่งไม่ถูกต้อง",
            text: "กรุณากรอกเวลาส่งอาหารให้ถูกต้อง (รูปแบบ HH:mm)",
            confirmButtonText: "รับทราบ",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // ถ้าเลือก completed → จัดการ ingredients ก่อน
      if (selectedStatus === "completed") {
        for (const menu of allIngredients) {
          for (const ingredient of menu.ingredients) {
            if (!ingredient.ingredient_id) continue;

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
        Swal.fire({
          icon: "success",
          title: "อัปเดตสถานะสำเร็จ",
          text: `สถานะถูกเปลี่ยนเป็น "${statusOptions.find((o) => o.value === selectedStatus)?.label
            }"`,
          showConfirmButton: false,
          timer: 4000,
        });
      }

      const formData = new FormData();
      formData.append("cart_status", selectedStatus);
      formData.append("cart_last_update", userName ?? "unknown");

      const res = await fetch(`/api/edit/cart_status/${cartId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      onUpdated?.();

      if (selectedStatus === "success" || selectedStatus === "cancelled") {
        setIsLocked(true);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  function onOrderSummaryClick(): void {
    Swal.fire({
      title: "สรุปวัตถุดิบของออเดอร์นี้",
      html: `
        <div style="text-align:left;">
          ${allIngredients
          .map(
            (menu) => `
                <div>
                  <strong>${menu.menuName}</strong>
                  <ul>
                    ${menu.ingredients
                .map(
                  (ing) =>
                    `<li>${ing.ingredient_name} : ${ing.calculatedTotal ?? "-"} ${ing.ingredient_unit ?? ""}</li>`
                )
                .join("")}
                  </ul>
                </div>
              `
          )
          .join("")}
        </div>
      `,
      confirmButtonText: "ปิด",
      width: 600,
    });
  }

  return (
    <div className="relative inline-flex items-center space-x-2">
      {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#5cfa6c",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {isSubmitting ? "กำลังอัปเดต..." : "บันทึก"}
        </button>
      )}

      <div className="relative px-4">
        <button
          style={{
            background: "#5bd9fc",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
          className="inline-block hover:bg-blue-200 hover:shadow-md rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow"
        >
          {statusOptions.find((o) => o.value === selectedStatus)?.label}
        </button>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isLocked}
          style={{ background: "#a2e1f2" }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* <div className="flex justify-end mt-4"> */}
        <button
          // size="sm"
          onClick={() => onOrderSummaryClick?.()} // ใช้ prop แทนการเรียกตรง
          // className="h-9 px-4 rounded-xl border border-blue-500 text-blue-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          className="inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: "#000000",
            background: "#a3e635",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* 📋 สรุปวัตถุดิบของออเดอร์นี้ */}
          สรุปวัตถุดิบของออเดอร์นี้
        </button>
    </div>
  );
};

export default StatusDropdown;
