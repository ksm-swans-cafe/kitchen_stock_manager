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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Add responsive state
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const router = useRouter();
  const { addLunchbox } = useCartStore();

  // States for hierarchical selection system
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>("");
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  // เพิ่ม state สำหรับเก็บ quantity ของข้าว
  const [riceQuantity, setRiceQuantity] = useState<number>(0);
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItemWithAutoRice[]>([]);
  const [note, setNote] = useState<string>("");

  // helper สำหรับสร้าง key ที่ไม่ซ้ำระหว่างเมนูที่ชื่อซ้ำแต่หมวดต่างกัน
  const buildMenuKey = (menu: Partial<MenuItemWithAutoRice>) => menu.lunchbox_menuid ?? `${menu.menu_id ?? ""}-${menu.lunchbox_menu_category ?? ""}-${menu.menu_name ?? ""}`;

  // unified price helper (ใช้เฉพาะ lunchbox_cost)
  const getPrice = (menu?: Partial<MenuItemWithAutoRice>) => menu?.lunchbox_cost ?? 0;

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true); // เพิ่ม state นี้
  // State สำหรับเก็บรายการรูปที่โหลดไม่สำเร็จ
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dots = useLoadingDots();

  const extractPriceFromSetName = (setName: string): number | null => {
    const match = setName.match(/(\d+)\s*baht/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Locale-aware sorter (EN/TH + numeric)
  const sortStrings = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b, "th", { numeric: true, sensitivity: "base" }));

  // Check for edit mode and manage loading state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get("edit") === "true";

    if (isEdit) {
      setIsLoadingEditData(true);
      const editingIndexStr = sessionStorage.getItem("editingLunchboxIndex");
      const editingDataStr = sessionStorage.getItem("editingLunchboxData");

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
            const menuKeys = editingData.selected_menus.map((menu: MenuItemWithAutoRice) => buildMenuKey(menu));
            setSelectedMenuItems(menuKeys);
          }

          console.log("Loading edit data:", editingData);
          console.log("Set selectedFoodSet to:", editingData.lunchbox_name);
          console.log("Set selectedSetMenu to:", editingData.lunchbox_set);
          console.log("Available lunchboxData:", lunchboxData);

          setTimeout(() => {
            setIsLoadingEditData(false);
          }, 500);
        } catch (error) {
          console.error("Error loading edit data:", error);
          setIsLoadingEditData(false);
        }
      } else if (lunchboxData.length === 0) {
        console.log("Waiting for lunchboxData to load...");
      }
    }
  }, [lunchboxData]);

  useEffect(() => {
    const fetchLunchboxData = async () => {
      setIsLoadingLunchboxData(true); // เริ่ม loading
      try {
        const response = await fetch("/api/get/lunchbox");
        const data = await response.json();
        console.log("Lunchbox data:", data);

        const items = (Array.isArray(data) ? data : data?.data) as LunchBoxFromAPI[] | undefined;
        if (items) {
          setLunchboxData(items);

          // Extract unique food sets (ชุดอาหาร)
          const uniqueFoodSets = sortStrings([...new Set(items.map((item: LunchBoxFromAPI) => item.lunchbox_name))]);
          console.log("Available food sets:", uniqueFoodSets);
          setAvailableFoodSets(uniqueFoodSets);
        }
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      } finally {
        setIsLoadingLunchboxData(false);
      }
    };

    fetchLunchboxData();

    // --- update current time ---
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // cleanup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedFoodSet && lunchboxData.length > 0) {
      const availableSets = lunchboxData.filter((item) => item.lunchbox_name === selectedFoodSet);
      const uniqueSetMenus = sortStrings([...new Set(availableSets.map((item) => item.lunchbox_set_name))]);
      console.log("Available set menus for", selectedFoodSet, ":", uniqueSetMenus);
      console.log("Filtered sets data:", availableSets);
      setAvailableSetMenus(uniqueSetMenus);
    } else {
      setAvailableSetMenus([]);
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

  useEffect(() => {
    if (selectedFoodSet && selectedSetMenu && availableMenus.length > 0) {
      // ตรวจสอบว่าเป็น Custom และ limit = 0 หรือไม่
      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setData?.lunchbox_limit ?? 0;
      const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

      // ถ้าไม่ใช่ Custom unlimited ให้ใช้การเลือกข้าวอัตโนมัติแบบเดิม
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

  // Filter menus based on search query
  const filteredMenus = useMemo(() => {
    if (!searchQuery.trim()) return availableMenus;

    const query = searchQuery.toLowerCase();
    const normalizedQuery = normalizeThaiText(query);

    return availableMenus.filter((menu) => {
      const normalizedMenuName = normalizeThaiText(menu.menu_name?.toLowerCase() || "");
      const normalizedMenuSubname = normalizeThaiText(menu.menu_subname?.toLowerCase() || "");
      const normalizedMenuDescription = normalizeThaiText(menu.menu_description?.toLowerCase() || "");
      const normalizedMenuCategory = normalizeThaiText(menu.lunchbox_menu_category?.toLowerCase() || "");

      return normalizedMenuName.includes(normalizedQuery) || normalizedMenuSubname.includes(normalizedQuery) || (menu.lunchbox_cost ?? 0).toString().includes(query) || normalizedMenuDescription.includes(normalizedQuery) || normalizedMenuCategory.includes(normalizedQuery);
    });
  }, [availableMenus, searchQuery]);

  // รวมจำนวนเมนูที่เลือก (นับข้าวให้ถูกต้อง และรองรับ key ที่ใช้ buildMenuKey)
  const selectionCount = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);

    const riceCountFromItems = resolvedMenus.filter((m) => m.lunchbox_menu_category === "ข้าว").length;
    const nonRiceCount = resolvedMenus.filter((m) => m.lunchbox_menu_category !== "ข้าว").length;

    // ถ้ามี riceQuantity ให้ใช้ค่านั้น (สำหรับ unlimited), ถ้าไม่มีให้ใช้จำนวนข้าวที่เจอใน items
    const riceCount = riceQuantity > 0 ? riceQuantity : riceCountFromItems;

    return {
      nonRiceCount,
      riceCount,
      total: nonRiceCount + riceCount,
    };
  }, [selectedMenuItems, availableMenus, riceQuantity]);

  const handle = {
    MenuSelection: (menuKey: string) => {
      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setData?.lunchbox_limit ?? 0;
      const selectedMenu = availableMenus.find((menu) => buildMenuKey(menu) === menuKey);
      if (!selectedMenu) return;

      const isRiceMenu = selectedMenu.lunchbox_menu_category === "ข้าว";
      const isUnlimited = limit === 0;

      const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

      // ตรวจสอบว่าเป็น Lunchbox Set E หรือ F หรือไม่
      const isSidedishesSet = selectedFoodSet === "Lunch Box" && (selectedSetMenu === "E" || selectedSetMenu === "F");
      const isSidedishesSetJ = selectedFoodSet === "อาหารเจ" && selectedSetMenu === "D";
      const isSidedishesSetPre = selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht" || selectedSetMenu === "379 baht");
      // เพิ่มเงื่อนไขสำหรับ Premium Lunch Set "379 baht"
      const isPremium379 = selectedFoodSet === "Premium Lunch" && selectedSetMenu === "379 baht";
      const isSidedishCategory = selectedMenu.lunchbox_menu_category === "เครื่องเคียง";
      // เพิ่มการตรวจสอบหมวด "กับข้าว"
      const isMainDishCategory = selectedMenu.lunchbox_menu_category === "กับข้าวที่ 1";

      // ใช้ flag จากข้อมูลเมนูเพื่อกำหนดการเพิ่มข้าวอัตโนมัติ
      const shouldAutoAddRice = selectedMenu.lunchbox_AutoRice === true;

      setSelectedMenuItems((prev) => {
        const isSelected = prev.includes(menuKey);

        if (isSelected) {
          // ถ้าเป็นเซต unlimited และเมนูนี้ถูกตั้งให้เพิ่มข้าวอัตโนมัติ (ไม่ใช่ข้าว)
          if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
            let newPrev = prev.filter((item) => item !== menuKey);

            // นับจำนวนเมนูใน category เดียวกันที่เหลืออยู่ (ไม่นับข้าว)
            const menusInCategory = availableMenus.filter((menu) => menu.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว" && newPrev.includes(buildMenuKey(menu)));

            // หาข้าวที่เพิ่มอัตโนมัติ
            const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
            const riceMenuName = riceMenus.length > 0 ? riceMenus[0].menu_name : null;

            if (riceMenuName) {
              // จำนวนข้าวที่ควรมี (1 ข้าวต่อ 1 เมนูใน category เดียวกัน)
              const requiredRiceCount = menusInCategory.length;

              setRiceQuantity(requiredRiceCount);

              // ถ้าไม่มีเมนูเหลือแล้ว ให้เอาข้าวออก
              if (requiredRiceCount === 0 && newPrev.includes(riceMenuName)) {
                newPrev = newPrev.filter((item) => item !== riceMenuName);
              } else if (requiredRiceCount > 0 && !newPrev.includes(riceMenuName)) {
                // ถ้ายังมีเมนูแต่ยังไม่มีข้าว ให้เพิ่มข้าว
                newPrev.push(riceMenuName);
              }
            }

            return newPrev;
          }

          // ถ้าเป็นเซต unlimited และเป็นข้าว
          if (isRiceMenu && isUnlimited) {
            const allSelectedMenus = availableMenus.filter((menu) => prev.includes(buildMenuKey(menu)) && menu.lunchbox_menu_category !== "ข้าว");
            const totalMenuCount = allSelectedMenus.length;

            // ถ้ายังมีเมนูเหลืออยู่และข้าวยังไม่พอ ให้แจ้งเตือน
            if (totalMenuCount > 0 && riceQuantity <= totalMenuCount) {
              alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากยังมีเมนูที่ต้องการข้าวอยู่");
              return prev;
            }

            // ลด quantity ของข้าว หรือเอาออกถ้า quantity = 0
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

          // ถ้าไม่ใช่เซต unlimited (limit > 0) ให้บล็อกหมวดที่เลือกไปแล้ว
          if (!isUnlimited) {
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
            } else if (selectedMenu.lunchbox_menu_category && existingLunchboxCategories.includes(selectedMenu.lunchbox_menu_category)) {
              alert(`ไม่สามารถเลือกเมนูจากหมวดหมู่ "${selectedMenu.lunchbox_menu_category}" ได้ เนื่องจากได้เลือกเมนูจากหมวดหมู่นี้ไว้แล้ว`);
              return prev;
            }
          }

          // ถ้าเป็นเซต unlimited และเมนูนี้ถูกตั้งให้เพิ่มข้าวอัตโนมัติ (ไม่ใช่ข้าว)
          // ให้เพิ่มจำนวนข้าวตามจำนวนเมนูใน category เดียวกัน
          if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
            const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
            if (riceMenus.length > 0) {
              const riceMenuKey = buildMenuKey(riceMenus[0]);

              // นับจำนวนเมนูใน category เดียวกันที่เลือกไว้แล้ว (ไม่นับข้าว)
              const menusInCategory = availableMenus.filter((menu) => menu.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && menu.lunchbox_menu_category !== "ข้าว" && prev.includes(buildMenuKey(menu)));

              // คำนวณจำนวนข้าวที่ต้องการ (1 ข้าวต่อ 1 เมนูใน category)
              const requiredRiceCount = menusInCategory.length + 1; // +1 เพราะกำลังจะเพิ่มเมนูใหม่

              setRiceQuantity(requiredRiceCount);

              // ถ้ายังไม่มีข้าวในรายการ ให้เพิ่มข้าว
              if (!prev.includes(riceMenuKey)) {
                return [...prev, riceMenuKey, menuKey];
              } else {
                return [...prev, menuKey];
              }
            }
          }

          // ถ้า limit = 0 (ไม่จำกัด) หรือ Custom unlimited ให้เลือกได้เลย
          if (isUnlimited || prev.length < limit) {
            return [...prev, menuKey];
          } else {
            const newSelection = [...prev.slice(1), menuKey];
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

      // เพิ่มการตรวจสอบ lunchbox_limit
      const setDataInfo = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
      const limit = setDataInfo?.lunchbox_limit ?? 0;

      // ถ้ามี limit > 0 และเลือกไม่ครบ ให้แจ้งเตือน
      if (limit > 0 && selectedMenuItems.length < limit) {
        alert(`กรุณาเลือกเมนูให้ครบ ${limit} เมนู (เลือกแล้ว ${selectedMenuItems.length} เมนู)`);
        return;
      }

      if (isSaving) return;

      setIsSaving(true);

      try {
        // นับจำนวนเมนูแต่ละตัว (รวมข้าวที่ซ้ำกัน)
        const menuCountMap = new Map<string, number>();
        selectedMenuItems.forEach((menuKey) => {
          const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
          // ถ้าเป็นข้าว ให้ใช้ quantity จาก state
          if (menu?.lunchbox_menu_category === "ข้าว") menuCountMap.set(menuKey, riceQuantity);
          else menuCountMap.set(menuKey, (menuCountMap.get(menuKey) || 0) + 1);
        });

        // สร้าง selectedMenuObjects โดยไม่ซ้ำกัน แต่เก็บ quantity ไว้
        // สำหรับ Custom unlimited เก็บเป็น array ที่มี menu objects ตามจำนวนที่เลือก
        const selectedMenuObjects: MenuItemWithAutoRice[] = [];
        const processedMenuNames = new Set<string>();

        for (const menuKey of selectedMenuItems) {
          if (!processedMenuNames.has(menuKey)) {
            const menu = availableMenus.find((m) => buildMenuKey(m) === menuKey);
            if (menu) {
              const quantity = menuCountMap.get(menuKey) || 1;
              // สำหรับ Custom unlimited (limit = 0) ให้สร้าง menu objects ตามจำนวนที่เลือก
              // สำหรับแบบอื่น ให้สร้างแค่ 1 object ต่อ menu name
              const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;
              const objectsToCreate = isCustomUnlimited ? quantity : 1;

              for (let i = 0; i < objectsToCreate; i++) selectedMenuObjects.push({ ...menu });
              processedMenuNames.add(menuKey);
            } else {
              console.warn(`Menu not found: ${menuKey}`);
            }
          }
        }

        // ตรวจสอบว่ามี menu objects หรือไม่
        if (selectedMenuObjects.length === 0) throw new Error("ไม่พบเมนูที่เลือก");

        const setDataInfo2 = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
        const limit2 = setDataInfo2?.lunchbox_limit ?? 0;

        let totalCost: number;
        const setPrice = extractPriceFromSetName(selectedSetMenu);
        if (setPrice !== null) totalCost = setPrice;
        else totalCost = selectedMenuObjects.reduce((total, menu) => total + (menu.lunchbox_cost ?? 0), 0);

        const newLunchbox = {
          lunchbox_name: selectedFoodSet,
          lunchbox_set: selectedSetMenu,
          lunchbox_limit: limit2,
          selected_menus: selectedMenuObjects,
          quantity: 1,
          lunchbox_total_cost: totalCost.toString(),
          note: note,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (isEditMode && editingIndex !== -1) {
          const store = useCartStore.getState();

          store.updateLunchboxMenus(editingIndex, selectedMenuObjects);
          store.updateLunchboxNote(editingIndex, note);
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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading overlay when loading edit data
  if (isLoadingEditData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4'>
        <div className='bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-sm w-full'>
          <div className='animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4'></div>
          <h3 className='text-base md:text-lg font-medium text-gray-700 mb-2'>🔧 กำลังโหลดข้อมูลแก้ไข</h3>
          <p className='text-base text-gray-500'>กรูณารอสักครู่{dots}</p>
        </div>
      </div>
    );
  }

  // Show loading overlay when loading lunchbox data
  if (isLoadingLunchboxData) {
    return <Loading context='กำลังโหลดข้อมูลชุดอาหาร' icon={SetFoodIcon.src} />;
  }

  // Improved DesktopSidebar with better responsive design
  const DesktopSidebar = () => (
    <div className='p-3 md:p-4 xl:p-6 h-full overflow-y-auto'>
      {/* Mode Indicator */}
      {isEditMode && (
        <div className='text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl'>
          <div className='text-sm font-medium text-yellow-800'>🔧 โหมดแก้ไข</div>
          <div className='text-xs text-yellow-600 mt-1'>กำลังแก้ไขรายการที่ {editingIndex + 1}</div>
        </div>
      )}

      {/* Time - Improved responsive typography */}
      <div className='text-center mb-4 md:mb-6 pt-3'>
        <div className='text-sm md:text-base xl:text-lg font-bold text-black'>
          วันที่{" "}
          {currentTime
            ? (() => {
                const date = currentTime;
                const day = date.toLocaleDateString("th-TH", { day: "2-digit" });
                const month = date.toLocaleDateString("th-TH", { month: "long" });
                const year = date.toLocaleDateString("th-TH", { year: "numeric" });

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
                // second: "2-digit",
              })
            : "--:--"}{" "}
          น.
        </div>
      </div>

      {/* Selection Progress - Improved spacing and touch targets */}
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
            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
              selectedFoodSet ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-100 border-2 border-orange-300" : "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
            }`}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3 xl:space-x-4'>
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${
                    selectedFoodSet ? "bg-green-500 text-white" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : "bg-gray-400 text-white"
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

          {/* Step 2: เลือก Set อาหาร - Similar improvements */}
          <button
            onClick={() => {
              if (selectedSetMenu) {
                setSelectedSetMenu("");
                setSelectedMenuItems([]);
              }
            }}
            disabled={!selectedFoodSet}
            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
              selectedSetMenu
                ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                : selectedFoodSet && !selectedSetMenu
                ? "bg-orange-100 border-2 border-orange-300"
                : selectedFoodSet
                ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
            }`}>
            {/* Similar structure to Step 1 with responsive improvements */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3 xl:space-x-4 truncate '>
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold truncate ${
                    selectedSetMenu ? "bg-green-500 text-white truncate" : selectedFoodSet && !selectedSetMenu ? "bg-orange-500 text-white truncate" : selectedFoodSet ? "bg-gray-400 text-white truncate " : "bg-gray-300 text-gray-500 truncate"
                  }`}>
                  2
                </div>
                <div className='flex-1 min-w-0 truncate'>
                  <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg truncate'>เลือก Set อาหาร</div>
                  <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>
                    {selectedSetMenu ? (
                      <>
                        {selectedSetMenu}
                        {(() => {
                          const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                          const limit = setData?.lunchbox_limit ?? 0;
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
              {selectedSetMenu && <span className='text-green-600 text-lg md:text-xl xl:text-2xl truncate'>✓</span>}
            </div>
          </button>

          {/* Step 3: เลือกเมนูอาหาร - Similar improvements */}
          <button
            onClick={() => {
              if (selectionCount.total > 0) {
                setSelectedMenuItems([]);
                setRiceQuantity(0);
              }
            }}
            disabled={!selectedSetMenu}
            className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
              selectionCount.total > 0
                ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                : selectedSetMenu
                ? "bg-orange-100 border-2 border-orange-300"
                : selectedSetMenu
                ? "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                : "bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-50"
            }`}>
            {/* Similar structure with responsive improvements */}
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

        {/* Note Section - Improved responsive design */}
        {selectionCount.total > 0 && (
          <div className='mt-4 xl:mt-6 space-y-3 xl:space-y-4'>
            <div>
              <label className='block text-xs md:text-sm xl:text-base font-medium text-gray-700 mb-2'>หมายเหตุ (ไม่บังคับ)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='ระบุข้อมูลเพิ่มเติม...'
                className='w-full px-3 py-3 md:px-4 md:py-4 xl:px-5 xl:py-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm md:text-base xl:text-lg text-gray-700 placeholder-gray-400 resize-none'
                rows={isMobile ? 2 : 3}
              />
            </div>

            {/* Submit Button - Improved responsive sizing */}
            <button
              onClick={handle.Submit}
              disabled={(() => {
                if (isSaving) return true;
                if (selectionCount.total === 0) return true;

                // ตรวจสอบว่าเลือกครบตาม limit หรือไม่
                const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                const limit = setData?.lunchbox_limit ?? 0;

                // ถ้า limit > 0 ต้องเลือกครบ, ถ้า limit = 0 (ไม่จำกัด) เลือกอย่างน้อย 1 เมนูก็ได้
                if (limit > 0) return selectionCount.total !== limit;
                return false; // limit = 0 (ไม่จำกัด)
              })()}
              className={`w-full px-4 py-4 md:px-5 md:py-5 xl:px-6 xl:py-6 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 xl:gap-3 min-h-[50px] md:min-h-[60px] xl:min-h-[70px] ${
                isSaving ||
                (() => {
                  if (selectionCount.total === 0) return true;
                  const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                  const limit = setData?.lunchbox_limit ?? 0;
                  return limit > 0 && selectionCount.total !== limit;
                })()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-xl"
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

        {/* Reset Button - Improved responsive design */}
        {(selectedFoodSet || selectedSetMenu || selectedMenuItems.length > 0) && (
          <button
            onClick={() => {
              const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));

              setSelectedFoodSet("");
              setSelectedSetMenu("");
              setSelectedMenuItems(riceMenus);
              setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
              setNote("");
            }}
            className='w-full mt-3 xl:mt-4 px-4 py-3 md:px-5 md:py-4 xl:px-6 xl:py-5 bg-red-500 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl hover:bg-red-600 transition-colors min-h-[45px] md:min-h-[50px] xl:min-h-[60px]'>
            รีเซ็ตการเลือก
          </button>
        )}
      </div>
    </div>
  );

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

        /* Improved responsive grid utilities */
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

        /* Mobile-specific utilities */
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
        {/* Desktop Sidebar - Rendered inline to prevent re-render issues */}
        <div className='hidden lg:block w-72 xl:w-80 2xl:w-96 bg-white border-r border-gray-200 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto'>
          <div className='p-3 md:p-4 xl:p-6'>
            {/* Mode Indicator */}
            {isEditMode && (
              <div className='text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl'>
                <div className='text-sm font-medium text-yellow-800'>🔧 โหมดแก้ไข</div>
                <div className='text-xs text-yellow-600 mt-1'>กำลังแก้ไขรายการที่ {editingIndex + 1}</div>
              </div>
            )}

            {/* Time - Improved responsive typography */}
            <div className='text-center mb-4 md:mb-6 pt-3'>
              <div className='text-sm md:text-base xl:text-lg font-bold text-black'>
                วันที่{" "}
                {currentTime
                  ? (() => {
                      const date = currentTime;
                      const day = date.toLocaleDateString("th-TH", { day: "2-digit" });
                      const month = date.toLocaleDateString("th-TH", { month: "long" });
                      const year = date.toLocaleDateString("th-TH", { year: "numeric" });

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
                  : "--:--"}{" "}
                น.
              </div>
            </div>

            {/* Selection Progress - Improved spacing and touch targets */}
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
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
                    selectedFoodSet
                      ? "bg-green-100 border-2 border-green-300 hover:bg-green-200 cursor-pointer"
                      : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0
                      ? "bg-orange-100 border-2 border-orange-300"
                      : "bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 cursor-pointer"
                  }`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 xl:space-x-4'>
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${
                          selectedFoodSet ? "bg-green-500 text-white" : !selectedFoodSet && !selectedSetMenu && selectedMenuItems.length === 0 ? "bg-orange-500 text-white" : "bg-gray-400 text-white"
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
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
                    selectedSetMenu
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
                        className={`w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full flex items-center justify-center text-sm md:text-base xl:text-lg font-bold ${
                          selectedSetMenu ? "bg-green-500 text-white" : selectedFoodSet && !selectedSetMenu ? "bg-orange-500 text-white" : selectedFoodSet ? "bg-gray-400 text-white" : "bg-gray-300 text-gray-500"
                        }`}>
                        2
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-800 text-sm md:text-base xl:text-lg'>เลือก Set อาหาร</div>
                        <div className='text-xs md:text-sm xl:text-base text-gray-500 truncate'>
                          {selectedSetMenu ? (
                            <>
                              {selectedSetMenu}
                              {(() => {
                                const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                                const limit = setData?.lunchbox_limit ?? 0;
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
                  className={`w-full p-3 md:p-4 xl:p-5 rounded-xl transition-all duration-200 text-left min-h-[60px] md:min-h-[70px] xl:min-h-[80px] ${
                    selectionCount.total > 0
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

              {/* Note  Section */}
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

                  {/* Submit Button */}
                  <button
                    onClick={handle.Submit}
                    disabled={(() => {
                      if (isSaving) return true;
                      if (selectionCount.total === 0) return true;
                      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                      const limit = setData?.lunchbox_limit ?? 0;
                      if (limit > 0) return selectionCount.total !== limit;
                      return false;
                    })()}
                    className={`w-full px-4 py-4 md:px-5 md:py-5 xl:px-6 xl:py-6 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 xl:gap-3 min-h-[50px] md:min-h-[60px] xl:min-h-[70px] ${
                      isSaving ||
                      (() => {
                        if (selectionCount.total === 0) return true;
                        const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                        const limit = setData?.lunchbox_limit ?? 0;
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

              {/* Reset Button */}
              {(selectedFoodSet || selectedSetMenu || selectedMenuItems.length > 0) && (
                <button
                  onClick={() => {
                    const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));
                    setSelectedFoodSet("");
                    setSelectedSetMenu("");
                    setSelectedMenuItems(riceMenus);
                    setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
                    setNote("");
                  }}
                  className='w-full mt-3 xl:mt-4 px-4 py-3 md:px-5 md:py-4 xl:px-6 xl:py-5 bg-red-500 text-white text-sm md:text-base xl:text-lg font-medium rounded-xl hover:bg-red-600 transition-colors min-h-[45px] md:min-h-[50px] xl:min-h-[60px]'>
                  รีเซ็ตการเลือก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col min-h-[100svh]'>
          {/* Mobile Top Stepper - Sticky Header */}
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
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "--/--/-- --:--"
              }
            />
          </div>

          {/* Scrollable Content - Enhanced responsive design */}
          <div className='flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 xl:p-8 pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-6 xl:pb-8 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 backdrop-blur-sm'>
            {/* Search and Filter Section - Improved responsive layout */}
            <div className=' bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 shadow-lg border border-white/20'>
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

            {/* Selection Area - Enhanced responsive grids */}
            <div className='mb-6 lg:mb-8 xl:mb-12'>
              {/* Step 1: เลือกชุดอาหาร */}
              {!selectedFoodSet && (
                <div>
                  <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
                    <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>1. เลือกชุดอาหาร</span>
                    <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableFoodSets.length} รายการ</span>
                  </h2>

                  <div className='responsive-grid'>
                    {availableFoodSets.map((foodSet, index) => {
                      // หาภาพ lunchbox_name_image จาก lunchboxData
                      const foodSetData = lunchboxData.find((item) => item.lunchbox_name === foodSet);
                      const foodSetImageName = foodSetData?.lunchbox_name_image;
                      // สร้าง URL เต็มจาก Blob Store
                      const foodSetImage = foodSetImageName 
                        ? `https://hvusvym1gfn5yabw.public.blob.vercel-storage.com/img/lunchbox-set-img/${foodSetImageName}`
                        : null;
                      
                      // Debug log
                      console.log(`FoodSet: ${foodSet}, ImageName: ${foodSetImageName}, ImageURL: ${foodSetImage}`);

                      return (
                        <div
                          key={index}
                          className='group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]'
                          onClick={() => setSelectedFoodSet(foodSet)}>
                          <div className='aspect-square bg-[linear-gradient(to_bottom_right,var(--color-orange-100),var(--color-orange-200),var(--color-orange-300))] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden'>
                            {foodSetImage && !failedImages.has(foodSetImage) ? (
                              <img 
                                src={foodSetImage} 
                                alt={`ชุด ${foodSet}`}
                                className='min-w-full min-h-full object-cover object-center'
                                onError={() => {
                                  setFailedImages(prev => new Set(prev).add(foodSetImage));
                                }}
                              />
                            ) : (
                              <svg width={100} height={100} version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox='0 0 512 512' xmlSpace='preserve'>
                                <path
                                  style={{ fill: "#4DA3FF" }}
                                  d='M379.089,134.898v247.18c0,11.396,9.238,20.634,20.634,20.634h91.643
    c11.396,0,20.634-9.238,20.634-20.634v-247.18C512,134.898,379.089,134.898,379.089,134.898z'
                                />
                                <rect x='379.087' y='134.902' style={{ opacity: 0.3, fill: "#333333" }} width='132.913' height='20.756' />
                                <rect x='379.087' y='62.138' style={{ fill: "#8AE6A1" }} width='132.913' height='72.76' />
                                <path
                                  style={{ opacity: 0.15, fill: "#333333" }}
                                  d='M405.899,382.078v-247.18h-26.81v247.18
                                    c0,11.396,9.238,20.634,20.634,20.634h26.81C415.137,402.712,405.899,393.474,405.899,382.078z'
                                />
                                <rect
                                  x='379.087'
                                  y='62.138'
                                  width='26.81'
                                  height='72.76'
                                  style={{ opacity: 0.15, fill: "#333333" }}
                                  d='M210.43,209.417h-67.717c-33.582,0-60.904-27.321-60.904-60.904s27.321-60.904,60.904-60.904h67.717
    c33.582,0,60.903,27.321,60.903,60.904S244.012,209.417,210.43,209.417z M142.713,125.893c-12.473,0-22.619,10.147-22.619,22.619
    s10.147,22.619,22.619,22.619h67.717c12.473,0,22.619-10.147,22.619-22.619s-10.147-22.619-22.619-22.619
    C210.43,125.893,142.713,125.893,142.713,125.893z'
                                />
                                <path
                                  style={{ opacity: 0.15, fill: "#333333" }}
                                  d='M233.049,148.513c0,12.473-10.146,22.619-22.619,22.619
    h-67.716c-12.473,0-22.619-10.146-22.619-22.619c0-5.165,1.744-9.929,4.669-13.741H83.392c-1.023,4.419-1.582,9.015-1.582,13.741
    c0,33.582,27.321,60.904,60.904,60.904h67.716c33.582,0,60.903-27.321,60.903-60.904c0-4.726-0.559-9.321-1.582-13.741H228.38
    C231.305,138.584,233.049,143.348,233.049,148.513z'
                                />
                                <path
                                  style={{ fill: "#FFCA66" }}
                                  d='M20.358,402.712h312.426c11.244,0,20.358-9.114,20.358-20.358V175.886
    c0-11.244-9.114-20.358-20.358-20.358H20.358C9.114,155.528,0,164.643,0,175.886v206.468C0,393.598,9.114,402.712,20.358,402.712z'
                                />
                                <path
                                  style={{ fill: "#FF8095" }}
                                  d='M295.214,199.283H57.93c-7.829,0-14.176,6.347-14.176,14.176v131.326
    c0,7.829,6.347,14.176,14.176,14.176h237.284c7.829,0,14.176-6.347,14.176-14.176V213.458
    C309.39,205.628,303.043,199.283,295.214,199.283z'
                                />
                                <circle style={{ fill: "#D9576D" }} cx='363.526' cy='378.12' r='71.742' />
                                <path
                                  style={{ opacity: 0.15, fill: "#333333" }}
                                  d='M316.405,378.118c0-35.419,25.677-64.823,59.427-70.664
    c-4.002-0.693-8.111-1.075-12.311-1.075c-39.62,0-71.738,32.119-71.738,71.738c0,39.62,32.118,71.738,71.738,71.738
    c4.2,0,8.309-0.382,12.311-1.073C342.082,442.941,316.405,413.537,316.405,378.118z'
                                />
                                <path
                                  style={{ fill: "#8AE6A1" }}
                                  d='M331.519,270.708c-3.873,9.849-1.834,21.483,6.127,29.443c7.96,7.96,19.596,9.999,29.443,6.127
    c3.873-9.849,1.834-21.483-6.127-29.443C353.001,268.874,341.366,266.836,331.519,270.708z'
                                />
                              </svg>
                            )}
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
                <div>
                  <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col gap-2'>
                    <span className='bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>2. เลือก Set อาหาร</span>
                    <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableSetMenus.length} รายการ</span>
                  </h2>

                  <div className='responsive-grid'>
                    {availableSetMenus.map((setMenu, index) => {
                      const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === setMenu);
                      const limit = setData?.lunchbox_limit || 0;
                      // หาภาพ lunchbox_set_name_image จาก lunchboxData
                      const setMenuImageName = setData?.lunchbox_set_name_image;
                      // สร้าง URL เต็มจาก Blob Store
                      const setMenuImage = setMenuImageName
                        ? `https://hvusvym1gfn5yabw.public.blob.vercel-storage.com/img/lunchbox-set-img/${setMenuImageName}`
                        : null;

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
                                  setFailedImages(prev => new Set(prev).add(setMenuImage));
                                }}
                              />
                            ) : (
                              <img src={FoodMenuSetIcon.src} className='w-[100px] h-[100px]' alt='' />
                            )}
                          </div>

                          <div className='text-center p-2 sm:p-3 lg:p-4'>
                            <h3 className='font-semibold text-gray-800 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2'>Set {setMenu}</h3>
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
                  <h2 className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 xl:mb-8 flex flex-col flex-wrap gap-2'>
                    <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>3. เลือกเมนูอาหาร</span>
                    <span className='text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit'>{availableMenus.length} รายการ</span>
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

                  {/* Note Section - Mobile Only with improved responsive design */}
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
                        const menusToDisplay = searchQuery.trim() ? filteredMenus : availableMenus;
                        const groupedMenus = menusToDisplay.reduce((groups, menu) => {
                          const category = menu.lunchbox_menu_category || "อื่นๆ";
                          if (!groups[category]) {
                            groups[category] = [];
                          }
                          groups[category].push(menu);
                          return groups;
                        }, {} as Record<string, typeof availableMenus>);

                        // กำหนดลำดับ category แบบกำหนดเอง
                        const categoryOrder = 
                        [
                          "ข้าว", "ข้าวผัด", "ราดข้าว", "กับข้าว", "กับข้าวที่ 1", "กับข้าวที่ 2", 
                          "ผัด", "พริกเเกง", "แกง", "ต้ม", 
                          "ไข่", "สเต็ก", "สปาเกตตี้", "สลัด", "ย่าง", "ยำ", "ซุป", "เครื่องเคียง", "ซอส", 
                          "เครื่องดื่ม", "ผลไม้", "ขนมปัง", "ของหวาน", "เค้ก", "อื่นๆ"
                        ];
                        const sortedCategories = Object.keys(groupedMenus).sort((a, b) => {
                          const indexA = categoryOrder.indexOf(a);
                          const indexB = categoryOrder.indexOf(b);
                          // ถ้าทั้งคู่อยู่ใน categoryOrder ให้เรียงตามลำดับที่กำหนด
                          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                          // ถ้า a อยู่ใน categoryOrder แต่ b ไม่อยู่ ให้ a มาก่อน
                          if (indexA !== -1) return -1;
                          // ถ้า b อยู่ใน categoryOrder แต่ a ไม่อยู่ ให้ b มาก่อน
                          if (indexB !== -1) return 1;
                          // ถ้าทั้งคู่ไม่อยู่ใน categoryOrder ให้เรียงตามตัวอักษรภาษาไทยและแสดงต่อท้าย
                          return a.localeCompare(b, "th");
                        });

                        // ฟังก์ชันตรวจสอบประเภทเนื้อสัตว์จากชื่อเมนู
                        const getMeatType = (menuName: string): "หมู" | "ไก่" | "หมึก" | "ทะเล" | null => {
                          if (menuName.includes("หมู")) return "หมู";
                          if (menuName.includes("ไก่")) return "ไก่";
                          if (menuName.includes("หมึก")) return "หมึก";
                          if (menuName.includes("กุ้ง") || menuName.includes("ทะเล")) return "ทะเล";
                          return null;
                        };

                        // ฟังก์ชันตรวจสอบประเภทอาหารจากชื่อเมนู
                        const getDishType = (menuName: string): string | null => {
                          if (menuName.includes("กะเพรา") || menuName.includes("กระเพรา")) return "กะเพรา";
                          if (menuName.includes("กระเทียม")) return "กระเทียม";
                          if (menuName.includes("พริกแกง") || menuName.includes("พริกเเกง")) return "พริกแกง";
                          if (menuName.includes("คั่วกลิ้ง")) return "คั่วกลิ้ง";
                          if (menuName.includes("ผัดผงกะหรี่")) return "ผัดผงกะหรี่";
                          return null;
                        };

                        // ลำดับความสำคัญของประเภทอาหาร
                        const dishOrder = ["กะเพรา", "กระเทียม", "พริกแกง", "คั่วกลิ้ง", "ผัดผงกะหรี่"];
                        // ลำดับความสำคัญของประเภทเนื้อสัตว์
                        const meatOrder = ["หมู", "ไก่", "หมึก", "ทะเล"];

                        return sortedCategories.map((category) => {
                          // เรียงลำดับเมนูตามประเภทอาหารก่อน แล้วตามประเภทเนื้อสัตว์ แล้วค่อยเรียงตามตัวอักษร
                          const menusInCategory = groupedMenus[category].sort((a, b) => {
                            const dishA = getDishType(a.menu_name);
                            const dishB = getDishType(b.menu_name);
                            const dishIndexA = dishA ? dishOrder.indexOf(dishA) : -1;
                            const dishIndexB = dishB ? dishOrder.indexOf(dishB) : -1;
                            
                            // เรียงตามประเภทอาหารก่อน
                            if (dishIndexA !== -1 && dishIndexB !== -1) {
                              if (dishIndexA !== dishIndexB) return dishIndexA - dishIndexB;
                              // ถ้าประเภทอาหารเดียวกัน ให้เรียงตามประเภทเนื้อสัตว์
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
                            // ถ้า a มีประเภทอาหาร แต่ b ไม่มี ให้ a มาก่อน
                            if (dishIndexA !== -1) return -1;
                            // ถ้า b มีประเภทอาหาร แต่ a ไม่มี ให้ b มาก่อน
                            if (dishIndexB !== -1) return 1;
                            
                            // ถ้าไม่มีประเภทอาหาร ให้เรียงตามประเภทเนื้อสัตว์
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

                          // ตรวจสอบว่าเป็น Custom unlimited หรือไม่
                          const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                          const limit = setData?.lunchbox_limit ?? 0;
                          const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

                          return (
                            <div key={category} className='space-y-3 sm:space-y-4 lg:space-y-6'>
                              {/* Category Header */}
                              <div className='flex items-center gap-2 sm:gap-4'>
                                <h3 className='text-sm sm:text-base lg:text-lg font-bold text-gray-800 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>หมวดหมู่: {category}</h3>
                                <div className='flex-1 h-px bg-gradient-to-r from-orange-200 to-pink-200'></div>
                                <span className='text-xs sm:text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full'>{menusInCategory.length} เมนู</span>
                              </div>

                              {/* Menus Grid for this category - Improved responsive layout แก้ตรงนี้*/}
                              <div className='responsive-grid'>
                                {menusInCategory.map((menu, index) => {
                                  const menuKey = buildMenuKey(menu);
                                  const isSelected = selectedMenuItems.includes(menuKey);

                                  // ตรวจสอบว่าเป็น Custom unlimited หรือไม่
                                  const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
                                  const limit = setData?.lunchbox_limit ?? 0;
                                  const isUnlimited = limit === 0;
                                  const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

                                  // ตรวจสอบว่าเป็น Lunch Box Set E หรือ F หรือ อาหารเจ Set D หรือ Premium Lunch Set "270 baht" และเป็นหมวด "เครื่องเคียง" หรือไม่
                                  const isSidedishesSet =
                                    (selectedFoodSet === "Lunch Box" && (selectedSetMenu === "E" || selectedSetMenu === "F")) ||
                                    (selectedFoodSet === "อาหารเจ" && selectedSetMenu === "D") ||
                                    (selectedFoodSet === "Premium Lunch" && (selectedSetMenu === "270 baht" || selectedSetMenu === "300 baht" || selectedSetMenu === "379 baht"));
                                  const isSidedishCategory = menu.lunchbox_menu_category === "เครื่องเคียง";
                                  // เพิ่มเงื่อนไขสำหรับ Premium Lunch Set "379 baht"
                                  const isPremium379 = selectedFoodSet === "Premium Lunch" && selectedSetMenu === "379 baht";
                                  const isMainDishCategory = menu.lunchbox_menu_category === "กับข้าวที่ 1";

                                  // ถ้าไม่ใช่เซต unlimited (limit > 0) ให้บล็อกหมวดที่เลือกไปแล้ว
                                  let isLunchboxCategoryTaken = false;
                                  if (!isUnlimited) {
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
                                    } else {
                                      // กรณีปกติ: ถ้าหมวดนั้นถูกเลือกไปแล้ว และเมนูนี้ยังไม่ได้เลือก ให้บล็อก
                                      isLunchboxCategoryTaken = !!menu.lunchbox_menu_category && selectedLunchboxCategories.includes(menu.lunchbox_menu_category) && !isSelected;
                                    }
                                  }

                                  const isAutoSelectedRice = menu.lunchbox_menu_category === "ข้าว" && isSelected;

                                  // ตรวจสอบว่าเป็นข้าวที่เพิ่มอัตโนมัติจาก flag บนเมนูหรือไม่
                                  const shouldAutoAddRice = menu.lunchbox_AutoRice === true;

                                  // ตรวจสอบประเภทเนื้อสัตว์สำหรับแสดงสี
                                  const menuMeatType = getMeatType(menu.menu_name);

                                  return (
                                    <MenuCard
                                      className='group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]'
                                      key={menu.menu_id || index}
                                      menuId={menu.menu_id || String(index)}
                                      name={menu.menu_name}
                                      price={getPrice(menu)}
                                      category={menu.lunchbox_menu_category || undefined}
                                      emoji={menu.lunchbox_menu_category === "ข้าว" ? "🍚" : "🍜"}
                                      image={FoodMenuIcon.src}
                                      meatType={menuMeatType}
                                      selected={isSelected}
                                      forced={isAutoSelectedRice && !isUnlimited} // แก้ไข: ไม่บังคับถ้าเป็นเซต unlimited
                                      duplicate={!!isLunchboxCategoryTaken}
                                      size={isMobile ? "sm" : "md"}
                                      showPrice={menu.lunchbox_showPrice ?? true} // แสดงราคาตาม lunchbox_isPrice
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

              {/* Empty state when search has no results */}
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

          {/* Mobile Action Bar - Sticky Bottom */}
          <MobileActionBar
            canSubmit={(() => {
              if (selectionCount.total === 0) return false;

              // ตรวจสอบว่าเลือกครบตาม limit หรือไม่
              const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
              const limit = setData?.lunchbox_limit ?? 0;

              if (limit > 0) {
                return selectionCount.total === limit;
              }
              return true;
            })()}
            saving={isSaving}
            editMode={isEditMode}
            totalCost={(() => {
              if (selectionCount.total === 0) return null;

              const setPrice = extractPriceFromSetName(selectedSetMenu);
              if (setPrice !== null) {
                return setPrice;
              }

              return availableMenus.filter((m) => selectedMenuItems.includes(buildMenuKey(m))).reduce((sum, m) => sum + (m.lunchbox_cost ?? 0), 0);
            })()}
            onSubmit={handle.Submit}
            onReset={() => {
              const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => menu.menu_name);
              setSelectedFoodSet("");
              setSelectedSetMenu("");
              setSelectedMenuItems(riceMenus);
              setNote("");
            }}
          />
        </div>
      </div>
    </div>
  );
}
