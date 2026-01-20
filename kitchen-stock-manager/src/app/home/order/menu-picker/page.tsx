"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
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
import { LunchboxHeaderSection } from "./components/LunchboxHeaderSection";
import { MobileQuantitySelector } from "./components/MobileQuantitySelector";
import { CategorySelection } from "./components/CategorySelection";
import { SelectionSidebar } from "./components/SelectionSidebar";
import { DEFAULT_CATEGORY_ORDER, PREMIUM_SNACK_BOX_ORDER, DISH_ORDER, MEAT_ORDER, GENERIC_DISH_TYPES, getMeatType, getDishType, getCategoryLimit, sortMenusByCategory, MEAT_SURCHARGE, getNormalizedPrice as getNormalizedPriceUtil } from "./constants/categoryOrder";
import { useCategorySequence } from "./hooks/useCategorySequence";

import FoodMenuSetIcon from "@/assets/food-menu.png";
import FoodMenuIcon from "@/assets/kung-pao-chicken.png";

import { MenuItemWithAutoRice, LunchBoxFromAPI } from "./types";

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
  // ตัวแปรสำหรับจัดการกลุ่มเมนู Moved to constants/categoryOrder.ts

  // ฟังก์ชันดึงราคาที่ปรับจูนแล้ว (Normalize price with meat surcharge calculation)
  const getNormalizedPrice = (menu?: Partial<MenuItemWithAutoRice>, includeMeatSurcharge = false) => {
    return getNormalizedPriceUtil(menu, availableMenus, includeMeatSurcharge);
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
            imageUrl: menu.imageUrl || (menu as any).menu_name_image || "",
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

  // Auto-select all menus for Premium Lunch
  useEffect(() => {
    if (selectedFoodSet === "Premium Lunch" && selectedSetMenu && availableMenus.length > 0) {
      // เลือกเมนูทั้งหมดของ lunchbox_set_name อัตโนมัติ
      const allMenuKeys = availableMenus.map((menu) => buildMenuKey(menu));

      setSelectedMenuItems((prev) => {
        // รวมเมนูทั้งหมดที่ยังไม่มีใน selectedMenuItems
        const newKeys = allMenuKeys.filter((key) => !prev.includes(key));
        if (newKeys.length > 0) {
          // นับจำนวนข้าว
          const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
          if (riceMenus.length > 0) {
            setRiceQuantity(riceMenus.length);
          }
          return [...prev, ...newKeys];
        }
        return prev;
      });
    }
  }, [selectedFoodSet, selectedSetMenu, availableMenus]);

  useEffect(() => {
    if (!selectedSetMenu) setRiceQuantity(0);
  }, [selectedSetMenu]);

  // ล้างการเลือก "เพิ่มเติมสำหรับเครื่องดื่ม" เมื่อเครื่องดื่มถูกปลดออก
  useEffect(() => {
    const hasBeverageSelected = selectedMenuItems.some((key) => {
      const menu = availableMenus.find((m) => buildMenuKey(m) === key);
      return menu?.lunchbox_menu_category === "เครื่องดื่ม";
    });

    // ถ้าไม่มีการเลือกเครื่องดื่ม ให้ล้างการเลือก "เพิ่มเติมสำหรับเครื่องดื่ม"
    if (!hasBeverageSelected) {
      const hasBeverageAddonSelected = selectedMenuItems.some((key) => {
        const menu = availableMenus.find((m) => buildMenuKey(m) === key);
        return menu?.lunchbox_menu_category === "เพิ่มเติมสำหรับเครื่องดื่ม";
      });

      // เรียก setState เฉพาะเมื่อมีการเลือก "เพิ่มเติมสำหรับเครื่องดื่ม" อยู่
      if (hasBeverageAddonSelected) {
        setSelectedMenuItems((prev) =>
          prev.filter((key) => {
            const menu = availableMenus.find((m) => buildMenuKey(m) === key);
            return menu?.lunchbox_menu_category !== "เพิ่มเติมสำหรับเครื่องดื่ม";
          })
        );
      }
    }
  }, [selectedMenuItems, availableMenus]);

  // ✅ Auto-add dish when both focusedDish + selectedMeatType are selected
  useEffect(() => {
    if (focusedDish && selectedMeatType) {
      const matchingMenu = availableMenus.find((m) =>
        (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
        m.menu_name.includes(focusedDish) &&
        m.menu_name.includes(selectedMeatType)
      );

      if (matchingMenu) {
        const menuKey = buildMenuKey(matchingMenu);
        // ถ้ายังไม่มีใน selectedMenuItems ให้เพิ่มเข้าไป (พร้อม Auto-Swap ในหมวดเดียวกัน)
        if (!selectedMenuItems.includes(menuKey)) {
          setSelectedMenuItems((prev) => {
            // กรองเอาเมนูเก่าในหมวด "กับข้าวที่ 1" หรือ "ข้าว+กับข้าว" ออกก่อน (Auto-Swap)
            const filteredItems = prev.filter((key) => {
              const menu = availableMenus.find((m) => buildMenuKey(m) === key);
              return (
                menu?.lunchbox_menu_category !== "กับข้าวที่ 1" &&
                menu?.lunchbox_menu_category !== "ข้าว+กับข้าว"
              );
            });
            return [...filteredItems, menuKey];
          });
        }
      }
    }
  }, [focusedDish, selectedMeatType, availableMenus]);

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

    total += nonRiceMenus.reduce((sum, m) => sum + getNormalizedPrice(m, false), 0);

    if (riceMenu) {
      const riceCount = riceQuantity > 0 ? riceQuantity : 1;
      total += getNormalizedPrice(riceMenu, false) * riceCount;
    }

    // เพิ่มราคาจาก focusedDish (ไม่ว่าจะเลือกเนื้อสัตว์หรือไม่)
    if (focusedDish) {
      if (selectedMeatType) {
        // ถ้าเลือก focusedDish + selectedMeatType -> หาเมนูที่ตรงกับทั้งคู่พร้อม surcharge
        const matchingMenu = availableMenus.find((m) =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          m.menu_name.includes(focusedDish) &&
          m.menu_name.includes(selectedMeatType)
        );
        if (matchingMenu && !selectedMenuItems.includes(buildMenuKey(matchingMenu))) {
          total += getNormalizedPrice(matchingMenu, true);
        }
      } else {
        // ถ้าเลือก focusedDish เพียงอย่างเดียว -> หาเมนูที่มี focusedDish ที่ถูกที่สุด (หมู/ไก่)
        const riceWithDishMenus = availableMenus.filter((m) =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          m.menu_name.includes(focusedDish)
        );

        if (riceWithDishMenus.length > 0) {
          // หาราคาที่ถูกที่สุด (มักจะเป็น หมู/ไก่)
          const basePriceMenu = riceWithDishMenus.find((m) => {
            const hasPork = m.menu_name.includes("หมู");
            const hasChicken = m.menu_name.includes("ไก่");
            return hasPork || hasChicken;
          });

          const menuToUse = basePriceMenu || riceWithDishMenus[0];

          if (!selectedMenuItems.includes(buildMenuKey(menuToUse))) {
            total += getNormalizedPrice(menuToUse, false);
          }
        }
      }
    }

    return total;
  }, [selectedMenuItems, availableMenus, riceQuantity, focusedDish, selectedMeatType]);



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
    // ตรวจสอบว่า focusedDish menu ไม่ได้อยู่ใน selectedMenuItems แล้ว ก่อนนับ
    if (focusedDish && selectedMeatType) {
      const matchingMenu = availableMenus.find((m) =>
        (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
        m.menu_name.includes(focusedDish) &&
        m.menu_name.includes(selectedMeatType)
      );
      if (matchingMenu) {
        const menuKeyExists = selectedMenuItems.includes(buildMenuKey(matchingMenu));
        // ถ้ายังไม่มีใน selectedMenuItems จึงนับ (เพราะ focusedDish ยังไม่ได้ถูกเพิ่ม)
        if (!menuKeyExists) {
          if (matchingMenu.lunchbox_menu_category === "ข้าว+กับข้าว") {
            totalNonRice += 1; // นับเป็นกับข้าว
            totalRice += 1; // นับเป็นข้าว
          } else {
            totalNonRice += 1;
          }
        }
      }
    }

    return {
      nonRiceCount: totalNonRice,
      riceCount: totalRice,
      total: totalNonRice + totalRice,
    };
  }, [selectedMenuItems, availableMenus, riceQuantity, selectedMeatType]);

  // ==================== Sequential Category Selection Logic ====================
  const {
    getOrderedCategories,
    getSelectedCategories,
    isCategoryLocked,
    getPreviousRequiredCategory,
  } = useCategorySequence({
    availableMenus,
    selectedSetMenu,
    selectedMenuItems,
    focusedDish,
    selectedMeatType,
    buildMenuKey,
  });

  // --- ข้อมูลเงื่อนไขพิเศษของชุดอาหาร (กำหนดโควตาแต่ละหมวด) ---
  // Moved to constants/categoryOrder.ts

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

      // ตรวจสอบว่าถ้าไม่ใช่ Custom ต้องเลือกทีละ step (ไม่ให้ข้าม step)
      if (selectedFoodSet !== "Custom") {
        const orderedCategories = getOrderedCategories;
        const selectedCategories = getSelectedCategories;

        // หาหมวดแรกที่ยังไม่ได้เลือก
        let firstUnselectedCategory: string | null = null;

        for (let i = 0; i < orderedCategories.length; i++) {
          const category = orderedCategories[i];

          // ข้ามหมวด "meat-filter" เพราะเป็น virtual category
          if (category === "meat-filter") continue;

          // ตรวจสอบว่าหมวดนี้มีเมนูหรือไม่
          const menusInCategory = availableMenus.filter(
            (m) => m.lunchbox_menu_category === category
          );

          if (menusInCategory.length === 0) continue;

          // ตรวจสอบว่าหมวดนี้เลือกแล้วหรือยัง
          const hasSelectionInCategory =
            selectedCategories.includes(category) ||
            (category === "กับข้าวที่ 1" && focusedDish !== null) ||
            (category === "ข้าว+กับข้าว" && focusedDish !== null) ||
            (category === "meat-filter" && selectedMeatType !== null);

          // ถ้ายังไม่ได้เลือก และยังไม่เจอหมวดแรกที่ยังไม่ได้เลือก
          if (!hasSelectionInCategory && firstUnselectedCategory === null) {
            firstUnselectedCategory = category;
          }

          // ถ้าเจอหมวดแรกที่ยังไม่ได้เลือก แล้วเจอหมวดถัดไปที่เลือกแล้ว แสดงว่าข้าม step
          if (firstUnselectedCategory !== null && hasSelectionInCategory && category !== firstUnselectedCategory) {
            alert(`กรุณาเลือกเมนูจากหมวด "${firstUnselectedCategory}" ก่อนเลือกหมวด "${category}"`);
            return;
          }
        }
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
        // ตรวจสอบว่าไม่ได้เพิ่มซ้ำ
        if (focusedDish && selectedMeatType) {
          const matchingMenu = availableMenus.find((m) =>
            (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
            m.menu_name.includes(focusedDish) &&
            m.menu_name.includes(selectedMeatType)
          );
          if (matchingMenu && !selectedMenuItems.includes(buildMenuKey(matchingMenu))) {
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
        const sortedSelectedMenus = sortMenusByCategory(selectedMenuObjects, selectedSetMenu);

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
          selected_menus: sortedSelectedMenus,
          quantity: lunchboxQuantity,
          lunchbox_total_cost: totalCost.toString(),
          note: note,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (isEditMode && editingIndex !== -1) {
          const store = useCartStore.getState();
          store.updateLunchboxMenus(editingIndex, sortedSelectedMenus);
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
          <div className='bg-white p-6 md:p-8 xl:p-6 rounded-xl shadow-lg text-center max-w-sm w-full'>
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
        <SelectionSidebar
          isEditMode={isEditMode}
          editingIndex={editingIndex}
          currentTime={currentTime}
          selectedFoodSet={selectedFoodSet}
          selectedSetMenu={selectedSetMenu}
          selectedMenuItems={selectedMenuItems}
          selectionCount={selectionCount}
          note={note}
          setNote={setNote}
          isSaving={isSaving}
          dots={dots}
          onReset={() => {
            const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));
            setSelectedFoodSet("");
            setSelectedSetMenu("");
            setSelectedMenuItems(riceMenus);
            setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
            setSelectedMeatType(null);
            setNote("");
          }}
          onSubmit={handle.Submit}
          onSetFoodSet={setSelectedFoodSet}
          onSetSetMenu={setSelectedSetMenu}
          onSetMenuItems={setSelectedMenuItems}
          onSetRiceQuantity={setRiceQuantity}
          onSetLunchboxQuantity={setLunchboxQuantity}
          onSetSelectedMeatType={setSelectedMeatType}
          onSetSearchQuery={setSearchQuery}
          onSetFocusedDish={setFocusedDish}
          getSetLimit={getSetLimit}
          availableMenus={availableMenus}
          buildMenuKey={buildMenuKey}
        />

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
              {/* Lunchbox Header Section Component */}
              <LunchboxHeaderSection
                selectedFoodSet={selectedFoodSet}
                selectedSetMenu={selectedSetMenu}
                lunchboxData={lunchboxData}
                failedImages={failedImages}
                setFailedImages={setFailedImages}
                buildBlobImageUrl={buildBlobImageUrl}
                setPriceBudget={setPriceBudget}
                selectionPrice={selectionPrice}
                lunchboxQuantity={lunchboxQuantity}
                setLunchboxQuantity={setLunchboxQuantity}
                selectedMenuItems={selectedMenuItems}
              />



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
                          <svg width={100} height={100} version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0  512 512'>
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
                  <CategorySelection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedMeatType={selectedMeatType}
                    handleMeatFilterChange={handleMeatFilterChange}
                    availableMenus={availableMenus}
                    selectedMenuItems={selectedMenuItems}
                    handleMenuSelection={handle.MenuSelection}
                    focusedDish={focusedDish}
                    handleGenericDishClick={handleGenericDishClick}
                    selectionCount={selectionCount}
                    selectedFoodSet={selectedFoodSet}
                    selectedSetMenu={selectedSetMenu}
                    lunchboxData={lunchboxData}
                    isCategoryLocked={isCategoryLocked}
                    getPreviousRequiredCategory={getPreviousRequiredCategory}
                    buildMenuKey={buildMenuKey}
                    getPrice={getPrice}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    buildBlobImageUrl={buildBlobImageUrl}
                  />
                )}
              </div>
            </div>

            {/* แถบเมนูด้านล่าง (Mobile) */}
            <div className='lg:hidden fixed bottom-0 inset-x-0 z-40 flex flex-col'>
              {/* จำนวนชุดอาหาร (Mobile) */}
              <MobileQuantitySelector
                selectedSetMenu={selectedSetMenu}
                lunchboxQuantity={lunchboxQuantity}
                setLunchboxQuantity={setLunchboxQuantity}
              />

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
