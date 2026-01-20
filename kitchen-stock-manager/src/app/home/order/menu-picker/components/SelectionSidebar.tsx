'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { MenuItemWithAutoRice } from '../types';

interface SelectionSidebarProps {
    isEditMode: boolean;
    editingIndex: number;
    currentTime: Date | null;
    selectedFoodSet: string;
    selectedSetMenu: string;
    selectedMenuItems: string[];
    selectionCount: {
        total: number;
        riceCount: number;
    };
    note: string;
    setNote: (value: string) => void;
    isSaving: boolean;
    dots: string;
    onReset: () => void;
    onSubmit: () => void;
    onSetFoodSet: (value: string) => void;
    onSetSetMenu: (value: string) => void;
    onSetMenuItems: (value: string[] | ((prev: string[]) => string[])) => void;
    onSetRiceQuantity: (value: number) => void;
    onSetLunchboxQuantity: (value: number) => void;
    onSetSelectedMeatType: (value: string | null) => void;
    onSetSearchQuery: (value: string) => void;
    onSetFocusedDish: (value: string | null) => void;
    getSetLimit: (foodSet: string, setMenu: string) => number;
    availableMenus: MenuItemWithAutoRice[];
    buildMenuKey: (menu: MenuItemWithAutoRice) => string;
}

export function SelectionSidebar({
    isEditMode,
    editingIndex,
    currentTime,
    selectedFoodSet,
    selectedSetMenu,
    selectedMenuItems,
    selectionCount,
    note,
    setNote,
    isSaving,
    dots,
    onReset,
    onSubmit,
    onSetFoodSet,
    onSetSetMenu,
    onSetMenuItems,
    onSetRiceQuantity,
    onSetLunchboxQuantity,
    onSetSelectedMeatType,
    onSetSearchQuery,
    onSetFocusedDish,
    getSetLimit,
    availableMenus,
    buildMenuKey,
}: SelectionSidebarProps) {
    return (
        <div className='hidden lg:block w-72 xl:w-80 2xl:w-96 bg-white border-r border-gray-200 sticky top-[48px] h-[calc(100vh-48px)] overflow-y-auto z-30 flex-shrink-0'>
            <div className='p-3 md:p-4 xl:p-6'>
                {/* Mode Indicator */}
                {isEditMode && (
                    <div className='text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl'>
                        <div className='text-sm font-medium text-yellow-800'>🔧 โหมดแก้ไข</div>
                        <div className='text-xs text-yellow-600 mt-1'>กำลังแก้ไขรายการที่ {editingIndex + 1}</div>
                    </div>
                )}

                {/* แสดงเวลา */}
                <div className='text-center mb-4 md:mb-6 pt-3'>
                    <div className='text-sm md:text-base xl:text-lg font-bold text-black'>
                        วันที่{' '}
                        {currentTime
                            ? (() => {
                                const date = currentTime;
                                const d = date.toLocaleDateString('th-TH', { day: '2-digit' });
                                const m = date.toLocaleDateString('th-TH', { month: 'long' });
                                const y = date.toLocaleDateString('th-TH', { year: 'numeric' });
                                return `${d} ${m} ${y}`;
                            })()
                            : 'วัน เดือน พ.ศ.'}
                    </div>
                    <div className='text-sm md:text-base xl:text-lg font-bold text-black'>
                        เวลา{' '}
                        {currentTime
                            ? currentTime.toLocaleTimeString('th-TH', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : '--:--'} น.
                    </div>
                </div>

                {/* ขั้นตอนการเลือก */}
                <div className='space-y-3 xl:space-y-4'>
                    {/* Progress Steps */}
                    <div className='space-y-3 xl:space-y-4'>
                        {/* Step 1: เลือกชุดอาหาร */}
                        <button
                            onClick={() => {
                                onSetFoodSet('');
                                onSetSetMenu('');
                                onSetMenuItems([]);
                                onSetRiceQuantity(0);
                                onSetLunchboxQuantity(1);
                                onSetSelectedMeatType(null);
                                setNote('');
                                onSetSearchQuery('');
                                onSetFocusedDish(null);
                            }}
                            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectedFoodSet
                                ? 'bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer'
                                : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0
                                    ? 'bg-orange-100 border-2 border-orange-300'
                                    : 'bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer'
                                }`}>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3 xl:space-x-4'>
                                    <div
                                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedFoodSet ? 'bg-green-500 text-white' : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? 'bg-orange-500 text-white' : 'bg-gray-400 text-white'
                                            }`}>
                                        1
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือกชุดอาหาร</div>
                                        <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>{selectedFoodSet ? selectedFoodSet : 'คลิกเพื่อเลือกชุดอาหาร'}</div>
                                    </div>
                                </div>
                                {selectedFoodSet && <span className='text-green-600 text-lg md:text-xl xl:text-2xl'>✓</span>}
                            </div>
                        </button>

                        {/* Step 2: เลือก Set อาหาร */}
                        <button
                            onClick={() => {
                                if (selectedSetMenu) {
                                    onSetSetMenu('');
                                    onSetMenuItems([]);
                                    onSetRiceQuantity(0);
                                    setNote('');
                                    onSetSelectedMeatType(null);
                                    onSetSearchQuery('');
                                    onSetFocusedDish(null);
                                }
                            }}
                            disabled={!selectedFoodSet}
                            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectedSetMenu
                                ? 'bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer'
                                : selectedFoodSet && !selectedSetMenu
                                    ? 'bg-orange-100 border-2 border-orange-300'
                                    : selectedFoodSet
                                        ? 'bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer'
                                        : 'bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50'
                                }`}>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3 xl:space-x-4'>
                                    <div
                                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedSetMenu ? 'bg-green-500 text-white' : selectedFoodSet && !selectedSetMenu ? 'bg-orange-500 text-white' : selectedFoodSet ? 'bg-gray-400 text-white' : 'bg-gray-300 text-gray-500'
                                            }`}>
                                        2
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือก Set อาหาร</div>
                                        <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>
                                            {selectedSetMenu ? (
                                                <>
                                                    {selectedSetMenu.toUpperCase().startsWith('SET') ? selectedSetMenu : `SET ${selectedSetMenu}`}
                                                    {(() => {
                                                        const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
                                                        return limit === 0 ? ' (ไม่จำกัด)' : limit > 0 ? ` (${limit} เมนู)` : '';
                                                    })()}
                                                </>
                                            ) : selectedFoodSet ? (
                                                'คลิกเพื่อเลือก Set อาหาร'
                                            ) : (
                                                'เลือกชุดอาหารก่อน'
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {selectedSetMenu && <span className='text-green-600 text-lg md:text-xl xl:text-2xl'>✓</span>}
                            </div>
                        </button>

                        {/* Step 3: เลือกเมนูอาหาร */}
                        <button
                            onClick={() => {
                                if (selectedMenuItems.length > 0) {
                                    onSetMenuItems([]);
                                }
                            }}
                            disabled={!selectedSetMenu}
                            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectionCount.total > 0
                                ? 'bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer'
                                : selectedSetMenu
                                    ? 'bg-orange-100 border-2 border-orange-300'
                                    : selectedSetMenu
                                        ? 'bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer'
                                        : 'bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50'
                                }`}>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-3 xl:space-x-4'>
                                    <div className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectionCount.total > 0 ? 'bg-green-500 text-white' : selectedSetMenu ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                        3
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือกเมนูอาหาร</div>
                                        <div className='text-xs md:text-sm xl:text-base text-gray-500'>
                                            {selectionCount.total > 0 ? `เลือกแล้ว ${selectionCount.total} เมนู${selectionCount.riceCount > 0 ? ` (ข้าว ${selectionCount.riceCount})` : ''}` : selectedSetMenu ? 'คลิกเพื่อเลือกเมนูอาหาร' : 'เลือก Set อาหารก่อน'}
                                        </div>
                                    </div>
                                </div>
                                {selectionCount.total > 0 && <span className='text-green-600 text-lg md:text-xl xl:text-2xl'>✓</span>}
                            </div>
                        </button>
                    </div>

                    {/* ส่วนบันทึกเพิ่มเติม */}
                    {selectionCount.total > 0 && (
                        <div className='mt-4 xl:mt-6 space-y-3 xl:space-y-4'>
                            <div>
                                <label className='block text-xs md:text-sm xl:text-base font-medium text-gray-700 mb-2'>หมายเหตุ (ไม่บังคับ)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder='ระบุข้อมูลเพิ่มเติม...'
                                    className='w-full px-3 py-3 md:px-4 md:py-4 xl:px-5 xl:py-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm md:text-base xl:text-lg text-gray-700 placeholder-gray-400 resize-none'
                                    rows={3}
                                />
                            </div>

                            {/* ปุ่มยืนยัน */}
                            <button
                                onClick={onSubmit}
                                disabled={(() => {
                                    if (isSaving) return true;
                                    if (selectionCount.total === 0) return true;
                                    const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
                                    if (limit > 0) return selectionCount.total !== limit;
                                    return false;
                                })()}
                                className={`w-full px-4 py-4 md:px-5 md:py-5 xl:px-6 xl:py-6 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 xl:gap-3 min-h-[50px] md:min-h-[60px] xl:min-h-[70px] ${isSaving ||
                                    (() => {
                                        if (selectionCount.total === 0) return true;
                                        const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
                                        return limit > 0 && selectionCount.total !== limit;
                                    })()
                                    ? '!bg-gray-200 !cursor-not-allowed'
                                    : '!bg-gradient-to-r !from-orange-500 !to-pink-500 !hover:from-orange-600 !hover:to-pink-600 transform !hover:scale-105 !hover:shadow-xl !text-white !font-bold'
                                    }`}>
                                {isSaving ? (
                                    <>
                                        <div className='animate-spin w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full'></div>
                                        กำลังบันทึก{dots}
                                    </>
                                ) : (
                                    <>
                                        <Send className='w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6' />
                                        {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มไปยังตะกร้า'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ปุ่มรีเซ็ต */}
                    {(selectedFoodSet || selectedSetMenu || selectedMenuItems.length > 0) && (
                        <button
                            onClick={() => {
                                const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === 'ข้าว').map((menu) => buildMenuKey(menu));
                                onSetFoodSet('');
                                onSetSetMenu('');
                                onSetMenuItems(riceMenus);
                                onSetRiceQuantity(riceMenus.length > 0 ? 1 : 0);
                                onSetSelectedMeatType(null);
                                setNote('');
                            }}
                            className='w-full mt-3 xl:mt-4 px-4 py-3 md:px-5 md:py-4 xl:px-6 xl:py-5 bg-red-500 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl hover:bg-red-600 transition-colors min-h-[45px] md:min-h-[50px] xl:min-h-[60px]'>
                            รีเซ็ตการเลือก
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
