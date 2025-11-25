"use client";

import React, { memo } from "react";

type TopStepperProps = {
  // Step 1: ชุดอาหารที่เลือก (เช่น "Lunch Box")
  step1?: string | null;
  // Step 2: Set อาหารที่เลือก (เช่น "A (2 เมนู)")
  step2?: string | null;
  // Step 3: จำนวนเมนูที่เลือกแล้ว
  step3Count?: number;

  // แสดงป้ายแก้ไขและหมายเลขรายการที่กำลังแก้ไข (ถ้ามี)
  showEdit?: boolean;
  editingIndex?: number;

  // แสดงเวลาปัจจุบันในรูปแบบที่จัดเตรียมไว้ (เช่น "14/11/68 20:27")
  timeLabel?: string;

  // className เพิ่มเติมจากภายนอก
  className?: string;
};

export const TopStepper = memo(function TopStepper({ step1 = null, step2 = null, step3Count = 0, showEdit = false, editingIndex, timeLabel, className }: TopStepperProps) {
  const rowClass = "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold select-none";
  const dotClass = "w-5 h-5 rounded-full flex-shrink-0";

  const badgeClass = (active: boolean, pending: boolean) => {
    if (active) return "bg-green-100 text-green-800 border border-green-300";
    if (pending) return "bg-orange-100 text-orange-800 border border-orange-300";
    return "bg-gray-100 text-gray-600 border border-gray-300";
  };

  const dotColor = (active: boolean, pending: boolean) => {
    if (active) return "bg-green-600";
    if (pending) return "bg-orange-600";
    return "bg-gray-400";
  };

  const step1Active = !!step1;
  const step2Active = !!step2;
  const step2Pending = !!step1 && !step2;
  const step3Active = step3Count > 0;
  const step3Pending = !!step2 && step3Count === 0;

  return (
    <div
      className={[
        "bg-white border-b-2 border-gray-300 shadow-md lg:hidden", // ซ่อนใน Desktop (แสดงใน Mobile/Tablet)
        className || "",
      ].join(" ")}
      role='region'
      aria-label='ตัวช่วยแสดงสถานะการเลือกเมนู'>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className='p-3 sm:p-4 bg-gradient-to-r from-orange-100 to-pink-100'>
        {/* Time + Edit status */}
        <div className='flex items-center justify-between mb-3 sm:mb-4'>
          <div className='text-sm sm:text-base font-semibold text-gray-700' aria-label='เวลาปัจจุบัน'>
            📅 {timeLabel || "--/--/-- --:--"}
          </div>

          {showEdit && (
            <div className='bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-yellow-400' aria-label='โหมดแก้ไข'>
              🔧 แก้ไข #{(editingIndex ?? 0) + 1}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className='flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1' aria-label='ขั้นตอนการเลือกเมนู'>
          {/* Step 1 */}
          <div className={[rowClass, "flex-shrink-0 min-w-0", badgeClass(step1Active, !step1Active), "transition-all"].join(" ")} aria-current={step1Active ? "step" : undefined}>
            <span className={[dotClass, dotColor(step1Active, !step1Active)].join(" ")} />
            <span className='truncate max-w-[60px] sm:max-w-[100px]'>{step1 ? (step1.length > 6 ? step1.substring(0, 6) + "..." : step1) : "เลือกชุด"}</span>
          </div>

          <span className='text-gray-500 font-bold flex-shrink-0 text-lg' aria-hidden>
            →
          </span>

          {/* Step 2 */}
          <div className={[rowClass, "flex-shrink-0 min-w-0", badgeClass(step2Active, step2Pending), "transition-all"].join(" ")} aria-current={step2Active ? "step" : undefined}>
            <span className={[dotClass, dotColor(step2Active, step2Pending)].join(" ")} />
            <span className='truncate max-w-[60px] sm:max-w-[100px]'>{step2 ? (step2.length > 6 ? step2.substring(0, 6) + "..." : step2) : "Set"}</span>
          </div>

          <span className='text-gray-500 font-bold flex-shrink-0 text-lg' aria-hidden>
            →
          </span>

          {/* Step 3 */}
          <div className={[rowClass, "flex-shrink-0", badgeClass(step3Active, step3Pending), "transition-all"].join(" ")} aria-current={step3Active ? "step" : undefined}>
            <span className={[dotClass, dotColor(step3Active, step3Pending)].join(" ")} />
            <span className='whitespace-nowrap'>{step3Active ? `${step3Count} เมนู` : "เมนู"}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TopStepper;
