"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

type StatusOption = {
  label: string;
  value: string;
};

const statusOptions: StatusOption[] = [
  { label: "รอดำเนินการ", value: "pending" },
  { label: "ยืนยันแล้ว", value: "completed" },
  { label: "เสร็จสิ้น", value: "success" },
  { label: "ยกเลิก", value: "cancelled" },
];

type StatusDropdownProps = {
  cartId: string;
  lastupdate?: string;
  defaultStatus?: string;
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  cartId,
  defaultStatus = "pending",
}) => {
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userName } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("cart_status", selectedStatus);
      formData.append("cart_last_update", userName ?? "unknown");

      const res = await fetch(`/api/edit/cart/${cartId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center space-x-2">

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="inline-block rounded-full bg-blue-500 px-4 py-1 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "กำลังอัปเดต..." : "บันทึก"}
      </button>


      <div className="relative px-4">
        <button
          className="inline-block rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-800 shadow"
        >
          {statusOptions.find(o => o.value === selectedStatus)?.label}
        </button>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
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
