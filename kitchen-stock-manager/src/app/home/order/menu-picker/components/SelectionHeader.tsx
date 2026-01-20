'use client';

import React from 'react';
import { LunchBoxFromAPI } from '../types';

interface SelectionHeaderProps {
    selectedFoodSet: string;
    selectedSetMenu: string;
    selectionCount: {
        total: number;
        riceCount: number;
    };
    lunchboxData: LunchBoxFromAPI[];
}

export function SelectionHeader({
    selectedFoodSet,
    selectedSetMenu,
    selectionCount,
    lunchboxData,
}: SelectionHeaderProps) {
    const setData = lunchboxData.find(
        (item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu
    );
    const limit = setData?.lunchbox_limit || 0;
    const selected = selectionCount.total;
    const isUnlimited = limit === 0;

    return (
        <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col flex-wrap gap-2'>
            <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
                3. เลือกเมนูอาหาร
            </span>
            <div className='flex gap-2 flex-wrap'>
                {isUnlimited ? (
                    <span className='text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full w-fit'>
                        เลือกแล้ว {selected} เมนู
                    </span>
                ) : (
                    <>
                        <span className='text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full w-fit'>
                            เลือกแล้ว {selected}/{limit}
                        </span>
                        {selected >= limit && (
                            <span className='text-xs sm:text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full w-fit'>
                                ครบแล้ว!
                            </span>
                        )}
                    </>
                )}
            </div>
        </h2>
    );
}
