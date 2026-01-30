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
  const step3Active = step3Count > 0;

  const currentStep = !step1 ? 1 : !step2 ? 2 : 3;

  const getStepStyle = (active: boolean, isCurrent: boolean) => {
    if (active) return "text-emerald-700 font-bold";
    if (isCurrent) return "text-blue-600 font-bold animate-pulse";
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
          <div className={`flex items-center gap-1 ${getStepStyle(step1Active, currentStep === 1)}`}>
            {/* แสดงเต็มเมื่ออยู่ขั้นตอนนี้ หรือจอใหญ่กว่า 375px */}
            <div className={`flex items-center gap-1 ${currentStep === 1 ? 'flex' : 'hidden min-[375px]:flex'}`}>
              <span className="opacity-60">ชุด:</span>
              <span className='truncate max-w-[80px] sm:max-w-none'>
                {step1 ? step1 : "ยังไม่เลือก"}
              </span>
            </div>
            {/* แสดงตัวเลขเมื่ออยู่ขั้นตอนอื่น และจอเล็กกว่า 375px */}
            <span className={`w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold ${currentStep === 1 ? 'hidden' : 'flex min-[375px]:hidden'}`}>1</span>
          </div>

          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />

          {/* Step 2: Set */}
          <div className={`flex items-center gap-1 ${getStepStyle(step2Active, currentStep === 2)}`}>
            {/* แสดงเต็มเมื่ออยู่ขั้นตอนนี้ หรือจอใหญ่กว่า 375px */}
            <div className={`flex items-center gap-1 ${currentStep === 2 ? 'flex' : 'hidden min-[375px]:flex'}`}>
              <span className="opacity-60">Set:</span>
              <span className='truncate max-w-[80px] sm:max-w-none'>
                {step2 ? step2 : "ยังไม่เลือก"}
              </span>
            </div>
            {/* แสดงตัวเลขเมื่ออยู่ขั้นตอนอื่น และจอเล็กกว่า 375px */}
            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${step2Active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'} ${currentStep === 2 ? 'hidden' : 'flex min-[375px]:hidden'}`}>2</span>
          </div>

          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />

          {/* Step 3: เมนู */}
          <div className={`flex items-center gap-1 ${getStepStyle(step3Active, currentStep === 3)}`}>
            {/* แสดงเต็มเมื่ออยู่ขั้นตอนนี้ หรือจอใหญ่กว่า 375px */}
            <div className={`flex items-center gap-1 ${currentStep === 3 ? 'flex' : 'hidden min-[375px]:flex'}`}>
              <span className="opacity-60">เมนู:</span>
              <span className='truncate max-w-[80px] sm:max-w-none'>
                {step3Active ? `${step3Count} รายการ` : "ยังไม่เลือก"}
              </span>
            </div>
            {/* แสดงตัวเลขเมื่ออยู่ขั้นตอนอื่น และจอเล็กกว่า 375px */}
            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${step3Active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'} ${currentStep === 3 ? 'hidden' : 'flex min-[375px]:hidden'}`}>3</span>
          </div>

        </div>
      </div>
    </div>
  );
});

export default TopStepper;
