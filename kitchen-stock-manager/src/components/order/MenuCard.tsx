"use client";

import React, { KeyboardEvent, forwardRef, memo } from "react";
import { GlassWater, CakeSlice, Candy, Apple, Check, } from "lucide-react";

export type MenuCardSize = "sm" | "md" | "lg";

export type MeatType = "หมู" | "ไก่" | "หมึก" | "กุ้ง" | null;

export type MenuCardProps = {
  menuId: string;
  name: string;
  price?: number | null;
  category?: string | null;
  emoji?: string;
  image?: string;
  meatType?: MeatType;

  selected?: boolean;
  forced?: boolean;
  duplicate?: boolean;
  disabled?: boolean;

  onClick?: (menuId: string) => void;

  className?: string;
  size?: MenuCardSize;
  showPrice?: boolean;
  showCategory?: boolean;
  title?: string;
  variant?: "card" | "list";
  faded?: boolean;
};

const sizeMap: Record<MenuCardSize, { media: string; emoji: string }> = {
  sm: { media: "h-56", emoji: "text-8xl" }, // ขยายขึ้นเล็กน้อย
  md: { media: "h-60", emoji: "text-8xl" }, // ขยายขึ้นเล็กน้อย
  lg: { media: "h-64", emoji: "text-8xl" }, // ขยายขึ้นเล็กน้อย
};

const defaultEmojiByCategory: Record<string, React.ReactNode> = {
  ข้าว: "🍚",
  noodle: "🍜",
  drink: <GlassWater size={100} color='white' />,
  dessert: "🍮",
  เค้ก: <CakeSlice size={100} color='white' />,
  ของหวาน: <Candy size={100} color='white' />,
  เครื่องดื่ม: <GlassWater size={100} color='white' />,
  น้ำแข็งสำหรับเครื่องดื่ม: <GlassWater size={100} color='white' />,
  อุปกรณ์เสริม: <GlassWater size={100} color='white' />,
  ผลไม้: <Apple size={100} color='white' />,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getEmoji(emoji?: string, category?: string | null) {
  if (emoji) return emoji;
  if (category && defaultEmojiByCategory[category]) return defaultEmojiByCategory[category];
  return "🍽️";
}

// กำหนดสีพื้นหลังตามประเภทเนื้อสัตว์
const meatTypeGradients: Record<string, string> = {
  หมู: "bg-[linear-gradient(to_bottom_right,theme(colors.pink.100),theme(colors.pink.200),theme(colors.pink.300))]",
  ไก่: "bg-[linear-gradient(to_bottom_right,theme(colors.yellow.100),theme(colors.yellow.200),theme(colors.yellow.300))]",
  หมึก: "bg-[linear-gradient(to_bottom_right,theme(colors.purple.100),theme(colors.purple.200),theme(colors.purple.300))]",
  กุ้ง: "bg-[linear-gradient(to_bottom_right,theme(colors.orange.100),theme(colors.orange.200),theme(colors.orange.300))]",
};

const defaultGradient = "bg-[linear-gradient(to_bottom_right,theme(colors.green.100),theme(colors.green.200),theme(colors.green.300))]";

const BaseMenuCard = forwardRef<HTMLButtonElement, MenuCardProps>(function MenuCard({ menuId, name, price, category, emoji, image, meatType, selected = false, forced = false, duplicate = false, disabled = false, onClick, className, size = "md", showPrice = true, showCategory = true, title, variant = "card", faded = false }, ref) {
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

  /* List Variant Rendering */
  if (variant === "list") {
    // Note: User can pass variant="list" or maybe we repurpose size="list" if cleaner. 
    // The plan said add variant prop. Let's use that.

    // Using opacity for faded state
    const opacityClass = faded ? "opacity-40 grayscale" : "opacity-100";

    return (
      <button
        type='button'
        ref={ref}
        role='button'
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border text-left bg-white",
          selected
            ? "border-orange-500 bg-orange-50 shadow-sm"
            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50",
          opacityClass,
          className
        )}
      >
        {/* Checkbox Circle */}
        <div className={cn(
          "w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
          selected
            ? "bg-orange-500 border-orange-500"
            : "border-gray-300 bg-white group-hover:border-gray-400"
        )}>
          {selected && <Check className="text-white w-3.5 h-3.5" strokeWidth={3} />}
        </div>

        {/* Name */}
        <div className={cn("flex-1 font-bold text-sm sm:text-base text-gray-800", selected ? "text-orange-900" : "")}>
          {name}
        </div>

        {/* Price */}
        {showPrice && typeof price === "number" && (
          <div className="font-medium text-gray-600 text-sm whitespace-nowrap">
            {price > 0 ? `${price}.-` : ""}
          </div>
        )}
      </button>
    );
  }

  /* Card Variant Rendering (Default) */
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

      {/* Media / Emoji or Image */}
      <div className={cn(sizeConf.media, meatType && meatTypeGradients[meatType] ? meatTypeGradients[meatType] : defaultGradient, "flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]")} aria-hidden>
        {image ? <img src={image} className='w-3/4 h-3/4 object-contain p-2' alt={name} /> : <span className={cn(sizeConf.emoji)}>{getEmoji(emoji, category || undefined)}</span>}
      </div>

      {/* Body */}
      <div className='p-2 h-24 text-center'>
        <div className={cn("font-bold p-1 text-black text-sm lg:text-base leading-tight group-hover:text-green-700 transition-colors duration-200", "line-clamp-2 overflow-hidden")}>เมนู{name}</div>

        {showPrice && typeof price === "number" && <div className='mt-1 text-sm text-black'>ราคา {isAdditionalPrice ? `(+${price})` : `${price} บาท`}</div>}
      </div>

      {/* Focus ring accent sweep (subtle visual polish) */}
      <div className='pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12' />
    </button>
  );
});

export const MenuCard = memo(BaseMenuCard);
export default MenuCard;
