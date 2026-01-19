'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface MobileQuantitySelectorProps {
  selectedSetMenu: string;
  lunchboxQuantity: number;
  setLunchboxQuantity: (value: number) => void;
}

export function MobileQuantitySelector({
  selectedSetMenu,
  lunchboxQuantity,
  setLunchboxQuantity,
}: MobileQuantitySelectorProps) {
  if (!selectedSetMenu) return null;

  return (
    <div className='bg-orange-50/90 backdrop-blur-sm border-t border-orange-100 px-4 py-2 flex items-center justify-between shadow-xs'>
      <span className='text-xs font-bold text-orange-800 uppercase tracking-wider'>จำนวนชุด (Set Quantity)</span>
      <div className='flex items-center gap-3 bg-white rounded-full p-1 shadow-sm ring-1 ring-orange-200'>
        <button
          onClick={() => setLunchboxQuantity(Math.max(1, lunchboxQuantity - 1))}
          className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 active:bg-orange-100 transition-colors'>
          <Minus className='w-4 h-4' />
        </button>
        <span className='w-8 text-center text-base font-black text-gray-900 tabular-nums'>
          {lunchboxQuantity}
        </span>
        <button
          onClick={() => setLunchboxQuantity(lunchboxQuantity + 1)}
          className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 active:bg-orange-100 transition-colors'>
          <Plus className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
