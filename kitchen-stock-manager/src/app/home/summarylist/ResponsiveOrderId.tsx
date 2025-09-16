import React, { useRef, useState, useEffect } from "react";
import { Hash } from "lucide-react";
import { ResponsiveOrderIdProps } from "@/types/interface_summary_orderhistory";

export default function ResponsiveOrderId({ id, maxFontSize = 16, minFontSize = 8 }: ResponsiveOrderIdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    function adjustFont() {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.offsetWidth;
      const textWidth = containerRef.current.scrollWidth;

      if (textWidth > parentWidth && fontSize > minFontSize) {
        setFontSize((f) => Math.max(f - 1, minFontSize));
      } else if (textWidth < parentWidth && fontSize < maxFontSize) {
        setFontSize((f) => Math.min(f + 1, maxFontSize));
      }
    }

    adjustFont();

    window.addEventListener("resize", adjustFont);
    return () => window.removeEventListener("resize", adjustFont);
  }, [fontSize, minFontSize, maxFontSize]);

  return (
    <div ref={containerRef} className='flex items-center gap-1 overflow-hidden whitespace-nowrap text-slate-500' style={{ fontSize: `${fontSize}px` }}>
      <Hash className='w-4 h-4 shrink-0' />
      <span className='truncate'>Order id: {id}</span>
    </div>
  );
}
