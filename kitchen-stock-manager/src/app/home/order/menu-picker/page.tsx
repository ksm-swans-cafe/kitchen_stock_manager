"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Send, Minus, Plus, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useCartStore, calculatePackaging } from "@/stores/store";

import { MenuItem } from "@/models/menu_card/MenuCard";
import TopStepper from "@/components/order/TopStepper";
import MenuCard from "@/components/order/MenuCard";
import MobileActionBar from "@/components/order/MobileActionBar";
import { Loading } from "@/components/loading/loading";

import useLoadingDots from "@/lib/hook/Dots";

import SetFoodIcon from "@/assets/setfood.png";
import FoodMenuSetIcon from "@/assets/food-menu.png";

type MenuItemWithAutoRice = MenuItem & { lunchbox_AutoRice?: boolean | null; lunchbox_showPrice?: boolean };

type LunchboxOrderSelectItem = {
  lunchbox_menu_category: string;
  lunchbox_menu_category_limit?: string | null;
  lunchbox_menu_category_sequence?: string | null;
};

interface LunchBoxFromAPI {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image?: string;
  lunchbox_set_name_image?: string;
  lunchbox_cost?: number;
  lunchbox_order_select?: LunchboxOrderSelectItem[];
  lunchbox_check_all?: boolean;
}

export default function Order() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [selectedMeatType, setSelectedMeatType] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const router = useRouter();
  const { addLunchbox } = useCartStore();

  // สถานะสำหรับการเลือกเมนู
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>("");
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [lunchboxQuantity, setLunchboxQuantity] = useState<number>(1);
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItemWithAutoRice[]>([]);
  const [note, setNote] = useState<string>("");
  const [didAutoSelectAll, setDidAutoSelectAll] = useState<boolean>(false);
  const buildMenuKey = (menu: Partial<MenuItemWithAutoRice>) => menu.lunchbox_menuid ?? `${menu.menu_id ?? ""}-${menu.lunchbox_menu_category ?? ""}-${menu.menu_name ?? ""}`;
  const getPrice = (menu?: Partial<MenuItemWithAutoRice>) => menu?.lunchbox_cost ?? 0;
  const getSetData = (foodSet: string, setMenu: string) => lunchboxData.find((item) => item.lunchbox_name === foodSet && item.lunchbox_set_name === setMenu);
  const parsePositiveIntOrNull = (value?: string | null): number | null => {
    const trimmed = (value ?? "").toString().trim();
    if (!trimmed) return null;
    const n = parseInt(trimmed, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  // ตรวจสอบจำนวนเมนูที่เลือกได้
  const getSetLimit = (foodSet: string, setMenu: string) => getSetData(foodSet, setMenu)?.lunchbox_limit ?? 0;
  const buildBlobImageUrl = (imageName?: string | null) => (imageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${imageName}` : null);
  const LunchboxImage = ({ imageName, alt, fallbackIcon }: { imageName?: string | null; alt: string; fallbackIcon: React.ReactNode }) => {
    const imageUrl = buildBlobImageUrl(imageName);

    if (!imageUrl || failedImages.has(imageUrl)) {
      return <>{fallbackIcon}</>;
    }

    return <img src={imageUrl} alt={alt} className='min-w-full min-h-full object-cover object-center' onError={() => setFailedImages((prev) => new Set(prev).add(imageUrl))} />;
  };

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dots = useLoadingDots();

  const extractPriceFromSetName = (setName: string): number | null => {
    const match = setName.match(/(\d+)\s*baht/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // เรียงลำดับข้อความ (ไทย/อังกฤษ + ตัวเลข)
  const sortStrings = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b, "th", { numeric: true, sensitivity: "base" }));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get("edit") === "true";

    if (isEdit) {
      const editingIndexStr = sessionStorage.getItem("editingLunchboxIndex");
      const editingDataStr = sessionStorage.getItem("editingLunchboxData");

      if (lunchboxData.length === 0) {
        setIsLoadingEditData(true);
        return;
      }

      if (editingIndexStr && editingDataStr) {
        setIsLoadingEditData(true);
        try {
          const index = parseInt(editingIndexStr);
          const editingData = JSON.parse(editingDataStr);

          setIsEditMode(true);
          setEditingIndex(index);
          setSelectedFoodSet(editingData.lunchbox_name);
          setLunchboxQuantity(editingData.quantity || 1);

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

  const getMeatType = (menuName: string): "หมู" | "ไก่" | "หมึก" | "กุ้ง" | null => {
    if (menuName.includes("หมู")) return "หมู";
    if (menuName.includes("ไก่")) return "ไก่";
    if (menuName.includes("หมึก")) return "หมึก";
    if (menuName.includes("กุ้ง")) return "กุ้ง";
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
        const response = await axios.get("/api/get/lunchbox");
        const data = response.data;
        console.log("lunchbox data: ", data);
        const items = data as LunchBoxFromAPI[] | undefined;
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

  // Handle browser back button and keyboard back to navigate between steps instead of pages
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      // Step 3 -> Step 2: ถ้าอยู่ขั้นตอนเลือกเมนู ให้กลับไปเลือก Set
      if (selectedFoodSet && selectedSetMenu) {
        setSelectedSetMenu("");
        setSelectedMenuItems([]);
        setSelectedMeatType(null);
        setNote("");
        setSearchQuery("");
        setFocusedDish(null);
        // Push state กลับไปเพื่อไม่ให้ออกจากหน้า
        window.history.pushState(null, "", window.location.href);
        return;
      }

      // Step 2 -> Step 1: ถ้าอยู่ขั้นตอนเลือก Set ให้กลับไปเลือกชุดอาหาร
      if (selectedFoodSet && !selectedSetMenu) {
        setSelectedFoodSet("");
        setSelectedSetMenu("");
        setSelectedMenuItems([]);
        setSelectedMeatType(null);
        setNote("");
        setSearchQuery("");
        setFocusedDish(null);
        // Push state กลับไปเพื่อไม่ให้ออกจากหน้า
        window.history.pushState(null, "", window.location.href);
        return;
      }

      // Step 1: ถ้าอยู่ขั้นตอนแรก ให้กลับไปหน้าก่อนหน้าจริงๆ
      router.back();
    };

    // Push initial state เพื่อจัดการ back button
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedFoodSet, selectedSetMenu, router]);

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
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const normalizeThaiText = (text: string): string => {
    if (!text) return "";
    return text.replace(/เเ/g, "แ");
  };

  const filteredFoodSets = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return availableFoodSets;
    const query = debouncedSearchQuery.toLowerCase();
    const normalizedQuery = normalizeThaiText(query);
    return availableFoodSets.filter((foodSet) => {
      const normalizedFoodSet = normalizeThaiText(foodSet.toLowerCase());
      return normalizedFoodSet.includes(normalizedQuery);
    });
  }, [availableFoodSets, debouncedSearchQuery]);

  const filteredSetMenus = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return availableSetMenus;
    const query = debouncedSearchQuery.toLowerCase();
    const normalizedQuery = normalizeThaiText(query);
    return availableSetMenus.filter((setMenu) => {
      const normalizedSetMenu = normalizeThaiText(setMenu.toLowerCase());
      return normalizedSetMenu.includes(normalizedQuery);
    });
  }, [availableSetMenus, debouncedSearchQuery]);

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
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
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
  }, [availableMenus, debouncedSearchQuery, selectedMeatType]);

  const dynamicMeatTypes = useMemo(() => {
    const keywords = ["หมู", "ไก่", "หมึก", "กุ้ง"];
    const mainDish1Menus = availableMenus.filter((m) => m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว");
    return keywords.filter((k) => mainDish1Menus.some((m) => (m.menu_name || "").includes(k)));
  }, [availableMenus]);

  const selectionPrice = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);

    let total = 0;
    total += resolvedMenus.reduce((sum, m) => sum + (m.lunchbox_cost ?? 0), 0);

    return total;
  }, [selectedMenuItems, availableMenus]);

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

    const total = resolvedMenus.length;

    return {
      total,
    };
  }, [selectedMenuItems, availableMenus]);

  const selectedSetData = useMemo(() => {
    if (!selectedFoodSet || !selectedSetMenu) return null;
    return getSetData(selectedFoodSet, selectedSetMenu) ?? null;
  }, [selectedFoodSet, selectedSetMenu, lunchboxData]);

  // นับจำนวนที่เลือกต่อหมวด (ใช้สำหรับ step-based selection)
  const selectedCountByCategory = useMemo(() => {
    const map = new Map<string, number>();

    selectedMenuItems.forEach((menuKey) => {
      const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
      if (!menu) return;

      const category = menu.lunchbox_menu_category || "อื่นๆ";
      map.set(category, (map.get(category) || 0) + 1);
    });

    return map;
  }, [selectedMenuItems, availableMenus]);

  // Step definitions (sequence + limit) จาก lunchbox_order_select ของ set ที่เลือก (รองรับ Drinks + Premium Snack Box ฯลฯ)
  const orderSelectSteps = useMemo(() => {
    if (!selectedSetData) return [];
    const raw = (selectedSetData.lunchbox_order_select ?? []).filter((s) => (s?.lunchbox_menu_category || "").trim().length > 0);

    return raw
      .map((s, i) => {
        const parsedSeq = parsePositiveIntOrNull(s.lunchbox_menu_category_sequence);
        return {
          category: s.lunchbox_menu_category,
          limit: parsePositiveIntOrNull(s.lunchbox_menu_category_limit),
          sequence: parsedSeq ?? i + 1, // ถ้าไม่มี sequence ให้ใช้ลำดับใน array เป็น fallback
        };
      })
      .sort((a, b) => a.sequence - b.sequence);
  }, [selectedSetData]);

  const isStepBasedSet = orderSelectSteps.length > 0;
  const stepCategories = useMemo(() => new Set(orderSelectSteps.map((s) => s.category)), [orderSelectSteps]);
  const optionalStepCategories = useMemo(() => new Set(orderSelectSteps.filter((s) => s.limit === null).map((s) => s.category)), [orderSelectSteps]);
  const isCustomUnlimited = selectedFoodSet === "Custom" && (selectedSetData?.lunchbox_limit ?? 0) === 0;

  // นับจำนวนตาม step (รองรับ "ข้าว+กับข้าว" รวม "กับข้าวที่ 1", และ "เนื้อสัตว์" = selectedMeatType)
  const getStepCategoryCount = useMemo(() => {
    return (stepCategory: string): number => {
      if (stepCategory === "ข้าว+กับข้าว") {
        const a = selectedCountByCategory.get("ข้าว+กับข้าว") || 0;
        const b = selectedCountByCategory.get("กับข้าวที่ 1") || 0;
        const fromMenus = a + b;
        if (fromMenus > 0) return fromMenus;
        return focusedDish ? 1 : 0;
      }
      if (stepCategory === "เนื้อสัตว์") return selectedMeatType ? 1 : 0;
      return selectedCountByCategory.get(stepCategory) || 0;
    };
  }, [selectedCountByCategory, selectedMeatType, focusedDish]);
  const hasExplicitOrderSequence = useMemo(() => {
    const raw = selectedSetData?.lunchbox_order_select ?? [];
    return raw.some((s) => ((s.lunchbox_menu_category_sequence ?? "").toString().trim().length > 0));
  }, [selectedSetData]);

  // ใช้สำหรับกำหนดเลขลำดับ "เลือกเนื้อสัตว์" เป็นหมวดที่ 2 เสมอ
  // (อิงจากเมนูที่โหลดได้จริง ไม่ผูกกับการกรอง/search)
  const hasRiceWithDishCategoryForDisplay = useMemo(() => {
    return availableMenus.some((m) => m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว");
  }, [availableMenus]);

  // โหมด combo: หมวด 1 (ข้าว+กับข้าว) + หมวด 2 (เลือกเนื้อสัตว์) นับเป็น 1 รายการ
  const isRiceDishMeatComboSet = useMemo(() => {
    return !!(
      isStepBasedSet &&
      hasRiceWithDishCategoryForDisplay &&
      stepCategories.has("ข้าว+กับข้าว") &&
      stepCategories.has("เนื้อสัตว์")
    );
  }, [isStepBasedSet, hasRiceWithDishCategoryForDisplay, stepCategories]);

  const comboComplete = useMemo(() => {
    if (!isRiceDishMeatComboSet) return false;
    return getStepCategoryCount("ข้าว+กับข้าว") >= 1 && getStepCategoryCount("เนื้อสัตว์") >= 1;
  }, [isRiceDishMeatComboSet, getStepCategoryCount]);

  const effectiveSelectionDisplay = useMemo(() => {
    const limit = selectedSetData?.lunchbox_limit ?? 0;
    if (isRiceDishMeatComboSet) {
      const comboPart = comboComplete ? 1 : 0;
      const otherPart = orderSelectSteps
        .filter((s) => s.category !== "ข้าว+กับข้าว" && s.category !== "เนื้อสัตว์")
        .reduce((sum, s) => sum + getStepCategoryCount(s.category), 0);
      return { selected: comboPart + otherPart, limit };
    }
    return { selected: selectionCount.total, limit };
  }, [isRiceDishMeatComboSet, comboComplete, orderSelectSteps, getStepCategoryCount, selectionCount.total, selectedSetData?.lunchbox_limit]);

  // reset auto-select flag when changing set
  useEffect(() => {
    setDidAutoSelectAll(false);
  }, [selectedFoodSet, selectedSetMenu]);

  // Auto select all (ตาม lunchbox_limit) เมื่อ set เปิดใช้งาน lunchbox_check_all
  useEffect(() => {
    if (!selectedSetData?.lunchbox_check_all) return;
    if (didAutoSelectAll) return;
    if (isLoadingMenus) return;
    if (!selectedFoodSet || !selectedSetMenu) return;
    if (availableMenus.length === 0) return;

    // ถ้าผู้ใช้เลือกเองแล้ว ไม่ override
    if (selectedMenuItems.length > 0) {
      setDidAutoSelectAll(true);
      return;
    }

    const overallLimit = selectedSetData.lunchbox_limit ?? 0;

    const keys: string[] = [];
    const pushKey = (m: MenuItemWithAutoRice) => {
      const key = buildMenuKey(m);
      if (!keys.includes(key)) keys.push(key);
    };

    if (isStepBasedSet) {
      // เลือกเฉพาะหมวดที่อยู่ใน orderSelectSteps ตามลำดับ
      for (const step of orderSelectSteps) {
        availableMenus.filter((m) => (m.lunchbox_menu_category || "อื่นๆ") === step.category).forEach(pushKey);
      }
    } else {
      // fallback: เลือกตามลำดับที่ได้จาก API
      availableMenus.forEach(pushKey);
    }

    const finalKeys = overallLimit > 0 ? keys.slice(0, overallLimit) : keys;
    setSelectedMenuItems(finalKeys);
    setDidAutoSelectAll(true);
  }, [
    selectedSetData,
    didAutoSelectAll,
    isLoadingMenus,
    selectedFoodSet,
    selectedSetMenu,
    availableMenus,
    selectedMenuItems.length,
    isStepBasedSet,
    orderSelectSteps,
  ]);

  const canSubmitSelection = useMemo(() => {
    if (!selectedFoodSet || !selectedSetMenu) return false;

    // โหมด combo: หมวด 1+2 = 1 รายการ — ใช้ comboComplete แทน selectionCount.total
    if (isRiceDishMeatComboSet) {
      if (!comboComplete) return false;
      for (const step of orderSelectSteps) {
        if (step.limit === null) continue;
        const count = getStepCategoryCount(step.category);
        if (count !== step.limit) return false;
      }
      return true;
    }

    if (selectionCount.total === 0) return false;

    // Step-based: ตรวจสอบตาม step/limit ของแต่ละหมวด + ห้ามเลือกนอกหมวดที่กำหนด (ยกเว้นข้าว)
    if (isStepBasedSet) {
      const overallLimit = selectedSetData?.lunchbox_limit ?? 0;
      if (overallLimit > 0 && selectionCount.total !== overallLimit) return false;

      for (const step of orderSelectSteps) {
        if (step.limit === null) continue; // ไม่มี limit = optional/unlimited (จะเลือกหรือไม่เลือกก็ได้)
        const count = getStepCategoryCount(step.category);
        if (count !== step.limit) return false;
      }

      for (const [cat] of selectedCountByCategory.entries()) {
        if (cat === "ข้าว") continue;
        if (!stepCategories.has(cat)) return false;
      }

      return true;
    }

    // Default: ตรวจสอบตาม lunchbox_limit เดิม
    const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
    if (limit > 0) return selectionCount.total === limit;
    return true;
  }, [selectedFoodSet, selectedSetMenu, selectionCount.total, isStepBasedSet, isRiceDishMeatComboSet, comboComplete, orderSelectSteps, getStepCategoryCount, stepCategories, selectedSetData]);

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
      // Custom limit=0 (ไม่จำกัด): ไม่ล็อคหมวด (เลือกได้อิสระ)
      if (isCustomUnlimited) return false;

      // Step-based: lock ตาม step sequence โดยใช้หมวดที่ "ต้องเลือกครบ limit" เป็นเงื่อนไขปลดล็อค
      if (isStepBasedSet) {
        const idx = orderSelectSteps.findIndex((s) => s.category === category);
        if (idx <= 0) return false;

        for (let i = 0; i < idx; i++) {
          const prev = orderSelectSteps[i];
          if (prev.limit === null) continue; // optional step ไม่ล็อค step ถัดไป
          const count = getStepCategoryCount(prev.category);
          if (count < prev.limit) return true;
        }
        return false;
      }

      const categoryIndex = getOrderedCategories.indexOf(category);
      if (categoryIndex === -1) return false;
      if (categoryIndex === 0) return false;
      const prevCategory = getOrderedCategories[categoryIndex - 1];
      return !getSelectedCategories.includes(prevCategory);
    };
  }, [isCustomUnlimited, isStepBasedSet, orderSelectSteps, getStepCategoryCount, getOrderedCategories, getSelectedCategories]);

  // Get the previous category that needs to be selected
  const getPreviousRequiredCategory = useMemo(() => {
    return (category: string) => {
      // Custom limit=0 (ไม่จำกัด): ไม่มีหมวดบังคับก่อนหน้า
      if (isCustomUnlimited) return null;

      // Step-based: ให้แจ้งหมวดล่าสุดที่ "ต้องเลือกให้ครบ limit" แต่ยังเลือกไม่ครบ
      if (isStepBasedSet) {
        const idx = orderSelectSteps.findIndex((s) => s.category === category);
        if (idx <= 0) return null;

        for (let i = idx - 1; i >= 0; i--) {
          const prev = orderSelectSteps[i];
          if (prev.limit === null) continue;
          const count = getStepCategoryCount(prev.category);
          if (count < prev.limit) return prev.category;
        }
        // ถ้าครบหมดแล้ว ให้คืนหมวดก่อนหน้าแบบตรงไปตรงมา (ถ้ามี)
        return orderSelectSteps[idx - 1]?.category ?? null;
      }

      const categoryIndex = getOrderedCategories.indexOf(category);
      if (categoryIndex <= 0) return null;
      return getOrderedCategories[categoryIndex - 1];
    };
  }, [isCustomUnlimited, isStepBasedSet, orderSelectSteps, getStepCategoryCount, getOrderedCategories]);

  // --- ข้อมูลเงื่อนไขพิเศษของชุดอาหาร (กำหนดโควตาแต่ละหมวด) ---
  const getCategoryLimit = (foodSet: string, setMenu: string, category: string) => {
    if (category === "ข้าว") return 1;

    // Custom + limit=0 (ไม่จำกัด): เลือกได้กี่อย่างก็ได้ในทุกหมวด
    // NOTE: บางชุดอื่นอาจ limit=0 แต่ยังอยากคุม per-category; เคสนี้ต้องปล่อยอิสระตาม requirement ของ Custom
    const setDataUnlimited = getSetData(foodSet, setMenu);
    if (foodSet === "Custom" && (setDataUnlimited?.lunchbox_limit ?? 0) === 0) {
      return Number.POSITIVE_INFINITY;
    }

    // Step-based: ใช้ limit ตาม lunchbox_order_select (ถ้า limit ว่าง = ไม่จำกัด/optional)
    const setData = getSetData(foodSet, setMenu);
    const order = setData?.lunchbox_order_select ?? [];
    if (order.length > 0) {
      const matched = order.find((o) => o.lunchbox_menu_category === category);
      if (matched) {
        const parsed = parsePositiveIntOrNull(matched.lunchbox_menu_category_limit);
        if (parsed === null) return Number.POSITIVE_INFINITY; // limit ว่าง = เลือกกี่อย่างก็ได้/หรือไม่เลือกก็ได้
        return parsed;
      }
    }

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

      setSelectedMenuItems((prev) => {
        const isSelected = prev.includes(menuKey);

        if (isSelected) {
          // --- ยกเลิกการเลือก (Unselect Logic) ---
          if (isRiceMenu && !isUnlimited) {
            alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากข้าวเป็นส่วนประกอบหลักของชุดอาหาร");
            return prev;
          }

          let newItems = prev.filter((item) => item !== menuKey);

          // Reset step ที่ตามมาหลังจากยกเลิก step ก่อนหน้า (สำหรับ step-based set)
          if (isStepBasedSet && orderSelectSteps.length > 0 && !isRiceMenu) {
            const unselectedCategory = selectedMenu.lunchbox_menu_category;

            // หา step ที่เมนูที่ถูกยกเลิกอยู่
            const unselectedStep = orderSelectSteps.find((step) => {
              if (unselectedCategory === "ข้าว+กับข้าว" || unselectedCategory === "กับข้าวที่ 1") {
                return step.category === "ข้าว+กับข้าว";
              }
              return step.category === unselectedCategory;
            });

            if (unselectedStep) {
              const unselectedSequence = unselectedStep.sequence;

              // หา step ที่ตามมาทั้งหมด (sequence มากกว่า)
              const followingSteps = orderSelectSteps.filter((step) => step.sequence > unselectedSequence);

              // ลบเมนูทั้งหมดที่อยู่ใน step ที่ตามมา
              followingSteps.forEach((step) => {
                const categoriesToRemove = new Set<string>();

                // จัดการกับ combo case (ข้าว+กับข้าว + เนื้อสัตว์)
                if (step.category === "เนื้อสัตว์") {
                  categoriesToRemove.add("เนื้อสัตว์");
                } else if (step.category === "ข้าว+กับข้าว") {
                  categoriesToRemove.add("ข้าว+กับข้าว");
                  categoriesToRemove.add("กับข้าวที่ 1");
                  // ถ้ายกเลิก "ข้าว+กับข้าว" ต้องลบ "เนื้อสัตว์" ด้วย
                  if (unselectedCategory === "ข้าว+กับข้าว" || unselectedCategory === "กับข้าวที่ 1") {
                    categoriesToRemove.add("เนื้อสัตว์");
                  }
                } else {
                  categoriesToRemove.add(step.category);
                }

                // ลบเมนูทั้งหมดที่อยู่ในหมวดที่ต้องลบ
                newItems = newItems.filter((key) => {
                  const menu = availableMenus.find((m) => buildMenuKey(m) === key);
                  if (!menu) return true;
                  const menuCategory = menu.lunchbox_menu_category;

                  // ไม่ลบข้าว (ยกเว้นกรณีพิเศษ)
                  if (menuCategory === "ข้าว") return true;

                  // ลบเมนูที่อยู่ในหมวดที่ต้องลบ
                  return !categoriesToRemove.has(menuCategory || "");
                });
              });

              // จัดการกับ selectedMeatType ถ้ายกเลิก "ข้าว+กับข้าว" หรือ "กับข้าวที่ 1"
              if ((unselectedCategory === "ข้าว+กับข้าว" || unselectedCategory === "กับข้าวที่ 1") && selectedMeatType) {
                setSelectedMeatType(null);
              }
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

          // 2. ตรวจสอบขีดจำกัดจำนวนเมนู (สำหรับชุดปกติ)
          // ถ้าเกินกำหนด (และรายการใหม่ไม่ได้ไปสลับกับใคร) ให้เตะรายการที่เก่าที่สุดออก
          // Step-based: ถ้า set มี lunchbox_limit รวม ให้คุมจำนวนรวมด้วย
          // (เช่น Snack Box S/M ที่ไม่มี limit รายหมวด แต่มี limit รวม)
          if (!isUnlimited && limit > 0 && newItems.length >= limit) {
            if (isStepBasedSet) {
              // พยายามเอาอันที่ "optional" ออกก่อน เพื่อไม่ทำให้ required step หลุด
              const idxToRemove = newItems.findIndex((k) => {
                const m = availableMenus.find((mm) => buildMenuKey(mm) === k);
                const cat = m?.lunchbox_menu_category || "อื่นๆ";
                return cat !== "ข้าว" && optionalStepCategories.has(cat);
              });

              if (idxToRemove !== -1) {
                const trimmed = newItems.filter((_, i) => i !== idxToRemove);
                return [...trimmed, menuKey];
              }
            }

            return [...newItems.slice(1), menuKey];
          }

          return [...newItems, menuKey];
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

      // Step-based: ตรวจสอบตาม step/limit ของแต่ละหมวด (limit ว่าง = optional/unlimited)
      if (isStepBasedSet) {
        if (!isRiceDishMeatComboSet) {
          if (limit > 0 && selectionCount.total !== limit) {
            alert(`กรุณาเลือกเมนูให้ครบ ${limit} เมนู (เลือกแล้ว ${selectionCount.total} เมนู)`);
            return;
          }
        }

        for (const step of orderSelectSteps) {
          if (step.limit === null) continue;
          const count = getStepCategoryCount(step.category);
          const label = step.category === "เนื้อสัตว์" ? "เลือกเนื้อสัตว์" : step.category;
          if (count !== step.limit) {
            alert(`กรุณาเลือกจากหมวด "${label}" ให้ครบ ${step.limit} รายการ (เลือกแล้ว ${count} รายการ)`);
            return;
          }
        }

        if (!isRiceDishMeatComboSet) {
          for (const [cat] of selectedCountByCategory.entries()) {
            if (cat === "ข้าว") continue;
            if (!stepCategories.has(cat)) {
              alert(`ไม่สามารถเลือกเมนูจากหมวด "${cat}" ในชุดนี้ได้`);
              return;
            }
          }
        }
      }

      // แจ้งเตือนเมื่อเลือกไม่ครบ (ข้ามถ้าเป็น combo: หมวด 1+2 = 1 รายการ)
      if (!isRiceDishMeatComboSet && limit > 0 && selectionCount.total < limit) {
        alert(`กรุณาเลือกเมนูให้ครบ ${limit} เมนู (เลือกแล้ว ${selectionCount.total} เมนู)`);
        return;
      }

      if (isSaving) return;

      setIsSaving(true);

      try {
        // นับจำนวนเมนู
        const menuCountMap = new Map<string, number>();
        selectedMenuItems.forEach((menuKey) => {
          const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
          menuCountMap.set(menuKey, (menuCountMap.get(menuKey) || 0) + 1);
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

        // คำนวณ packaging จาก set name และ quantity
        const packaging = calculatePackaging(selectedSetMenu, lunchboxQuantity);

        const newLunchbox = {
          lunchbox_name: selectedFoodSet,
          lunchbox_set: selectedSetMenu.toUpperCase().startsWith("SET") ? selectedSetMenu : `SET ${selectedSetMenu}`,
          lunchbox_limit: limit2,
          selected_menus: selectedMenuObjects,
          quantity: lunchboxQuantity,
          lunchbox_total_cost: totalCost.toString(),
          note: note,
          packaging: packaging,
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
        let newItems = prev.filter((key) => {
          const menu = availableMenus.find((m) => buildMenuKey(m) === key);
          return menu?.lunchbox_menu_category !== "กับข้าวที่ 1" && menu?.lunchbox_menu_category !== "ข้าว+กับข้าว";
        });

        // Reset step ที่ตามมาหลังจากยกเลิก "เนื้อสัตว์" (สำหรับ step-based set)
        if (isStepBasedSet && orderSelectSteps.length > 0) {
          // หา step "เนื้อสัตว์"
          const meatStep = orderSelectSteps.find((step) => step.category === "เนื้อสัตว์");

          if (meatStep) {
            const meatSequence = meatStep.sequence;

            // หา step ที่ตามมาทั้งหมด (sequence มากกว่า)
            const followingSteps = orderSelectSteps.filter((step) => step.sequence > meatSequence);

            // ลบเมนูทั้งหมดที่อยู่ใน step ที่ตามมา
            followingSteps.forEach((step) => {
              const categoriesToRemove = new Set<string>();

              if (step.category === "ข้าว+กับข้าว") {
                categoriesToRemove.add("ข้าว+กับข้าว");
                categoriesToRemove.add("กับข้าวที่ 1");
              } else {
                categoriesToRemove.add(step.category);
              }

              // ลบเมนูทั้งหมดที่อยู่ในหมวดที่ต้องลบ
              newItems = newItems.filter((key) => {
                const menu = availableMenus.find((m) => buildMenuKey(m) === key);
                if (!menu) return true;
                const menuCategory = menu.lunchbox_menu_category;

                // ไม่ลบข้าว
                if (menuCategory === "ข้าว") return true;

                // ลบเมนูที่อยู่ในหมวดที่ต้องลบ
                return !categoriesToRemove.has(menuCategory || "");
              });
            });
          }
        }

        return newItems;
      });
      setFocusedDish(null);
      return;
    }

    let newSelectedItems = [...selectedMenuItems];
    let hasChanges = false;

    // 1. ตรวจสอบเมนูที่เลือกอยู่เฉพาะในหมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว"
    const conflictingItems = availableMenus.filter(
      (m) =>
        selectedMenuItems.includes(buildMenuKey(m)) &&
        (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว")
    );

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
    return <Loading context='ข้อมูลชุดอาหาร' icon={SetFoodIcon.src} />;
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
                          {selectionCount.total > 0 ? `เลือกแล้ว ${selectionCount.total} เมนู` : selectedSetMenu ? "คลิกเพื่อเลือกเมนูอาหาร" : "เลือก Set อาหารก่อน"}
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
                      return !canSubmitSelection;
                    })()}
                    className={`w-full px-4 py-4 md:px-5 md:py-5 xl:px-6 xl:py-6 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 xl:gap-3 min-h-[50px] md:min-h-[60px] xl:min-h-[70px] ${isSaving ||
                      (() => {
                        return !canSubmitSelection;
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
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems([]);
                    setSelectedMeatType(null);
                    setNote("");
                  }}
                  className='w-full mt-3 xl:mt-4 px-4 py-3 md:px-5 md:py-4 xl:px-6 xl:py-5 bg-red-500 hover:text-white! text-sm md:text-base xl:text-lg font-medium rounded-xl hover:bg-red-600! transition-colors! duration-300 min-h-[45px] md:min-h-[50px] xl:min-h-[60px]'>
                  รีเซ็ตการเลือก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนแสดงผลหลัก */}
        <div className='flex-1 flex flex-col min-h-svh'>
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
                  <div className='relative w-full aspect-video overflow-hidden transition-all duration-700 ease-in-out bg-gray-100/50 opacity-100'>
                    <img
                      src={displayImage}
                      alt={`Set ${selectedSetMenu}`}
                      className='w-full h-full transition-all duration-700 object-cover bg-white'
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
                      <div className='w-[160px] sm:w-auto sm:min-w-[280px] md:w-72 lg:w-72 xl:w-80 animate-fade-in-up pointer-events-auto z-30'>
                        <div className='bg-[#F7F3ED]/95 backdrop-blur-sm rounded-lg sm:rounded-xl xl:rounded-2xl px-2 py-1.5 sm:p-3 xl:p-5 border border-[#E8E2D9] shadow-lg sm:shadow-2xl flex flex-col justify-center relative overflow-hidden min-h-[70px] sm:min-h-[120px] xl:min-h-[140px]'>
                          {/* Decorative Accent */}
                          <div className='absolute top-0 left-0 w-full h-px sm:h-0.5 xl:h-1 bg-orange-500' />

                          <div className='relative z-10 flex flex-col justify-between h-full gap-0.5 sm:gap-0'>
                            <div>
                              <div className='text-[7px] sm:text-[9px] xl:text-xs font-black text-gray-900 uppercase tracking-[0.5px] sm:tracking-[2px] mb-0 sm:mb-0.5 opacity-80'>{selectedFoodSet}</div>
                            </div>

                            <div className='my-0.5 sm:my-1.5 xl:my-3 flex items-center gap-1 sm:gap-2 xl:gap-3'>
                              <div className='h-[0.5px] sm:h-[1px] bg-gray-900/10 flex-1' />
                              <div className='text-sm sm:text-lg xl:text-3xl font-black text-gray-900 tracking-tighter tabular-nums'>
                                {setPriceBudget
                                  ? `${(setPriceBudget * lunchboxQuantity).toLocaleString()}`
                                  : (selectionPrice * lunchboxQuantity).toLocaleString()}
                                <span className='text-[9px] sm:text-xs xl:text-base ml-0.5 sm:ml-1 font-normal opacity-60'>฿</span>
                              </div>
                              <div className='h-[0.5px] sm:h-[1px] bg-gray-900/10 flex-1' />
                            </div>

                            <div className='flex items-center justify-start sm:justify-between pb-0 sm:pb-1'>
                              <div className={`hidden sm:flex items-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg p-0.5 shadow-sm ${selectionCount.total > 0 ? "bg-white ring-1 ring-gray-900/5" : "bg-gray-100 ring-1 ring-gray-200"}`}>
                                <button
                                  type='button'
                                  disabled={selectionCount.total === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectionCount.total > 0) setLunchboxQuantity((prev) => Math.max(1, prev - 1));
                                  }}
                                  className={`hidden sm:flex p-0.5 sm:p-1 rounded transition-colors ${selectionCount.total > 0 ? "hover:bg-orange-50 text-gray-500 hover:text-orange-600" : "cursor-not-allowed text-gray-300"}`}
                                  title={selectionCount.total === 0 ? "กรุณาเลือกเมนูก่อน" : "ลดจำนวน"}>
                                  <Minus className='w-2 h-2 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3' />
                                </button>
                                <span className={`w-3 sm:w-5 xl:w-6 text-center text-[8px] sm:text-[10px] xl:text-xs font-black tabular-nums ${selectionCount.total > 0 ? "text-gray-900" : "text-gray-400"}`}>{lunchboxQuantity}</span>
                                <button
                                  type='button'
                                  disabled={selectionCount.total === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectionCount.total > 0) setLunchboxQuantity((prev) => prev + 1);
                                  }}
                                  className={`hidden sm:flex p-0.5 sm:p-1 rounded transition-colors ${selectionCount.total > 0 ? "hover:bg-orange-50 text-gray-500 hover:text-orange-600" : "cursor-not-allowed text-gray-300"}`}
                                  title={selectionCount.total === 0 ? "กรุณาเลือกเมนูก่อน" : "เพิ่มจำนวน"}>
                                  <Plus className='w-2 h-2 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3' />
                                </button>
                              </div>

                              <div className='ml-auto flex flex-col items-center sm:items-end text-center sm:text-right'>
                                <p className='text-[6px] sm:text-[8px] xl:text-[10px] uppercase font-bold text-gray-500 tracking-tight sm:tracking-wider'>Selection</p>
                                <p className='text-[8px] sm:text-[10px] xl:text-sm font-black text-center text-gray-900 italic leading-tight'>{selectedSetMenu}</p>
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
              <div className='bg-white/95 backdrop-blur-xl p-4 sm:p-5 lg:p-6 transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-lg border-2 border-gray-100/50 ring-1 ring-black/[0.02] mb-2 mx-4 sm:mx-6 lg:mx-8 mt-2 lg:mt-4 relative z-30'>
                <div className='flex flex-col gap-3 sm:gap-4'>
                  <div className='flex-1 relative w-full'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5' />
                    <input
                      type='text'
                      placeholder={
                        !selectedFoodSet
                          ? "ค้นหาชุดอาหาร"
                          : selectedFoodSet && !selectedSetMenu
                            ? "ค้นหา Set อาหาร"
                            : "ค้นหาเมนู"
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-10 py-2.5 sm:py-3 lg:py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm sm:text-base shadow-sm'
                      style={{ fontFamily: 'inherit' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1'>
                        ✕
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* พื้นที่เลือกเมนู */}
              <div className='mb-6 lg:mb-8 xl:mb-12'>
                {/* Step 1: เลือกชุดอาหาร */}
                {!selectedFoodSet && (
                  <div className='px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4'>
                    <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
                      <span className='bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. เลือกชุดอาหาร</span>
                      <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{filteredFoodSets.length} รายการ</span>
                    </h2>

                    <div className='responsive-grid'>
                      {filteredFoodSets.map((foodSet, index) => {
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
                            onClick={() => {
                              setSelectedFoodSet(foodSet);
                              setSearchQuery("");
                            }}>
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
                  <div className='px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4'>
                    <div className='flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8'>
                      <button
                        onClick={() => {
                          setSelectedFoodSet("");
                          setSelectedSetMenu("");
                          setSelectedMenuItems([]);
                          setSelectedMeatType(null);
                          setNote("");
                          setSearchQuery("");
                          setFocusedDish(null);
                        }}
                        className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md group'
                        title='ย้อนกลับไปเลือกชุดอาหาร'>
                        <ArrowLeft className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-orange-600 transition-colors' />
                      </button>
                      <div className='flex-1'>
                        <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 flex flex-col gap-2'>
                          <span className='bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>2. เลือก Set อาหาร</span>
                          <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{filteredSetMenus.length} รายการ</span>
                        </h2>
                      </div>
                    </div>

                    <div className='responsive-grid'>
                      {filteredSetMenus.map((setMenu, index) => {
                        const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === setMenu);
                        const limit = setData?.lunchbox_limit || 0;
                        const setMenuImageName = setData?.lunchbox_set_name_image;
                        const setMenuImage = setMenuImageName ? `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH}/${setMenuImageName}` : null;

                        return (
                          <div
                            key={index}
                            className='group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]'
                            onClick={() => {
                              setSelectedSetMenu(setMenu);
                              setSearchQuery("");
                            }}>
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

                            <div className='text-center p-2 sm:p-3 lg:p-4 '>
                              <h3 className='font-semibold pt-1 text-gray-800 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2'>{setMenu.toUpperCase().startsWith("SET") ? setMenu : `SET ${setMenu}`}</h3>
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
                  <div className='px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4'>
                    <div className='flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8'>
                      <button
                        onClick={() => {
                          setSelectedSetMenu("");
                          setSelectedMenuItems([]);
                          setSelectedMeatType(null);
                          setNote("");
                          setSearchQuery("");
                          setFocusedDish(null);
                        }}
                        className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md group'
                        title='ย้อนกลับไปเลือก Set อาหาร'>
                        <ArrowLeft className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-orange-600 transition-colors' />
                      </button>
                      <div className='flex-1'>
                        <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 flex flex-col flex-wrap gap-2'>
                          <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>3. เลือกเมนูอาหาร</span>
                          {(() => {
                            const { selected, limit } = effectiveSelectionDisplay;
                            const isUnlimited = limit === 0;

                            return (
                              <div className='flex gap-2 flex-wrap'>
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
                          // จัดกลุ่มเมนูและเรียงลำดับ
                          const menusToDisplay = debouncedSearchQuery.trim() || selectedMeatType ? filteredMenus : availableMenus;
                          const groupedMenus = menusToDisplay.reduce((groups, menu) => {
                            const category = menu.lunchbox_menu_category || "อื่นๆ";
                            if (!groups[category]) {
                              groups[category] = [];
                            }
                            groups[category].push(menu);
                            return groups;
                          }, {} as Record<string, typeof availableMenus>);

                          // ตรวจสอบว่ามีหมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว" หรือไม่
                          const riceWithDishCategory = groupedMenus["กับข้าวที่ 1"] || groupedMenus["ข้าว+กับข้าว"] || [];
                          const hasRiceWithDishCategoryLocal = riceWithDishCategory.length > 0;

                          // สร้าง array ของเมนูทั้งหมดในหมวด "ข้าว+กับข้าว" จาก availableMenus (ไม่ผ่านการกรอง)
                          // ใช้สำหรับค้นหาราคาพื้นฐาน (หมู/ไก่) แม้ว่าจะเลือกเนื้อสัตว์ที่มีราคาเพิ่มเติม (กุ้ง/หมึก)
                          const allRiceWithDishMenus = availableMenus.filter((m) =>
                            m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว"
                          );

                          // กำหนดลำดับหมวดหมู่ (เอา "กับข้าวที่ 1" และ "ข้าว+กับข้าว" ออกก่อน)
                          const categoryOrder = ["ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "กับข้าวที่ 2", "ผัด", "พริกเเกง", "แกง", "ต้ม", "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"];

                          const allCategories = Object.keys(groupedMenus);
                          const baseSortedCategories = allCategories
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

                          const sortedCategories = (() => {
                            // Step-based: ให้เรียงหมวดตาม orderSelectSteps ก่อน และซ่อนหมวดที่ไม่อยู่ใน step (ยกเว้น rice/หมวดพิเศษที่ถูกกรองไว้แล้ว)
                            if (isStepBasedSet && orderSelectSteps.length > 0) {
                              const stepCats = orderSelectSteps.map((s) => s.category).filter((c) => allCategories.includes(c));
                              const dedupStepCats = [...new Set(stepCats)].filter((c) => c !== "ข้าว" && c !== "กับข้าวที่ 1" && c !== "ข้าว+กับข้าว");
                              return dedupStepCats;
                            }
                            return baseSortedCategories;
                          })();

                          const seqRiceWithDish = isStepBasedSet ? (orderSelectSteps.find((s) => s.category === "ข้าว+กับข้าว")?.sequence ?? 1) : 1;
                          const seqMeat = isStepBasedSet ? (orderSelectSteps.find((s) => s.category === "เนื้อสัตว์")?.sequence ?? 2) : 2;
                          const isMeatStepLocked = isStepBasedSet && hasRiceWithDishCategoryLocal && isCategoryLocked("เนื้อสัตว์");
                          const prevCategoryForMeat = getPreviousRequiredCategory("เนื้อสัตว์");

                          return (
                            <>
                              {/* Step: แสดงหมวด "ข้าว+กับข้าว" ตาม sequence */}
                              {hasRiceWithDishCategoryLocal && (
                                <div className='space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8'>
                                  <div className='flex items-center gap-2 sm:gap-4'>
                                    <h3 className='text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
                                      <span className='inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black tabular-nums bg-white/80 text-gray-900 ring-1 ring-gray-900/10'>
                                        {seqRiceWithDish}
                                      </span>
                                      หมวดหมู่: ข้าว+กับข้าว
                                    </h3>
                                    <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                    <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full'>{riceWithDishCategory.length} เมนู</span>
                                  </div>

                                  <div className='flex flex-wrap gap-3 sm:gap-4'>
                                    {genericDishTypes.map((dishType) => {
                                      // ค้นหาเมนูที่ตรงกัน (ถ้าเลือกเนื้อสัตว์แล้ว)
                                      const matchingMenu = selectedMeatType ? riceWithDishCategory.find((m) => m.menu_name.includes(dishType) && m.menu_name.includes(selectedMeatType)) : null;

                                      // ตรวจสอบสถานะการเลือก
                                      const isDishTypeSelected = selectedMeatType ? (matchingMenu ? selectedMenuItems.includes(buildMenuKey(matchingMenu)) : false) : focusedDish === dishType;

                                      // ถ้าเลือกเนื้อสัตว์แล้วแต่ไม่มีเมนูที่ตรงกัน ให้ซ่อน
                                      const isUnavailable = selectedMeatType && !matchingMenu;

                                      if (isUnavailable) return null;

                                      // แสดงราคาเดิมเสมอ (ไม่ว่าจะเลือกเนื้อสัตว์อะไร) - ไม่บวกราคาเพิ่มเติม
                                      // ใช้ราคาจากเมนูหมูหรือไก่ (ราคาพื้นฐาน) เท่านั้น - ห้ามใช้ราคาจากเมนูที่มีราคาเพิ่มเติม (หมึก/กุ้ง/ทะเล)
                                      let displayPrice = 0;

                                      // หาเมนูหมูก่อน (ราคาพื้นฐาน) - ต้องมี dishType และ "หมู"
                                      // ใช้ allRiceWithDishMenus (ไม่ผ่านการกรอง) เพื่อให้หาเมนูหมู/ไก่ได้แม้เลือกกุ้ง/หมึก
                                      const porkMenu = allRiceWithDishMenus.find((m) =>
                                        m.menu_name.includes(dishType) && m.menu_name.includes("หมู")
                                      );

                                      // ถ้าไม่มีหมู ให้หาไก่ (ราคาพื้นฐาน) - ต้องมี dishType และ "ไก่"
                                      const chickenMenu = !porkMenu ? allRiceWithDishMenus.find((m) =>
                                        m.menu_name.includes(dishType) && m.menu_name.includes("ไก่")
                                      ) : null;

                                      // ใช้ราคาจากเมนูหมูหรือไก่เท่านั้น (ไม่ใช้ราคาจากเมนูที่มีราคาเพิ่มเติม เช่น หมึก/กุ้ง/ทะเล)
                                      const priceSourceMenu = porkMenu || chickenMenu;

                                      if (priceSourceMenu) {
                                        // ใช้ราคาจากเมนูหมูหรือไก่เท่านั้น (ราคาพื้นฐาน)
                                        displayPrice = getPrice(priceSourceMenu);
                                      } else {
                                        // ถ้าไม่มีหมูหรือไก่เลย ให้หาเมนูอื่นที่ไม่มีราคาเพิ่มเติม (ไม่ใช่หมึก, กุ้ง, ทะเล)
                                        const fallbackMenu = allRiceWithDishMenus.find((m) => {
                                          const hasDishType = m.menu_name.includes(dishType);
                                          const hasExpensiveMeat = m.menu_name.includes("หมึก") || m.menu_name.includes("กุ้ง") || m.menu_name.includes("ทะเล");
                                          return hasDishType && !hasExpensiveMeat;
                                        });

                                        if (fallbackMenu) {
                                          displayPrice = getPrice(fallbackMenu);
                                        }
                                        // ถ้าไม่มีเมนูที่เหมาะสมเลย ให้แสดง 0 หรือไม่แสดงราคา (ไม่ใช้เมนูที่มีราคาเพิ่มเติม)
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
                                            const hasCategorySelection = availableMenus.some((m) =>
                                              (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
                                              selectedMenuItems.includes(buildMenuKey(m))
                                            );

                                            // อนุญาตให้คลิกได้ถ้ายังไม่มีการเลือก หรือคลิกเพื่อยกเลิกอันเดิม
                                            if (true) {
                                              handleGenericDishClick(dishType, matchingMenu);
                                            }
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Step: แสดงตัวกรองเนื้อสัตว์ ตาม sequence (ล็อคจนกว่า ข้าว+กับข้าว จะครบ) */}
                              {hasRiceWithDishCategoryLocal && (
                                <div className={`space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8 ${isMeatStepLocked ? "opacity-60" : ""}`}>
                                  <div className='flex items-center gap-2 sm:gap-4'>
                                    <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isMeatStepLocked ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black tabular-nums ${isMeatStepLocked ? "bg-gray-200 text-gray-600" : "bg-white/80 text-gray-900 ring-1 ring-gray-900/10"}`}>
                                        {seqMeat}
                                      </span>
                                      หมวดหมู่: เลือกเนื้อสัตว์
                                    </h3>
                                    <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                    <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap'>{dynamicMeatTypes.length} รายการ</span>
                                  </div>

                                  {isMeatStepLocked && prevCategoryForMeat && (
                                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                                      <p className='text-xs sm:text-sm text-yellow-800 flex items-center gap-2'>
                                        <span>⚠️</span>
                                        <span>กรุณาเลือก &quot;{prevCategoryForMeat}&quot; ก่อน</span>
                                      </p>
                                    </div>
                                  )}

                                  <div className={`flex flex-wrap gap-3 sm:gap-4 ${isMeatStepLocked ? "pointer-events-none" : ""}`}>
                                    {dynamicMeatTypes.map((meat) => {
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
                                          onClick={() => !isMeatStepLocked && handleMeatFilterChange(selectedMeatType === meat ? null : meat)}
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
                                  return a.menu_name.localeCompare(b.menu_name, "th");
                                });

                                const categorySeqNumber = (() => {
                                  // Step-based: ยึดตามลำดับใน lunchbox_order_select (sorted แล้ว)
                                  if (isStepBasedSet && orderSelectSteps.length > 0) {
                                    const idx = orderSelectSteps.findIndex((s) => s.category === category);
                                    if (idx !== -1) return idx + 1;
                                  }

                                  // Default: ยึดตามลำดับ category list ที่ระบบใช้ (ถ้าพบ)
                                  const idx = getOrderedCategories.indexOf(category);
                                  if (idx !== -1) return idx + 1;

                                  return null;
                                })();

                                const categorySeqNumberForDisplay = categorySeqNumber;

                                return (
                                  <div key={category} className={`space-y-3 sm:space-y-4 lg:space-y-6 ${isLocked ? "opacity-40 pointer-events-none" : ""}`}>
                                    <div className='flex items-center gap-2 sm:gap-4'>
                                      <h3 className={`text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 ${isLocked ? "text-gray-500" : "text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                        {hasExplicitOrderSequence && (
                                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black tabular-nums ${isLocked ? "bg-gray-200 text-gray-600" : "bg-white/80 text-gray-900 ring-1 ring-gray-900/10"}`}>
                                            {categorySeqNumberForDisplay ?? "-"}
                                          </span>
                                        )}
                                        หมวดหมู่: {category}
                                      </h3>
                                      <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${isLocked ? "bg-gray-100 text-gray-500" : "bg-orange-100 text-orange-600"}`}>{menusInCategory.length} เมนู</span>
                                    </div>

                                    {/* แสดงข้อความเมื่อหมวดถูกล็อค */}
                                    {isLocked && (
                                      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3'>
                                        <p className='text-xs sm:text-sm text-yellow-800 flex items-center gap-2'>
                                          <span>⚠️</span>
                                          <span>
                                            {previousCategory
                                              ? `กรุณาเลือก "${previousCategory}" ก่อน`
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
                                            showPrice={menu.lunchbox_showPrice ?? true}
                                            onClick={() => {
                                              // Step-based: อนุญาตเฉพาะหมวดที่อยู่ใน lunchbox_order_select (ยกเว้น "ข้าว")
                                              if (isStepBasedSet) {
                                                const cat = menu.lunchbox_menu_category || "อื่นๆ";
                                                if (cat !== "ข้าว" && !stepCategories.has(cat)) {
                                                  alert(`ไม่สามารถเลือกเมนูจากหมวด "${cat}" ในชุดนี้ได้`);
                                                  return;
                                                }
                                              }

                                              // ตรวจสอบว่าหมวดนี้ถูกล็อคหรือไม่
                                              if (isLocked && menu.lunchbox_menu_category) {
                                                const prevCat = getPreviousRequiredCategory(menu.lunchbox_menu_category);
                                                if (prevCat) {
                                                  alert(`กรุณาเลือกจากหมวด "${prevCat}" ก่อน`);
                                                  return;
                                                }
                                              }

                                              if (true) {
                                                handle.MenuSelection(menuKey);
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
                {selectedFoodSet && selectedSetMenu && debouncedSearchQuery.trim() && filteredMenus.length === 0 && (
                  <div className='text-center py-8 sm:py-12 lg:py-16'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-orange-200 to-pink-300 rounded-full flex items-center justify-center'>
                      <svg className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                      </svg>
                    </div>
                    <h3 className='text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-2'>ไม่พบเมนูที่ค้นหา</h3>
                    <p className='text-xs sm:text-sm lg:text-base text-gray-500 mb-4'>ไม่พบ &ldquo;{debouncedSearchQuery}&rdquo; ในเมนูชุดนี้</p>
                    <button onClick={() => setSearchQuery("")} className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm'>
                      ล้างการค้นหา
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* แถบเมนูด้านล่าง (Mobile Footer) */}
          <MobileActionBar
            isVisible={!!selectedSetMenu}
            canSubmit={canSubmitSelection}
            saving={isSaving}
            editMode={isEditMode}
            totalCost={(() => {
              if (selectionCount.total === 0) return null;
              return selectionPrice * lunchboxQuantity;
            })()}
            onSubmit={handle.Submit}
            onReset={() => {
              setSelectedFoodSet("");
              setSelectedSetMenu("");
              setSelectedMenuItems([]);
              setLunchboxQuantity(1);
              setSelectedMeatType(null);
              setNote("");
            }}
            quantity={lunchboxQuantity}
            onQuantityChange={(val) => setLunchboxQuantity(val)}
            showQuantityControl={!!selectedSetMenu && selectionCount.total > 0}
          />
        </div >
      </div >
    </div >
  );
}
