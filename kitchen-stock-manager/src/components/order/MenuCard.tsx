"use client";

import React, { KeyboardEvent, forwardRef, memo } from "react";



export type MenuCardSize = "sm" | "md" | "lg";

export type MenuCardProps = {
  menuId: string;
  name: string;
  price?: number | null;
  category?: string | null;
  emoji?: string;

  // Visual states
  selected?: boolean;
  forced?: boolean; // e.g., rice auto-selected and cannot be deselected
  duplicate?: boolean; // attempting to pick item in a taken category
  disabled?: boolean; // true disables interaction

  // Behavior
  onClick?: (menuId: string) => void;

  // UI
  className?: string;
  size?: MenuCardSize;
  showPrice?: boolean;
  showCategory?: boolean;
  title?: string;
};

const sizeMap: Record<MenuCardSize, { media: string; emoji: string }> = {
  sm: { media: "h-20", emoji: "text-lg" },
  md: { media: "h-24", emoji: "text-xl" },
  lg: { media: "h-28", emoji: "text-2xl" },
};

const defaultEmojiByCategory: Record<string, string> = {
  ข้าว: "🍚",
  noodle: "🍜",
  drink: "🥤",
  dessert: "🍮",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getEmoji(emoji?: string, category?: string | null) {
  if (emoji) return emoji;
  if (category && defaultEmojiByCategory[category]) return defaultEmojiByCategory[category];
  return "🍽️";
}

const BaseMenuCard = forwardRef<HTMLButtonElement, MenuCardProps>(function MenuCard({ menuId, name, price, category, emoji, selected = false, forced = false, duplicate = false, disabled = false, onClick, className, size = "md", showPrice = true, showCategory = true, title }, ref) {
  const sizeConf = sizeMap[size] || sizeMap.md;
  const isDisabled = disabled || (!!duplicate && !selected);

  const handleClick = () => {
    if (isDisabled) return;
    onClick?.(menuId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(menuId);
    }
  };

  const visualStateClass = selected
    ? forced
      ? "bg-yellow-50 border-2 border-yellow-400 ring-1 ring-yellow-200"
      : "bg-green-50 border-2 border-green-300 ring-1 ring-green-200"
    : duplicate
    ? "bg-red-50 border-2 border-red-200 opacity-60 cursor-not-allowed"
    : "bg-white border border-gray-100 hover:border-green-200 hover:shadow-md";

  const indicatorClass = forced ? "bg-yellow-500" : "bg-green-500";

  return (
    <button
      type='button'
      ref={ref}
      role='button'
      aria-pressed={selected}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={title || name}
      className={cn("group relative w-full min-w-0 rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(249,115,22,0.4)]", "select-none", visualStateClass, className)}
      data-testid={`menu-card-${menuId}`}>
      {/* Badges (top-left) */}
      {duplicate && !selected && <div className='absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md z-10'>ซ้ำ</div>}
      {forced && selected && <div className='absolute top-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-md z-10'>บังคับ</div>}

      {/* Selection/Lock indicator (top-right) */}
      {selected && (
        <div className={cn("absolute top-1 right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center", indicatorClass)}>
          <span className='text-white text-[10px] font-bold'>{forced ? "🔒" : "✓"}</span>
        </div>
      )}

      {/* Media / Emoji */}
      <div className={cn(sizeConf.media, "bg-[linear-gradient(to_bottom_right,theme(colors.green.100),theme(colors.green.200),theme(colors.green.300))]", "flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]")} aria-hidden>
        <span className={cn(sizeConf.emoji)}>{getEmoji(emoji, category || undefined)}</span>
      </div>

      {/* Body */}
      <div className='p-2'>
        <div className={cn("font-medium text-gray-800 text-xs lg:text-sm leading-tight group-hover:text-green-700 transition-colors duration-200", "line-clamp-2 overflow-hidden")}>{name}</div>

        {showPrice && typeof price === "number" && price > 0 && <div className='mt-1 text-[11px] text-gray-700 font-semibold'>฿{price}</div>}

        {showCategory && category && <div className='mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 text-[10px] text-gray-600 px-2 py-0.5'>#{category}</div>}
      </div>

      {/* Focus ring accent sweep (subtle visual polish) */}
      <div className='pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12' />
    </button>
  );
});

export const MenuCard = memo(BaseMenuCard);
export default MenuCard;
