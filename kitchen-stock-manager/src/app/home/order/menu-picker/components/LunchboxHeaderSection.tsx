'use client';

import React from 'react';
import { LunchboxHeaderImage } from './LunchboxHeaderImage';
import { LunchboxInfoCard } from './LunchboxInfoCard';

interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image?: string;
  lunchbox_set_name_image?: string;
}

interface LunchboxHeaderSectionProps {
  selectedFoodSet: string;
  selectedSetMenu: string;
  lunchboxData: LunchBoxFromAPI[];
  failedImages: Set<string>;
  setFailedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  buildBlobImageUrl: (imageName?: string | null) => string | null;
  setPriceBudget: number | null;
  selectionPrice: number;
  lunchboxQuantity: number;
  setLunchboxQuantity: (value: number) => void;
  selectedMenuItems: string[];
}

export function LunchboxHeaderSection({
  selectedFoodSet,
  selectedSetMenu,
  lunchboxData,
  failedImages,
  setFailedImages,
  buildBlobImageUrl,
  setPriceBudget,
  selectionPrice,
  lunchboxQuantity,
  setLunchboxQuantity,
  selectedMenuItems,
}: LunchboxHeaderSectionProps) {
  if (!selectedSetMenu) return null;

  return (
    <div className='relative w-full overflow-hidden transition-all duration-700 ease-in-out'>
      {/* Header Image */}
      <LunchboxHeaderImage
        selectedFoodSet={selectedFoodSet}
        selectedSetMenu={selectedSetMenu}
        lunchboxData={lunchboxData}
        failedImages={failedImages}
        setFailedImages={setFailedImages}
        buildBlobImageUrl={buildBlobImageUrl}
      />

      {/* Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none' />

      {/* Content Overlay */}
      <div className='absolute inset-x-0 bottom-4 px-4 sm:bottom-8 sm:px-8 flex items-end justify-between pointer-events-none'>
        {/* Selected Set Label */}
        <div className='text-white transition-all duration-500 opacity-100 scale-100 pointer-events-auto'>
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] sm:text-xs font-black uppercase tracking-[3px] text-orange-400 drop-shadow-md bg-black/20 w-fit px-2 py-0.5 rounded'>
              Selected Set
            </span>
            <h2 className='text-2xl sm:text-4xl lg:text-5xl font-black drop-shadow-2xl tracking-tighter italic'>
              {selectedSetMenu.toUpperCase().startsWith('SET')
                ? selectedSetMenu
                : `SET ${selectedSetMenu}`}
            </h2>
          </div>
        </div>

        {/* Info Card */}
        <LunchboxInfoCard
          selectedSetMenu={selectedSetMenu}
          setPriceBudget={setPriceBudget}
          selectionPrice={selectionPrice}
          lunchboxQuantity={lunchboxQuantity}
          setLunchboxQuantity={setLunchboxQuantity}
          selectedMenuItems={selectedMenuItems}
        />
      </div>
    </div>
  );
}
