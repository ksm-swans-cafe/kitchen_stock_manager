'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface LunchboxInfoCardProps {
  selectedSetMenu: string;
  setPriceBudget: number | null;
  selectionPrice: number;
  lunchboxQuantity: number;
  setLunchboxQuantity: (value: number) => void;
  selectedMenuItems: string[];
}

export function LunchboxInfoCard({
  selectedSetMenu,
  setPriceBudget,
  selectionPrice,
  lunchboxQuantity,
  setLunchboxQuantity,
  selectedMenuItems,
}: LunchboxInfoCardProps) {
  return (
    <div className='hidden sm:block lg:w-72 xl:w-80 animate-fade-in-up pointer-events-auto sticky top-4 z-30'>
      <div className='bg-[#F7F3ED]/95 backdrop-blur-sm rounded-2xl p-4 xl:p-5 border border-[#E8E2D9] shadow-2xl flex flex-col justify-center relative overflow-hidden min-h-[140px]'>
        {/* Decorative Accent */}
        <div className='absolute top-0 left-0 w-full h-1 bg-orange-500' />

        <div className='relative z-10 flex flex-col justify-between h-full'>
          <div>
            <div className='text-[17px] font-black text-gray-900 tracking-[2px] mb-0.5 opacity-80'>
              {selectedSetMenu.startsWith('Selected Menu Set') ? selectedSetMenu : `Selected Menu Set ${selectedSetMenu}`}
            </div>
          </div>

          <div className='my-2 xl:my-3 flex items-center gap-3'>
            <div className='h-[1px] bg-gray-900/10 flex-1' />
            <div className='text-xl xl:text-3xl font-black text-gray-900 tracking-tighter tabular-nums'>
              {setPriceBudget
                ? `${setPriceBudget * lunchboxQuantity}`
                : (selectionPrice * lunchboxQuantity).toLocaleString()}
            </div>
            <div className='h-[1px] bg-gray-900/10 flex-1' />
          </div>

          <div className='flex items-center justify-between pb-1'>
            <div className='flex items-center gap-1 bg-white ring-1 ring-gray-900/5 rounded-lg p-0.5 shadow-sm'>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setLunchboxQuantity(Math.max(1, lunchboxQuantity - 1));
                }}
                className='p-1 rounded transition-colors hover:bg-orange-50 text-gray-500 hover:text-orange-600'>
                <Minus className='w-3 h-3' />
              </button>
              <span className='w-6 text-center text-xs font-black text-gray-900 tabular-nums'>
                {lunchboxQuantity}
              </span>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setLunchboxQuantity(lunchboxQuantity + 1);
                }}
                className='p-1 rounded transition-colors hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                title='เพิ่มจำนวน'>
                <Plus className='w-3 h-3' />
              </button>
            </div>

            <div className='text-right'>
              <p className='text-[9px] xl:text-[10px] uppercase font-bold text-gray-500 tracking-wider'>
                Selection
              </p>
              <p className='text-xs xl:text-sm font-black text-gray-900 text-center italic'>{selectedSetMenu}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
