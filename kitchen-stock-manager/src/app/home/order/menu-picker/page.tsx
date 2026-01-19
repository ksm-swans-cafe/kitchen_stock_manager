"use client";

import { Search, Filter, Grid3X3, List, Send, Minus, Plus } from "lucide-react";
import { useLunchbox } from "@/lib/hook/useLunchbox"; // เรียกใช้ Hook ที่เราทำเสร็จแล้ว
import { LunchboxImageProps } from "@/lib/types";
import { buildMenuKey } from "@/lib/lunchboxUtils";
import { buildBlobImageUrl } from "@/lib/lunchboxUtils";
import { GENERIC_DISH_TYPES, MEAT_PRICE_MAP } from "@/lib/constants";

// Components
import TopStepper from "@/components/order/TopStepper";
import MenuCard from "@/components/order/MenuCard";
import MobileActionBar from "@/components/order/MobileActionBar";
import { Loading } from "@/components/loading/loading";
import useLoadingDots from "@/lib/hook/Dots";

// Assets
import SetFoodIcon from "@/assets/setfood.png";
import FoodMenuSetIcon from "@/assets/food-menu.png";

// Component ย่อยสำหรับแสดงรูปภาพ (แยกออกมาเพื่อให้ไฟล์หลักสะอาด)
const LunchboxImage = ({ imageName, alt, fallbackIcon }: LunchboxImageProps) => {
  // หมายเหตุ: ตรงนี้เราใช้ buildBlobImageUrl โดยตรง หรือจะส่ง failedImages มาจาก hook ก็ได้
  // ในที่นี้ขอเขียนแบบ simple เพื่อการแสดงผล
  const imageUrl = buildBlobImageUrl(imageName);
  
  // Logic การจัดการรูปเสียอาจจะจัดการในระดับ IMG tag
  return (
    <img 
      src={imageUrl || ""} 
      alt={alt} 
      className='min-w-full min-h-full object-cover object-center' 
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        // ในอนาคตอาจจะเพิ่ม logic setFailedImages ผ่าน props ได้
      }} 
    />
  );
};

export default function Order() {
  // ดึงทุกอย่างมาจาก Hook บรรทัดเดียวจบ!
  const { state, actions, computed } = useLunchbox();
  
  const dots = useLoadingDots();

  // Helper สำหรับเช็ครูปเสีย (ดึงมาจาก Hook state)
  const isImageFailed = (url: string | null) => !url || state.failedImages.has(url);

  // แสดงหน้าจอรอโหลดข้อมูล
  if (state.isLoadingLunchboxData) {
    return <Loading context='กำลังโหลดข้อมูลชุดอาหาร' icon={SetFoodIcon.src} />;
  }

  // แสดงหน้าจอรอโหลดข้อมูลแก้ไข
  if (state.isLoadingEditData) {
    return <Loading context='ข้อมูลแก้ไข' />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
      {/* Saving Overlay */}
      {state.isSaving && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-sm w-full'>
            <div className='animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4'></div>
            <h3 className='text-base md:text-lg font-medium text-gray-700 mb-2'>
              {state.isEditMode ? "🔧 กำลังบันทึกการแก้ไข" : "💾 กำลังเพิ่มลงตะกร้า"}
            </h3>
            <p className='text-base text-gray-500'>กรุณารอสักครู่{dots}</p>
          </div>
        </div>
      )}

      {/* Style CSS (Inline) */}
      <style jsx>{`
        /* ... CSS เดิมของคุณ (ตัดมาบางส่วนเพื่อความกระชับ) ... */
        .responsive-grid { display: grid; width: 100%; gap: 0.5rem; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 641px) { .responsive-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; } }
        @media (min-width: 769px) { .responsive-grid { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }
        @media (min-width: 1025px) { .responsive-grid { grid-template-columns: repeat(5, 1fr); gap: 1.5rem; } }
      `}</style>

      <div className='flex min-h-[100svh]'>
        {/* Sidebar (Desktop) */}
        <div className='hidden lg:block w-72 xl:w-80 2xl:w-96 bg-white border-r border-gray-200 sticky top-[48px] h-[calc(100vh-48px)] overflow-y-auto z-30 flex-shrink-0'>
          <div className='p-3 md:p-4 xl:p-6'>
            {/* Mode Indicator */}
            {state.isEditMode && (
              <div className='text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl'>
                <div className='text-sm font-medium text-yellow-800'>🔧 โหมดแก้ไข</div>
                <div className='text-xs text-yellow-600 mt-1'>รายการที่ {state.editingIndex + 1}</div>
              </div>
            )}

            {/* Steps Panel */}
            <div className='space-y-3 xl:space-y-4 pt-3'>
              {/* Step 1 Button */}
              <button
                onClick={actions.resetSelection}
                className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                  state.selectedFoodSet ? "bg-green-100 border-green-300" : "bg-orange-100 border-orange-300"
                }`}
              >
                <div className="font-bold text-gray-800">1. เลือกชุดอาหาร</div>
                <div className="text-sm text-gray-600">{state.selectedFoodSet || "เลือกชุดอาหาร"}</div>
              </button>

              {/* Step 2 Button */}
              <button
                onClick={() => actions.setSelectedSetMenu("")}
                disabled={!state.selectedFoodSet}
                className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                  state.selectedSetMenu 
                    ? "bg-green-100 border-green-300" 
                    : state.selectedFoodSet ? "bg-orange-100 border-orange-300" : "bg-gray-100 border-gray-200 opacity-50"
                }`}
              >
                <div className="font-bold text-gray-800">2. เลือก Set</div>
                <div className="text-sm text-gray-600">{state.selectedSetMenu || "เลือก Set อาหาร"}</div>
              </button>

              {/* Step 3 Status */}
              <div className={`w-full p-4 rounded-xl text-left border-2 ${
                computed.selectionCount.total > 0 ? "bg-green-100 border-green-300" : "bg-gray-100 border-gray-200"
              }`}>
                <div className="font-bold text-gray-800">3. รายการที่เลือก</div>
                <div className="text-sm text-gray-600">
                  {computed.selectionCount.total} รายการ (ข้าว {computed.selectionCount.riceCount})
                </div>
              </div>

              {/* Note Input */}
              {computed.selectionCount.total > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
                  <textarea
                    value={state.note}
                    onChange={(e) => actions.setNote(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                    rows={2}
                  />
                  <button
                    onClick={actions.handleSubmit}
                    className="w-full mt-3 p-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    {state.isEditMode ? "บันทึกการแก้ไข" : "เพิ่มลงตะกร้า"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col min-h-[100svh]'>
          {/* Mobile Stepper */}
          <div className='lg:hidden'>
            <TopStepper
              step1={state.selectedFoodSet || null}
              step2={state.selectedSetMenu || null}
              step3Count={computed.selectionCount.total}
              showEdit={state.isEditMode}
              editingIndex={state.editingIndex}
              timeLabel="" 
            />
          </div>

          <div className='flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-6 xl:pb-8 bg-gray-50'>
            
            {/* Header Image (Set Image) */}
            {state.selectedSetMenu && (() => {
               const setData = state.lunchboxData.find(i => i.lunchbox_name === state.selectedFoodSet && i.lunchbox_set_name === state.selectedSetMenu);
               const imgUrl = buildBlobImageUrl(setData?.lunchbox_set_name_image);
               
               if (!imgUrl || state.failedImages.has(imgUrl)) return null;

               return (
                 <div className="relative w-full h-48 sm:h-64 lg:h-80 overflow-hidden mb-4">
                   <img src={imgUrl} alt="Set Cover" className="w-full h-full object-cover" onError={() => actions.setFailedImages(prev => new Set(prev).add(imgUrl))} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                     <h1 className="text-3xl font-bold text-white italic">{state.selectedSetMenu}</h1>
                   </div>
                 </div>
               );
            })()}

            {/* Content Area */}
            <div className="p-4 lg:p-8">
              
              {/* Step 1: Select Food Set */}
              {!state.selectedFoodSet && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">1. เลือกชุดอาหาร</h2>
                  <div className="responsive-grid">
                    {state.availableFoodSets.map((foodSet, i) => (
                      <div 
                        key={i} 
                        onClick={() => actions.setSelectedFoodSet(foodSet)}
                        className="bg-white p-4 rounded-xl shadow-sm border hover:border-orange-500 cursor-pointer transition-all hover:-translate-y-1"
                      >
                        <div className="aspect-square bg-orange-100 rounded-lg mb-2 flex items-center justify-center">
                           {/* ใส่รูปภาพตาม logic เดิม */}
                           <img src={SetFoodIcon.src} className="w-1/2 opacity-50" />
                        </div>
                        <div className="font-bold text-center text-gray-700">{foodSet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Set Menu */}
              {state.selectedFoodSet && !state.selectedSetMenu && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">2. เลือก Set อาหาร ({state.selectedFoodSet})</h2>
                  <div className="responsive-grid">
                    {state.availableSetMenus.map((setMenu, i) => {
                       const setData = state.lunchboxData.find(item => item.lunchbox_name === state.selectedFoodSet && item.lunchbox_set_name === setMenu);
                       const limit = setData?.lunchbox_limit || 0;
                       
                       return (
                        <div 
                          key={i} 
                          onClick={() => actions.setSelectedSetMenu(setMenu)}
                          className="bg-white p-4 rounded-xl shadow-sm border hover:border-blue-500 cursor-pointer transition-all hover:-translate-y-1"
                        >
                          <div className="aspect-square bg-blue-100 rounded-lg mb-2 flex items-center justify-center text-blue-500 font-bold text-xl">
                             {setMenu}
                          </div>
                          <div className="font-bold text-center text-gray-700">{setMenu}</div>
                          <div className="text-xs text-center text-gray-500 mt-1">
                            {limit === 0 ? "ไม่จำกัด" : `เลือกได้ ${limit}`}
                          </div>
                        </div>
                       );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Select Menus */}
              {state.selectedFoodSet && state.selectedSetMenu && (
                <div>
                  {/* Search Bar */}
                  <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md p-4 -mx-4 mb-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="ค้นหาเมนู..."
                        value={state.searchQuery}
                        onChange={(e) => actions.setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  {state.isLoadingMenus ? (
                    <div className="text-center py-10"><Loading /></div>
                  ) : (
                    <div className="space-y-8">
                      {/* === หมวด 1: ข้าว+กับข้าว === */}
                      {(() => {
                         const dishMenus = computed.filteredMenus.filter(m => m.lunchbox_menu_category === "ข้าว+กับข้าว" || m.lunchbox_menu_category === "กับข้าวที่ 1");
                         if (dishMenus.length === 0) return null;
                         
                         return (
                           <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">1. เลือกเมนูหลัก</h3>
                             <div className="flex flex-wrap gap-3">
                               {GENERIC_DISH_TYPES.map(dishType => {
                                  const isSelected = state.focusedDish === dishType;
                                  return (
                                    <MenuCard 
                                      key={dishType}
                                      menuId={dishType}
                                      name={dishType}
                                      price={0}
                                      selected={isSelected}
                                      variant="list"
                                      className="w-full sm:w-auto min-w-[150px]"
                                      onClick={() => actions.handleGenericDishClick(dishType)}
                                    />
                                  );
                               })}
                             </div>
                           </div>
                         );
                      })()}

                      {/* === หมวด 2: เนื้อสัตว์ === */}
                      {state.focusedDish && (
                        <div>
                           <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-orange-500 pl-3">2. เลือกเนื้อสัตว์</h3>
                           <div className="flex flex-wrap gap-3">
                             {computed.dynamicMeatTypes.map(meat => (
                               <MenuCard 
                                 key={meat}
                                 menuId={meat}
                                 name={meat}
                                 price={MEAT_PRICE_MAP[meat] || 0}
                                 showPrice
                                 selected={state.selectedMeatType === meat}
                                 variant="list"
                                 className="w-full sm:w-auto min-w-[120px]"
                                 onClick={() => actions.handleMeatFilterChange(state.selectedMeatType === meat ? null : meat)}
                               />
                             ))}
                           </div>
                        </div>
                      )}

                      {/* === หมวดอื่นๆ === */}
                      {computed.getOrderedCategories.map((category, idx) => {
                        const menus = computed.filteredMenus.filter(m => m.lunchbox_menu_category === category);
                        const isLocked = computed.isCategoryLocked(category);
                        if (menus.length === 0) return null;

                        return (
                          <div key={category} className={isLocked ? "opacity-50 pointer-events-none grayscale" : ""}>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-3">
                              {category} {isLocked && "(กรุณาเลือกหมวดก่อนหน้า)"}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {menus.map((menu) => (
                                <MenuCard
                                  key={menu.menu_id}
                                  menuId={menu.menu_id || ""}
                                  name={menu.menu_name}
                                  price={computed.getPrice(menu)}
                                  showPrice
                                  selected={state.selectedMenuItems.includes(buildMenuKey(menu))}
                                  variant="list"
                                  className="w-full sm:w-[300px]"
                                  onClick={() => actions.handleMenuSelection(buildMenuKey(menu))}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Action Bar */}
          <div className="lg:hidden">
             <MobileActionBar 
               totalCost={computed.selectionPrice * state.lunchboxQuantity}
               onSubmit={actions.handleSubmit}
               onReset={actions.resetSelection}
               canSubmit={computed.selectionCount.total > 0} // ปรับ Logic ตามต้องการ
               saving={state.isSaving}
               editMode={state.isEditMode}
             />
          </div>
        </div>
      </div>
    </div>
  );
}