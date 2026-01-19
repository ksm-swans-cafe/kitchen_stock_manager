import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/store";
import { MenuItemWithAutoRice, LunchBoxFromAPI } from "@/lib/types";
import { 
  CATEGORY_ORDER, 
  MEAT_KEYWORDS, 
  MEAT_PRICE_MAP, 
  DISH_ORDER, 
  MEAT_ORDER 
} from "@/lib/constants";
import { 
  buildMenuKey, 
  normalizeThaiText, 
  extractPriceFromSetName, 
  sortStrings, 
  getMeatType, 
  getDishType, 
  getCategoryLimit,
  getSetLimit as getSetLimitUtil, // เปลี่ยนชื่อเพื่อไม่ให้ซ้ำกับ function ภายใน
} from "@/lib/lunchboxUtils";

export const useLunchbox = () => {
  const router = useRouter();
  const { addLunchbox } = useCartStore();

  // ==================== State ====================
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMeatType, setSelectedMeatType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Selection State
  const [selectedFoodSet, setSelectedFoodSet] = useState<string>("");
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [riceQuantity, setRiceQuantity] = useState<number>(0);
  const [lunchboxQuantity, setLunchboxQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [focusedDish, setFocusedDish] = useState<string | null>(null);

  // Data State
  const [lunchboxData, setLunchboxData] = useState<LunchBoxFromAPI[]>([]);
  const [availableFoodSets, setAvailableFoodSets] = useState<string[]>([]);
  const [availableSetMenus, setAvailableSetMenus] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItemWithAutoRice[]>([]);

  // Loading & UI State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoadingEditData, setIsLoadingEditData] = useState<boolean>(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingLunchboxData, setIsLoadingLunchboxData] = useState<boolean>(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // ==================== Helpers ภายใน Hook ====================
  
  // Wrapper เพื่อให้ UI เรียกใช้ได้ง่ายขึ้น (Closure over lunchboxData)
  const getSetLimit = (foodSet: string, setMenu: string) => 
    getSetLimitUtil(lunchboxData, foodSet, setMenu);

  // คำนวณราคาแบบ Normalzied
  const getNormalizedPrice = (menu?: Partial<MenuItemWithAutoRice>, includeMeatSurcharge = false) => {
    if (!menu) return 0;
    let basePrice = menu.lunchbox_cost ?? 0;

    if (menu.lunchbox_menu_category === "กับข้าวที่ 1" || menu.lunchbox_menu_category === "ข้าว+กับข้าว") {
      const dishType = getDishType(menu.menu_name || "");
      if (dishType) {
        const variants = availableMenus.filter(m =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          getDishType(m.menu_name || "") === dishType
        );
        if (variants.length > 0) {
          basePrice = Math.min(...variants.map(v => v.lunchbox_cost || 0));
        }
      }
      if (includeMeatSurcharge) {
        const meatType = getMeatType(menu.menu_name || "");
        const surcharge = MEAT_PRICE_MAP[meatType || ""] || 0;
        basePrice += surcharge;
      }
    }
    return basePrice;
  };

  const getPrice = (menu?: Partial<MenuItemWithAutoRice>) => getNormalizedPrice(menu);

  // ==================== Effects ====================

  // 1. Fetch Data & Time
  useEffect(() => {
    const fetchLunchboxData = async () => {
      setIsLoadingLunchboxData(true);
      try {
        const response = await fetch("/api/get/lunchbox");
        const data = await response.json();
        const items = (Array.isArray(data) ? data : data?.data) as LunchBoxFromAPI[] | undefined;
        if (items) {
          setLunchboxData(items);
          const uniqueFoodSets = sortStrings([...new Set(items.map((item) => item.lunchbox_name))]);
          setAvailableFoodSets(uniqueFoodSets);
        }
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      } finally {
        setIsLoadingLunchboxData(false);
      }
    };

    fetchLunchboxData();
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Resize Handler
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 2. Edit Mode Logic
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

            for (const menu of editingData.selected_menus) {
              const meat = getMeatType(menu.menu_name || "");
              if (meat) {
                setSelectedMeatType(meat);
                break;
              }
            }
          }
          setTimeout(() => setIsLoadingEditData(false), 500);
        } catch (error) {
          console.error("Error loading edit data:", error);
          setIsLoadingEditData(false);
        }
      } else {
        setIsLoadingEditData(false);
      }
    }
  }, [lunchboxData]);

  // 3. Available Sets Logic
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

  // 4. Fetch Menus Logic
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
            ...menu,
            menu_id: menu.menu_id?.toString() || "",
            menu_name: menu.menu_name || "",
            lunchbox_cost: Number(menu.lunchbox_cost) || 0,
            // ... map fields as needed
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

  // 5. Auto Rice & Reset Logic
  useEffect(() => {
    if (selectedFoodSet && selectedSetMenu && availableMenus.length > 0) {
      const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
      const isCustomUnlimited = selectedFoodSet === "Custom" && limit === 0;

      if (!isCustomUnlimited) {
        const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว");
        if (riceMenus.length > 0) {
          const riceMenuKey = buildMenuKey(riceMenus[0]);
          setSelectedMenuItems((prev) => {
            if (!prev.includes(riceMenuKey)) {
              if (riceQuantity < 1) setRiceQuantity(1);
              return [...prev, riceMenuKey];
            }
            return prev;
          });
        }
      }
    }
  }, [selectedFoodSet, selectedSetMenu, availableMenus, lunchboxData]);

  useEffect(() => {
    if (!selectedSetMenu) setRiceQuantity(0);
  }, [selectedSetMenu]);

  // ==================== Computed Values (Memo) ====================

  const filteredMenus = useMemo(() => {
    let result = availableMenus;
    if (selectedMeatType) {
      result = result.filter((menu) => {
        if (menu.lunchbox_menu_category !== "กับข้าวที่ 1" && menu.lunchbox_menu_category !== "ข้าว+กับข้าว") return true;
        return (menu.menu_name || "").includes(selectedMeatType);
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const normalizedQuery = normalizeThaiText(query);
      result = result.filter((menu) => {
        const normName = normalizeThaiText(menu.menu_name?.toLowerCase() || "");
        return normName.includes(normalizedQuery);
      });
    }
    return result;
  }, [availableMenus, searchQuery, selectedMeatType]);

  const dynamicMeatTypes = useMemo(() => {
    const mainDish1Menus = availableMenus.filter((m) => m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว");
    return MEAT_KEYWORDS.filter((k) => mainDish1Menus.some((m) => (m.menu_name || "").includes(k)));
  }, [availableMenus]);

  const selectionPrice = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);
    let total = 0;
    const riceMenu = resolvedMenus.find((m) => m.lunchbox_menu_category === "ข้าว");
    const nonRiceMenus = resolvedMenus.filter((m) => m.lunchbox_menu_category !== "ข้าว");

    total += nonRiceMenus.reduce((sum, m) => sum + getNormalizedPrice(m, false), 0);

    if (riceMenu) {
      const riceCount = riceQuantity > 0 ? riceQuantity : 1;
      total += getNormalizedPrice(riceMenu, false) * riceCount;
    }

    if (focusedDish) {
      if (selectedMeatType) {
        const matchingMenu = availableMenus.find((m) =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          m.menu_name.includes(focusedDish) &&
          m.menu_name.includes(selectedMeatType)
        );
        if (matchingMenu && !selectedMenuItems.includes(buildMenuKey(matchingMenu))) {
          total += getNormalizedPrice(matchingMenu, true);
        }
      } else {
        const riceWithDishMenus = availableMenus.filter((m) =>
          (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
          m.menu_name.includes(focusedDish)
        );
        if (riceWithDishMenus.length > 0) {
          const basePriceMenu = riceWithDishMenus.find((m) => m.menu_name.includes("หมู") || m.menu_name.includes("ไก่"));
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

  const selectionCount = useMemo(() => {
    const resolvedMenus = selectedMenuItems.map((key) => availableMenus.find((m) => buildMenuKey(m) === key)).filter((m): m is MenuItemWithAutoRice => !!m);
    const riceCountFromItems = resolvedMenus.filter((m) => m.lunchbox_menu_category === "ข้าว").length;
    const nonRiceCount = resolvedMenus.filter((m) => m.lunchbox_menu_category !== "ข้าว").length;
    const riceCount = riceQuantity > 0 ? riceQuantity : riceCountFromItems;

    let totalNonRice = nonRiceCount;
    let totalRice = riceCount;

    if (focusedDish && selectedMeatType) {
      const matchingMenu = availableMenus.find((m) =>
        (m.lunchbox_menu_category === "กับข้าวที่ 1" || m.lunchbox_menu_category === "ข้าว+กับข้าว") &&
        m.menu_name.includes(focusedDish) &&
        m.menu_name.includes(selectedMeatType)
      );
      if (matchingMenu) {
        const menuKeyExists = selectedMenuItems.includes(buildMenuKey(matchingMenu));
        if (!menuKeyExists) {
          if (matchingMenu.lunchbox_menu_category === "ข้าว+กับข้าว") {
            totalNonRice += 1; totalRice += 1;
          } else {
            totalNonRice += 1;
          }
        }
      }
    }
    return { nonRiceCount: totalNonRice, riceCount: totalRice, total: totalNonRice + totalRice };
  }, [selectedMenuItems, availableMenus, riceQuantity, selectedMeatType]);

  const getOrderedCategories = useMemo(() => {
    const categoryOrder = [...CATEGORY_ORDER];
    const existingCategories = [...new Set(availableMenus.map((m) => m.lunchbox_menu_category).filter((cat): cat is string => !!cat && cat !== "ข้าว"))];
    if (existingCategories.some(cat => cat === "กับข้าวที่ 1" || cat === "ข้าว+กับข้าว")) {
      existingCategories.push("meat-filter");
    }
    return categoryOrder.filter((cat) => existingCategories.includes(cat));
  }, [availableMenus]);

  const getSelectedCategories = useMemo(() => {
    const selected = availableMenus
      .filter((menu) => selectedMenuItems.includes(buildMenuKey(menu)))
      .map((menu) => menu.lunchbox_menu_category)
      .filter((cat): cat is string => !!cat && cat !== "ข้าว");

    if (focusedDish !== null) {
      if (!selected.includes("กับข้าวที่ 1")) selected.push("กับข้าวที่ 1");
      if (!selected.includes("ข้าว+กับข้าว")) selected.push("ข้าว+กับข้าว");
    }
    if (focusedDish !== null && selectedMeatType !== null) {
      selected.push("meat-filter");
    }
    return selected;
  }, [availableMenus, selectedMenuItems, focusedDish, selectedMeatType]);

  const isCategoryLocked = (category: string) => {
    const categoryIndex = getOrderedCategories.indexOf(category);
    if (categoryIndex === -1 || categoryIndex === 0) return false;
    const prevCategory = getOrderedCategories[categoryIndex - 1];
    return !getSelectedCategories.includes(prevCategory);
  };

  const getPreviousRequiredCategory = (category: string) => {
    const categoryIndex = getOrderedCategories.indexOf(category);
    if (categoryIndex <= 0) return null;
    return getOrderedCategories[categoryIndex - 1];
  };

  // ==================== Handlers ====================

  const handleMenuSelection = (menuKey: string) => {
    const setData = lunchboxData.find((item) => item.lunchbox_name === selectedFoodSet && item.lunchbox_set_name === selectedSetMenu);
    const limit = setData?.lunchbox_limit ?? 0;
    const selectedMenu = availableMenus.find((menu) => buildMenuKey(menu) === menuKey);
    if (!selectedMenu) return;

    const isRiceMenu = selectedMenu.lunchbox_menu_category === "ข้าว";
    const isUnlimited = limit === 0;
    const shouldAutoAddRice = selectedMenu.lunchbox_AutoRice === true;

    setSelectedMenuItems((prev) => {
      const isSelected = prev.includes(menuKey);

      if (isSelected) {
        if (isRiceMenu && !isUnlimited) {
          alert("ไม่สามารถยกเลิกการเลือกข้าวได้ เนื่องจากข้าวเป็นส่วนประกอบหลักของชุดอาหาร");
          return prev;
        }
        let newItems = prev.filter((item) => item !== menuKey);
        
        // Cascade Clear
        if (selectedMenu.lunchbox_menu_category) {
          const currentCatIndex = getOrderedCategories.indexOf(selectedMenu.lunchbox_menu_category);
          if (currentCatIndex !== -1) {
            const followingCategories = getOrderedCategories.slice(currentCatIndex + 1);
            newItems = newItems.filter((key) => {
              const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
              return !m?.lunchbox_menu_category || !followingCategories.includes(m.lunchbox_menu_category);
            });
            if (followingCategories.includes("meat-filter")) {
              setSelectedMeatType(null);
              setFocusedDish(null);
            }
          }
        } else if (isRiceMenu && isUnlimited) {
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
        let newItems = [...prev];
        // Auto-Swap Logic
        if (selectedMenu.lunchbox_menu_category) {
          const catLimit = getCategoryLimit(selectedFoodSet, selectedSetMenu, selectedMenu.lunchbox_menu_category);
          const itemsInCategory = newItems.filter((key) => {
            const m = availableMenus.find((menu) => buildMenuKey(menu) === key);
            return m?.lunchbox_menu_category === selectedMenu.lunchbox_menu_category;
          });
          if (itemsInCategory.length >= catLimit) {
            const oldestKey = itemsInCategory[0];
            newItems = newItems.filter((k) => k !== oldestKey);
          }
        }
        // Auto Add Rice
        if (isUnlimited && !isRiceMenu && selectedMenu.lunchbox_menu_category && shouldAutoAddRice) {
          const riceMenus = availableMenus.filter((m) => m.lunchbox_menu_category === "ข้าว");
          if (riceMenus.length > 0) {
            const riceKey = buildMenuKey(riceMenus[0]);
            const menusInCategory = availableMenus.filter((m) => m.lunchbox_menu_category === selectedMenu.lunchbox_menu_category && m.lunchbox_menu_category !== "ข้าว" && newItems.includes(buildMenuKey(m)));
            setRiceQuantity(menusInCategory.length + 1);
            if (!newItems.includes(riceKey)) newItems.push(riceKey);
          }
        }
        // Check Limit
        if (!isUnlimited && newItems.length >= limit) {
          return [...newItems.slice(1), menuKey];
        }
        return [...newItems, menuKey];
      }
    });
  };

  const handleSubmit = async () => {
    const isWithDish1Complete = focusedDish !== null && selectedMeatType !== null;
    const hasSelections = selectedMenuItems.length > 0 || isWithDish1Complete;

    if (!selectedFoodSet || !selectedSetMenu || !hasSelections) {
      alert("กรุณาเลือกชุดอาหาร, Set อาหาร และเมนูอาหารให้ครบถ้วน");
      return;
    }

    const limit = getSetLimit(selectedFoodSet, selectedSetMenu);
    if (limit > 0 && selectionCount.total < limit) {
      alert(`กรุณาเลือกเมนูให้ครบ ${limit} รายการ (เลือกแล้ว ${selectionCount.total} รายการ)`);
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalSelectedItems: MenuItemWithAutoRice[] = [];
      selectedMenuItems.forEach(key => {
        const m = availableMenus.find(menu => buildMenuKey(menu) === key);
        if (m) finalSelectedItems.push(m);
      });

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

      const menuCountMap = new Map<string, number>();
      finalSelectedItems.forEach((menu) => {
        const menuKey = buildMenuKey(menu);
        if (menu.lunchbox_menu_category === "ข้าว") {
          menuCountMap.set(menuKey, riceQuantity);
        } else {
          menuCountMap.set(menuKey, (menuCountMap.get(menuKey) || 0) + 1);
        }
      });

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

      const categoryOrder = CATEGORY_ORDER;
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

      resetSelection();
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push("/home/order");
    } catch (error) {
      console.error("Error processing lunchbox:", error);
      alert(`เกิดข้อผิดพลาดในการประมวลผล: ${error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง"}`);
      setIsSaving(false);
    }
  };

  const handleMeatFilterChange = (newMeatType: string | null) => {
    setSelectedMeatType(newMeatType);
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

  const handleGenericDishClick = (dishType: string) => {
    setFocusedDish((prev) => {
      const isDeselecting = prev === dishType;
      if (isDeselecting) {
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

  const resetSelection = () => {
    const riceMenus = availableMenus.filter((menu) => menu.lunchbox_menu_category === "ข้าว").map((menu) => buildMenuKey(menu));
    setSelectedFoodSet("");
    setSelectedSetMenu("");
    setSelectedMenuItems(riceMenus);
    setRiceQuantity(riceMenus.length > 0 ? 1 : 0);
    setLunchboxQuantity(1);
    setSelectedMeatType(null);
    setNote("");
    setSearchQuery("");
    setFocusedDish(null);
    setIsEditMode(false);
    setEditingIndex(-1);
  };

  return {
    state: {
      searchQuery, selectedMeatType, viewMode, currentTime, isMobile,
      selectedFoodSet, selectedSetMenu, selectedMenuItems, riceQuantity, lunchboxQuantity, note, focusedDish,
      lunchboxData, availableFoodSets, availableSetMenus, availableMenus,
      isEditMode, editingIndex, isLoadingEditData, isLoadingMenus, isSaving, isLoadingLunchboxData, failedImages,
    },
    actions: {
      setSearchQuery, setSelectedMeatType, setViewMode,
      setSelectedFoodSet, setSelectedSetMenu, setSelectedMenuItems, setRiceQuantity, setLunchboxQuantity, setNote,
      setFailedImages,
      handleMenuSelection, handleSubmit, handleMeatFilterChange, handleGenericDishClick, resetSelection
    },
    computed: {
      filteredMenus, dynamicMeatTypes, selectionPrice, setPriceBudget, selectionCount,
      getOrderedCategories, getSelectedCategories, isCategoryLocked, getPreviousRequiredCategory,
      getSetLimit, getPrice
    }
  };
};