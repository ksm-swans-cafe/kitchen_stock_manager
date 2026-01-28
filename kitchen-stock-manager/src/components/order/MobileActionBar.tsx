"use client";

import React, { memo, useMemo } from "react";
import { Send, RotateCcw, Minus, Plus } from "lucide-react";

type Props = {
  // Controls if the entire bar is rendered
  isVisible?: boolean;

  // Controls if the submit button is enabled
  canSubmit: boolean;

  // Submit current selection
  onSubmit: () => void | Promise<void>;

  // Reset current selection
  onReset: () => void;

  // Disable submit and show spinner
  saving?: boolean;

  // If true, submit button text changes to "บันทึก"
  editMode?: boolean;

  // Optional total price to display on the left
  totalCost?: number | string | null;

  // Custom text under the cost/summary line (e.g., warnings or info)
  noteWarning?: string | null;

  // Override submit label text
  submitLabel?: string;

  // Additional className for the wrapper
  className?: string;

  // Quantity control props
  quantity?: number;
  onQuantityChange?: (newQuantity: number) => void;
  showQuantityControl?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * MobileActionBar
 * A sticky bottom action bar for mobile screens providing Submit and Reset actions.
 *
 * - Visible on mobile/tablet (hidden on lg and above).
 * - Shows optional total cost/summary and a subtle note line.
 * - Accessibility-friendly with labels and disabled states.
 *
 * Example:
 * <MobileActionBar
 *   canSubmit={selectedCount > 0}
 *   saving={isSaving}
 *   editMode={isEditMode}
 *   totalCost={123}
 *   onSubmit={handleSubmit}
 *   onReset={handleReset}
 * />
 */
export const MobileActionBar = memo(function MobileActionBar({
  isVisible = true,
  canSubmit,
  onSubmit,
  onReset,
  saving = false,
  editMode = false,
  totalCost = null,
  noteWarning = null,
  submitLabel,
  className,
  quantity = 1,
  onQuantityChange,
  showQuantityControl = false,
}: Props) {
  // Resolve submit button text
  const resolvedSubmitLabel = useMemo(() => {
    if (submitLabel) return submitLabel;
    return editMode ? "บันทึก" : "เพิ่มลงตะกร้า";
  }, [submitLabel, editMode]);

  if (!isVisible) return null;

  return (
    <div
      role='region'
      aria-label='แถบเครื่องมือการทำรายการบนมือถือ'
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-50 flex flex-col",
        "animate-in fade-in slide-in-from-bottom-full duration-300",
        className
      )}>

      {/* Quantity Control Row (Compact Style) */}
      {showQuantityControl && onQuantityChange && (
        <div className='bg-[#FFF9F0]/98 backdrop-blur-md border-t border-orange-100/50 px-4 py-2 flex items-center justify-between shadow-sm'>
          <div className="flex flex-col">
            <span className='text-[8px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1'>Quantity</span>
            <span className='text-xs font-bold text-gray-800 leading-none'>จำนวนชุด</span>
          </div>
          <div className='flex items-center gap-1 bg-white rounded-full p-1 shadow-sm ring-1 ring-orange-100/40'>
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className='w-7 h-7 rounded-full flex items-center justify-center text-gray-400 active:bg-orange-50 transition-all'>
              <Minus className='w-3.5 h-3.5' />
            </button>
            <span className='w-8 text-center text-sm font-bold text-gray-800 tabular-nums'>{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className='w-7 h-7 rounded-full flex items-center justify-center text-gray-400 active:bg-orange-50 transition-all'>
              <Plus className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>
      )}

      {/* Action Bar Row (Compact White Pill Style) */}
      <div className={cn(
        "bg-white/98 backdrop-blur-2xl border-t border-gray-100 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]",
        "shadow-[0_-5px_30px_rgba(0,0,0,0.05)] rounded-t-2xl"
      )} data-testid='mobile-action-bar'>

        <div className='flex items-center gap-3 max-w-lg mx-auto h-12'>
          {/* TOTAL AMOUNT - Locked Layout */}
          <div aria-live='polite' className='flex-[1.2] min-w-0 flex flex-col justify-center' title='ราคารวม'>
            {totalCost !== null ? (
              <>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">Total Amount</span>
                <span className='text-xl font-black text-gray-900 leading-none truncate tracking-tight'>
                  ฿{typeof totalCost === "number" ? totalCost.toLocaleString("th-TH") : totalCost}
                </span>
              </>
            ) : (
              <div aria-hidden="true" className="opacity-0">
                <span className="text-[8px] font-bold uppercase leading-none mb-1">Total Amount</span>
                <span className='text-xl font-black leading-none'>฿0</span>
              </div>
            )}
          </div>

          {/* ADD TO CART - Fixed Proportion Column */}
          <div className="flex-[2.5] flex items-center">
            <button
              type='button'
              onClick={onSubmit}
              disabled={saving || !canSubmit}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-3 transition-all duration-300 active:scale-95 border border-gray-100",
                saving || !canSubmit
                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "bg-white text-gray-700 shadow-sm hover:shadow-md"
              )}>
              {saving ? (
                <span className='inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-orange-500 animate-spin' />
              ) : (
                <Send className='w-4 h-4 text-gray-400' />
              )}
              <span className="text-[11px] font-black tracking-tight truncate">
                {saving ? "Saving..." : resolvedSubmitLabel}
              </span>
            </button>
          </div>

          {/* RESET - Fixed Proportion Column */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              type='button'
              onClick={onReset}
              className='inline-flex flex-col items-center justify-center gap-0.5 text-gray-400 active:scale-90 w-full'
              aria-label='รีเซ็ตการเลือก'>
              <RotateCcw className='w-5 h-5' />
              <span className="text-[8px] font-bold">รีเซ็ต</span>
            </button>
          </div>
        </div>

        {/* Note Warning */}
        {noteWarning && (
          <div className='mt-2 text-[8px] font-bold text-center text-amber-600 bg-amber-50/50 py-1 rounded-md border border-amber-100/30 line-clamp-1'>
            {noteWarning}
          </div>
        )}
      </div>
    </div>
  );
});

export default MobileActionBar;
