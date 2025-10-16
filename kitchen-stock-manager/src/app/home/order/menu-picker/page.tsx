"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, Grid3X3, List, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/store";
import { MenuItem } from "@/models/menu_card/MenuCard";

// Interface สำหรับข้อมูลจาก API
interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
}

export default function Order() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  const router = useRouter();
  const { addLunchbox } = useCartStore();
  
  // States for hierarchical selection system
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>(""); // ชุดอาหาร
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>(""); // Set อาหาร
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]); // เมนูอาหารหลายตัว
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItem[]>([]);
  const [note, setNote] = useState<string>("");
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    
    // Set initial time
    updateTime();
    
    // Update time every second
    const interval = setInterval(updateTime, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Check for edit mode and manage loading state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get('edit') === 'true';
    
    if (isEdit) {
      setIsLoadingEditData(true);
      const editingIndexStr = sessionStorage.getItem('editingLunchboxIndex');
      const editingDataStr = sessionStorage.getItem('editingLunchboxData');
      
      if (editingIndexStr && editingDataStr && lunchboxData.length > 0) {
        try {
          const index = parseInt(editingIndexStr);
          const editingData = JSON.parse(editingDataStr);
          
          setIsEditMode(true);
          setEditingIndex(index);
          setSelectedFoodSet(editingData.lunchbox_name);
          setSelectedSetMenu(editingData.lunchbox_set);
          setNote(editingData.note || "");
          
          // Set selected menu items
          if (editingData.selected_menus && editingData.selected_menus.length > 0) {
            const menuNames = editingData.selected_menus.map((menu: MenuItem) => menu.menu_name);
            setSelectedMenuItems(menuNames);
          }
          
          console.log("Loading edit data:", editingData);
          console.log("Set selectedFoodSet to:", editingData.lunchbox_name);
          console.log("Set selectedSetMenu to:", editingData.lunchbox_set);
          console.log("Available lunchboxData:", lunchboxData);
          
          // สำหรับการหน่วงเวลาเล็กน้อยเพื่อให้ระบบอัปเดตข้อมูลทั้งหมด
          setTimeout(() => {
            setIsLoadingEditData(false);
          }, 500);
        } catch (error) {
          console.error("Error loading edit data:", error);
          setIsLoadingEditData(false);
        }
      } else if (lunchboxData.length === 0) {
        // ยังรอ lunchboxData โหลด
        console.log("Waiting for lunchboxData to load...");
      }
    }
  }, [lunchboxData]); // เพิ่ม dependency เพื่อรอ lunchboxData โหลดเสร็จ

  // Fetch lunchbox data on component mount
  useEffect(() => {
    const fetchLunchboxData = async () => {
      try {
        const response = await fetch("/api/get/lunchbox");
        const data = await response.json();
        console.log("Lunchbox data:", data);
        
        if (data && Array.isArray(data)) {
          setLunchboxData(data);
          
          // Extract unique food sets (ชุดอาหาร)
          const uniqueFoodSets = [...new Set(data.map((item: LunchBoxFromAPI) => item.lunchbox_name))] as string[];
          console.log("Available food sets:", uniqueFoodSets);
          setAvailableFoodSets(uniqueFoodSets);
        } else if (data.success && data.data) {
          setLunchboxData(data.data);
          
          // Extract unique food sets (ชุดอาหาร)
          const uniqueFoodSets = [...new Set(data.data.map((item: LunchBoxFromAPI) => item.lunchbox_name))] as string[];
          console.log("Available food sets:", uniqueFoodSets);
          setAvailableFoodSets(uniqueFoodSets);
        }
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      }
    };

    fetchLunchboxData();
  }, []);

  // Handle food set selection (ชุดอาหาร)
  useEffect(() => {
    if (selectedFoodSet && lunchboxData.length > 0) {
      // Get available set menus for selected food set - ใช้ lunchbox_set_name ตาม API
      const availableSets = lunchboxData.filter(item => item.lunchbox_name === selectedFoodSet);
      const uniqueSetMenus = [...new Set(availableSets.map(item => item.lunchbox_set_name))] as string[];
      console.log("Available set menus for", selectedFoodSet, ":", uniqueSetMenus);
      console.log("Filtered sets data:", availableSets);
      setAvailableSetMenus(uniqueSetMenus);
    } else {
      setAvailableSetMenus([]);
      // เฉพาะในโหมดปกติเท่านั้นที่จะ reset selectedSetMenu
      if (!isEditMode) {
        setSelectedSetMenu("");
        setSelectedMenuItems([]);
      }
    }
  }, [selectedFoodSet, lunchboxData, isEditMode]);

  // Handle set menu selection (Set อาหาร)
  useEffect(() => {
    const fetchMenus = async () => {
      if (!selectedFoodSet || !selectedSetMenu) {
        setAvailableMenus([]);
        setIsLoadingMenus(false);
        return;
      }

      setIsLoadingMenus(true);
      try {
        const url = `/api/get/lunchbox/categories?lunchbox_name=${encodeURIComponent(selectedFoodSet)}&lunchbox_set_name=${encodeURIComponent(selectedSetMenu)}`;
        console.log("Fetching menus from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log("Menu data received:", data);
        
        if (data.success && data.data) {
          const menuItems: MenuItem[] = data.data.map((menu: MenuItem) => ({
            menu_id: menu.menu_id?.toString() || "",
            menu_name: menu.menu_name || "",
            menu_subname: menu.menu_subname || "",
            menu_category: menu.menu_category || "",
            menu_cost: menu.menu_cost || 0,
            menu_ingredients: menu.menu_ingredients || [],
            menu_description: menu.menu_description || "",
          }));
          console.log("Processed menu items:", menuItems);
          setAvailableMenus(menuItems);
        } else {
          console.log("No menu data found or incorrect format");
          setAvailableMenus([]);
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
        setAvailableMenus([]);
      } finally {
        setIsLoadingMenus(false);
      }
    };

    fetchMenus();
  }, [selectedFoodSet, selectedSetMenu, lunchboxData]);



  // Filter products based on selected menu items and search query
  const filteredProducts = useMemo(() => {
    // Only show menus if specific menu items are selected
    let filtered = selectedMenuItems.length > 0 ? availableMenus.filter(menu => selectedMenuItems.includes(menu.menu_name)) : [];
    
    if (searchQuery.trim() && filtered.length > 0) {
      filtered = filtered.filter((menu) => 
        menu.menu_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.menu_cost?.toString().includes(searchQuery) ||
        menu.menu_description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [availableMenus, selectedMenuItems, searchQuery]);

  // Function to handle menu selection with limit (FIFO replacement)
  const handleMenuSelection = (menuName: string) => {
    const setData = lunchboxData.find(item => 
      item.lunchbox_name === selectedFoodSet && 
      item.lunchbox_set_name === selectedSetMenu
    );
    const limit = setData?.lunchbox_limit || 1;

    setSelectedMenuItems(prev => {
      const isSelected = prev.includes(menuName);
      
      if (isSelected) {
        // ถ้าเลือกแล้ว ให้ยกเลิก
        return prev.filter(item => item !== menuName);
      } else {
        // ถ้ายังไม่เลือก
        if (prev.length < limit) {
          // ยังไม่ถึง limit ให้เพิ่มเข้าไป
          return [...prev, menuName];
        } else {
          // เกิน limit แล้ว ให้เอาตัวแรกออกแล้วเพิ่มตัวใหม่เข้าไป (FIFO)
          const newSelection = [...prev.slice(1), menuName];
          return newSelection;
        }
      }
    });
  };

  // Function to handle submit
  const handleSubmit = async () => {
    if (!selectedFoodSet || !selectedSetMenu || selectedMenuItems.length === 0) {
      alert("กรุณาเลือกชุดอาหาร, Set อาหาร และเมนูอาหารให้ครบถ้วน");
      return;
    }

    setIsSaving(true);

    try {
      // แปลงเมนูที่เลือกเป็น MenuItem objects
      const selectedMenuObjects = availableMenus.filter(menu => 
        selectedMenuItems.includes(menu.menu_name)
      );

      // หา limit ของ set ที่เลือก
      const setDataInfo = lunchboxData.find(item => 
        item.lunchbox_name === selectedFoodSet && 
        item.lunchbox_set_name === selectedSetMenu
      );
      const limit = setDataInfo?.lunchbox_limit || selectedMenuItems.length;

      // สร้าง lunchbox object
      const newLunchbox = {
        lunchbox_name: selectedFoodSet,
        lunchbox_set: selectedSetMenu,
        lunchbox_limit: limit,
        selected_menus: selectedMenuObjects,
        quantity: 1,
        lunchbox_total_cost: selectedMenuObjects.reduce((total, menu) => total + (menu.menu_cost || 0), 0).toString(),
        note: note // เก็บ note แยกต่างหาก
      };

      // เพิ่มหน่วงเวลาเล็กน้อยเพื่อแสดง loading
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isEditMode && editingIndex !== -1) {
        // Edit mode: อัปเดตข้อมูลในตำแหน่งเดิม
        const store = useCartStore.getState();
        
        // อัปเดตทุกฟิลด์ที่สามารถแก้ไขได้
        store.updateLunchboxMenus(editingIndex, selectedMenuObjects);
        store.updateLunchboxNote(editingIndex, note);
        
        // ล้างข้อมูล edit
        sessionStorage.removeItem('editingLunchboxIndex');
        sessionStorage.removeItem('editingLunchboxData');
      } else {
        // Add mode: เพิ่มรายการใหม่
        addLunchbox(newLunchbox);
      }

      // รีเซ็ตการเลือก
      setSelectedFoodSet("");
      setSelectedSetMenu("");
      setSelectedMenuItems([]);
      setNote("");
      setIsEditMode(false);
      setEditingIndex(-1);

      // ไปหน้า CartList
      router.push("/home/order");
    } catch (error) {
      console.error("Error processing lunchbox:", error);
      alert("เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading overlay when loading edit data
  if (isLoadingEditData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">🔧 กำลังโหลดข้อมูลแก้ไข</h3>
          <p className="text-sm text-gray-500">รอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
      {/* Saving Overlay */}
      {isSaving && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-8 rounded-xl shadow-lg text-center'>
            <div className='animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4'></div>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>{isEditMode ? "🔧 กำลังบันทึกการแก้ไข" : "💾 กำลังเพิ่มลงตะกร้า"}</h3>
            <p className='text-sm text-gray-500'>กรุณารอสักครู่...</p>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className='flex'>
        {/* Left Sidebar */}
        <div className='w-64 bg-white border-r border-gray-200 min-h-screen'>
          <div className='p-4'>
            {/* Mode Indicator */}
            {isEditMode && (
              <div className='text-center mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='text-sm font-medium text-yellow-800'>🔧 โหมดแก้ไข</div>
                <div className='text-xs text-yellow-600'>กำลังแก้ไขรายการที่ {editingIndex + 1}</div>
              </div>
            )}

            {/* Time */}
            <div className='text-center mb-6 pt-3'>
              <div className='text-base font-medium text-gray-600'>
                {currentTime
                  ? currentTime
                      .toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                      .replace(/\//g, "/")
                  : "--/--/--"}
              </div>
              <div className='text-base font-medium text-gray-600'>
                {currentTime
                  ? currentTime.toLocaleTimeString("th-TH", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "--:--:--"}
              </div>
            </div>

            {/* Selection Progress */}
            <div className='space-y-3'>
              {/* Progress Steps - แบบ Card สองบรรทัด */}
              <div className='space-y-3'>
                {/* Step 1: เลือกชุดอาหาร */}
                <button
                  onClick={() => {
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems([]);
                  }}
                  className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${
                    selectedFoodSet
                      ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                      : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0
                      ? "bg-orange-100 border-2 border-orange-300"
                      : "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                  }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedFoodSet ? "bg-green-500 text-white" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : "bg-gray-400 text-white"}`}>1</div>
                      <div>
                        <div className='font-medium text-gray-800'>เลือกชุดอาหาร</div>
                        <div className='text-xs text-gray-500'>{selectedFoodSet ? selectedFoodSet : "คลิกเพื่อเลือกชุดอาหาร"}</div>
                      </div>
                    </div>
                    {selectedFoodSet && <span className='text-green-600 text-lg'>✓</span>}
                  </div>
                </button>

                {/* Step 2: เลือก Set อาหาร */}
                <button
                  onClick={() => {
                    if (selectedSetMenu) {
                      setSelectedSetMenu("");
                      setSelectedMenuItems([]);
                    }
                  }}
                  disabled={!selectedFoodSet}
                  className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${
                    selectedSetMenu
                      ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                      : selectedFoodSet && !selectedSetMenu
                      ? "bg-orange-100 border-2 border-orange-300"
                      : selectedFoodSet
                      ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                      : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
                  }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedSetMenu ? "bg-green-500 text-white" : selectedFoodSet && !selectedSetMenu ? "bg-orange-500 text-white" : selectedFoodSet ? "bg-gray-400 text-white" : "bg-gray-300 text-gray-500"}`}>
                        2
                      </div>
                      <div>
                        <div className='font-medium text-gray-800'>เลือก Set อาหาร</div>
                        <div className='text-xs text-gray-500'>
                          {selectedSetMenu ? (
                            <>
                              {selectedSetMenu}
                              {(() => {
                                const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                                return setData?.lunchbox_limit ? ` (${setData.lunchbox_limit} เมนู)` : "";
                              })()}
                            </>
                          ) : selectedFoodSet ? (
                            "คลิกเพื่อเลือก Set อาหาร"
                          ) : (
                            "เลือกชุดอาหารก่อน"
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedSetMenu && <span className='text-green-600 text-lg'>✓</span>}
                  </div>
                </button>

                {/* Step 3: เลือกเมนูอาหาร */}
                <button
                  onClick={() => {
                    if (selectedMenuItems.length > 0) {
                      setSelectedMenuItems([]);
                    }
                  }}
                  disabled={!selectedSetMenu}
                  className={`w-full p-3 rounded-xl transition-all duration-200 text-left ${
                    selectedMenuItems.length > 0
                      ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                      : selectedSetMenu && selectedMenuItems.length === 0
                      ? "bg-orange-100 border-2 border-orange-300"
                      : selectedSetMenu
                      ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                      : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
                  }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedMenuItems.length > 0 ? "bg-green-500 text-white" : selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : selectedSetMenu ? "bg-gray-400 text-white" : "bg-gray-300 text-gray-500"
                        }`}>
                        3
                      </div>
                      <div>
                        <div className='font-medium text-gray-800'>เลือกเมนูอาหาร</div>
                        <div className='text-xs text-gray-500'>{selectedMenuItems.length > 0 ? `เลือกแล้ว ${selectedMenuItems.length} เมนู` : selectedSetMenu ? "คลิกเพื่อเลือกเมนูอาหาร" : "เลือก Set อาหารก่อน"}</div>
                      </div>
                    </div>
                    {selectedMenuItems.length > 0 && <span className='text-green-600 text-lg'>✓</span>}
                  </div>
                </button>
              </div>

              {/* Note Section */}
              {selectedMenuItems.length > 0 && (
                <div className='mt-4 space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>หมายเหตุ (ไม่บังคับ)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder='ระบุข้อมูลเพิ่มเติม...'
                      className='w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-xs text-gray-700 placeholder-gray-400 resize-none'
                      rows={2}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                      isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-xl"
                    }`}>
                    {isSaving ? (
                      <>
                        <div className='animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full'></div>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Send className='w-3 h-3' />
                        {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มไปยังตะกร้า"}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Reset Button */}
              {(selectedFoodSet || selectedSetMenu || selectedMenuItems.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems([]);
                    setNote("");
                  }}
                  className='w-full mt-3 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors'>
                  รีเซ็ตการเลือก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 p-6 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 backdrop-blur-sm'>
          {/* Search and Filter Section */}
          <div className='bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-lg border border-white/20'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='ค้นหาสินค้า, ราคา...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400'
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                    ✕
                  </button>
                )}
              </div>

              <div className='flex items-center gap-2 bg-gray-100 rounded-xl p-1'>
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}>
                  <Grid3X3 className='w-5 h-5' />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}>
                  <List className='w-5 h-5' />
                </button>
              </div>

              <button className='flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 text-gray-700'>
                <Filter className='w-4 h-4' />
                <span className='text-sm font-medium'>ตัวกรอง</span>
              </button>
            </div>

            {searchQuery && (
              <div className='text-sm text-gray-600'>
                ค้นหา &ldquo;{searchQuery}&rdquo; {selectedMenuItems.length > 0 && `ในเมนูที่เลือก`} - พบ {filteredProducts.length} รายการ
              </div>
            )}

            {/* Debug Information */}
            <div className='text-xs text-gray-500 bg-gray-100 p-3 rounded-lg'>
              <div className='font-semibold mb-2'>🐛 Debug Information:</div>
              <div>
                📦 ชุดอาหาร ({availableFoodSets.length}): {availableFoodSets.length > 0 ? availableFoodSets.join(", ") : "ไม่พบข้อมูล"}
              </div>
              <div>
                📋 Set อาหาร ({availableSetMenus.length}): {availableSetMenus.length > 0 ? availableSetMenus.join(", ") : "ไม่พบข้อมูล"}
              </div>
              <div>
                🍜 เมนูอาหาร ({availableMenus.length}): {availableMenus.length > 0 ? availableMenus.map((m) => m.menu_name).join(", ") : "ไม่พบข้อมูล"}
              </div>
              <div>
                ✅ Selected: {selectedFoodSet || "ไม่ได้เลือก"} → {selectedSetMenu || "ไม่ได้เลือก"} → [{selectedMenuItems.length > 0 ? selectedMenuItems.join(", ") : "ไม่ได้เลือก"}]
              </div>
              {note && <div>📝 Note: {note}</div>}
              <div>🔢 Total lunchbox data: {lunchboxData.length} items</div>
              {selectedFoodSet && selectedSetMenu && (
                <div>
                  🎯 Current set limit:{" "}
                  {(() => {
                    const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                    return setData?.lunchbox_limit || 0;
                  })()}{" "}
                  เมนู
                </div>
              )}
            </div>
          </div>

          {/* Selection Area */}
          <div className='mb-8'>
            {/* Step 1: เลือกชุดอาหาร */}
            {!selectedFoodSet && (
              <div>
                <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                  <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. เลือกชุดอาหาร</span>
                  <span className='ml-3 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full'>{availableFoodSets.length} รายการ</span>
                </h2>

                <div className='grid grid-cols-3 gap-4 md:gap-6'>
                  {availableFoodSets.map((foodSet, index) => (
                    <div key={index} className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer' onClick={() => setSelectedFoodSet(foodSet)}>
                      <div className='aspect-square bg-[linear-gradient(to_bottom_right,theme(colors.orange.100),theme(colors.orange.200),theme(colors.orange.300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                        <div className='text-center p-4'>
                          <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-xl shadow-inner flex items-center justify-center'>
                            <span className='text-2xl'>🍽️</span>
                          </div>
                          <h3 className='font-semibold text-gray-800 text-sm leading-tight group-hover:text-orange-600 transition-colors duration-200'>{foodSet}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: เลือก Set อาหาร */}
            {selectedFoodSet && !selectedSetMenu && (
              <div>
                <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                  <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>2. เลือก Set อาหาร</span>
                  <span className='ml-3 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full'>{availableSetMenus.length} รายการ</span>
                </h2>

                <div className='grid grid-cols-3 gap-4 md:gap-6'>
                  {availableSetMenus.map((setMenu, index) => {
                    // หา lunchbox_limit สำหรับ set นี้
                    const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === setMenu);
                    const limit = setData?.lunchbox_limit || 0;

                    return (
                      <div key={index} className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer' onClick={() => setSelectedSetMenu(setMenu)}>
                        <div className='aspect-square bg-[linear-gradient(to_bottom_right,theme(colors.blue.100),theme(colors.blue.200),theme(colors.blue.300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                          <div className='text-center p-4'>
                            <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-300 rounded-xl shadow-inner flex items-center justify-center'>
                              <span className='text-2xl'>📋</span>
                            </div>
                            <h3 className='font-semibold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors duration-200 mb-2'>{setMenu}</h3>
                            {limit > 0 && <div className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>เลือกได้ {limit} เมนู</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: เลือกเมนูอาหาร */}
            {selectedFoodSet && selectedSetMenu && (
              <div>
                <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center flex-wrap gap-2'>
                  <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>3. เลือกเมนูอาหาร</span>
                  <span className='text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full'>{availableMenus.length} รายการ</span>
                  {(() => {
                    const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                    const limit = setData?.lunchbox_limit || 0;
                    const selected = selectedMenuItems.length;

                    return (
                      <div className='flex gap-2'>
                        <span className='text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full'>
                          เลือกแล้ว {selected}/{limit}
                        </span>
                        {selected >= limit && <span className='text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full'>ครบแล้ว!</span>}
                      </div>
                    );
                  })()}
                </h2>

                {isLoadingMenus ? (
                  <div className='flex items-center justify-center py-12'>
                    <div className='text-center'>
                      <div className='animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4'></div>
                      <p className='text-gray-600'>กำลังโหลดเมนู...</p>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-4 gap-4 md:gap-6'>
                    {availableMenus.map((menu, index) => {
                      const isSelected = selectedMenuItems.includes(menu.menu_name);
                      return (
                        <div
                          key={menu.menu_id || index}
                          className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer ${
                            isSelected ? "bg-green-50 border-2 border-green-300 ring-2 ring-green-200" : "bg-white border border-gray-100 hover:border-green-200"
                          }`}
                          onClick={() => handleMenuSelection(menu.menu_name)}>
                          <div className='aspect-square bg-[linear-gradient(to_bottom_right,theme(colors.green.100),theme(colors.green.200),theme(colors.green.300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                            <div className='text-center p-4 relative'>
                              <div className='w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-300 via-emerald-300 to-teal-300 rounded-xl shadow-inner flex items-center justify-center'>
                                <span className='text-2xl'>🍜</span>
                              </div>
                              <h3 className='font-semibold text-gray-800 text-xs leading-tight group-hover:text-green-600 transition-colors duration-200 line-clamp-2'>{menu.menu_name}</h3>
                              {menu.menu_cost > 0 && <p className='text-xs text-gray-600 mt-1 font-medium'>฿{menu.menu_cost}</p>}
                              {/* Selection indicator */}
                              {isSelected && (
                                <div className='absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                                  <span className='text-white text-xs font-bold'>✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Final Step: แสดงเมนูที่เลือก */}
            {selectedMenuItems.length > 0 && (
              <div>
                <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                  <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>เมนูที่เลือก ({selectedMenuItems.length} เมนู)</span>
                  <span className='ml-3 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full'>{filteredProducts.length} รายการ</span>
                </h2>
                <div className='mb-4 flex flex-wrap gap-2'>
                  {selectedMenuItems.map((menuName, index) => (
                    <span key={index} className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
                      {menuName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grid View - แสดงเฉพาะเมื่อเลือกเมนูแล้ว */}
            {selectedMenuItems.length > 0 && viewMode === "grid" && (
              <div className='grid grid-cols-6 gap-4 md:gap-6'>
                {filteredProducts.map((menu, index) => (
                  <div key={menu.menu_id || index} className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 animate-fade-in-up' style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Product Image */}
                    <div className='relative overflow-hidden'>
                      <div className='aspect-square bg-[linear-gradient(to_bottom_right,theme(colors.gray.100),theme(colors.gray.200),theme(colors.gray.300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                        {/* Placeholder image with gradient */}
                        <div className='w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-xl shadow-inner flex items-center justify-center'>
                          <div className='w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-lg opacity-60'></div>
                        </div>

                        {/* Overlay effect */}
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                        {/* Price badge */}
                        <div className='absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg'>
                          <span className='text-xs font-bold text-orange-600'>฿{menu.menu_cost || 0}</span>
                        </div>

                        {/* Add to cart button */}
                        <div className='absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300'>
                          <button className='bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200'>
                            <Plus className='w-3 h-3 md:w-4 md:h-4' />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className='p-3 md:p-4'>
                      <h3 className='font-semibold text-gray-800 text-xs md:text-sm leading-tight mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200'>{menu.menu_name}</h3>

                      {/* Menu subname */}
                      {menu.menu_subname && <p className='text-xs text-gray-500 mb-2'>{menu.menu_subname}</p>}

                      {/* Category and stock */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className='w-2 h-2 bg-green-400 rounded-full mr-1 md:mr-2'></div>
                          <span className='text-xs text-gray-500'>พร้อมจำหน่าย</span>
                        </div>
                        <div className='text-xs text-gray-400'># {menu.menu_category}</div>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12'></div>
                  </div>
                ))}
              </div>
            )}

            {/* List View - แสดงเฉพาะเมื่อเลือกเมนูแล้ว */}
            {selectedMenuItems.length > 0 && viewMode === "list" && (
              <div className='space-y-4'>
                {filteredProducts.map((menu, index) => (
                  <div key={menu.menu_id || index} className='group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in-up' style={{ animationDelay: `${index * 30}ms` }}>
                    <div className='flex items-center p-4 md:p-6'>
                      {/* Product Image */}
                      <div className='relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 mr-4 md:mr-6'>
                        <div className='w-full h-full bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-xl shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-300'>
                          <div className='w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-lg opacity-60'></div>
                        </div>
                        <div className='absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg'>
                          <span className='text-xs font-bold text-orange-600'>฿{menu.menu_cost || 0}</span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-gray-800 text-sm md:text-base mb-1 group-hover:text-orange-600 transition-colors duration-200'>{menu.menu_name}</h3>

                            {/* Subname and category */}
                            <div className='flex items-center gap-4 mb-2'>
                              {menu.menu_subname && <span className='text-xs text-gray-500'>{menu.menu_subname}</span>}
                              <div className='flex items-center'>
                                <div className='w-2 h-2 bg-green-400 rounded-full mr-2'></div>
                                <span className='text-xs text-gray-500'>พร้อมจำหน่าย</span>
                              </div>
                              <div className='text-xs text-gray-400'># {menu.menu_category}</div>
                            </div>

                            {/* Description if available */}
                            {menu.menu_description && <p className='text-xs text-gray-600 mt-1'>{menu.menu_description}</p>}
                          </div>

                          {/* Add to cart button */}
                          <button className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105'>
                            <Plus className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {selectedMenuItems.length === 0 ? (
              <div className='text-center py-16'>
                {/* <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-200 to-pink-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-5.5M9 5l8 8M9 5v8l8-8" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">กรุณาเลือกเมนูอาหาร</h3>
                <p className="text-gray-400">เลือกชุดอาหาร → Set อาหาร → เมนูอาหาร จากด้านซ้าย</p> */}
              </div>
            ) : (
              filteredProducts.length === 0 && (
                <div className='text-center py-16'>
                  <div className='w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center'>
                    <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-600 mb-2'>ไม่พบเมนูสำหรับการเลือกนี้</h3>
                  <p className='text-gray-400'>ลองเลือกตัวเลือกอื่นหรือค้นหาด้วยคำค้นหา</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
