'use client';

import React from 'react';

interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image?: string;
  lunchbox_set_name_image?: string;
}

interface LunchboxHeaderImageProps {
  selectedFoodSet: string;
  selectedSetMenu: string;
  lunchboxData: LunchBoxFromAPI[];
  failedImages: Set<string>;
  setFailedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  buildBlobImageUrl: (imageName?: string | null) => string | null;
}

export function LunchboxHeaderImage({
  selectedFoodSet,
  selectedSetMenu,
  lunchboxData,
  failedImages,
  setFailedImages,
  buildBlobImageUrl,
}: LunchboxHeaderImageProps) {
  if (!selectedSetMenu) return null;

  const setData = lunchboxData.find(
    (item) =>
      item.lunchbox_name === selectedFoodSet && // ✅ ตรวจสอบชุดอาหาร
      item.lunchbox_set_name === selectedSetMenu // ✅ ตรวจสอบ set ในชุดนั้น
  );
  const setMenuImageName = setData?.lunchbox_set_name_image;
  const apiImage = buildBlobImageUrl(setMenuImageName);

  // หากไม่มีรูป (apiImage = null) หรือโหลดล้มเหลว
  let displayImage = apiImage;
  if (!displayImage || failedImages.has(displayImage)) {
    const setAData = lunchboxData.find(
      (item) =>
        item.lunchbox_name === selectedFoodSet && // ✅ ชุดอาหารเดียวกัน
        item.lunchbox_set_name === 'A' // ✅ ใช้ Set A เป็น fallback
    );
    const setAImageName = setAData?.lunchbox_set_name_image;
    displayImage = buildBlobImageUrl(setAImageName);
  }

  if (!displayImage || failedImages.has(displayImage)) return null;

  return (
    <div className='relative w-full overflow-hidden transition-all duration-700 ease-in-out bg-gray-100/50 h-64 sm:h-[450px] lg:h-[550px] opacity-100'>
      <img
        src={displayImage}
        alt={`Set ${selectedSetMenu}`}
        className='w-full h-full transition-all duration-700 object-contain bg-white'
        onError={() => {
          setFailedImages((prev) => new Set(prev).add(displayImage));
        }}
      />
    </div>
  );
}
