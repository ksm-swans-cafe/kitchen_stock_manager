"use client";

import React, { memo } from "react";
import { Package, Box, Utensils, Calendar, Wrench, ChevronRight } from "lucide-react";

type TopStepperProps = {
  step1?: string | null;
  step2?: string | null;
  step3Count?: number;
  showEdit?: boolean;
  editingIndex?: number;
  timeLabel?: string;
  selectedFoodSet?: string | null;
  selectedSetMenu?: string | null;
  className?: string;
};

export const TopStepper = memo(function TopStepper({
  step1 = null,
  step2 = null,
  step3Count = 0,
  showEdit = false,
  editingIndex,
  timeLabel,
  selectedFoodSet,
  selectedSetMenu,
  className
}: TopStepperProps) {

  const step1Active = !!step1;
  const step2Active = !!step2;
  const step2Pending = !!step1 && !step2;
  const step3Active = step3Count > 0;
  const step3Pending = !!step2 && step3Count === 0;

  const getStepStyle = (active: boolean, pending: boolean) => {
    if (active) return "text-emerald-700 font-bold";
    if (pending) return "text-blue-600 font-bold animate-pulse";
    return "text-gray-400 font-medium";
  };

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-30 ${className || ""}`}>
      <div className='flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar whitespace-nowrap'>

        {/* Time & Edit Status */}
        <div className='flex items-center gap-2 flex-shrink-0 border-r pr-2 border-gray-200'>
          <div className='flex flex-col items-center text-center text-gray-500 text-[11px] sm:text-[13px] font-bold leading-tight'>
            <span>{timeLabel?.split(' ')[0] || "--/--/--"}</span>
            <span className="text-blue-600">{timeLabel?.split(' ')[1] || "--:--"}</span>
          </div>
          {showEdit && (
            <div className='bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border border-amber-200'>
              แก้ไข #{(editingIndex ?? 0) + 1}
            </div>
          )}
        </div>

        {/* Stepper Content */}
        <div className='flex items-center gap-2 sm:gap-4 text-[11px] sm:text-[13px]'>

          {/* Step 1: ชุด */}
          <div className={`flex items-center gap-1 ${getStepStyle(step1Active, !step1Active)}`}>
            <span className="opacity-60">ชุด:</span>
            <span className='truncate max-w-[80px] sm:max-w-none'>
              {step1 ? step1 : "ยังไม่เลือก"}
            </span>
          </div>

          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />

          {/* Step 2: Set */}
          <div className={`flex items-center gap-1 ${getStepStyle(step2Active, step2Pending)}`}>
            <span className="opacity-60">Set:</span>
            <span className='truncate max-w-[80px] sm:max-w-none'>
              {step2 ? step2 : "ยังไม่เลือก"}
            </span>
          </div>

          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />

          {/* Step 3: เมนู */}
          <div className={`flex items-center gap-1 ${getStepStyle(step3Active, step3Pending)}`}>
            <span className="opacity-60">เมนู:</span>
            <span className='truncate max-w-[80px] sm:max-w-none'>
              {step3Active ? `${step3Count} รายการ` : "ยังไม่เลือก"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

export default TopStepper;
