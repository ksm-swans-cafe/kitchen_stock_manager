'use client';

import React from 'react';
import { Search, Filter, Grid3X3, List, X } from 'lucide-react';
import MenuCard from '@/components/order/MenuCard';
import { SelectionHeader } from './SelectionHeader';
import { MenuItemWithAutoRice, LunchBoxFromAPI } from '../types';
import {
    DEFAULT_CATEGORY_ORDER,
    PREMIUM_SNACK_BOX_ORDER,
    DISH_ORDER,
    MEAT_ORDER,
    GENERIC_DISH_TYPES,
    getMeatType,
    getDishType,
    MEAT_SURCHARGE
} from '../constants/categoryOrder';

interface CategorySelectionProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedMeatType: string | null;
    handleMeatFilterChange: (meat: string | null) => void;
    availableMenus: MenuItemWithAutoRice[];
    selectedMenuItems: string[];
    handleMenuSelection: (menuKey: string) => void;
    focusedDish: string | null;
    handleGenericDishClick: (dish: string) => void;
    selectionCount: {
        total: number;
        riceCount: number;
    };
    selectedFoodSet: string;
    selectedSetMenu: string;
    lunchboxData: LunchBoxFromAPI[];
    isCategoryLocked: (category: string) => boolean;
    getPreviousRequiredCategory: (category: string) => string | null;
    buildMenuKey: (menu: MenuItemWithAutoRice) => string;
    getPrice: (menu: MenuItemWithAutoRice) => number;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    buildBlobImageUrl: (imageName?: string | null) => string | null;
}

export function CategorySelection({
    searchQuery,
    setSearchQuery,
    selectedMeatType,
    handleMeatFilterChange,
    availableMenus,
    selectedMenuItems,
    handleMenuSelection,
    focusedDish,
    handleGenericDishClick,
    selectionCount,
    selectedFoodSet,
    selectedSetMenu,
    lunchboxData,
    isCategoryLocked,
    getPreviousRequiredCategory,
    buildMenuKey,
    getPrice,
    viewMode,
    setViewMode,
    buildBlobImageUrl,
}: CategorySelectionProps) {
    // Logic from page.tsx (filtering and grouping)
    const menusToDisplay = availableMenus.filter((menu) => {
        const matchesSearch =
            menu.menu_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.menu_subname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.menu_category.toLowerCase().includes(searchQuery.toLowerCase());

        const meatType = getMeatType(menu.menu_name);
        const matchesMeat = !selectedMeatType || selectedMeatType === 'ทั้งหมด' || meatType === selectedMeatType;

        return matchesSearch && matchesMeat;
    });

    const groupedMenus = menusToDisplay.reduce((acc: Record<string, any[]>, menu) => {
        const cat = menu.lunchbox_menu_category || 'อื่นๆ';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(menu);
        return acc;
    }, {});

    const allRiceWithDishMenus = availableMenus.filter(
        (menu) => menu.lunchbox_menu_category === 'ข้าว+กับข้าว' || menu.lunchbox_menu_category === 'กับข้าวที่ 1'
    );

    const sortedCategories = Object.keys(groupedMenus).sort((a, b) => {
        const order = selectedFoodSet === 'Premium Snack Box' ? PREMIUM_SNACK_BOX_ORDER : DEFAULT_CATEGORY_ORDER;
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <div className='p-3 sm:p-4 lg:p-6 xl:p-8 animate-fade-in-up'>
            <SelectionHeader
                selectedFoodSet={selectedFoodSet}
                selectedSetMenu={selectedSetMenu}
                selectionCount={selectionCount}
                lunchboxData={lunchboxData}
            />

            {/* Search and Filters Section */}
            <div className='mb-6 xl:mb-10 space-y-4 sm:space-y-6'>
                <div className='flex flex-col sm:flex-row gap-4 items-stretch'>
                    <div className='relative flex-1 group'>
                        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors' />
                        <input
                            type='text'
                            placeholder='ค้นหาเมนูอาหาร...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm sm:text-base'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <X className='w-4 h-4 text-gray-400' />
                            </button>
                        )}
                    </div>

                    <div className='flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl self-end sm:self-center'>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid'
                                ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            title='มุมมองตาราง'
                        >
                            <Grid3X3 className='h-5 w-5' />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list'
                                ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            title='มุมมองรายการ'
                        >
                            <List className='h-5 w-5' />
                        </button>
                    </div>
                </div>

                {/* Meat Filter */}
                <div className='flex flex-wrap gap-2'>
                    <button
                        onClick={() => handleMeatFilterChange(null)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all transform active:scale-95 flex items-center gap-1.5 ${!selectedMeatType
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200'
                            : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                            }`}>
                        <Filter className={`w-3 h-3 sm:w-4 sm:h-4 ${!selectedMeatType ? 'text-white' : 'text-gray-400'}`} />
                        ทั้งหมด
                    </button>
                    {MEAT_ORDER.map((meat) => {
                        const isSelected = selectedMeatType === meat;
                        const surcharge = MEAT_SURCHARGE[meat] || 0;

                        return (
                            <button
                                key={meat}
                                onClick={() => handleMeatFilterChange(meat)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all transform active:scale-95 flex items-center gap-1.5 ${isSelected
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200'
                                    : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                                    }`}>
                                <Filter className={`w-3 h-3 sm:w-4 sm:h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                {meat}
                                {surcharge > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-orange-50 text-orange-500'}`}>+{surcharge}</span>}
                            </button>
                        );
                    })}
                    {/* Add ทะเล manually if not in MEAT_ORDER but in MEAT_SURCHARGE */}
                    {!MEAT_ORDER.includes('ทะเล') && MEAT_SURCHARGE['ทะเล'] !== undefined && (
                        <button
                            key='ทะเล'
                            onClick={() => handleMeatFilterChange('ทะเล')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all transform active:scale-95 flex items-center gap-1.5 ${selectedMeatType === 'ทะเล'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200'
                                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                                }`}>
                            <Filter className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedMeatType === 'ทะเล' ? 'text-white' : 'text-gray-400'}`} />
                            ทะเล
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedMeatType === 'ทะเล' ? 'bg-white/20' : 'bg-orange-50 text-orange-500'}`}>+{MEAT_SURCHARGE['ทะเล']}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* แสดงหมวดหมู่และเมนู */}
            <div className='space-y-8 sm:space-y-10 lg:space-y-12'>
                {sortedCategories.map((category) => {
                    const isLocked = isCategoryLocked(category);
                    const prevCat = getPreviousRequiredCategory(category);
                    const menus = groupedMenus[category];

                    return (
                        <div key={category} className={`transition-all duration-500 ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                            <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                                <div className='h-8 sm:h-10 w-1.5 sm:w-2 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full shadow-sm' />
                                <h3 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-gray-800 tracking-tight'>{category}</h3>
                                {isLocked && (
                                    <span className='text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-2 sm:px-3 py-1 rounded-full border border-orange-100 animate-pulse'>
                                        กรุณาเลือก {prevCat} ก่อน
                                    </span>
                                )}
                            </div>

                            {/* Special Rice+Dish UI */}
                            {(category === 'ข้าว+กับข้าว' || category === 'กับข้าวที่ 1') && (
                                <div className='mb-6 sm:mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4'>
                                    {GENERIC_DISH_TYPES.map((dish) => {
                                        const isFocused = focusedDish === dish;
                                        const representativeMenu = allRiceWithDishMenus.find((m) => getDishType(m.menu_name) === dish);

                                        if (!representativeMenu) return null;

                                        return (
                                            <button
                                                key={dish}
                                                onClick={() => !isLocked && handleGenericDishClick(dish)}
                                                disabled={isLocked}
                                                className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${isFocused ? 'ring-4 ring-orange-500 shadow-xl shadow-orange-500/20 scale-[1.02]' : 'ring-1 ring-gray-200 hover:ring-orange-300 hover:shadow-lg'
                                                    } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10' />
                                                {representativeMenu.imageUrl ? (
                                                    <img
                                                        src={buildBlobImageUrl(representativeMenu.imageUrl) || ''}
                                                        alt={dish}
                                                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                                                    />
                                                ) : (
                                                    <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                                                        <span className='text-2xl'>🍲</span>
                                                    </div>
                                                )}
                                                <div className='absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-20'>
                                                    <div className='text-xs sm:text-sm font-black text-white truncate drop-shadow-md'>{dish}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className={`responsive-grid ${isLocked ? 'pointer-events-none' : ''}`}>
                                {menus
                                    .sort((a, b) => {
                                        const order = category === 'ข้าว+กับข้าว' || category === 'กับข้าวที่ 1' ? DISH_ORDER : [];
                                        const indexA = order.indexOf(getDishType(a.menu_name) || '');
                                        const indexB = order.indexOf(getDishType(b.menu_name) || '');
                                        if (indexA === -1 && indexB === -1) return a.menu_name.localeCompare(b.menu_name, 'th');
                                        if (indexA === -1) return 1;
                                        if (indexB === -1) return -1;
                                        return indexA - indexB;
                                    })
                                    .map((menu) => (
                                        <MenuCard
                                            key={buildMenuKey(menu)}
                                            menuId={buildMenuKey(menu)}
                                            name={menu.menu_name}
                                            price={getPrice(menu)}
                                            category={menu.lunchbox_menu_category}
                                            image={buildBlobImageUrl(menu.imageUrl) || undefined}
                                            selected={selectedMenuItems.includes(buildMenuKey(menu))}
                                            onClick={handleMenuSelection}
                                            variant={viewMode === 'grid' ? 'card' : 'list'}
                                            showPrice={menu.lunchbox_showPrice}
                                            meatType={getMeatType(menu.menu_name) as any}
                                        />
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
