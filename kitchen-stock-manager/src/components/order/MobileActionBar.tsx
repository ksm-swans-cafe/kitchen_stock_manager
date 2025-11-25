"use client";

import React, { memo, useMemo } from "react";
import { Send, RotateCcw } from "lucide-react";

type Props = {
  // Show bar only when user can perform submit (e.g., has selected items)
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
  canSubmit,
  onSubmit,
  onReset,
  saving = false,
  editMode = false,
  totalCost = null,
  noteWarning = null,
  submitLabel,
  className,
}: Props) {
  // Resolve submit button text
  const resolvedSubmitLabel = useMemo(() => {
    if (submitLabel) return submitLabel;
    return editMode ? "บันทึก" : "เพิ่มลงตะกร้า";
  }, [submitLabel, editMode]);

  if (!canSubmit) return null;

  return (
    <div
      role="region"
      aria-label="แถบเครื่องมือการทำรายการบนมือถือ"
      className={cn(
        "lg:hidden sticky bottom-0 inset-x-0 z-40",
        "bg-white/95 backdrop-blur border-t border-gray-200",
        "px-3 py-3",
        className,
      )}
      data-testid="mobile-action-bar"
    >
      {/* Summary row */}
      {(totalCost !== null || noteWarning) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {totalCost !== null ? (
            <div
              aria-live="polite"
              className="font-semibold text-gray-800"
              title="ราคารวม"
            >
              รวม{" "}
              <span className="text-gray-900">
                ฿
                {typeof totalCost === "number"
                  ? totalCost.toLocaleString("th-TH")
                  : totalCost}
              </span>
            </div>
          ) : (
            <div />
          )}
          {noteWarning ? (
            <div className="text-xs text-amber-600">{noteWarning}</div>
          ) : null}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          aria-busy={saving || undefined}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-white text-sm font-medium transition-all duration-200",
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(249,115,22,0.4)]",
          )}
        >
          {saving ? (
            <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{saving ? "กำลังบันทึก..." : resolvedSubmitLabel}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-white text-sm font-medium transition-colors",
            "bg-red-500 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(239,68,68,0.35)]",
          )}
          aria-label="รีเซ็ตการเลือก"
        >
          <RotateCcw className="w-4 h-4" />
          <span>รีเซ็ต</span>
        </button>
      </div>
    </div>
  );
});

export default MobileActionBar;
