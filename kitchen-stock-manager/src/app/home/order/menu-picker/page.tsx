"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Search, Filter, Grid3X3, List, Send, Minus, Plus } from "lucide-react";

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

// ==================== ชนิดข้อมูล (Types) ====================
type MenuItemWithAutoRice = MenuItem & { lunchbox_AutoRice?: boolean | null; lunchbox_showPrice?: boolean };

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [Optional, setOptional] = useState<object>({
    lunchbox_name: "Drinks",
    lunchbox_set_name: "เครื่องดื่ม",
    lunchbox_limit: 0,
  });

  // สถานะสำหรับการแสดงผลบนมือถือ
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const router = useRouter();
  const { addLunchbox } = useCartStore();

  // สถานะสำหรับการเลือกเมนู
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>("");
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  // สถานะจำนวนข้าว
  const [riceQuantity, setRiceQuantity] = useState<number>(0);
  const [lunchboxQuantity, setLunchboxQuantity] = useState<number>(1);
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItemWithAutoRice[]>([]);
  const [note, setNote] = useState<string>("");
  // สร้างคีย์เมนูที่ไม่ซ้ำกัน
  const buildMenuKey = (menu: Partial<MenuItemWithAutoRice>) => menu.lunchbox_menuid ?? `${menu.menu_id ?? ""}-${menu.lunchbox_menu_category ?? ""}-${menu.menu_name ?? ""}`;
  // ฟังก์ชันดึงราคา
  const getPrice = (menu?: Partial<MenuItemWithAutoRice>) => getNormalizedPrice(menu);

  // ==================== ฟังก์ชันช่วยทำงาน ====================
  // ค้นหาข้อมูลชุดอาหาร
  const getSetData = (foodSet: string, setMenu: string) => lunchboxData.find((item) => item.lunchbox_name === foodSet && item.lunchbox_set_name === setMenu);

  // ตรวจสอบจำนวนเมนูที่เลือกได้
  const getSetLimit = (foodSet: string, setMenu: string) => getSetData(foodSet, setMenu)?.lunchbox_limit ?? 0;

  // สร้าง URL สำหรับรูปภาพ
  const buildBlobImageUrl = (imageName?: string | null) => (imageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${imageName}` : null);

  // คอมโพเนนต์แสดงรูปภาพ
  const LunchboxImage = ({ imageName, alt, fallbackIcon }: { imageName?: string | null; alt: string; fallbackIcon: React.ReactNode }) => {
    const imageUrl = buildBlobImageUrl(imageName);

    if (!imageUrl || failedImages.has(imageUrl)) {
      return <>{fallbackIcon}</>;
    }

    return <img src={imageUrl} alt={alt} className='min-w-full min-h-full object-cover object-center' onError={() => setFailedImages((prev) => new Set(prev).add(imageUrl))} />;
  };

  // สถานะโหมดแก้ไข
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true);
  // รายการรูปที่โหลดไม่ผ่าน
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dots = useLoadingDots();

  const extractPriceFromSetName = (setName: string): number | null => {
    const match = setName.match(/(\d+)\s*baht/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // เรียงลำดับข้อความ (ไทย/อังกฤษ + ตัวเลข)
  const sortStrings = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b, "th", { numeric: true, sensitivity: "base" }));

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
  const meatOrder = ["หมู", "ไก่", "หมึก", "กุ้ง"];
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

  // ฟังก์ชันดึงราคาที่ปรับจูนแล้ว (Normalize price for categories that shouldn't have meat surcharges)
  const getNormalizedPrice = (menu?: Partial<MenuItemWithAutoRice>) => {
    if (!menu) return 0;

    // ถ้าเป็นหมวดจานหลัก ให้ใช้ราคาสม่ำเสมอ (ไม่บวกราคาเนื้อสัตว์เพิ่ม)
    if (menu.lunchbox_menu_category === "กับข้าวที่ 1" || menu.lunchbox_menu_category === "ข้าว+กับข้าว") {
      const dishType = getDishType(menu.menu_name || "");
      if (dishType) {
        const variants = availableMenus.filter(m =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          getDishType(m.menu_name || "") === dishType
        );
        if (variants.length > 0) {
          // ใช้ราคาที่ถูกที่สุด (มักจะเป็น หมู/ไก่) เป็นราคากลางของจานนี้
          return Math.min(...variants.map(v => v.lunchbox_cost || 0));
        }
      }
    }

    return menu.lunchbox_cost ?? 0;
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

  // กรองเมนูตามคำค้นหาและประเภทเนื้อสัตว์
  const filteredMenus = useMemo(() => {
    let result = availableMenus;

    // 1. Filter by Meat Type (เฉพาะหมวดหมู่ "กับข้าวที่ 1")
    if (selectedMeatType) {
      result = result.filter((menu) => {
        // ถ้าไม่ใช่หมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว" ให้ปล่อยผ่าน (ไม่กรอง)
        if (menu.lunchbox_menu_category !== "กับข้าวที่ 1" && menu.lunchbox_menu_category !== "ข้าว+กับข้าว") return true;

        const menuName = menu.menu_name || "";
        return menuName.includes(selectedMeatType);
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const normalizedQuery = normalizeThaiText(query);

      result = result.filter((menu) => {
        const normalizedMenuName = normalizeThaiText(menu.menu_name?.toLowerCase() || "");
        const normalizedMenuSubname = normalizeThaiText(menu.menu_subname?.toLowerCase() || "");
        const normalizedMenuDescription = normalizeThaiText(menu.menu_description?.toLowerCase() || "");
        const normalizedMenuCategory = normalizeThaiText(menu.lunchbox_menu_category?.toLowerCase() || "");

        return normalizedMenuName.includes(normalizedQuery) || normalizedMenuSubname.includes(normalizedQuery) || (menu.lunchbox_cost ?? 0).toString().includes(query) || normalizedMenuDescription.includes(normalizedQuery) || normalizedMenuCategory.includes(normalizedQuery);
      });
    }

    return result;
  }, [availableMenus, searchQuery, selectedMeatType]);

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

    total += nonRiceMenus.reduce((sum, m) => sum + getNormalizedPrice(m), 0);

    if (riceMenu) {
      const riceCount = riceQuantity > 0 ? riceQuantity : 1;
      total += getNormalizedPrice(riceMenu) * riceCount;
    }

    return total;
  }, [selectedMenuItems, availableMenus, riceQuantity]);

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

    let totalNonRice = nonRiceCount;
    let totalRice = riceCount;

    // เพิ่มจำนวนเมนูที่เลือกแบบ Decoupled (จานหลัก + เนื้อสัตว์)
    if (focusedDish && selectedMeatType) {
      const matchingMenu = availableMenus.find((m) =>
        (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
        m.menu_name.includes(focusedDish) &&
        m.menu_name.includes(selectedMeatType)
      );
      if (matchingMenu) {
        if (matchingMenu.lunchbox_menu_category === "ข้าว+กับข้าว") {
          totalNonRice += 1; // นับเป็นกับข้าว
          totalRice += 1; // นับเป็นข้าว
        } else {
          totalNonRice += 1;
        }
      }
    }

    return {
      nonRiceCount: totalNonRice,
      riceCount: totalRice,
      total: totalNonRice + totalRice,
    };
  }, [selectedMenuItems, availableMenus, riceQuantity]);

  // ==================== Sequential Category Selection Logic ====================
  // Get ordered list of categories that exist in current menu
  const getOrderedCategories = useMemo(() => {
    const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "ข้าว+กับข้าว", "meat-filter", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];

    const existingCategories = [...new Set(availableMenus.map((m) => m.lunchbox_menu_category).filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว"))];

    // Add virtual meat filter if we have a dish category that requires meat
    if (existingCategories.some(cat => cat === "กับข้าวที่ 1" || cat === "ข้าว+กับข้าว")) {
      existingCategories.push("meat-filter");
    }

    return categoryOrder.filter((cat) => existingCategories.includes(cat));
  }, [availableMenus]);

  // Get list of categories that have been selected (excluding rice)
  const getSelectedCategories = useMemo(() => {
    const selected = availableMenus
      .filter((menu) => selectedMenuItems.includes(buildMenuKey(menu)))
      .map((menu) => menu.lunchbox_menu_category)
      .filter((cat): cat is string => cat !== null && cat !== undefined && cat !== "ข้าว");

    // Add virtual flags for sequence logic
    // Unlocks meat filter if a dish is picked or being focused
    if (focusedDish !== null || selected.some(cat => cat === "กับข้าวที่ 1" || cat === "ข้าว+กับข้าว")) {
      if (!selected.includes("กับข้าวที่ 1")) selected.push("กับข้าวที่ 1");
      if (!selected.includes("ข้าว+กับข้าว")) selected.push("ข้าว+กับข้าว");
    }

    // Unlocks subsequent steps if meat is selected
    if (selectedMeatType !== null) {
      selected.push("meat-filter");
    }

    return selected;
  }, [availableMenus, selectedMenuItems, focusedDish, selectedMeatType]);

  // Check if a category is locked (requires previous category to be selected first)
  const isCategoryLocked = useMemo(() => {
    return (category: string) => {
      const categoryIndex = getOrderedCategories.indexOf(category);

      // If not in ordered list, not locked
      if (categoryIndex === -1) return false;

      // First category is always unlocked
      if (categoryIndex === 0) return false;

      // Check if previous category is selected
      const prevCategory = getOrderedCategories[categoryIndex - 1];
      return !getSelectedCategories.includes(prevCategory);
    };
  }, [getOrderedCategories, getSelectedCategories]);

  // Get the previous category that needs to be selected
  const getPreviousRequiredCategory = useMemo(() => {
    return (category: string) => {
      const categoryIndex = getOrderedCategories.indexOf(category);
      if (categoryIndex <= 0) return null;
      return getOrderedCategories[categoryIndex - 1];
    };
  }, [getOrderedCategories]);

  // --- ข้อมูลเงื่อนไขพิเศษของชุดอาหาร (กำหนดโควตาแต่ละหมวด) ---
  const getCategoryLimit = (foodSet: string, setMenu: string, category: string) => {
    if (category === "ข้าว") return 1;

    // --- กลุ่มที่เลือก "เครื่องเคียง" ได้มากกว่า 1 อย่าง ---
    if (category === "เครื่องเคียง") {
      // เฉพาะ Set F ของ Lunch Box
      if (foodSet === "Lunch Box" && setMenu === "F") return 2;
    }

    // มาตรฐานปกติคือเลือกได้ 1 อย่าง (ระบบจะสลับให้อัตโนมัติ)
    return 1;
  };

  const handle = {
    MenuSelection: (menuKey: string) => {
      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setData?.lunchbox_limit ?? 0;
      const selectedMenu = availableMenus.find((menu) => buildMenuKey(menu) === menuKey);
      if (!selectedMenu) return;

      const isRiceMenu = selectedMenu.lunchbox_menu_category === "ข้าว";
      const isUnlimited = limit === 0;

      // ตรวจสอบการเพิ่มข้าวอัตโนมัติ
      const shouldAutoAddRice = selectedMenu.lunchbox_AutoRice === true;

      setSelectedMenuItems((prev) => {
        const isSelected = prev.includes(menuKey);

        if (isSelected) {
          // --- ยกเลิกการเลือก (Unselect Logic) ---
          if (isRiceMenu && !isUnlimited) {
            alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากข้าวเป็นส่วนประกอบหลักของชุดอาหาร");
            return prev;
          }

          let newItems = prev.filter((item) => item !== menuKey);

          // Cascade Clear: เมื่อเอาขั้นตอนก่อนหน้าออก ให้เอาขั้นตอนถัดไปออกทั้งหมด
          if (selectedMenu.lunchbox_menu_category) {
            const currentCatIndex = getOrderedCategories.indexOf(selectedMenu.lunchbox_menu_category);
            if (currentCatIndex !== -1) {
              const followingCategories = getOrderedCategories.slice(currentCatIndex + 1);
              newItems = newItems.filter((key) => {
                const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
                return !m?.lunchbox_menu_category || !followingCategories.includes(m.lunchbox_menu_category);
              });

              // และถ้าเป็นหมวดหมู่จำลอง (เสมือน) เช่น meat-filter อยู่ในลำดับถัดไป ให้เคลียร์ด้วย
              if (followingCategories.includes("meat-filter")) {
                setSelectedMeatType(null);
                setFocusedDish(null);
              }
            }
          } else if (isRiceMenu && isUnlimited) {
            // คลิกที่การ์ดข้าวในชุด Unlimited เพื่อลดจำนวน
            if (riceQuantity > 1) {
              setRiceQuantity(riceQuantity - 1);
              return prev.filter((item) => item !== menuKey);
            } else {
              setRiceQuantity(0);
              return prev.filter((item) => item !== menuKey);
            }
          }

          return newItems;
        } else {
          // --- เลือกเมนูใหม่ (Select Logic with Auto-Swap) ---
          let newItems = [...prev];

          // 1. Auto-Swap (Smart): สลับรายการในหมวดหมู่เดียวกันเมื่อเกินขีดจำกัดของหมวดนั้น
          if (selectedMenu.lunchbox_menu_category) {
            const catLimit = getCategoryLimit(selectedFoodSet, selectedSetMenu, selectedMenu.lunchbox_menu_category);
            const itemsInCategory = newItems.filter((key) => {
              const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
              return m?.lunchbox_menu_category === selectedMenu.lunchbox_menu_category;
            });

            if (itemsInCategory.length >= catLimit) {
              // ถ้าเกินกำหนด (หรือเท่ากับขีดจำกัดแล้วกำลังจะเพิ่มใหม่) ให้เอาตัวเก่าที่สุดในหมวดนี้ออก 1 ตัว
              const oldestKey = itemsInCategory[0];
              newItems = newItems.filter((k) => k !== oldestKey);
            }
          }

          // 2. จัดการเพิ่มข้าวอัตโนมัติ (เฉพาะชุด Unlimited)
          if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
            const riceMenus = availableMenus.filter((m) => m.lunchbox_menu_category === "ข้าว");
            if (riceMenus.length > 0) {
              const riceKey = buildMenuKey(riceMenus[0]);
              // นับเมนูในหมวดเดียวกันหลังจากรวมรายการใหม่ (ที่เอาตัวเก่าออกไปแล้ว)
              const menusInCategory = availableMenus.filter((m) => m.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && m.lunchbox_menu_category !== "ข้าว" && newItems.includes(buildMenuKey(m)));

              setRiceQuantity(menusInCategory.length + 1);

              if (!newItems.includes(riceKey)) {
                newItems.push(riceKey);
              }
            }
          }

          // 3. ตรวจสอบขีดจำกัดจำนวนเมนู (สำหรับชุดปกติ)
          // ถ้าเกินกำหนด (และรายการใหม่ไม่ได้ไปสลับกับใคร) ให้เตะรายการที่เก่าที่สุดออก
          if (!isUnlimited && newItems.length >= limit) {
            return [...newItems.slice(1), menuKey];
          }

          return [...newItems, menuKey];
        }
      });
    },
    Submit: async () => {
      // ตรวจสอบความครบถ้วนพื้นฐาน
      const isWithDish1Complete = focusedDish !== null && selectedMeatType !== null;
      const hasSelections = selectedMenuItems.length > 0 || isWithDish1Complete;

      if (!selectedFoodSet || !selectedSetMenu || !hasSelections) {
        alert("กรุณาเลือกชุดอาหาร, Set อาหาร และเมนูอาหารให้ครบถ้วน");
        return;
      }

      // ตรวจสอบ limit โดยใช้ selectionCount (ที่รวมรายการเสมือนแล้ว)
      const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
      if (limit > 0 && selectionCount.total < limit) {
        alert(`กรุณาเลือกเมนูให้ครบ ${limit} รายการ (เลือกแล้ว ${selectionCount.total} รายการ)`);
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      try {
        // เตรียมรายการเมนูทั้งหมด (รวมรายการใน cart และรายการที่เลือกแยกจากกัน)
        const finalSelectedItems: MenuItemWithAutoRice[] = [];

        // 1. เมนูที่เลือกตามปกติ (ข้าว, กับข้าวที่ 2, ฯลฯ)
        selectedMenuItems.forEach(key => {
          const m = availableMenus.find(menu => buildMenuKey(menu) === key);
          if (m) finalSelectedItems.push(m);
        });

        // 2. เมนูจานหลักที่เพิ่งเลือกแบบแยก (จานหลัก + เนื้อสัตว์)
        if (focusedDish && selectedMeatType) {
          const matchingMenu = availableMenus.find((m) =>
            (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
            m.menu_name.includes(focusedDish) &&
            m.menu_name.includes(selectedMeatType)
          );
          if (matchingMenu) {
            finalSelectedItems.push(matchingMenu);
          }
        }

        // นับจำนวนเมนูเตรียมส่ง API
        const menuCountMap = new Map<string, number>();
        finalSelectedItems.forEach((menu) => {
          const menuKey = buildMenuKey(menu);
          if (menu.lunchbox_menu_category === "ข้าว") {
            menuCountMap.set(menuKey, riceQuantity);
          } else {
            menuCountMap.set(menuKey, (menuCountMap.get(menuKey) || 0) + 1);
          }
        });

        // สร้างรายการเมนูสำหรับบันทึก
        const selectedMenuObjects: MenuItemWithAutoRice[] = [];
        const processedMenuNames = new Set<string>();

        for (const menu of finalSelectedItems) {
          const menuKey = buildMenuKey(menu);
          if (!processedMenuNames.has(menuKey)) {
            const quantity = menuCountMap.get(menuKey) || 1;
            const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;
            const objectsToCreate = isCustomUnlimited ? quantity : 1;

            for (let i = 0; i < objectsToCreate; i++) {
              selectedMenuObjects.push({ ...menu });
            }
            processedMenuNames.add(menuKey);
          }
        }

        // เรียงลำดับเมนูตามหมวดหมู่ก่อนบันทึก
        const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "ข้าว+กับข้าว", "meat-filter", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];
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

        let totalCost: number;
        const setPrice = extractPriceFromSetName(selectedSetMenu);
        if (setPrice !== null) {
          totalCost = setPrice * lunchboxQuantity;
        } else {
          totalCost = selectedMenuObjects.reduce((total, menu) => total + (menu.lunchbox_cost ?? 0), 0) * lunchboxQuantity;
        }

        const newLunchbox = {
          lunchbox_name: selectedFoodSet,
          lunchbox_set: selectedSetMenu.toUpperCase().startsWith("SET") ? selectedSetMenu : `SET ${selectedSetMenu}`,
          lunchbox_limit: limit,
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
        setFocusedDish(null);
        setSelectedMeatType(null);

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
    return <Loading context='ข้อมูลแก้ไข' />;
  }

  // จัดการเปลี่ยนประเภทเนื้อสัตว์และสลับเมนู
  const handleMeatFilterChange = (newMeatType: string | null) => {
    setSelectedMeatType(newMeatType);

    // Cascade Clear: ถ้าเอาเนื้อสัตว์ออก ให้เอาขั้นตอนถัดไปออกทั้งหมด
    if (newMeatType === null) {
      const currentCatIndex = getOrderedCategories.indexOf("meat-filter");
      if (currentCatIndex !== -1) {
        const followingCategories = getOrderedCategories.slice(currentCatIndex + 1);
        setSelectedMenuItems((prev) => prev.filter((key) => {
          const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
          return !m?.lunchbox_menu_category || !followingCategories.includes(m.lunchbox_menu_category);
        }));
      }
    }
  };

  // จัดการคลิกเมนูกลาง (ไม่ต้องเลือกเนื้อ)
  const handleGenericDishClick = (dishType: string) => {
    setFocusedDish((prev) => {
      const isDeselecting = prev === dishType;
      if (isDeselecting) {
        // Cascade Clear: เมื่อเอาขั้นตอนก่อนหน้าออก ให้เอาขั้นตอนถัดไปออกทั้งหมด
        setSelectedMeatType(null);
        const currentCatIndex = getOrderedCategories.indexOf("กับข้าวที่ 1");
        if (currentCatIndex !== -1) {
          const followingCategories = getOrderedCategories.slice(currentCatIndex + 1);
          setSelectedMenuItems((innerPrev) => innerPrev.filter((key) => {
            const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
            return !m?.lunchbox_menu_category || !followingCategories.includes(m.lunchbox_menu_category);
          }));
        }
        return null;
      }
      return dishType;
    });
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
                    const d = date.toLocaleDateString("th-TH", { day: "2-digit" });
                    const m = date.toLocaleDateString("th-TH", { month: "long" });
                    const y = date.toLocaleDateString("th-TH", { year: "numeric" });
                    return `${d} ${m} ${y}`;
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
                  : "--:--"} น.
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
                    setRiceQuantity(0);
                    setLunchboxQuantity(1);
                    setSelectedMeatType(null);
                    setNote("");
                    setSearchQuery("");
                    setFocusedDish(null);
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
                      setRiceQuantity(0);
                      setNote("");
                      setSelectedMeatType(null);
                      setSearchQuery("");
                      setFocusedDish(null);
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
                  ? `${currentTime.toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })} ${currentTime.toLocaleTimeString("th-TH", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                  : "--/--/-- --:--"
              }
            />
          </div>

          {/* ส่วนเนื้อหา */}
          <div className='flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-6 xl:pb-8 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 backdrop-blur-sm'>
            {/* ส่วนหัว (รูปภาพ + ค้นหา) */}
            <div className='relative z-20 transition-all duration-300 bg-transparent'>
              {/* รูปภาพชุดอาหาร */}
              {(() => {
                if (!selectedSetMenu) return null;

                const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                const setMenuImageName = setData?.lunchbox_set_name_image;
                const apiImage = buildBlobImageUrl(setMenuImageName);

                const displayImage = apiImage;

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
                    {/* พื้นหลังไล่ระดับสี */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none' />

                    {/* เนื้อหาบนรูปภาพ */}
                    <div className='absolute inset-x-0 bottom-4 px-4 sm:bottom-8 sm:px-8 flex items-end justify-between pointer-events-none'>
                      <div className='text-white transition-all duration-500 opacity-100 scale-100 pointer-events-auto'>
                        <div className='flex flex-col gap-1'>
                          <span className='text-[10px] sm:text-xs font-black uppercase tracking-[3px] text-orange-400 drop-shadow-md bg-black/20 w-fit px-2 py-0.5 rounded'>Selected Set</span>
                          <h2 className='text-2xl sm:text-4xl lg:text-5xl font-black drop-shadow-2xl tracking-tighter italic'>{selectedSetMenu.toUpperCase().startsWith("SET") ? selectedSetMenu : `SET ${selectedSetMenu}`}</h2>
                        </div>
                      </div>

                      {/* กล่องแสดงราคา */}
                      <div className='hidden sm:block lg:w-72 xl:w-80 animate-fade-in-up pointer-events-auto sticky top-4 z-30'>
                        <div className='bg-[#F7F3ED]/95 backdrop-blur-sm rounded-2xl p-4 xl:p-5 border border-[#E8E2D9] shadow-2xl flex flex-col justify-center relative overflow-hidden min-h-[140px]'>
                          {/* Decorative Accent */}
                          <div className='absolute top-0 left-0 w-full h-1 bg-orange-500' />

                          <div className='relative z-10 flex flex-col justify-between h-full'>
                            <div>
                              <div className='text-[10px] xl:text-xs font-black text-gray-900 uppercase tracking-[2px] mb-0.5 opacity-80'>PREMIUM</div>
                              <div className='text-[10px] xl:text-xs font-black text-gray-900 uppercase tracking-[2px] opacity-80'>LUNCH BOX</div>
                            </div>

                            <div className='my-2 xl:my-3 flex items-center gap-3'>
                              <div className='h-[1px] bg-gray-900/10 flex-1' />
                              <div className='text-xl xl:text-3xl font-black text-gray-900 tracking-tighter tabular-nums'>{setPriceBudget ? `${(setPriceBudget - 20) * lunchboxQuantity}-${(setPriceBudget + 20) * lunchboxQuantity}` : (selectionPrice * lunchboxQuantity).toLocaleString()}</div>
                              <div className='h-[1px] bg-gray-900/10 flex-1' />
                            </div>

                            <div className='flex items-center justify-between pb-1'>
                              <div className='flex items-center gap-1 bg-white ring-1 ring-gray-900/5 rounded-lg p-0.5 shadow-sm'>
                                <button
                                  type='button'
                                  disabled={selectedMenuItems.length === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLunchboxQuantity((prev) => Math.max(1, prev - 1));
                                  }}
                                  className={`p-1 rounded transition-colors ${selectedMenuItems.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'}`}>
                                  <Minus className='w-3 h-3' />
                                </button>
                                <span className='w-6 text-center text-xs font-black text-gray-900 tabular-nums'>{lunchboxQuantity}</span>
                                <button
                                  type='button'
                                  disabled={selectedMenuItems.length === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLunchboxQuantity((prev) => prev + 1);
                                  }}
                                  className={`p-1 rounded transition-colors ${selectedMenuItems.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'}`}
                                  title='เพิ่มจำนวน'>
                                  <Plus className='w-3 h-3' />
                                </button>
                              </div>

                              <div className='text-right'>
                                <p className='text-[9px] xl:text-[10px] uppercase font-bold text-gray-500 tracking-wider'>Selection</p>
                                <p className='text-xs xl:text-sm font-black text-gray-900 italic'>{selectedSetMenu}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ส่วนค้นหา */}
              <div className='bg-white/70 backdrop-blur-md p-3 sm:p-4 lg:p-6 transition-all duration-300 rounded-b-2xl shadow-lg border border-white/20 mb-4 mx-3 sm:mx-4 lg:mx-6'>
                <div className='flex flex-col gap-3 sm:gap-4'>
                  <div className='flex-1 relative w-full'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5' />
                    <input
                      type='text'
                      placeholder='ค้นหาเมนูอาหาร'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-10 py-2.5 sm:py-3 lg:py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm sm:text-base shadow-sm'
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1'>
                        ✕
                      </button>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100'>
                      <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-sm text-orange-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}>
                        <Grid3X3 className='w-4 h-4' />
                      </button>
                      <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-sm text-orange-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}>
                        <List className='w-4 h-4' />
                      </button>
                    </div>

                    <button className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-orange-300 transition-all duration-200 text-gray-700 shadow-sm'>
                      <Filter className='w-4 h-4' />
                      <span className='text-sm font-medium hidden sm:inline'>ตัวกรอง</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* พื้นที่เลือกเมนู */}
              <div className='mb-6 lg:mb-8 xl:mb-12'>
                {/* Step 1: เลือกชุดอาหาร */}
                {!selectedFoodSet && (
                  <div className='px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
                      <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. เลือกชุดอาหาร</span>
                      <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableFoodSets.length} รายการ</span>
                    </h2>

                    <div className='responsive-grid'>
                      {availableFoodSets.map((foodSet, index) => {
                        const foodSetData = lunchboxData.find((item) => item.lunchbox_name === foodSet);
                        const foodSetImageName = foodSetData?.lunchbox_name_image;
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

                    <div className='responsive-grid'>
                      {availableSetMenus.map((setMenu, index) => {
                        const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === setMenu);
                        const limit = setData?.lunchbox_limit || 0;
                        // ค้นหารูปภาพ Set อาหาร
                        const setMenuImageName = setData?.lunchbox_set_name_image;
                        // สร้าง URL รูปภาพ
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
                  <div className='px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col flex-wrap gap-2'>
                      <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>3. เลือกเมนูอาหาร</span>
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
                          // จัดกลุ่มเมนูและเรียงลำดับ
                          const menusToDisplay = searchQuery.trim() || selectedMeatType ? filteredMenus : availableMenus;
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
                          const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "ข้าว+กับข้าว", "meat-filter", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];
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
                                    <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isCategoryLocked("กับข้าวที่ 1") && isCategoryLocked("ข้าว+กับข้าว") ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                      {isCategoryLocked("กับข้าวที่ 1") && isCategoryLocked("ข้าว+กับข้าว") ? "🔒" : (availableMenus.some(m => (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") && selectedMenuItems.includes(buildMenuKey(m))) ? "✓" : "🔓")} 1. หมวดหมู่: ข้าว+กับข้าว
                                    </h3>
                                    <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                    <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full'>
                                      {genericDishTypes.filter((dish) => riceWithDishCategory.some((m) => m.menu_name.includes(dish))).length} รายการ
                                    </span>
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
                                          selected={focusedDish === dishType}
                                          faded={(() => {
                                            if (isCategoryLocked("กับข้าวที่ 1")) return true;
                                            return focusedDish !== null && focusedDish !== dishType;
                                          })()}
                                          size={isMobile ? "sm" : "md"}
                                          showPrice={true}
                                          onClick={() => {
                                            if (isCategoryLocked("กับข้าวที่ 1")) {
                                              const prevCat = getPreviousRequiredCategory("กับข้าวที่ 1");
                                              if (prevCat) alert(`กรุณาเลือกจากหมวด "${prevCat}" ก่อน`);
                                              return;
                                            }
                                            handleGenericDishClick(dishType);
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Step 3: แสดงตัวกรองเนื้อสัตว์ (หลังจากหมวด "ข้าว+กับข้าว") */}
                              {hasRiceWithDishCategory && (
                                <div className={`space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8 ${isCategoryLocked("meat-filter") ? "opacity-40 pointer-events-none" : ""}`}>
                                  <div className='flex items-center gap-2 sm:gap-4'>
                                    <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isCategoryLocked("meat-filter") ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                      {isCategoryLocked("meat-filter") ? "🔒" : selectedMeatType ? "✓" : "🔓"} 2. หมวดหมู่: เลือกเนื้อสัตว์
                                    </h3>
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
                                          menuId={`meat-${meat}`}
                                          name={meat}
                                          price={meatPriceMap[meat] || 0}
                                          variant='list'
                                          className='cursor-pointer w-full sm:w-[320px]'
                                          category='meat-filter'
                                          selected={selectedMeatType === meat}
                                          faded={(() => {
                                            if (isCategoryLocked("meat-filter")) return true;
                                            return selectedMeatType !== null && selectedMeatType !== meat;
                                          })()}
                                          size={isMobile ? "sm" : "md"}
                                          showPrice={true}
                                          onClick={() => {
                                            if (isCategoryLocked("meat-filter")) {
                                              const prevCat = getPreviousRequiredCategory("meat-filter");
                                              if (prevCat) alert(`กรุณาเลือกจากหมวด "${prevCat}" ก่อน`);
                                              return;
                                            }
                                            handleMeatFilterChange(selectedMeatType === meat ? null : meat);
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* แสดงหมวดหมู่อื่นๆ หลังจาก "ข้าว+กับข้าว" และตัวกรองเนื้อสัตว์ */}
                              {sortedCategories.map((category, idx) => {
                                const menusInCategory = groupedMenus[category];
                                const isCategoryHasSelection = availableMenus.some((m) => (m.lunchbox_menu_category || "อื่นๆ") === category && selectedMenuItems.includes(buildMenuKey(m)));

                                // ตรวจสอบว่าหมวดนี้ถูกล็อคหรือไม่
                                const isLocked = isCategoryLocked(category);
                                const previousCategory = getPreviousRequiredCategory(category);

                                // คำนวณลำดับขั้นตอนภายใน Step 3
                                const subStepNumber = idx + (hasRiceWithDishCategory ? 3 : 1);

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
                                  return a.menu_name.localeCompare(b.menu_name, "th");
                                });

                                return (
                                  <div key={category} className={`space-y-3 sm:space-y-4 lg:space-y-6`}>
                                    <div className='flex items-center gap-2 sm:gap-4'>
                                      <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isLocked ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                        {isLocked ? "🔒" : isCategoryHasSelection ? "✓" : "🔓"} {subStepNumber}. หมวดหมู่: {category}
                                      </h3>
                                      <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full bg-orange-100 text-orange-600`}>{menusInCategory.length} เมนู</span>
                                    </div>

                                    {/* แสดงข้อความเมื่อหมวดถูกล็อค */}
                                    {isLocked && (
                                      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3'>
                                        <p className='text-xs sm:text-sm text-yellow-800 flex items-center gap-2'>
                                          <span>⚠️</span>
                                          <span>
                                            {previousCategory
                                              ? `กรุณาเลือก "${previousCategory === "meat-filter" ? "เนื้อสัตว์" : previousCategory}" ก่อน`
                                              : "กรุณาเลือกหมวดก่อนหน้าก่อน"}
                                          </span>
                                        </p>
                                      </div>
                                    )}

                                    <div className='flex flex-wrap gap-3 sm:gap-4'>
                                      {sortedMenus.map((menu, index) => {
                                        const menuKey = buildMenuKey(menu);
                                        const isSelected = selectedMenuItems.includes(menuKey);

                                        const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                                        const limit = setData?.lunchbox_limit ?? 0;

                                        let isLunchboxCategoryTaken = false;
                                        // ทุกหมวดหมู่เลือกได้แค่ 1 อย่างเดียว (ยกเว้นข้าว)
                                        if (menu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว") {
                                          const selectedLunchboxCategories = availableMenus
                                            .filter((m) => selectedMenuItems.includes(buildMenuKey(m)))
                                            .map((m) => m.lunchbox_menu_category)
                                            .filter((category) => category);

                                          // ตรวจสอบว่ามีเมนูในหมวดหมู่นี้เลือกไว้แล้วหรือไม่
                                          if (selectedLunchboxCategories.includes(menu.lunchbox_menu_category) && !isSelected) {
                                            isLunchboxCategoryTaken = false;
                                          }
                                        }

                                        const menuMeatType = getMeatType(menu.menu_name);

                                        return (
                                          <MenuCard
                                            className='cursor-pointer w-full sm:w-[320px]'
                                            key={menu.menu_id || index}
                                            menuId={menu.menu_id || String(index)}
                                            name={menu.menu_name}
                                            price={getPrice(menu)}
                                            variant='list'
                                            category={menu.lunchbox_menu_category || undefined}
                                            meatType={menuMeatType as any}
                                            selected={isSelected}
                                            faded={(() => {
                                              if (isLocked) return true;
                                              if (isSelected) return false;

                                              // ตรวจสอบเรื่องการเลือกในหมวดหมู่เดียวกันไปแล้ว (ยกเว้นข้าว)
                                              if (isCategoryHasSelection && menu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว") {
                                                const catLimit = getCategoryLimit(selectedFoodSet, selectedSetMenu, menu.lunchbox_menu_category);
                                                const selectedInCategoryCount = availableMenus.filter((m) => m.lunchbox_menu_category === menu.lunchbox_menu_category && selectedMenuItems.includes(buildMenuKey(m))).length;
                                                return selectedInCategoryCount >= catLimit;

                                              }
                                              return false;
                                            })()}
                                            duplicate={!!isLunchboxCategoryTaken}
                                            size={isMobile ? "sm" : "md"}
                                            showPrice={true}
                                            onClick={() => {
                                              if (isLocked) {
                                                const prevCat = getPreviousRequiredCategory(menu.lunchbox_menu_category || "อื่นๆ");
                                                if (prevCat) alert(`กรุณาเลือกจากหมวด "${prevCat}" ก่อน`);
                                                return;
                                              }
                                              if (true) {
                                                handle.MenuSelection(buildMenuKey(menu));
                                              }
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
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
            </div>

            {/* แถบเมนูด้านล่าง (Mobile) */}
            <div className='lg:hidden fixed bottom-0 inset-x-0 z-40 flex flex-col'>
              {/* จำนวนชุดอาหาร (Mobile) */}
              {selectedSetMenu && (
                <div className='bg-orange-50/90 backdrop-blur-sm border-t border-orange-100 px-4 py-2 flex items-center justify-between shadow-xs'>
                  <span className='text-xs font-bold text-orange-800 uppercase tracking-wider'>จำนวนชุด (Set Quantity)</span>
                  <div className='flex items-center gap-3 bg-white rounded-full p-1 shadow-sm ring-1 ring-orange-200'>
                    <button onClick={() => setLunchboxQuantity((prev) => Math.max(1, prev - 1))} className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 active:bg-orange-100 transition-colors'>
                      <Minus className='w-4 h-4' />
                    </button>
                    <span className='w-8 text-center text-base font-black text-gray-900 tabular-nums'>{lunchboxQuantity}</span>
                    <button onClick={() => setLunchboxQuantity((prev) => prev + 1)} className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 active:bg-orange-100 transition-colors'>
                      <Plus className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}

              <MobileActionBar
                canSubmit={(() => {
                  if (selectionCount.total === 0) return false;
                  const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                  const limit = setData?.lunchbox_limit ?? 0;
                  if (limit > 0) return selectionCount.total === limit;
                  return true;
                })()}
                saving={isSaving}
                editMode={isEditMode}
                totalCost={(() => {
                  if (selectionCount.total === 0) return null;
                  return selectionPrice * lunchboxQuantity;
                })()}
                onSubmit={handle.Submit}
                onReset={() => {
                  const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));
                  setSelectedFoodSet("");
                  setSelectedSetMenu("");
                  setSelectedMenuItems(riceMenus);
                  setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
                  setLunchboxQuantity(1);
                  setSelectedMeatType(null);
                  setNote("");
                }}
              />
            </div>
          </div>
        </div >
      </div >
    </div >
  );
}
