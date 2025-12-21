"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Search, Filter, Grid3X3, List, Send } from "lucide-react";

import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/utils";

import { useCartStore } from "@/stores/store";

import { MenuItem } from "@/models/menu_card/MenuCard";
import TopStepper from "@/components/order/TopStepper";
import MenuCard from "@/components/order/MenuCard";
import MobileActionBar from "@/components/order/MobileActionBar";
import { Loading } from "@/components/loading/loading";

import useLoadingDots from "@/lib/hook/Dots";

import SetFoodIcon from "@/assets/setfood.png";
import FoodMenuSetIcon from "@/assets/food-menu.png";
import FoodMenuIcon from "@/assets/kung-pao-chicken.png";

// Import Set Images (A-G)
import SetA from "@/assets/รูป Set อาหาร KSM/lunchbox_set_A.jpg";
import SetB from "@/assets/รูป Set อาหาร KSM/lunchbox_set_B.jpg";
import SetC from "@/assets/รูป Set อาหาร KSM/lunchbox_set_C.jpg";
import SetD from "@/assets/รูป Set อาหาร KSM/lunchbox_set_D.jpg";
import SetE from "@/assets/รูป Set อาหาร KSM/lunchbox_set_E.jpg";
import SetF from "@/assets/รูป Set อาหาร KSM/lunchbox_set_F.jpg";

const setImages: Record<string, string> = {
  A: SetA.src,
  B: SetB.src,
  C: SetC.src,
  D: SetD.src,
  E: SetE.src,
  F: SetF.src,
};

// ==================== Types ====================
type MenuItemWithAutoRice = MenuItem & { 
  lunchbox_AutoRice?: boolean | null; 
  lunchbox_showPrice?: boolean;
  menu_cost?: number; // เพิ่ม menu_cost สำหรับเก็บราคาจาก lunchbox_cost
};

interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image?: string;
  lunchbox_set_name_image?: string;
}

export default function Order() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMeatType, setSelectedMeatType] = useState<string | null>(null);
  const [selectedMeatType, setSelectedMeatType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [Optional, setOptional] = useState<object>({
    lunchbox_name: "Drinks",
    lunchbox_set_name: "เครื่องดื่ม",
    lunchbox_limit: 0,
  });

  // สถานะสำหรับการแสดงผลบนมือถือ
  // สถานะสำหรับการแสดงผลบนมือถือ
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const router = useRouter();
  const { addLunchbox } = useCartStore();

  // สถานะสำหรับการเลือกเมนู
  // สถานะสำหรับการเลือกเมนู
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>("");
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  // สถานะจำนวนข้าว
  // สถานะจำนวนข้าว
  const [riceQuantity, setRiceQuantity] = useState<number>(0);
  const [lunchboxQuantity, setLunchboxQuantity] = useState<number>(1);
  const [lunchboxQuantity, setLunchboxQuantity] = useState<number>(1);
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItemWithAutoRice[]>([]);
  const [note, setNote] = useState<string>("");

  // UI States
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [selectedMeatFilter, setSelectedMeatFilter] = useState<string | null>(null);

  // helper สำหรับสร้าง key ที่ไม่ซ้ำระหว่างเมนูที่ชื่อซ้ำแต่หมวดต่างกัน
  const buildMenuKey = (menu: Partial<MenuItemWithAutoRice>) => menu.lunchbox_menuid ?? `${menu.menu_id ?? ""}-${menu.lunchbox_menu_category ?? ""}-${menu.menu_name ?? ""}`;
  // ฟังก์ชันดึงราคา
  // ฟังก์ชันดึงราคา
  const getPrice = (menu?: Partial<MenuItemWithAutoRice>) => menu?.lunchbox_cost ?? 0;

  // ==================== ฟังก์ชันช่วยทำงาน ====================
  // ค้นหาข้อมูลชุดอาหาร
  // ==================== ฟังก์ชันช่วยทำงาน ====================
  // ค้นหาข้อมูลชุดอาหาร
  const getSetData = (foodSet: string, setMenu: string) => lunchboxData.find((item) => item.lunchbox_name === foodSet && item.lunchbox_set_name === setMenu);

  // ตรวจสอบจำนวนเมนูที่เลือกได้
  // ตรวจสอบจำนวนเมนูที่เลือกได้
  const getSetLimit = (foodSet: string, setMenu: string) => getSetData(foodSet, setMenu)?.lunchbox_limit ?? 0;

  // สร้าง URL สำหรับรูปภาพ
  // สร้าง URL สำหรับรูปภาพ
  const buildBlobImageUrl = (imageName?: string | null) => (imageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${imageName}` : null);

  // คอมโพเนนต์แสดงรูปภาพ
  // คอมโพเนนต์แสดงรูปภาพ
  const LunchboxImage = ({ imageName, alt, fallbackIcon }: { imageName?: string | null; alt: string; fallbackIcon: React.ReactNode }) => {
    const imageUrl = buildBlobImageUrl(imageName);

    if (!imageUrl || failedImages.has(imageUrl)) {
      return <>{fallbackIcon}</>;
    }

    return <img src={imageUrl} alt={alt} className='min-w-full min-h-full object-cover object-center' onError={() => setFailedImages((prev) => new Set(prev).add(imageUrl))} />;
  };

  // สถานะโหมดแก้ไข
  // สถานะโหมดแก้ไข
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true);
  // รายการรูปที่โหลดไม่ผ่าน
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true);
  // รายการรูปที่โหลดไม่ผ่าน
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dots = useLoadingDots();

  const extractPriceFromSetName = (setName: string): number | null => {
    const match = setName.match(/(\d+)\s*baht/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // เรียงลำดับข้อความ (ไทย/อังกฤษ + ตัวเลข)
  // เรียงลำดับข้อความ (ไทย/อังกฤษ + ตัวเลข)
  const sortStrings = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b, "th", { numeric: true, sensitivity: "base" }));

  // ตรวจสอบโหมดแก้ไขและจัดการสถานะการโหลด
  // ตรวจสอบโหมดแก้ไขและจัดการสถานะการโหลด
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get("edit") === "true";

    if (isEdit) {
      const editingIndexStr = sessionStorage.getItem("editingLunchboxIndex");
      const editingDataStr = sessionStorage.getItem("editingLunchboxData");

      // ถ้ายังไม่มีข้อมูล lunchbox ให้รอ
      if (lunchboxData.length === 0) {
        setIsLoadingEditData(true);
        return;
      }

      // ถ้ามีข้อมูลแล้ว ให้โหลดข้อมูลแก้ไข
      if (editingIndexStr && editingDataStr) {
        setIsLoadingEditData(true);
        // ถ้ายังไม่มีข้อมูล lunchbox ให้รอ
        if (lunchboxData.length === 0) {
          setIsLoadingEditData(true);
          return;
        }

        // ถ้ามีข้อมูลแล้ว ให้โหลดข้อมูลแก้ไข
        if (editingIndexStr && editingDataStr) {
          setIsLoadingEditData(true);
          try {
            const index = parseInt(editingIndexStr);
            const editingData = JSON.parse(editingDataStr);

            setIsEditMode(true);
            setEditingIndex(index);
            setSelectedFoodSet(editingData.lunchbox_name);
            setLunchboxQuantity(editingData.quantity || 1);

            // ลบ "SET " ออกจากชื่อเซตเพื่อให้ตรงกับข้อมูลใน API
            const normalizedSet = editingData.lunchbox_set?.replace(/^SET\s+/i, "") || "";
            setSelectedSetMenu(normalizedSet);

            setNote(editingData.note || "");

            if (editingData.selected_menus && editingData.selected_menus.length > 0) {
              const menuKeys = editingData.selected_menus.map((menu: MenuItemWithAutoRice) => buildMenuKey(menu));
              setSelectedMenuItems(menuKeys);

              // พยายามดึงประเภทเนื้อสัตว์จากเมนูที่เลือกไว้
              for (const menu of editingData.selected_menus) {
                const meat = getMeatType(menu.menu_name || "");
                if (meat) {
                  setSelectedMeatType(meat);
                  break;
                }
              }
            }

            setTimeout(() => {
              setIsLoadingEditData(false);
            }, 500);
          } catch (error) {
            console.error("Error loading edit data:", error);
            setIsLoadingEditData(false);
          }
        } else {
          // ถ้าไม่มีข้อมูลแก้ไข ให้หยุดโหลด
          setIsLoadingEditData(false);
        }
      }
    }, [lunchboxData]);

  // ==================== ตรรกะกลุ่มเมนู ====================
  // ตัวแปรสำหรับจัดการกลุ่มเมนู
  const dishOrder = ["กะเพรา", "กระเทียม", "พริกแกง", "พะแนง", "คั่วกลิ้ง", "ผัดผงกะหรี่"];
  const meatOrder = ["หมู", "ไก่", "หมึก", "กุ้ง", "ทะเล"];
  const genericDishTypes = ["กะเพรา", "กระเทียม", "พริกแกง", "พะแนง", "คั่วกลิ้ง", "ผัดผงกะหรี่"];

  const getMeatType = (menuName: string): "หมู" | "ไก่" | "หมึก" | "กุ้ง" | "ทะเล" | null => {
    if (menuName.includes("หมู")) return "หมู";
    if (menuName.includes("ไก่")) return "ไก่";
    if (menuName.includes("หมึก")) return "หมึก";
    if (menuName.includes("กุ้ง")) return "กุ้ง";
    if (menuName.includes("ทะเล")) return "ทะเล";
    return null;
  };

  const getDishType = (menuName: string): string | null => {
    if (menuName.includes("กะเพรา") || menuName.includes("กระเพรา")) return "กะเพรา";
    if (menuName.includes("กระเทียม")) return "กระเทียม";
    if (menuName.includes("พริกแกง") || menuName.includes("พริกเเกง")) return "พริกแกง";
    if (menuName.includes("พะแนง")) return "พะแนง";
    if (menuName.includes("คั่วกลิ้ง")) return "คั่วกลิ้ง";
    if (menuName.includes("ผัดผงกะหรี่")) return "ผัดผงกะหรี่";
    return null;
  };

  // สถานะสำหรับเมนูที่รอเลือกเนื้อสัตว์
  const [focusedDish, setFocusedDish] = useState<string | null>(null);

  useEffect(() => {
    const fetchLunchboxData = async () => {
      setIsLoadingLunchboxData(true);
      try {
        const response = await fetch("/api/get/lunchbox");
        const data = await response.json();

        const items = (Array.isArray(data) ? data : data?.data) as LunchBoxFromAPI[] | undefined;
        if (items) {
          setLunchboxData(items);

          const uniqueFoodSets = sortStrings([...new Set(items.map((item: LunchBoxFromAPI) => item.lunchbox_name))]);
          setAvailableFoodSets(uniqueFoodSets);
        }
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      } finally {
        setIsLoadingLunchboxData(false);
      }
    };

    fetchLunchboxData();

    // อัปเดตเวลาปัจจุบัน
    // อัปเดตเวลาปัจจุบัน
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedFoodSet && lunchboxData.length > 0) {
      const availableSets = lunchboxData.filter((item) => item.lunchbox_name === selectedFoodSet);
      const uniqueSetMenus = sortStrings([...new Set(availableSets.map((item) => item.lunchbox_set_name))]);
      setAvailableSetMenus(uniqueSetMenus);
    } else {
      setAvailableSetMenus([]);
      if (!isEditMode) {
        setSelectedSetMenu("");
        setSelectedMenuItems([]);
      }
    }
  }, [selectedFoodSet, lunchboxData, isEditMode]);

  // จัดการการเลือก Set อาหาร
  // จัดการการเลือก Set อาหาร
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

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
          const menuItems: MenuItemWithAutoRice[] = data.data.map((menu: MenuItemWithAutoRice) => ({
            menu_id: menu.menu_id?.toString() || "",
            menu_name: menu.menu_name || "",
            menu_subname: menu.menu_subname || "",
            menu_category: menu.menu_category || "",
            lunchbox_cost: Number(menu.lunchbox_cost) || 0,
            menu_ingredients: menu.menu_ingredients || [],
            menu_description: menu.menu_description || "",
            lunchbox_menu_category: menu.lunchbox_menu_category || null,
            lunchbox_showPrice: menu.lunchbox_showPrice ?? true,
            lunchbox_AutoRice: menu.lunchbox_AutoRice ?? false,
            lunchbox_menuid: menu.lunchbox_menuid || menu.lunchbox_menuid === "" ? menu.lunchbox_menuid : undefined,
          }));
          setAvailableMenus(menuItems);
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

  useEffect(() => {
    if (selectedFoodSet && selectedSetMenu && availableMenus.length > 0) {
      // ตรวจสอบว่าเป็น Custom และ limit = 0 หรือไม่
      const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
      const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

      // ถ้าไม่ใช่ Custom unlimited ให้ใช้การเลือกข้าวอัตโนมัติแบบ เดิม
      if (!isCustomUnlimited) {
        const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");

        if (riceMenus.length > 0) {
          const riceMenuKey = buildMenuKey(riceMenus[0]);

          setSelectedMenuItems((prev) => {
            if (!prev.includes(riceMenuKey)) {
              // สำหรับชุดที่บังคับมีข้าว ให้ตั้งจำนวนข้าวอย่างน้อย 1
              if (riceQuantity < 1) setRiceQuantity(1);
              return [...prev, riceMenuKey];
            }
            return prev;
          });
        }
      }
      // ถ้าเป็น Custom unlimited ไม่ต้องเพิ่มข้าวอัตโนมัติ
    }
  }, [selectedFoodSet, selectedSetMenu, availableMenus, lunchboxData]);

  useEffect(() => {
    if (!selectedSetMenu) setRiceQuantity(0);
  }, [selectedSetMenu]);

  const normalizeThaiText = (text: string): string => {
    if (!text) return "";
    return text.replace(/เเ/g, "แ");
  };

  // Filter menus based on search query AND meat filter
  const filteredMenus = useMemo(() => {
    let result = availableMenus;

    // 1. Filter by Meat Type (Category Filter)
    if (selectedMeatFilter) {
      if (selectedMeatFilter === "ทั้งหมด") {
        // No filter
      } else {
        result = result.filter((menu) => {
          // ฟิวเตอร์เนื้อส่งผลเฉพาะกับข้าวที่ 1 ที่เหลือแสดงผลปกติ
          if (menu.lunchbox_menu_category === "กับข้าวที่ 1") {
            const name = normalizeThaiText(menu.menu_name || "");
            return name.includes(selectedMeatFilter);
          }
          // For other categories, always show
          return true;
        });
      }
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const normalizedQuery = normalizeThaiText(query);

      result = result.filter((menu) => {
        const normalizedMenuName = normalizeThaiText(menu.menu_name?.toLowerCase() || "");
        const normalizedMenuSubname = normalizeThaiText(menu.menu_subname?.toLowerCase() || "");
        const normalizedMenuDescription = normalizeThaiText(menu.menu_description?.toLowerCase() || "");
        const normalizedMenuCategory = normalizeThaiText(menu.lunchbox_menu_category?.toLowerCase() || "");
      result = result.filter((menu) => {
        const normalizedMenuName = normalizeThaiText(menu.menu_name?.toLowerCase() || "");
        const normalizedMenuSubname = normalizeThaiText(menu.menu_subname?.toLowerCase() || "");
        const normalizedMenuDescription = normalizeThaiText(menu.menu_description?.toLowerCase() || "");
        const normalizedMenuCategory = normalizeThaiText(menu.lunchbox_menu_category?.toLowerCase() || "");

        return normalizedMenuName.includes(normalizedQuery) || normalizedMenuSubname.includes(normalizedQuery) || (menu.lunchbox_cost ?? 0).toString().includes(query) || normalizedMenuDescription.includes(normalizedQuery) || normalizedMenuCategory.includes(normalizedQuery);
      });
    }

    return result;
  }, [availableMenus, searchQuery, selectedMeatFilter]);

  // หาประเภทเนื้อสัตว์ที่มีในเมนูปัจจุบัน
  const dynamicMeatTypes = useMemo(() => {
    const keywords = ["หมู", "ไก่", "กุ้ง", "หมึก", "ทะเล"];
    const mainDish1Menus = availableMenus.filter((m) => m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว");
    return keywords.filter((k) => mainDish1Menus.some((m) => (m.menu_name || "").includes(k)));
  }, [availableMenus]);

  // คำนวณราคารวม
  const selectionPrice = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);

    let total = 0;
    // แยกข้าวและไม่ใช่ข้าวเพื่อคำนวณราคา
    const riceMenu = resolvedMenus.find((m) => m.lunchbox_menu_category === "ข้าว");
    const nonRiceMenus = resolvedMenus.filter((m) => m.lunchbox_menu_category !== "ข้าว");

    total += nonRiceMenus.reduce((sum, m) => sum + (m.lunchbox_cost ?? 0), 0);

    if (riceMenu) {
      const riceCount = riceQuantity > 0 ? riceQuantity : 1;
      total += (riceMenu.lunchbox_cost ?? 0) * riceCount;
    }

    // คูณจำนวนกล่อง
    return total * lunchboxQuantity;
  }, [selectedMenuItems, availableMenus, riceQuantity, lunchboxQuantity]);

  const setPriceBudget = useMemo(() => {
    if (!selectedSetMenu) return null;
    return extractPriceFromSetName(selectedSetMenu);
  }, [selectedSetMenu]);

  const remainingBudget = useMemo(() => {
    if (setPriceBudget === null) return null;
    return setPriceBudget - selectionPrice;
  }, [setPriceBudget, selectionPrice]);

  const selectionCount = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);

    const riceCountFromItems = resolvedMenus.filter((m) => m.lunchbox_menu_category === "ข้าว").length;
    const nonRiceCount = resolvedMenus.filter((m) => m.lunchbox_menu_category !== "ข้าว").length;

    // ใช้ riceQuantity ถ้ามี หรือนับจากรายการที่เลือก
    const riceCount = riceQuantity > 0 ? riceQuantity : riceCountFromItems;

    return {
      nonRiceCount,
      riceCount,
      total: nonRiceCount + riceCount,
    };
  }, [selectedMenuItems, availableMenus, riceQuantity]);

  // ==================== Sequential Category Selection Logic ====================
  // Get list of categories that have been selected (excluding rice)
  const getSelectedCategories = useMemo(() => {
    return availableMenus
      .filter((menu) => selectedMenuItems.includes(buildMenuKey(menu)))
      .map((menu) => menu.lunchbox_menu_category)
      .filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว");
  }, [availableMenus, selectedMenuItems]);

  // Get ordered list of categories that exist in current menu
  const getOrderedCategories = useMemo(() => {
    const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];

    const existingCategories = [...new Set(availableMenus.map((m) => m.lunchbox_menu_category).filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว"))];

    return categoryOrder.filter((cat) => existingCategories.includes(cat));
  }, [availableMenus]);

  // Check if a category is locked (requires previous category to be selected first)
  const isCategoryLocked = useMemo(() => {
    return (category: string) => {
      const categoryIndex = getOrderedCategories.indexOf(category);

      // If not in ordered list, not locked
      if (categoryIndex === -1) return false;

      // First category is always unlocked
      if (categoryIndex === 0) return false;

      // Special condition: "กับข้าวที่ 2" requires meat filter to be selected
      if (category === "กับข้าวที่ 2" && !selectedMeatType) {
        return true;
      }

      // Check if previous category is selected
      const prevCategory = getOrderedCategories[categoryIndex - 1];
      return !getSelectedCategories.includes(prevCategory);
    };
  }, [getOrderedCategories, getSelectedCategories, selectedMeatType]);

  // Get the previous category that needs to be selected
  const getPreviousRequiredCategory = useMemo(() => {
    return (category: string) => {
      const categoryIndex = getOrderedCategories.indexOf(category);
      if (categoryIndex <= 0) return null;
      return getOrderedCategories[categoryIndex - 1];
    };
  }, [getOrderedCategories]);

  const handle = {
    MenuSelection: (menuKey: string) => {
      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setData?.lunchbox_limit ?? 0;
      const selectedMenu = availableMenus.find((menu) => buildMenuKey(menu) === menuKey);
      if (!selectedMenu) return;

      const isRiceMenu = selectedMenu.lunchbox_menu_category === "ข้าว";
      const isUnlimited = limit === 0;

      const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

      // ตรวจสอบประเภทชุดอาหาร
      const isSidedishesSet = selectedFoodSet === "Lunch Box" && (selectedSetMenu === "E" || selectedSetMenu === "F");
      const isSidedishesSetJ = selectedFoodSet === "อาหารเจ" && selectedSetMenu === "D";
      const isSidedishesSetPre = selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht" || selectedSetMenu === "379 baht");
      // เพิ่มเงื่อนไขสำหรับ Premium Lunch Set "379 baht"
      const isPremium379 = selectedFoodSet === "Premium Lunch" && selectedSetMenu === "379 baht";
      const isSidedishCategory = selectedMenu.lunchbox_menu_category === "เครื่องเคียง";
      // เพิ่มตรวจสอบหมวดกับข้าว
      const isMainDishCategory = selectedMenu.lunchbox_menu_category === "กับข้าวที่ 1";

      // ตรวจสอบชุดเครื่องดื่ม
      const isDrinksSet = selectedFoodSet === "Drinks" && selectedSetMenu === "เครื่องดื่ม";
      const isOtherCategory = selectedMenu.lunchbox_menu_category === "อื่นๆ";

      // ตรวจสอบการเพิ่มข้าวอัตโนมัติ
      const shouldAutoAddRice = selectedMenu.lunchbox_AutoRice === true;

      setSelectedMenuItems((prev) => {
        const isSelected = prev.includes(menuKey);

        if (isSelected) {
          // ถ้าเป็นเซต unlimited และเมนูนี้ถูกตั้งให้เพิ่มข้าวอัตโนมัติ (ไม่ใช่ข้าว)
          if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
            let newPrev = prev.filter((item) => item !== menuKey);

            // นับเมนูในหมวดเดียวกัน (ไม่รวมข้าว)
            const menusInCategory = availableMenus.filter((menu) => menu.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว" && newPrev.includes(buildMenuKey(menu)));

            // ค้นหาเมนูข้าว
            const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
            const riceMenuName = riceMenus.length > 0 ? riceMenus[0].menu_name : null;

            if (riceMenuName) {
              // คำนวณจำนวนข้าวที่ต้องมี
              const requiredRiceCount = menusInCategory.length;

              setRiceQuantity(requiredRiceCount);

              // ลบข้าวออกถ้าไม่มีเมนูเหลือ
              if (requiredRiceCount === 0 && newPrev.includes(riceMenuName)) {
                newPrev = newPrev.filter((item) => item !== riceMenuName);
              } else if (requiredRiceCount > 0 && !newPrev.includes(riceMenuName)) {
                // เพิ่มข้าวถ้ายังมีเมนู
                newPrev.push(riceMenuName);
              }
            }

            return newPrev;
          }

          // จัดการเมื่อเลือก/ยกเลิกข้าวในชุดไม่จำกัด
          if (isRiceMenu && isUnlimited) {
            const allSelectedMenus = availableMenus.filter((menu) => prev.includes(buildMenuKey(menu)) && menu.lunchbox_menu_category !== "ข้าว");
            const totalMenuCount = allSelectedMenus.length;

            // แจ้งเตือนถ้าลดข้าวไม่ได้
            if (totalMenuCount > 0 && riceQuantity <= totalMenuCount) {
              alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากยังมีเมนูที่ต้องการข้าวอยู่");
              return prev;
            }

            // ลดจำนวนหรือลบข้าว
            if (riceQuantity > 1) {
              setRiceQuantity(riceQuantity - 1);
              return prev.filter((item) => item !== menuKey);
            } else {
              setRiceQuantity(0);
              return prev.filter((item) => item !== menuKey);
            }
          } else if (isRiceMenu && !isUnlimited) {
            alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากข้าวเป็นส่วนประกอบหลักของชุดอาหาร");
            return prev;
          }

          return prev.filter((item) => item !== menuKey);
        } else {
          const currentSelectedMenus = availableMenus.filter((menu) => prev.includes(buildMenuKey(menu)));

          // ถ้าไม่ใช่เซต unlimited (limit > 0) หรือเป็น Drinks set ให้บล็อกหมวดที่เลือกไปแล้ว
          if (!isUnlimited || isDrinksSet) {
            const existingLunchboxCategories = currentSelectedMenus.map((menu) => menu.lunchbox_menu_category).filter((category) => category);

            // กรณีพิเศษ: Premium Lunch Set "379 baht" - ให้เลือกเครื่องเคียงได้ 3 อย่าง
            if (isPremium379 && isSidedishCategory) {
              // นับจำนวนเมนูในหมวด "เครื่องเคียง" ที่เลือกไว้แล้ว
              const sidedishCount = currentSelectedMenus.filter((menu) => menu.lunchbox_menu_category === "เครื่องเคียง").length;

              // ถ้าเลือกครบ 3 อย่างแล้ว ให้แจ้งเตือน
              if (sidedishCount >= 3) {
                alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "เครื่องเคียง" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ครบ 3 อย่างแล้ว`);
                return prev;
              }
            }
            // กรณีพิเศษ: ถ้าเป็น Lunchbox Set E หรือ F หรือ อาหารเจ Set D หรือ Premium Lunch Set "270 baht", "300 baht" และเป็นหมวด "เครื่องเคียง" ให้เลือกได้ 2 อย่าง
            else if ((isSidedishesSet || isSidedishesSetJ || (selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht"))) && isSidedishCategory) {
              // นับจำนวนเมนูในหมวด "เครื่องเคียง" ที่เลือกไว้แล้ว
              const sidedishCount = currentSelectedMenus.filter((menu) => menu.lunchbox_menu_category === "เครื่องเคียง").length;

              // ถ้าเลือกครบ 2 อย่างแล้ว ให้แจ้งเตือน
              if (sidedishCount >= 2) {
                alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "เครื่องเคียง" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ครบ 2 อย่างแล้ว`);
                return prev;
              }
            }
            // เพิ่มเงื่อนไขสำหรับ Premium Lunch Set "379 baht" - ให้เลือกกับข้าวได้ 2 อย่าง
            else if (isPremium379 && isMainDishCategory) {
              // นับจำนวนเมนูในหมวด "กับข้าว" ที่เลือกไว้แล้ว
              const mainDishCount = currentSelectedMenus.filter((menu) => menu.lunchbox_menu_category === "กับข้าว").length;

              // ถ้าเลือกครบ 2 อย่างแล้ว ให้แจ้งเตือน
              if (mainDishCount >= 2) {
                alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "กับข้าว" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ครบ 2 อย่างแล้ว`);
                return prev;
              }
            }
            // เพิ่มเงื่อนไขสำหรับ Drinks set - ให้เลือกได้ 1 อย่างต่อ 1 หมวด ยกเว้นหมวด "อื่นๆ"
            else if (isDrinksSet && !isOtherCategory && selectedMenu.lunchbox_menu_category && existingLunchboxCategories.includes(selectedMenu.lunchbox_menu_category)) {
              alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "${selectedMenu.lunchbox_menu_category}" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ไว้แล้ว`);
              return prev;
            }
            // กรณีปกติ: ถ้าหมวดนั้นถูกเลือกไปแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก (ยกเว้น Drinks set ที่เป็นหมวด "อื่นๆ" หรือ limit = 1 ให้เลือกเปลี่ยนได้)
            else if (selectedMenu.lunchbox_menu_category && existingLunchboxCategories.includes(selectedMenu.lunchbox_menu_category) && !(isDrinksSet && isOtherCategory) && limit !== 1) {
              alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "${selectedMenu.lunchbox_menu_category}" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ไว้แล้ว`);
              return prev;
            }
          }

          // เพิ่มข้าวอัตโนมัติ
          if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
            const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
            if (riceMenus.length > 0) {
              const riceMenuKey = buildMenuKey(riceMenus[0]);

              // นับเมนูในหมวดเดียวกัน (ไม่รวมข้าว)
              const menusInCategory = availableMenus.filter((menu) => menu.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว" && effectivePrev.includes(buildMenuKey(menu)));

              // คำนวณจำนวนข้าว
              const requiredRiceCount = menusInCategory.length + 1; // +1 เพราะกำลังจะเพิ่มเมนูใหม่

              setRiceQuantity(requiredRiceCount);

              // เพิ่มข้าวถ้ายังไม่มี
              if (!effectivePrev.includes(riceMenuKey)) {
                return [...effectivePrev, riceMenuKey, menuKey];
              } else {
                return [...effectivePrev, menuKey];
              }
            }
          }

          // ตรวจสอบขีดจำกัดจำนวนเมนู
          if (isUnlimited || effectivePrev.length < limit) {
            return [...effectivePrev, menuKey];
          } else {
            const newSelection = [...effectivePrev.slice(1), menuKey];
            return newSelection;
          }
        }
      });
    },
    Submit: async () => {
      if (!selectedFoodSet || !selectedSetMenu || selectedMenuItems.length === 0) {
        alert("กรุณาเลือกชุดอาหาร, Set อาหาร และเมนูอาหารให้ครบถ้วน");
        return;
      }

      // ตรวจสอบ limit
      const setDataInfo = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setDataInfo?.lunchbox_limit ?? 0;

      // แจ้งเตือนเมื่อเลือกไม่ครบ
      if (limit > 0 && selectedMenuItems.length < limit) {
        alert(`กรุณาเลือกเมนูให้ครบ ${limit} เมนู (เลือกแล้ว ${selectedMenuItems.length} เมนู)`);
        return;
      }

      if (isSaving) return;

      setIsSaving(true);

      try {
        // นับจำนวนเมนู (รวมข้าว)
        const menuCountMap = new Map<string, number>();
        selectedMenuItems.forEach((menuKey) => {
          const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
          // ใช้จำนวนข้าวจาก state
          if (menu?.lunchbox_menu_category === "ข้าว") menuCountMap.set(menuKey, riceQuantity);
          else menuCountMap.set(menuKey, (menuCountMap.get(menuKey) || 0) + 1);
        });

        // สร้างรายการเมนูสำหรับบันทึก

        const selectedMenuObjects: MenuItemWithAutoRice[] = [];
        const processedMenuNames = new Set<string>();

        for (const menuKey of selectedMenuItems) {
          if (!processedMenuNames.has(menuKey)) {
            const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
            if (menu) {
              const quantity = menuCountMap.get(menuKey) || 1;
              // สร้าง object ตามจำนวนที่เลือก (สำหรับ Custom Unlimited) หรือ 1 object (ปกติ)

              const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;
              const objectsToCreate = isCustomUnlimited ? quantity : 1;

              for (let i = 0; i < objectsToCreate; i++) selectedMenuObjects.push({ ...menu });
              processedMenuNames.add(menuKey);
            } else {
              console.warn(`Menu not found: ${menuKey}`);
            }
          }
        }

        // เรียงลำดับเมนูตามหมวดหมู่ก่อนบันทึก
        const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];
        selectedMenuObjects.sort((a, b) => {
          const catA = a.lunchbox_menu_category || "อื่นๆ";
          const catB = b.lunchbox_menu_category || "อื่นๆ";
          const indexA = categoryOrder.indexOf(catA);
          const indexB = categoryOrder.indexOf(catB);

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return catA.localeCompare(catB, "th");
        });

        // ตรวจสอบว่ามีเมนูหรือไม่
        if (selectedMenuObjects.length === 0) throw new Error("ไม่พบเมนูที่เลือก");

        const setDataInfo2 = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
        const limit2 = setDataInfo2?.lunchbox_limit ?? 0;

        let totalCost: number;
        const setPrice = extractPriceFromSetName(selectedSetMenu);
        if (setPrice !== null) totalCost = setPrice * lunchboxQuantity;
        else totalCost = selectedMenuObjects.reduce((total, menu) => total + (menu.lunchbox_cost ?? 0), 0) * lunchboxQuantity;

        const newLunchbox = {
          lunchbox_name: selectedFoodSet,
          lunchbox_set: selectedSetMenu.toUpperCase().startsWith("SET") ? selectedSetMenu : `SET ${selectedSetMenu}`,
          lunchbox_limit: limit2,
          selected_menus: selectedMenuObjects,
          quantity: lunchboxQuantity,
          lunchbox_total_cost: totalCost.toString(),
          note: note,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (isEditMode && editingIndex !== -1) {
          const store = useCartStore.getState();

          store.updateLunchboxMenus(editingIndex, selectedMenuObjects);
          store.updateLunchboxNote(editingIndex, note);
          store.updateLunchboxQuantity(editingIndex, lunchboxQuantity);
          store.updateLunchboxTotalCost(editingIndex, newLunchbox.lunchbox_total_cost);

          sessionStorage.removeItem("editingLunchboxIndex");
          sessionStorage.removeItem("editingLunchboxData");
        } else {
          addLunchbox(newLunchbox);
        }

        setSelectedFoodSet("");
        setSelectedSetMenu("");
        setSelectedMenuItems([]);
        setNote("");
        setIsEditMode(false);
        setEditingIndex(-1);

        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push("/home/order");
      } catch (error) {
        console.error("Error processing lunchbox:", error);
        alert(`เกิดข้อผิดพลาดในการประมวลผล: ${error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง"}`);
        setIsSaving(false);
      }
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // แสดงหน้าจอรอโหลดข้อมูล
  if (isLoadingEditData) {
    return <Loading context='ข้อมูลแก้ไข' />;
  }

  // จัดการเปลี่ยนประเภทเนื้อสัตว์และสลับเมนู
  const handleMeatFilterChange = (newMeatType: string | null) => {
    setSelectedMeatType(newMeatType);

    // ถ้าปลดตัวเลือกเนื้อสัตว์ออก ให้เคลียร์เมนูในหมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว"
    if (!newMeatType) {
      setSelectedMenuItems((prev) => {
        return prev.filter((key) => {
          const menu = availableMenus.find((m) => buildMenuKey(m) === key);
          return menu?.lunchbox_menu_category !== "กับข้าวที่ 1" && menu?.lunchbox_menu_category !== "ข้าว+กับข้าว";
        });
      });
      setFocusedDish(null);
      return;
    }

    let newSelectedItems = [...selectedMenuItems];
    let hasChanges = false;

    // 1. ตรวจสอบเมนูที่เลือกอยู่ทั้งหมด
    const conflictingItems = availableMenus.filter((m) => selectedMenuItems.includes(buildMenuKey(m)));

    conflictingItems.forEach((oldDish) => {
      const oldMeatType = getMeatType(oldDish.menu_name);

      // ถ้าเป็นเมนูที่มีเนื้อสัตว์ และเนื้อสัตว์ไม่ตรงกับที่เลือกใหม่
      if (oldMeatType && oldMeatType !== newMeatType) {
        // ลองหาเมนูใหม่ที่ประเภทเดียวกัน (Swap)
        const dishType = getDishType(oldDish.menu_name);
        const category = oldDish.lunchbox_menu_category;

        let newDish = null;

        if (dishType) {
          newDish = availableMenus.find((m) => m.lunchbox_menu_category === category && getDishType(m.menu_name) === dishType && m.menu_name.includes(newMeatType));
        }

        // ลบเมนูเดิมออกเสมอ (เพราะมันไม่ตรงกับ Filter)
        const oldKey = buildMenuKey(oldDish);
        newSelectedItems = newSelectedItems.filter((k) => k !== oldKey);
        hasChanges = true;

        // ถ้าหาเมนูเปลี่ยนได้ ให้ใส่เมนูใหม่เข้าไปแทน
        if (newDish) {
          const newKey = buildMenuKey(newDish);
          if (!newSelectedItems.includes(newKey)) {
            newSelectedItems.push(newKey);
          }
        }
      }
    });

    // 2. จัดการเมนูที่รอเลือกเนื้อสัตว์ (Pending Focus)
    if (focusedDish) {
      const matchPending = availableMenus.find((m) => (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") && m.menu_name.includes(focusedDish) && m.menu_name.includes(newMeatType));

      if (matchPending) {
        const key = buildMenuKey(matchPending);
        const category = matchPending.lunchbox_menu_category;

        // ลบเมนูเดิมในหมวดเดียวกันออกก่อน (ถ้ามี) เพื่อป้องกันการเลือกซ้ำ
        if (category && category !== "ข้าว") {
          newSelectedItems = newSelectedItems.filter((selectedKey) => {
            const selectedMenu = availableMenus.find((m) => buildMenuKey(m) === selectedKey);
            return selectedMenu?.lunchbox_menu_category !== category;
          });
          hasChanges = true;
        }

        // เพิ่มเมนูใหม่
        if (!newSelectedItems.includes(key)) {
          newSelectedItems.push(key);
          hasChanges = true;
        }
        setFocusedDish(null); // Clear focus after resolving
      } else {
        // ถ้าหาคู่ไม่ได้ แปลว่าเมนูนี้จะถูกซ่อนจาก Filter -> ต้องเอา Focus ออก
        setFocusedDish(null);
      }
    }

    if (hasChanges) {
      setSelectedMenuItems(newSelectedItems);
    }
  };

  // จัดการคลิกเมนูกลาง (ไม่ต้องเลือกเนื้อ)
  const handleGenericDishClick = (dishType: string, matchingMenu: MenuItemWithAutoRice | null | undefined) => {
    if (selectedMeatType) {
      // การทำงานปกติ (เลือก/ยกเลิก)
      if (matchingMenu) {
        handle.MenuSelection(buildMenuKey(matchingMenu));
      } else {
        alert(`ไม่มีเมนู ${dishType}${selectedMeatType}`);
      }
    } else {
      // สร้างการรอเลือกเนื้อสัตว์
      setFocusedDish((prev) => (prev === dishType ? null : dishType));
    }
  };

  // แสดงหน้าจอรอโหลดข้อมูล
  if (isLoadingLunchboxData) {
    return <Loading context='กำลังโหลดข้อมูลชุดอาหาร' icon={SetFoodIcon.src} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
      {/* Saving Overlay */}
      {isSaving && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-sm w-full'>
            <div className='animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4'></div>
            <h3 className='text-base md:text-lg font-medium text-gray-700 mb-2'>{isEditMode ? "🔧 กำลังบันทึกการแก้ไข" : "💾 กำลังเพิ่มลงตะกร้า"}</h3>
            <p className='text-base text-gray-500'>กรุณารอสักครู่{dots}</p>
          </div>
        </div>
      )}

      {/* CSS สำหรับ Animation */}
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* จัดการ Grid แบบ Responsive */
        /* จัดการ Grid แบบ Responsive */
        .responsive-grid {
          display: grid;
          width: 100%;
        }

        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        @media (min-width: 481px) and (max-width: 640px) {
          .responsive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.25rem;
          }
        }

        @media (min-width: 1025px) {
          .responsive-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1280px) {
          .responsive-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 1.75rem;
          }
        }

        /* การแสดงผลบนมือถือ */
        /* การแสดงผลบนมือถือ */
        @media (max-width: 640px) {
          .mobile-compact {
            padding: 0.5rem;
          }

          .mobile-text-sm {
            font-size: 0.75rem;
            line-height: 1rem;
          }
        }
      `}</style>

      <div className='flex min-h-[100svh]'>
        {/* แผงควบคุมด้านข้าง (Desktop) */}
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
                วันที่{" "}
                {currentTime
                  ? (() => {
                    const date = currentTime;
                    const day = date.toLocaleDateString("th-TH", { day: "2-digit" });
                    const month = date.toLocaleDateString("th-TH", { month: "long" });
                    const year = date.toLocaleDateString("th-TH", { year: "numeric" });
                    const date = currentTime;
                    const day = date.toLocaleDateString("th-TH", { day: "2-digit" });
                    const month = date.toLocaleDateString("th-TH", { month: "long" });
                    const year = date.toLocaleDateString("th-TH", { year: "numeric" });

                    return `${day} ${month} ${year}`;
                  })()
                    return `${day} ${month} ${year}`;
                  })()
                  : "วัน เดือน พ.ศ."}
              </div>
              <div className='text-sm md:text-base xl:text-lg font-bold text-black'>
                เวลา{" "}
                {currentTime
                  ? currentTime.toLocaleTimeString("th-TH", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                    hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                  })
                  : "--:--"}{" "}
                น.
              </div>
            </div>

            {/* ขั้นตอนการเลือก */}
            <div className='space-y-3 xl:space-y-4'>
              {/* Progress Steps */}
              <div className='space-y-3 xl:space-y-4'>
                {/* Step 1: เลือกชุดอาหาร */}
                <button
                  onClick={() => {
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems([]);
                  }}
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectedFoodSet
                    ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                    : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0
                      ? "bg-orange-100 border-2 border-orange-300"
                      : "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                    }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 xl:space-x-4'>
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedFoodSet ? "bg-green-500 text-white" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : "bg-gray-400 text-white"
                          }`}>
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedFoodSet ? "bg-green-500 text-white" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : "bg-gray-400 text-white"
                          }`}>
                        1
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือกชุดอาหาร</div>
                        <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>{selectedFoodSet ? selectedFoodSet : "คลิกเพื่อเลือกชุดอาหาร"}</div>
                      </div>
                    </div>
                    {selectedFoodSet && <span className='text-green-600 text-lg md:text-xl xl:text-2xl'>✓</span>}
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
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectedSetMenu
                    ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                    : selectedFoodSet && !selectedSetMenu
                      ? "bg-orange-100 border-2 border-orange-300"
                      : selectedFoodSet
                        ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                        : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
                    }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 xl:space-x-4'>
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedSetMenu ? "bg-green-500 text-white" : selectedFoodSet && !selectedSetMenu ? "bg-orange-500 text-white" : selectedFoodSet ? "bg-gray-400 text-white" : "bg-gray-300 text-gray-500"
                          }`}>
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectedSetMenu ? "bg-green-500 text-white" : selectedFoodSet && !selectedSetMenu ? "bg-orange-500 text-white" : selectedFoodSet ? "bg-gray-400 text-white" : "bg-gray-300 text-gray-500"
                          }`}>
                        2
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือก Set อาหาร</div>
                        <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>
                          {selectedSetMenu ? (
                            <>
                              {selectedSetMenu.toUpperCase().startsWith("SET") ? selectedSetMenu : `SET ${selectedSetMenu}`}
                              {(() => {
                                const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
                                return limit === 0 ? " (ไม่จำกัด)" : limit > 0 ? ` (${limit} เมนู)` : "";
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
                    {selectedSetMenu && <span className='text-green-600 text-lg md:text-xl xl:text-2xl'>✓</span>}
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
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${selectionCount.total > 0
                    ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                    : selectedSetMenu
                      ? "bg-orange-100 border-2 border-orange-300"
                      : selectedSetMenu
                        ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                        : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
                    }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 xl:space-x-4'>
                      <div className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${selectionCount.total > 0 ? "bg-green-500 text-white" : selectedSetMenu ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-500"}`}>
                        3
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือกเมนูอาหาร</div>
                        <div className='text-xs md:text-sm xl:text-base text-gray-500'>
                          {selectionCount.total > 0 ? `เลือกแล้ว ${selectionCount.total} เมนู${selectionCount.riceCount > 0 ? ` (ข้าว ${selectionCount.riceCount})` : ""}` : selectedSetMenu ? "คลิกเพื่อเลือกเมนูอาหาร" : "เลือก Set อาหารก่อน"}
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
                    onClick={handle.Submit}
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
                      ? "!bg-gray-200 !cursor-not-allowed"
                      : "!bg-gradient-to-r !from-orange-500 !to-pink-500 !hover:from-orange-600 !hover:to-pink-600 transform !hover:scale-105 !hover:shadow-xl !text-white !font-bold"
                      }`}>
                    {isSaving ? (
                      <>
                        <div className='animate-spin w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full'></div>
                        กำลังบันทึก{dots}
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6' />
                        {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มไปยังตะกร้า"}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ปุ่มรีเซ็ต */}
              {(selectedFoodSet || selectedSetMenu || selectedMenuItems.length > 0) && (
                <button
                  onClick={() => {
                    const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems(riceMenus);
                    setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
                    setSelectedMeatType(null);
                    setNote("");
                  }}
                  className='w-full mt-3 xl:mt-4 px-4 py-3 md:px-5 md:py-4 xl:px-6 xl:py-5 bg-red-500 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl hover:bg-red-600 transition-colors min-h-[45px] md:min-h-[50px] xl:min-h-[60px]'>
                  รีเซ็ตการเลือก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนแสดงผลหลัก */}
        <div className='flex-1 flex flex-col min-h-[100svh]'>
          {/* แถบขั้นตอนด้านบน (Mobile) */}
          <div className='lg:hidden'>
            <TopStepper
              step1={selectedFoodSet || null}
              step2={selectedSetMenu || null}
              step3Count={selectionCount.total}
              showEdit={isEditMode}
              editingIndex={editingIndex}
              timeLabel={
                currentTime
                  ? `${currentTime
                    .toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                    .replace(/\//g, "/")} ${currentTime.toLocaleTimeString("th-TH", {
                    .toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                        .replace(/\//g, "/")
                    } ${
                      currentTime.toLocaleTimeString("th-TH", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }`
                  : "--/--/-- --:--"
              }
            />
          </div>

          {/* Scrollable Content - Enhanced responsive design */}
          <div
            className='flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-6 xl:pb-8 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 backdrop-blur-sm'
            onScroll={(e) => {
              const scrollTop = (e.target as HTMLDivElement).scrollTop;
              setIsScrolled(scrollTop > 50);
            }}
          >
            {/* Sticky Header Container (Image + Search) */}
            <div className={`sticky top-0 z-20 transition-all duration-300 ${isScrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-transparent"}`}>
              {/* Set Image Header - Robust Lookup (Local A-F fallback to API) */}
              {(() => {
                if (!selectedSetMenu) return null;

                const localImage = setImages[selectedSetMenu];
                const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                const setMenuImageName = setData?.lunchbox_set_name_image;
                const apiImage = buildBlobImageUrl(setMenuImageName);

                const displayImage = localImage || apiImage;

                if (!displayImage || failedImages.has(displayImage)) return null;

                return (
                  <div className={`relative w-full overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? "h-0 opacity-0" : "h-40 sm:h-56 lg:h-72 opacity-100"}`}>
                    <img
                      src={displayImage}
                      alt={`Set ${selectedSetMenu}`}
                      className="w-full h-full object-cover object-center"
                      onError={() => {
                        setFailedImages((prev) => new Set(prev).add(displayImage));
                      }}
                    />
                    {/* Gradient Overlay for better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Content on Image */}
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[2px] text-orange-400 drop-shadow-sm">Selected Set</span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black drop-shadow-xl tracking-tight">SET {selectedSetMenu}</h2>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Search and Filter Section - Improved responsive layout */}
              <div className={`bg-white/70 backdrop-blur-md p-3 sm:p-4 lg:p-6 transition-all duration-300 ${isScrolled ? "p-2 sm:p-2 lg:p-3 shadow-none border-b border-gray-100" : "rounded-b-2xl shadow-lg border border-white/20 mb-4"}`}>
                <div className='sticky flex flex-col gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4'>
                  <div className='flex-1 relative w-full'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5' />
                    <input
                      type='text'
                      placeholder='ค้นหาเมนูอาหาร'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-10 py-2.5 sm:py-3 lg:py-4 bg-white/80 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm sm:text-base'
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1'>
                        ✕
                      </button>
                    )}
                  </div>

                  <div className='flex items-center justify-center sm:justify-start gap-2'>
                    <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                      <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}>
                        <Grid3X3 className='w-4 h-4' />
                      </button>
                      <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-sm text-orange-600" : "text-gray-500 hover:text-gray-700"}`}>
                        <List className='w-4 h-4' />
                      </button>
                    </div>

                    <button className='flex items-center gap-2 px-3 py-2 bg-white/80 border border-gray-200 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 text-gray-700'>
                      <Filter className='w-4 h-4' />
                      <span className='text-sm font-medium hidden sm:inline'>ตัวกรอง</span>
                    </button>
                  </div>
                </div>

                {searchQuery && (
                  <div className='text-xs sm:text-sm text-gray-600'>
                    ค้นหา &ldquo;{searchQuery}&rdquo; - พบ {filteredMenus.length} รายการ
                  </div>
                )}
              </div>
            </div>

            {/* Selection Area - Enhanced responsive grids */}
            <div className='mb-6 lg:mb-8 xl:mb-12 px-3 sm:px-4 lg:px-6'>
              {/* Step 1: เลือกชุดอาหาร */}
              {!selectedFoodSet && (
                <div>
                  <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
                    <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. เลือกชุดอาหาร</span>
                    <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableFoodSets.length} รายการ</span>
                  </h2>

                  <div className='grid grid-cols-1 gap-4'>
                    {availableFoodSets.map((foodSet, index) => {
                      // หาภาพ lunchbox_name_image จาก lunchboxData
                      const foodSetData = lunchboxData.find((item) => item.lunchbox_name === foodSet);
                      const foodSetImageName = foodSetData?.lunchbox_name_image;

          // ไอคอนเริ่มต้น
          const FoodSetFallbackIcon = (
            <svg width={100} height={100} version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
              <path style={{ fill: "#4DA3FF" }} d='M379.089,134.898v247.18c0,11.396,9.238,20.634,20.634,20.634h91.643c11.396,0,20.634-9.238,20.634-20.634v-247.18C512,134.898,379.089,134.898,379.089,134.898z' />
              <rect x='379.087' y='134.902' style={{ opacity: 0.3, fill: "#333333" }} width='132.913' height='20.756' />
              <rect x='379.087' y='62.138' style={{ fill: "#8AE6A1" }} width='132.913' height='72.76' />
              <path style={{ opacity: 0.15, fill: "#333333" }} d='M405.899,382.078v-247.18h-26.81v247.18c0,11.396,9.238,20.634,20.634,20.634h26.81C415.137,402.712,405.899,393.474,405.899,382.078z' />
              <path style={{ fill: "#FFCA66" }} d='M20.358,402.712h312.426c11.244,0,20.358-9.114,20.358-20.358V175.886c0-11.244-9.114-20.358-20.358-20.358H20.358C9.114,155.528,0,164.643,0,175.886v206.468C0,393.598,9.114,402.712,20.358,402.712z' />
              <path style={{ fill: "#FF8095" }} d='M295.214,199.283H57.93c-7.829,0-14.176,6.347-14.176,14.176v131.326c0,7.829,6.347,14.176,14.176,14.176h237.284c7.829,0,14.176-6.347,14.176-14.176V213.458C309.39,205.628,303.043,199.283,295.214,199.283z' />
              <circle style={{ fill: "#D9576D" }} cx='363.526' cy='378.12' r='71.742' />
              <path
                style={{ opacity: 0.15, fill: "#333333" }}
                d='M316.405,378.118c0-35.419,25.677-64.823,59.427-70.664c-4.002-0.693-8.111-1.075-12.311-1.075c-39.62,0-71.738,32.119-71.738,71.738c0,39.62,32.118,71.738,71.738,71.738c4.2,0,8.309-0.382,12.311-1.073C342.082,442.941,316.405,413.537,316.405,378.118z'
              />
              <path style={{ fill: "#8AE6A1" }} d='M331.519,270.708c-3.873,9.849-1.834,21.483,6.127,29.443c7.96,7.96,19.596,9.999,29.443,6.127c3.873-9.849,1.834-21.483-6.127-29.443C353.001,268.874,341.366,266.836,331.519,270.708z' />
            </svg>
          );

          return (
            <div
              key={index}
              className='group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]'
              onClick={() => setSelectedFoodSet(foodSet)}>
              <div className='aspect-square bg-[linear-gradient(to_bottom_right,var(--color-orange-100),var(--color-orange-200),var(--color-orange-300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden'>
                <LunchboxImage imageName={foodSetImageName} alt={`ชุด ${foodSet}`} fallbackIcon={FoodSetFallbackIcon} />
              </div>
              <div className='text-center p-2 sm:p-3 lg:p-4'>
                <h3 className='font-semibold text-gray-800 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-orange-600 transition-colors duration-200 line-clamp-2'>ชุด {foodSet}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Step 2: เลือก Set อาหาร */}
  {selectedFoodSet && !selectedSetMenu && (
    <div className='px-4 sm:px-6 lg:px-8'>
      <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
        <span className='bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>2. เลือก Set อาหาร</span>
        <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableSetMenus.length} รายการ</span>
      </h2>

                  <div className='grid grid-cols-1 gap-4'>
                    {availableSetMenus.map((setMenu, index) => {
                      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === setMenu);
                      const limit = setData?.lunchbox_limit || 0;
                      // หาภาพ lunchbox_set_name_image จาก lunchboxData
                      const setMenuImageName = setData?.lunchbox_set_name_image;
                      // สร้าง URL เต็มจาก Blob Store
                      const setMenuImage = setMenuImageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${setMenuImageName}` : null;

          return (
            <div
              key={index}
              className='group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]'
              onClick={() => setSelectedSetMenu(setMenu)}>
              <div className='aspect-square bg-[linear-gradient(to_bottom_right,theme(colors.blue.100),theme(colors.blue.200),theme(colors.blue.300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden'>
                {setMenuImage && !failedImages.has(setMenuImage) ? (
                  <img
                    src={setMenuImage}
                    alt={`Set ${setMenu}`}
                    className='min-w-full min-h-full object-cover object-center'
                    onError={() => {
                      setFailedImages((prev) => new Set(prev).add(setMenuImage));
                    }}
                  />
                ) : (
                  <img src={FoodMenuSetIcon.src} className='w-[100px] h-[100px]' alt='' />
                )}
              </div>

              <div className='text-center p-2 sm:p-3 lg:p-4'>
                <h3 className='font-semibold text-gray-800 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2'>{setMenu.toUpperCase().startsWith("SET") ? setMenu : `SET ${setMenu}`}</h3>
                {/* แสดงข้อความแตกต่างกันตาม limit */}
                {limit === 0 ? (
                  <div className='bg-purple-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full inline-block'>ไม่จำกัดจำนวนเมนู</div>
                ) : limit > 0 ? (
                  <div className='bg-blue-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full inline-block'>เลือกได้ {limit} เมนู</div>
                ) : null}
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
                  <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 flex flex-col flex-wrap gap-2'>
                    <div className="flex items-center justify-between w-full">
                      <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>3. เลือกเมนูอาหาร</span>
                      <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{filteredMenus.length} รายการ</span>
                    </div>
                    {(() => {
                      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                      const limit = setData?.lunchbox_limit || 0;
                      const selected = selectionCount.total;
                      const isUnlimited = limit === 0;

                      return (
                        <div className='flex gap-2 flex-wrap'>
                          {/* แสดงข้อความแตกต่างกันตาม limit */}
                          {isUnlimited ? (
                            <span className='text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full w-fit'>เลือกแล้ว {selected} เมนู</span>
                          ) : (
                            <>
                              <span className='text-xs sm:text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full w-fit'>
                                เลือกแล้ว {selected}/{limit}
                              </span>
                              {selected >= limit && <span className='text-xs sm:text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full w-fit'>ครบแล้ว!</span>}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </h2>

                  {/* Category Meat Filter */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex gap-2 pt-2 pl-2 overflow-x-auto pb-2 scrollbar-none">
                      {["ทั้งหมด", "หมู", "ไก่", "กุ้ง", "หมึก", "ทะเล"].map((meat) => {
                        const isActive = (meat === "ทั้งหมด" && selectedMeatFilter === null) || selectedMeatFilter === meat;
                        return (
                          <button
                            key={meat}
                            onClick={() => setSelectedMeatFilter(meat === "ทั้งหมด" ? null : meat)}
                            className={`px-6 py-2 rounded-full text-base font-medium whitespace-nowrap transition-all duration-200 border ${isActive
                              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105 border-transparent ring-2 ring-orange-300 ring-offset-2"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                              }`}
                          >
                            {meat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

      {/* ส่วนบันทึกเพิ่มเติม (Mobile) */}
      {selectedMenuItems.length > 0 && (
        <div className='lg:hidden mb-3 sm:mb-4 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200'>
          <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-2'>หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='ระบุข้อมูลเพิ่มเติม...'
            className='w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm text-gray-700 placeholder-gray-400 resize-none'
            rows={2}
          />
        </div>
      )}

                  {isLoadingMenus ? (
                    <div className='flex items-center justify-center py-8 sm:py-12 lg:py-16'>
                      <div className='text-center'>
                        <div className='animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4'></div>
                        <p className='text-gray-600 text-sm sm:text-base'>กำลังโหลดเมนู...</p>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4 sm:space-y-6 lg:space-y-8'>
                      {(() => {
                        // Group menus by category and sort (use filtered menus)
                        const menusToDisplay = filteredMenus;
                        const groupedMenus = menusToDisplay.reduce((groups, menu) => {
                          const category = menu.lunchbox_menu_category || "อื่นๆ";
                          if (!groups[category]) {
                            groups[category] = [];
                          }
                          groups[category].push(menu);
                          return groups;
                        }, {} as Record<string, typeof availableMenus>);

            // ตรวจสอบว่ามีหมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว" หรือไม่
            const hasRiceWithDishCategory = groupedMenus["กับข้าวที่ 1"] || groupedMenus["ข้าว+กับข้าว"];
            const riceWithDishCategory = groupedMenus["กับข้าวที่ 1"] || groupedMenus["ข้าว+กับข้าว"] || [];

            // กำหนดลำดับหมวดหมู่ (เอา "กับข้าวที่ 1" และ "ข้าว+กับข้าว" ออกก่อน)
            const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];
            const sortedCategories = Object.keys(groupedMenus)
              .sort((a, b) => {
                const indexA = categoryOrder.indexOf(a);
                const indexB = categoryOrder.indexOf(b);
                // เรียงตามลำดับที่กำหนด
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // เรียงหมวดที่กำหนดไว้ก่อน
                if (indexB !== -1) return 1;
                // หรือเรียงตามตัวอักษร
                return a.localeCompare(b, "th");
              })
              .filter((category) => category !== "ข้าว" && category !== "กับข้าวที่ 1" && category !== "ข้าว+กับข้าว");

            return (
              <>
                {/* Step 1: แสดงหมวด "ข้าว+กับข้าว" ก่อน */}
                {hasRiceWithDishCategory && (
                  <div className='space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8'>
                    <div className='flex items-center gap-2 sm:gap-4'>
                      <h3 className='text-sm sm:text-base lg:text-lg font-bold text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. หมวดหมู่: ข้าว+กับข้าว</h3>
                      <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                      <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full'>{riceWithDishCategory.length} เมนู</span>
                    </div>

                    <div className='flex flex-wrap gap-3 sm:gap-4'>
                      {genericDishTypes.map((dishType) => {
                        // ค้นหาเมนูที่ตรงกัน (ถ้าเลือกเนื้อสัตว์แล้ว)
                        const matchingMenu = selectedMeatType ? riceWithDishCategory.find((m) => m.menu_name.includes(dishType) && m.menu_name.includes(selectedMeatType)) : null;

                        // หาราคาเดิมจากเมนูหมูหรือไก่ (ราคาไม่เพิ่ม) เสมอ
                        const basePriceMenu = riceWithDishCategory.find((m) => {
                          const hasDishType = m.menu_name.includes(dishType);
                          const hasPork = m.menu_name.includes("หมู");
                          const hasChicken = m.menu_name.includes("ไก่");
                          return hasDishType && (hasPork || hasChicken);
                        });

                        // ถ้าไม่มีเมนูหมูหรือไก่ ให้หาเมนูอื่นที่ไม่มีราคาเพิ่มเติม (ไม่ใช่หมึก, กุ้ง, ทะเล)
                        const representativeMenu =
                          basePriceMenu ||
                          riceWithDishCategory.find((m) => {
                            const hasDishType = m.menu_name.includes(dishType);
                            const hasExpensiveMeat = m.menu_name.includes("หมึก") || m.menu_name.includes("กุ้ง") || m.menu_name.includes("ทะเล");
                            return hasDishType && !hasExpensiveMeat;
                          }) ||
                          riceWithDishCategory.find((m) => m.menu_name.includes(dishType));

                        // ตรวจสอบสถานะการเลือก
                        const isDishTypeSelected = selectedMeatType ? (matchingMenu ? selectedMenuItems.includes(buildMenuKey(matchingMenu)) : false) : focusedDish === dishType;

                        // ถ้าเลือกเนื้อสัตว์แล้วแต่ไม่มีเมนูที่ตรงกัน ให้ซ่อน
                        const isUnavailable = selectedMeatType && !matchingMenu;

                        if (isUnavailable) return null;

                        // Step 2: แสดงราคาตามเนื้อสัตว์ที่เลือก (แสดงราคาเดิม ไม่เพิ่มราคา)
                        let displayPrice = 0;

                        // แสดงราคาเดิมจากเมนูหมูหรือไก่เสมอ (ไม่ว่าจะเลือกเนื้อสัตว์อะไร)
                        if (basePriceMenu) {
                          displayPrice = getPrice(basePriceMenu);
                        } else if (representativeMenu) {
                          // ถ้าไม่มีเมนูหมูหรือไก่ ให้แสดงราคาจากเมนูที่ไม่มีราคาเพิ่มเติม
                          displayPrice = getPrice(representativeMenu);
                        }

                        return (
                          <MenuCard
                            className='cursor-pointer w-full sm:w-[320px]'
                            key={dishType}
                            menuId={`group-${dishType}`}
                            name={dishType}
                            price={displayPrice}
                            variant='list'
                            category='กับข้าวที่ 1'
                            meatType={(selectedMeatType as any) || null}
                            selected={isDishTypeSelected}
                            faded={(() => {
                              if (isDishTypeSelected) return false;

                              // 1. ถ้ามีเมนูอื่นในหมวดเดียวกันถูกเลือกไปแล้ว
                              const hasCategorySelection = availableMenus.some((m) =>
                                (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
                                selectedMenuItems.includes(buildMenuKey(m))
                              );
                              if (hasCategorySelection) return true;

                              // 2. ถ้ามีไอเทมอื่นกำลัง focused อยู่ (รอเลือกเนื้อ)
                              if (focusedDish && focusedDish !== dishType) return true;

                              return false;
                            })()}
                            size={isMobile ? "sm" : "md"}
                            showPrice={true}
                            onClick={() => {
                              handleGenericDishClick(dishType, matchingMenu);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: แสดงตัวกรองเนื้อสัตว์ (หลังจากหมวด "ข้าว+กับข้าว") */}
                {hasRiceWithDishCategory && (
                  <div className='space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8'>
                    <div className='flex items-center gap-2 sm:gap-4'>
                      <h3 className='text-sm sm:text-base lg:text-lg font-bold text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>2. หมวดหมู่: เลือกเนื้อสัตว์</h3>
                      <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                      <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap'>{dynamicMeatTypes.length} รายการ</span>
                    </div>

                    <div className='flex flex-wrap gap-3 sm:gap-4'>
                      {dynamicMeatTypes.map((meat) => {
                        // กำหนดราคาเพิ่มเติมตามประเภทเนื้อสัตว์
                        const meatPriceMap: Record<string, number> = {
                          หมู: 0,
                          ไก่: 0,
                          หมึก: 10,
                          กุ้ง: 10,
                          ทะเล: 10,
                        };
                        const additionalPrice = meatPriceMap[meat] || 0;
                        const isAdditional = additionalPrice > 0;

                        return (
                          <MenuCard
                            key={meat}
                            className='cursor-pointer w-full sm:w-[320px]'
                            menuId={`filter-${meat}`}
                            name={meat}
                            variant='list'
                            selected={selectedMeatType === meat}
                            faded={selectedMeatType !== null && selectedMeatType !== meat}
                            showPrice={isAdditional}
                            price={additionalPrice}
                            isAdditionalPrice={isAdditional}
                            size={isMobile ? "sm" : "md"}
                            onClick={() => handleMeatFilterChange(selectedMeatType === meat ? null : meat)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* แสดงหมวดหมู่อื่นๆ หลังจาก "ข้าว+กับข้าว" และตัวกรองเนื้อสัตว์ */}
                {sortedCategories.map((category) => {
                  const menusInCategory = groupedMenus[category];
                  const isCategoryHasSelection = availableMenus.some((m) => (m.lunchbox_menu_category || "อื่นๆ") === category && selectedMenuItems.includes(buildMenuKey(m)));

                  // ตรวจสอบว่าหมวดนี้ถูกล็อคหรือไม่
                  const isLocked = isCategoryLocked(category);
                  const previousCategory = getPreviousRequiredCategory(category);

                  // เรียงลำดับเมนู
                  const sortedMenus = [...menusInCategory].sort((a, b) => {
                    const dishA = getDishType(a.menu_name);
                    const dishB = getDishType(b.menu_name);
                    const dishIndexA = dishA ? dishOrder.indexOf(dishA) : -1;
                    const dishIndexB = dishB ? dishOrder.indexOf(dishB) : -1;

                    if (dishIndexA !== -1 && dishIndexB !== -1) {
                      if (dishIndexA !== dishIndexB) return dishIndexA - dishIndexB;
                      const meatA = getMeatType(a.menu_name);
                      const meatB = getMeatType(b.menu_name);
                      const meatIndexA = meatA ? meatOrder.indexOf(meatA) : -1;
                      const meatIndexB = meatB ? meatOrder.indexOf(meatB) : -1;
                      if (meatIndexA !== -1 && meatIndexB !== -1) {
                        if (meatIndexA !== meatIndexB) return meatIndexA - meatIndexB;
                      }
                      if (meatIndexA !== -1) return -1;
                      if (meatIndexB !== -1) return 1;
                      return a.menu_name.localeCompare(b.menu_name, "th");
                    }

                    const meatA = getMeatType(a.menu_name);
                    const meatB = getMeatType(b.menu_name);
                    const indexA = meatA ? meatOrder.indexOf(meatA) : -1;
                    const indexB = meatB ? meatOrder.indexOf(meatB) : -1;

                            if (indexA !== -1 && indexB !== -1) {
                              if (indexA !== indexB) return indexA - indexB;
                              return a.menu_name.localeCompare(b.menu_name, "th");
                            }
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                            // ถ้าทั้งคู่ไม่มีประเภทเนื้อสัตว์ ให้เรียงตามตัวอักษร
                            return a.menu_name.localeCompare(b.menu_name, "th");
                          });

                          // ตรวจสอบข้อมูล Set และ Limit ครั้งเดียวต่อหมวดหมู่เพื่อความรวดเร็ว
                          const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                          const limit = setData?.lunchbox_limit ?? 0;
                          const isUnlimited = limit === 0;
                          const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

                          // ตรวจสอบว่าในหมวดหมู่นี้มีการเลือกเมนูไปแล้วหรือไม่ (สำหรับเอฟเฟกต์สีจางเฉพาะหมวด)
                          const isCategoryHasSelection = menusInCategory.some(menu => selectedMenuItems.includes(buildMenuKey(menu)));

                  return (
                    <div key={category} className={`space-y-3 sm:space-y-4 lg:space-y-6 ${isLocked ? "opacity-40 pointer-events-none" : ""}`}>
                      <div className='flex items-center gap-2 sm:gap-4'>
                        <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isLocked ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                          {isLocked ? "🔒" : isCategoryHasSelection ? "✓" : "🔓"} หมวดหมู่: {category}
                        </h3>
                        <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                        <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${isLocked ? "bg-gray-100 text-gray-500" : "bg-orange-100 text-orange-600"}`}>{menusInCategory.length} เมนู</span>
                      </div>

                              {/* Menus Grid for this category - Improved responsive layout แก้ตรงนี้*/}
                              {/* Menus List (Responsive Grid max 4) */}
                              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                                {menusInCategory.map((menu, index) => {
                                  const menuKey = buildMenuKey(menu);
                                  const isSelected = selectedMenuItems.includes(menuKey);

                                  // (ข้อมูล limit และ isUnlimited ถูกดึงมาด้านบนแล้ว)

                          const isSidedishesSet =
                            (selectedFoodSet === "Lunch Box" && (selectedSetMenu === "E" || selectedSetMenu === "F")) ||
                            (selectedFoodSet === "อาหารเจ" && selectedSetMenu === "D") ||
                            (selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht" || selectedSetMenu === "379 baht"));
                          const isSidedishCategory = menu.lunchbox_menu_category === "เครื่องเคียง";
                          const isPremium379 = selectedFoodSet === "Premium Lunch" && selectedSetMenu === "379 baht";
                          const isMainDishCategory = menu.lunchbox_menu_category === "กับข้าวที่ 1";
                          const isDrinksSet = selectedFoodSet === "Drinks" && selectedSetMenu === "เครื่องดื่ม";
                          const isOtherCategory = menu.lunchbox_menu_category === "อื่นๆ";

                          let isLunchboxCategoryTaken = false;
                          // ทุกหมวดหมู่เลือกได้แค่ 1 อย่างเดียว (ยกเว้นข้าว)
                          if (menu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว") {
                            const selectedLunchboxCategories = availableMenus
                              .filter((m) => selectedMenuItems.includes(buildMenuKey(m)))
                              .map((m) => m.lunchbox_menu_category)
                              .filter((category) => category);

                                    // กรณีพิเศษ: Premium Lunch Set "379 baht" - ให้เลือกเครื่องเคียงได้ 3 อย่าง
                                    if (isPremium379 && isSidedishCategory) {
                                      // นับจำนวนเมนูในหมวด "เครื่องเคียง" ที่เลือกไว้แล้ว
                                      const sidedishCount = availableMenus.filter((m) => selectedMenuItems.includes(m.menu_name) && m.lunchbox_menu_category === "เครื่องเคียง").length;

                                      // ถ้าเลือกครบ 3 อย่างแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก
                                      isLunchboxCategoryTaken = sidedishCount >= 3 && !isSelected;
                                    }
                                    // กรณีพิเศษ: ถ้าเป็น Lunch Box Set E หรือ F หรือ อาหารเจ Set D หรือ Premium Lunch Set "270 baht", "300 baht" และเป็นหมวด "เครื่องเคียง" ให้ตรวจสอบจำนวนที่เลือกไว้แล้ว
                                    else if (
                                      ((selectedFoodSet === "Lunch Box" && (selectedSetMenu === "E" || selectedSetMenu === "F")) ||
                                        (selectedFoodSet === "อาหารเจ" && selectedSetMenu === "D") ||
                                        (selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht"))) &&
                                      isSidedishCategory
                                    ) {
                                      // นับจำนวนเมนูในหมวด "เครื่องเคียง" ที่เลือกไว้แล้ว
                                      const sidedishCount = availableMenus.filter((m) => selectedMenuItems.includes(buildMenuKey(m)) && m.lunchbox_menu_category === "เครื่องเคียง").length;

                                      // ถ้าเลือกครบ 2 อย่างแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก
                                      isLunchboxCategoryTaken = sidedishCount >= 2 && !isSelected;
                                    }
                                    // เพิ่มเงื่อนไขสำหรับ Premium Lunch Set "379 baht" - ให้เลือกกับข้าวได้ 2 อย่าง
                                    else if (isPremium379 && isMainDishCategory) {
                                      // นับจำนวนเมนูในหมวด "กับข้าว" ที่เลือกไว้แล้ว
                                      const mainDishCount = availableMenus.filter((m) => selectedMenuItems.includes(buildMenuKey(m)) && m.lunchbox_menu_category === "กับข้าว").length;

                                      // ถ้าเลือกครบ 2 อย่างแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก
                                      isLunchboxCategoryTaken = mainDishCount >= 2 && !isSelected;
                                    }
                                    // เพิ่มเงื่อนไขสำหรับ Drinks set - ให้เลือกได้ 1 อย่างต่อ 1 หมวด ยกเว้นหมวด "อื่นๆ"
                                    else if (isDrinksSet && !isOtherCategory && menu.lunchbox_menu_category && selectedLunchboxCategories.includes(menu.lunchbox_menu_category) && !isSelected) {
                                      isLunchboxCategoryTaken = true;
                                    }
                                    // กรณีปกติ: ถ้าหมวดนั้นถูกเลือกไปแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก (ยกเว้น Drinks set ที่เป็นหมวด "อื่นๆ" หรือ limit = 1 ให้เลือกเปลี่ยนได้)
                                    else if (menu.lunchbox_menu_category && selectedLunchboxCategories.includes(menu.lunchbox_menu_category) && !isSelected && !(isDrinksSet && isOtherCategory) && limit !== 1) {
                                      isLunchboxCategoryTaken = true;
                                    }
                                  }

                                  const isAutoSelectedRice = menu.lunchbox_menu_category === "ข้าว" && isSelected;

                                  // ตรวจสอบว่าเป็นข้าวที่เพิ่มอัตโนมัติจาก flag บนเมนูหรือไม่
                                  const shouldAutoAddRice = menu.lunchbox_AutoRice === true;

                                  // ตรวจสอบประเภทเนื้อสัตว์สำหรับแสดงสี
                                  const menuMeatType = getMeatType(menu.menu_name);

                                  // Check if any menu is selected to trigger fade effect
                                  const isAnySelected = selectedMenuItems.length > 0;

                                  return (
                                    <MenuCard
                                      className='cursor-pointer'
                                      key={menu.menu_id || index}
                                      menuId={menu.menu_id || String(index)}
                                      name={menu.menu_name}
                                      price={getPrice(menu)}
                                      category={menu.lunchbox_menu_category || undefined}
                                      emoji={undefined}
                                      image={undefined}
                                      meatType={menuMeatType}
                                      variant="list"
                                      faded={isCategoryHasSelection && !isSelected}
                                      selected={isSelected}
                                      forced={isAutoSelectedRice && !isUnlimited}
                                      duplicate={!!isLunchboxCategoryTaken}
                                      showPrice={menu.lunchbox_showPrice ?? true}
                                      onClick={() => {
                                        if (!isLunchboxCategoryTaken) {
                                          handle.MenuSelection(menuKey);
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              )}

  {/* แสดงเมื่อไม่พบข้อมูล */}
  {selectedFoodSet && selectedSetMenu && searchQuery.trim() && filteredMenus.length === 0 && (
    <div className='text-center py-8 sm:py-12 lg:py-16'>
      <div className='w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-orange-200 to-pink-300 rounded-full flex items-center justify-center'>
        <svg className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
        </svg>
      </div>
      <h3 className='text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-2'>ไม่พบเมนูที่ค้นหา</h3>
      <p className='text-xs sm:text-sm lg:text-base text-gray-500 mb-4'>ไม่พบ &ldquo;{searchQuery}&rdquo; ในเมนูชุดนี้</p>
      <button onClick={() => setSearchQuery("")} className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm'>
        ล้างการค้นหา
      </button>
    </div>
  )}
</div>
            </div >

  {/* แถบเมนูด้านล่าง (Mobile) */ }
  < MobileActionBar
canSubmit = {(() => {
  if (selectionCount.total === 0) return false;

  // ตรวจสอบการเลือกครบตามจำนวน
  const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
  const limit = setData?.lunchbox_limit ?? 0;

  if (limit > 0) {
    return selectionCount.total === limit;
  }
  return true;
})()}
saving = { isSaving }
editMode = { isEditMode }
totalCost = {(() => {
  if (selectionCount.total === 0) return null;
  return selectionPrice;
})()}
onSubmit = { handle.Submit }
onReset = {() => {
  const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => menu.menu_name);
  setSelectedFoodSet("");
  setSelectedSetMenu("");
  setSelectedMenuItems(riceMenus);
  setSelectedMeatType(null);
  setNote("");
}}
            />
          </div >
        </div >
      </div >
    </div >
  );
}
