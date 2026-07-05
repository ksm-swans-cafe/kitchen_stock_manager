"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useSWR from "swr";
import { create } from "zustand";
import {
  Search,
  Utensils,
  Info,
  Plus,
  X,
  Tag,
  Tags,
  Carrot,
  Box,
  Settings,
  FileText,
  Pencil,
  Trash2,
  Drumstick,
  AlignLeft,
  List,
  PackageOpen,
  CirclePlus,
  CircleX,
  DollarSign,
  Layers,
  Eye,
  EyeOff,
  Sprout,
  UtensilsCrossed,
  Save,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import PaginationComponent from "@/components/ui/Totalpage";
import { Ingredient, IngredientOption, MenuItem, IngredientUnit, MenuLunchbox } from "@/models/menu_list/MenuList";
import { DISH_TYPES, MEAT_TYPES, resolveDishType, resolveMeatType } from "@/lib/menu/dishMeatType";

interface LunchboxOption {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
}

interface MenuLists {
  currentPage: number;
  menuName: string;
  ingredients: Ingredient[];
  menuSubName: string;
  menuCategoryName: string;
  menuCost: number;
  menuLunchbox: MenuLunchbox[];
  isSubmitting: boolean;
  editMenuId: string | null;
  dialog: boolean;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setMenuName: (name: string) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setMenuSubName: (name: string) => void;
  setMenuCategoryName: (name: string) => void;
  setMenuCost: (cost: number) => void;
  setMenuLunchbox: (lunchbox: MenuLunchbox[]) => void;
  setDialog: (dialog: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setEditMenuId: (id: string | null) => void;
  setTotalPages: (totalPages: number) => void;
}

const useMenuLists = create<MenuLists>((set) => ({
  currentPage: 1,
  menuName: "",
  ingredients: [{ useItem: 0, ingredient_name: "" }],
  menuSubName: "เมนู",
  menuCategoryName: "",
  menuCost: 0,
  menuLunchbox: [],
  isSubmitting: false,
  editMenuId: null,
  dialog: false,
  totalPages: 1,
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setMenuName: (name: string) => set({ menuName: name }),
  setIngredients: (ingredients: Ingredient[]) => set({ ingredients }),
  setMenuSubName: (name: string) => set({ menuSubName: name }),
  setMenuCategoryName: (name: string) => set({ menuCategoryName: name }),
  setMenuCost: (cost: number) => set({ menuCost: cost }),
  setMenuLunchbox: (lunchbox: MenuLunchbox[]) => set({ menuLunchbox: lunchbox }),
  setDialog: (dialog: boolean) => set({ dialog }),
  setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  setEditMenuId: (id: string | null) => set({ editMenuId: id }),
  setTotalPages: (totalPages: number) => set({ totalPages }),
}));

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface EditableComboboxProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// dropdown ที่พิมพ์ค้นหาได้ + เพิ่มค่าที่ยังไม่มีในรายการได้ (แทน input+datalist เดิมที่หน้าตาเป็น native ของเบราว์เซอร์)
function EditableCombobox({ value, options, onChange, onBlur, placeholder, disabled, className }: EditableComboboxProps) {
  const [open, setOpen] = useState(false);

  const trimmedValue = value.trim();
  const filteredOptions = trimmedValue ? options.filter((opt) => opt.toLowerCase().includes(trimmedValue.toLowerCase())) : options;
  const showAddOption = trimmedValue.length > 0 && !options.some((opt) => opt.toLowerCase() === trimmedValue.toLowerCase());

  return (
    <div className='relative'>
      <input
        type='text'
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          setOpen(false);
          onBlur?.(e.target.value);
        }}
        className={`${className || ""} pr-8`}
      />
      <button
        type='button'
        tabIndex={-1}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50'>
        <ChevronDown size={14} />
      </button>

      {open && !disabled && (filteredOptions.length > 0 || showAddOption) && (
        <div className='absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type='button'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                onBlur?.(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-emerald-50 ${opt === value ? "bg-emerald-50 font-medium text-emerald-700" : "text-gray-700"}`}>
              {opt}
            </button>
          ))}
          {showAddOption && (
            <button
              type='button'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onBlur?.(value);
                setOpen(false);
              }}
              className='flex w-full items-center gap-1.5 border-t border-gray-100 px-3 py-1.5 text-left text-sm text-sky-700 hover:bg-sky-50'>
              <Plus size={13} />
              <span>เพิ่ม &quot;{trimmedValue}&quot; เป็นรายการใหม่</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [isMinimumLoading, setIsMinimumLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    currentPage,
    menuName,
    ingredients,
    menuSubName,
    menuCategoryName,
    menuCost,
    menuLunchbox,
    dialog,
    isSubmitting,
    editMenuId,
    totalPages,
    setCurrentPage,
    setMenuName,
    setIngredients,
    setMenuSubName,
    setMenuCategoryName,
    setMenuCost,
    setMenuLunchbox,
    setDialog,
    setIsSubmitting,
    setEditMenuId,
    setTotalPages,
  } = useMenuLists();
  const itemsPerPage = 30;

  // SWR hooks with improved configuration
  const {
    data: menuData,
    error: menuError,
    isLoading: menuLoading,
    mutate: mutateMenu,
  } = useSWR(`/api/get/menu/page?page=${currentPage}&limit=${itemsPerPage}`, fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 1000,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    keepPreviousData: true,
  });

  const { data: ingredientOptions } = useSWR<IngredientOption[]>("/api/get/ingredients", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
    dedupingInterval: 10000,
    keepPreviousData: true,
  });

  const { data: lunchboxOptions } = useSWR<LunchboxOption[]>("/api/get/lunchbox", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
    dedupingInterval: 10000,
    keepPreviousData: true,
  });

  // รายการ "ประเภทกับข้าว"/"ประเภทเนื้อสัตว์" ดึงจาก DB (แอดมินพิมพ์เพิ่มเองได้ ไม่ fixed อีกต่อไป)
  const { data: dishTypeOptions, mutate: mutateDishTypes } = useSWR<string[]>("/api/get/dish-type", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  const { data: meatTypeOptions, mutate: mutateMeatTypes } = useSWR<string[]>("/api/get/meat-type", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  const handleDishTypeBlur = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || (dishTypeOptions || []).includes(trimmed)) return;
    try {
      await axios.post("/api/post/dish-type", { dish_name: trimmed });
      mutateDishTypes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMeatTypeBlur = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || (meatTypeOptions || []).includes(trimmed)) return;
    try {
      await axios.post("/api/post/meat-type", { meat_name: trimmed });
      mutateMeatTypes();
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all menus when searching (no pagination)
  const {
    data: allMenuData,
    error: allMenuError,
    isLoading: allMenuLoading,
    mutate: mutateAllMenu,
  } = useSWR<MenuItem[]>(
    searchQuery.trim() ? "/api/get/menu/list" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  // Use all menu data when searching, otherwise use paginated data
  const menuItemsToUse = searchQuery.trim() ? (allMenuData || []) : (menuData?.data || []);
  
  const menuItems = menuItemsToUse;
  const totalPagesFromData = menuData?.pagination?.totalPages || 1;
  const currentError = searchQuery.trim() ? (allMenuError?.message || null) : (menuError?.message || null);

  const shouldShowLoading = useMemo(() => {
    if (searchQuery.trim()) {
      return ((allMenuLoading && !allMenuData) || isSubmitting || isMinimumLoading) && !allMenuData;
    }
    return ((menuLoading && !menuData) || isSubmitting || isMinimumLoading) && !menuData;
  }, [searchQuery, menuLoading, menuData, allMenuLoading, allMenuData, isSubmitting, isMinimumLoading]);

  const normalizeThaiText = (text: string): string => {
    if (!text) return "";
    return text.replace(/เเ/g, "แ");
  };

  // Filter menus based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;

    const query = searchQuery.toLowerCase();
    const normalizedQuery = normalizeThaiText(query);

    return menuItems.filter((item: MenuItem) => {
      const normalizedMenuName = normalizeThaiText(item.menu_name?.toLowerCase() || "");
      const normalizedMenuSubname = normalizeThaiText(item.menu_subname?.toLowerCase() || "");
      const normalizedMenuCategory = normalizeThaiText(item.menu_category?.toLowerCase() || "");

      return (
        normalizedMenuName.includes(normalizedQuery) ||
        normalizedMenuSubname.includes(normalizedQuery) ||
        normalizedMenuCategory.includes(normalizedQuery) ||
        item.menu_cost?.toString().includes(query)
      );
    });
  }, [menuItems, searchQuery]);

  // Calculate unique ingredients from filtered menu items
  const uniqueIngredients = filteredMenuItems.length > 0
    ? Array.from(
      new Set(
        filteredMenuItems.flatMap((item: MenuItem) => {
          try {
            const ingredients = typeof item.menu_ingredients === "string" ? JSON.parse(item.menu_ingredients) : item.menu_ingredients;
            return ingredients.map((ing: Ingredient) => ing.ingredient_name?.trim().toLowerCase()).filter(Boolean);
          } catch {
            return [];
          }
        })
      )
    )
    : [];

  const { data: ingredientUnitsData } = useSWR(uniqueIngredients.length > 0 ? `/api/get/ingredients/list?names=${encodeURIComponent(uniqueIngredients.join(","))}` : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000,
    keepPreviousData: true,
  });

  const ingredientUnits = useMemo(() => {
    if (!ingredientUnitsData) return {};
    const unitMap: Record<string, string> = {};
    ingredientUnitsData.forEach((unit: IngredientUnit) => {
      unitMap[unit.ingredient_name.trim().toLowerCase()] = unit.ingredient_unit;
    });
    return unitMap;
  }, [ingredientUnitsData]);

  // เลื่อนหน้าจอขึ้นด้านบนทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    window.scrollTo({ top: 0,});
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (menuData) {
      setLastUpdated(new Date());
    }
  }, [menuData]);

  useEffect(() => {
    if (totalPagesFromData) setTotalPages(totalPagesFromData);
  }, [totalPagesFromData, setTotalPages]);

  const formatIngredients = (data: string | Ingredient[]) => {
    try {
      const ingredients = typeof data === "string" ? JSON.parse(data) : data;
      return (
        <div className='flex flex-col gap-1'>
          {ingredients.map((ing: Ingredient, idx: number) => {
            const unit = ingredientUnits[ing.ingredient_name.trim().toLowerCase()] || "หน่วย";
            return (
              <div key={idx} className={idx < ingredients.length - 1 ? "border-b border-gray-100 py-1" : "py-1"}>
                <span className='inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700'>
                  {ing.ingredient_name} {ing.useItem} {unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    } catch {
      return <span className='text-sm text-red-600'>ข้อมูลไม่ถูกต้อง</span>;
    }
  };

  const formatLunchbox = (lunchbox: MenuLunchbox[] | undefined) => {
    if (!lunchbox || !Array.isArray(lunchbox) || lunchbox.length === 0) {
      return <span className='text-sm text-gray-300'>-</span>;
    }

    return (
      <div className='flex flex-col gap-2'>
        {lunchbox.map((lb, idx) => (
          <div key={idx} className={idx < lunchbox.length - 1 ? "border-b border-gray-100 py-1.5" : "py-1.5"}>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'>
                {lb.lunchbox_name}
                {lb.lunchbox_set_name && <span className='ml-1'>({lb.lunchbox_set_name})</span>}
              </span>
              {lb.lunchbox_cost && <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'>{lb.lunchbox_cost} บาท</span>}
              {lb.lunchbox_menu_category && <span className='inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700'>{lb.lunchbox_menu_category}</span>}
              {lb.lunchbox_dish_type && <span className='inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700'>{lb.lunchbox_dish_type}</span>}
              {lb.lunchbox_meat_type && <span className='inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700'>{lb.lunchbox_meat_type}</span>}
              {(lb.lunchbox_showPrice === false) && (
                <span className='inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-amber-700' title='ไม่แสดงราคา'>
                  <EyeOff size={12} />
                </span>
              )}
              {lb.lunchbox_AutoRice && (
                <span className='inline-flex items-center rounded-full bg-sky-50 px-1.5 py-0.5 text-sky-700' title='ใส่ข้าวอัตโนมัติ'>
                  <UtensilsCrossed size={12} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const wasCreating = !editMenuId;

    try {
      const formData = new FormData();
      formData.append("menu_id", editMenuId || "");
      formData.append("menu_name", menuName);
      formData.append("menu_ingredients", JSON.stringify(ingredients));
      formData.append("menu_subname", menuSubName);
      formData.append("menu_category", menuCategoryName);
      formData.append("menu_cost", menuCost.toString());
      formData.append("menu_lunchbox", JSON.stringify(menuLunchbox));

      const res = await axios({
        method: editMenuId ? "patch" : "post",
        url: editMenuId ? `/api/edit/menu/${editMenuId}` : "/api/post/menu",
        data: formData,
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(editMenuId ? "ไม่สามารถแก้ไขเมนูได้" : "ไม่สามารถเพิ่มเมนูได้");
      }

      // Reset form
      setMenuName("");
      setIngredients([{ useItem: 0, ingredient_name: "" }]);
      setMenuSubName("เมนู");
      setMenuCategoryName("");
      setMenuCost(0);
      setMenuLunchbox([]);
      setDialog(false);
      setEditMenuId(null);

      if (searchQuery.trim()) {
        // กำลังค้นหาอยู่ (ไม่มีการแบ่งหน้า) ให้รีเฟรชผลค้นหาแทน ไม่งั้นตารางจะไม่อัปเดตเลย
        await mutateAllMenu();
      } else if (wasCreating) {
        // เมนูใหม่จะได้ menu_id สูงสุดเสมอ (เรียงจากน้อยไปมาก) จึงไปอยู่หน้าสุดท้ายเสมอ
        // พาไปหน้าสุดท้ายให้เลย ผู้ใช้จะได้เห็นเมนูที่เพิ่งเพิ่มทันที
        const newTotal = (menuData?.pagination?.total ?? 0) + 1;
        const newLastPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
        if (newLastPage !== currentPage) {
          setCurrentPage(newLastPage);
        } else {
          await mutateMenu();
        }
      } else {
        await mutateMenu();
      }

      Swal.fire({
        icon: "success",
        title: wasCreating ? "เพิ่มเมนูสำเร็จ!" : "แก้ไขเมนูสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : err instanceof Error ? err.message : null;
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: message || (wasCreating ? "ไม่สามารถเพิ่มเมนูได้" : "ไม่สามารถแก้ไขเมนูได้"),
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?")) return;
    setIsSubmitting(true);

    try {
      const res = await axios.delete(`/api/delete/menu/${menuId}`);

      if (res.status !== 200) throw new Error("ไม่สามารถลบเมนูได้");

      if (searchQuery.trim()) {
        await mutateAllMenu();
      } else {
        await mutateMenu();
      }

      Swal.fire({
        icon: "success",
        title: "ลบเมนูสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : err instanceof Error ? err.message : null;
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: message || "ไม่สามารถลบเมนูได้",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setMenuName(item.menu_name);
    setMenuSubName(item.menu_subname);
    setMenuCategoryName(item.menu_category);
    setMenuCost(item.menu_cost);
    setMenuLunchbox(
      (item.menu_lunchbox || []).map((lb) => ({
        ...lb,
        lunchbox_dish_type: lb.lunchbox_dish_type ?? resolveDishType({ menu_name: item.menu_name, ...lb }),
        lunchbox_meat_type: lb.lunchbox_meat_type ?? resolveMeatType({ menu_name: item.menu_name, ...lb }),
      }))
    );
    setIngredients(typeof item.menu_ingredients === "string" ? JSON.parse(item.menu_ingredients) : item.menu_ingredients);
    setEditMenuId(item.menu_id);
    setDialog(true);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  const addLunchbox = () => {
    setMenuLunchbox([
      ...menuLunchbox,
      {
        lunchbox_menuid: crypto.randomUUID(),
        lunchbox_name: "",
        lunchbox_set_name: "",
        lunchbox_cost: 0,
        lunchbox_menu_category: "",
        lunchbox_showPrice: true,
        lunchbox_AutoRice: false,
        lunchbox_dish_type: "",
        lunchbox_meat_type: "",
      },
    ]);
  };

  const removeLunchbox = (index: number) => {
    const updated = menuLunchbox.filter((_, i) => i !== index);
    setMenuLunchbox(updated);
  };

  const updateLunchbox = (
    index: number,
    field: "lunchbox_name" | "lunchbox_set_name" | "lunchbox_cost" | "lunchbox_menu_category" | "lunchbox_showPrice" | "lunchbox_AutoRice" | "lunchbox_dish_type" | "lunchbox_meat_type",
    value: string | number | boolean
  ) => {
    const updated = [...menuLunchbox];

    if (field === "lunchbox_cost") updated[index] = { ...updated[index], [field]: Number(value) || 0 };
    else if (field === "lunchbox_showPrice" || field === "lunchbox_AutoRice") updated[index] = { ...updated[index], [field]: Boolean(value) };
    else updated[index] = { ...updated[index], [field]: value };

    if (field === "lunchbox_name") updated[index].lunchbox_set_name = "";

    setMenuLunchbox(updated);
  };

  const getUniqueLunchboxNames = () => {
    const uniqueNames = [...new Set((lunchboxOptions || []).map((option) => option.lunchbox_name))];
    return uniqueNames;
  };

  const getLunchboxSetOptions = (lunchboxName: string) => {
    if (!lunchboxName) return [];
    return (lunchboxOptions || []).filter((option) => option.lunchbox_name === lunchboxName);
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400";
  const labelClass = "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700";
  const smallLabelClass = "mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700";

  return (
    <div className='px-4 py-8 md:px-8'>
      {/* Header */}
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
              <Utensils className='text-emerald-600' size={22} />
              <span>จัดการเมนูอาหาร</span>
            </h1>
            <p className='mt-1 flex items-center gap-1.5 text-sm text-gray-500'>
              <Info size={14} />
              <span>เพิ่ม แก้ไข และลบเมนูอาหารในระบบ</span>
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* ช่องค้นหา */}
            <div className='relative'>
              <input
                type='text'
                className='w-full min-w-[250px] max-w-[350px] rounded-md border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-black shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                placeholder='ค้นหาเมนูอาหาร'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              {searchQuery && (
                <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600' onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ปุ่มเพิ่มเมนูใหม่ */}
            <button
              onClick={() => {
                setDialog(true);
                setEditMenuId(null);
                setMenuName("");
                setMenuSubName("เมนู");
                setMenuCategoryName("");
                setMenuCost(0);
                setMenuLunchbox([]);
                setIngredients([{ useItem: 0, ingredient_name: "" }]);
              }}
              className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700'>
              <Plus size={16} />
              <span>เพิ่มเมนูใหม่</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {currentError && (
          <div className='relative mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-red-700'>
            <button className='absolute right-3 top-3 text-red-400 hover:text-red-600' onClick={() => { }}>
              <X size={16} />
            </button>
            <strong>เกิดข้อผิดพลาด</strong>
            <p>{currentError}</p>
          </div>
        )}

        {/* Menu Table */}
        <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          {shouldShowLoading ? (
            <div className='p-10 text-center'>
              <Loader2 className='mx-auto mb-3 animate-spin text-emerald-600' size={28} />
              <p className='text-sm text-gray-500'>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-emerald-500 text-white'>
                  <tr>
                    <th className='px-4 py-3 font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <Utensils size={14} />
                        <strong>ชื่อเมนู</strong>
                      </span>
                    </th>
                    <th className='px-4 py-3 font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <Tag size={14} />
                        <strong>ประเภท</strong>
                      </span>
                    </th>
                    <th className='px-4 py-3 font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <Carrot size={14} />
                        <strong>วัตถุดิบ</strong>
                      </span>
                    </th>
                    <th className='px-4 py-3 font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <Box size={14} />
                        <strong>กล่องอาหาร</strong>
                      </span>
                    </th>
                    <th className='px-4 py-3 font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <Settings size={14} />
                        <strong>การจัดการ</strong>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 bg-white'>
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='p-10 text-center'>
                        <FileText className='mx-auto mb-3 text-gray-300' size={40} />
                        <p className='font-medium text-gray-700'>
                          {searchQuery ? `ไม่พบเมนูที่ค้นหา "${searchQuery}"` : "ไม่มีเมนูอาหาร"}
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          {searchQuery ? "ลองค้นหาด้วยคำอื่น" : "เริ่มต้นด้วยการเพิ่มเมนูอาหารใหม่"}
                        </p>
                        {searchQuery && (
                          <button className='mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50' onClick={() => setSearchQuery("")}>
                            ล้างการค้นหา
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredMenuItems.map((item: MenuItem) => (
                      <tr key={item.menu_id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 align-top'>
                          <p className='font-medium text-gray-900'>{item.menu_name}</p>
                          <p className='text-xs text-gray-500'>{item.menu_subname}</p>
                        </td>
                        <td className='px-4 py-3 align-top'>
                          <span className='inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700'>{item.menu_category}</span>
                        </td>
                        <td className='px-4 py-3 align-top'>{formatIngredients(item.menu_ingredients)}</td>
                        <td className='px-4 py-3 align-top'>{formatLunchbox(item.menu_lunchbox)}</td>
                        <td className='px-4 py-3 align-top'>
                          <div className='flex gap-2'>
                            <button onClick={() => openEditDialog(item)} className='inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100'>
                              <Pencil size={13} />
                              <span>แก้ไข</span>
                            </button>
                            <button onClick={() => deleteMenu(item.menu_id)} className='inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100'>
                              <Trash2 size={13} />
                              <span>ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination - Hide when searching */}
        {!searchQuery.trim() && totalPages >= 1 && (
          <div className='mt-5'>
            <PaginationComponent totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {dialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setDialog(false)}></div>
          <div className='relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-xl'>
            <header className='flex items-center justify-between rounded-t-md bg-emerald-500 px-5 py-4 text-white'>
              <p className='text-base font-semibold'>
                {editMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
              </p>
              <button aria-label='close' onClick={() => setDialog(false)} className='text-white/80 hover:text-white'>
                <X size={18} />
              </button>
            </header>
            <section className='overflow-y-auto p-5'>
              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <label className={labelClass}>
                      <Drumstick size={15} className='text-emerald-600' />
                      <span>ชื่อเมนู</span>
                    </label>
                    <input className={inputClass} type='text' value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder='ชื่อเมนู' required />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <AlignLeft size={15} className='text-sky-600' />
                      <span>ชื่อรอง</span>
                    </label>
                    <input className={inputClass} type='text' value={menuSubName} onChange={(e) => setMenuSubName(e.target.value)} placeholder='ชื่อรอง' required />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <List size={15} className='text-indigo-600' />
                    <span>ประเภท</span>
                  </label>
                  <input className={inputClass} type='text' value={menuCategoryName} onChange={(e) => setMenuCategoryName(e.target.value)} placeholder='ประเภทเมนู' required />
                </div>

                {/* Lunchbox Section */}
                <div>
                  <label className={labelClass}>
                    <PackageOpen size={15} className='text-emerald-600' />
                    <span>ข้อมูลกล่องอาหาร</span>
                  </label>
                  <div className='mb-3 flex justify-end'>
                    <button type='button' onClick={addLunchbox} className='inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100'>
                      <CirclePlus size={14} />
                      <span>เพิ่มกล่องอาหาร</span>
                    </button>
                  </div>

                  <div className='flex flex-col gap-3'>
                    {menuLunchbox.map((lb, idx) => (
                      <div key={idx} className='rounded-md border border-gray-200 bg-gray-50 p-4'>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                          <div>
                            <label className={smallLabelClass}>
                              <Box size={13} className='text-sky-600' />
                              <span>ชื่อกล่องอาหาร</span>
                            </label>
                            <select value={lb.lunchbox_name} onChange={(e) => updateLunchbox(idx, "lunchbox_name", e.target.value)} required className={inputClass}>
                              <option value=''>เลือกกล่องอาหาร</option>
                              {getUniqueLunchboxNames().map((name, nameIdx) => (
                                <option key={nameIdx} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <Layers size={13} className='text-indigo-600' />
                              <span>ชื่อชุดกล่องอาหาร</span>
                            </label>
                            <select value={lb.lunchbox_set_name} onChange={(e) => updateLunchbox(idx, "lunchbox_set_name", e.target.value)} required disabled={!lb.lunchbox_name} className={inputClass}>
                              <option value=''>เลือกชุดกล่องอาหาร</option>
                              {getLunchboxSetOptions(lb.lunchbox_name).map((option, optionIdx) => (
                                <option key={optionIdx} value={option.lunchbox_set_name}>
                                  {option.lunchbox_set_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <DollarSign size={13} className='text-amber-600' />
                              <span>ราคาชุดกล่องอาหาร</span>
                            </label>
                            <input
                              className={inputClass}
                              type='text'
                              inputMode='numeric'
                              pattern='[0-9]*'
                              value={lb.lunchbox_cost || 0}
                              onChange={(e) => updateLunchbox(idx, "lunchbox_cost", Number(e.target.value.replace(/\D/g, "")) || 0)}
                              onFocus={(e) => {
                                if (e.target.value === "0") e.target.value = "";
                              }}
                              required
                              disabled={!lb.lunchbox_name}
                            />
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <Tags size={13} className='text-emerald-600' />
                              <span>ประเภทชุดเมนูอาหาร</span>
                            </label>
                            <input className={inputClass} type='text' value={lb.lunchbox_menu_category || ""} onChange={(e) => updateLunchbox(idx, "lunchbox_menu_category", e.target.value)} disabled={!lb.lunchbox_name} />
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <Drumstick size={13} className='text-orange-600' />
                              <span>ประเภทกับข้าว (ถ้ามี)</span>
                            </label>
                            <EditableCombobox
                              value={lb.lunchbox_dish_type || ""}
                              options={dishTypeOptions && dishTypeOptions.length > 0 ? dishTypeOptions : [...DISH_TYPES]}
                              onChange={(value) => updateLunchbox(idx, "lunchbox_dish_type", value)}
                              onBlur={handleDishTypeBlur}
                              disabled={!lb.lunchbox_name}
                              placeholder='ไม่ระบุ หรือพิมพ์เอง'
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <UtensilsCrossed size={13} className='text-rose-600' />
                              <span>ประเภทเนื้อสัตว์ (ถ้ามี)</span>
                            </label>
                            <EditableCombobox
                              value={lb.lunchbox_meat_type || ""}
                              options={meatTypeOptions && meatTypeOptions.length > 0 ? meatTypeOptions : [...MEAT_TYPES]}
                              onChange={(value) => updateLunchbox(idx, "lunchbox_meat_type", value)}
                              onBlur={handleMeatTypeBlur}
                              disabled={!lb.lunchbox_name}
                              placeholder='ไม่ระบุ หรือพิมพ์เอง'
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <Eye size={13} className='text-sky-600' />
                              <span>แสดงราคา</span>
                            </label>
                            <label className={`relative inline-flex items-center ${lb.lunchbox_name ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                              <input
                                type='checkbox'
                                className='peer sr-only'
                                checked={lb.lunchbox_showPrice ?? true}
                                onChange={(e) => updateLunchbox(idx, "lunchbox_showPrice", e.target.checked)}
                                disabled={!lb.lunchbox_name}
                              />
                              <div className="group peer h-8 w-16 rounded-full bg-white ring-2 ring-red-500 duration-300 after:absolute after:top-1 after:left-1 after:flex after:h-6 after:w-6 after:items-center after:justify-center after:rounded-full after:bg-red-500 after:duration-300 peer-checked:ring-green-500 peer-checked:after:translate-x-8 peer-checked:after:bg-green-500 peer-hover:after:scale-95"></div>
                            </label>
                          </div>

                          <div>
                            <label className={smallLabelClass}>
                              <UtensilsCrossed size={13} className='text-amber-600' />
                              <span>ใส่ข้าวอัตโนมัติ</span>
                            </label>
                            <label className={`relative inline-flex items-center ${lb.lunchbox_name ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                              <input
                                type='checkbox'
                                className='peer sr-only'
                                checked={lb.lunchbox_AutoRice ?? false}
                                onChange={(e) => updateLunchbox(idx, "lunchbox_AutoRice", e.target.checked)}
                                disabled={!lb.lunchbox_name}
                              />
                              <div className="group peer h-8 w-16 rounded-full bg-white ring-2 ring-red-500 duration-300 after:absolute after:top-1 after:left-1 after:flex after:h-6 after:w-6 after:items-center after:justify-center after:rounded-full after:bg-red-500 after:duration-300 peer-checked:ring-green-500 peer-checked:after:translate-x-8 peer-checked:after:bg-green-500 peer-hover:after:scale-95"></div>
                            </label>
                          </div>
                        </div>

                        <button type='button' onClick={() => removeLunchbox(idx)} className='mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100'>
                          <CircleX size={14} />
                          <span>ลบ set อาหาร</span>
                        </button>
                      </div>
                    ))}

                    {menuLunchbox.length === 0 && (
                      <div className='rounded-md bg-gray-50 p-6 text-center'>
                        <Box className='mx-auto mb-2 text-gray-300' size={32} />
                        <p className='text-sm text-gray-500'>ยังไม่มีข้อมูลกล่องอาหาร</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients Section */}
                <div>
                  <label className={labelClass}>
                    <Sprout size={15} className='text-emerald-600' />
                    <span>วัตถุดิบ</span>
                  </label>
                  <div className='flex flex-col gap-2'>
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className='flex gap-2'>
                        <select
                          value={ing.ingredient_name}
                          onChange={(e) => {
                            const updated = [...ingredients];
                            updated[idx].ingredient_name = e.target.value;
                            setIngredients(updated);
                          }}
                          className={`${inputClass} flex-1`}>
                          <option value=''>เลือกวัตถุดิบ</option>
                          {(ingredientOptions || []).map((opt) => (
                            <option key={opt.ingredient_id} value={opt.ingredient_name}>
                              {opt.ingredient_name}
                            </option>
                          ))}
                        </select>
                        <input
                          className={inputClass}
                          type='text'
                          inputMode='numeric'
                          pattern='[0-9]*'
                          value={ing.useItem}
                          onChange={(e) => {
                            const updated = [...ingredients];
                            updated[idx].useItem = Number(e.target.value.replace(/\D/g, "")) || 0;
                            setIngredients(updated);
                          }}
                          onFocus={(e) => {
                            if (e.target.value === "0") e.target.value = "";
                          }}
                          placeholder='จำนวน'
                          style={{ width: "120px" }}
                        />
                        <button type='button' onClick={() => removeIngredient(idx)} className='inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100'>
                          <Trash2 size={14} />
                          <span>ลบ</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type='button' onClick={() => setIngredients([...ingredients, { useItem: 0, ingredient_name: "" }])} className='mt-3 inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100'>
                    <CirclePlus size={14} />
                    <span>เพิ่มวัตถุดิบ</span>
                  </button>
                </div>
              </form>
            </section>
            <footer className='flex justify-end gap-3 border-t border-gray-200 px-5 py-4'>
              <button type='button' onClick={() => setDialog(false)} className='inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <X size={15} />
                <span>ยกเลิก</span>
              </button>
              <button
                type='submit'
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50'>
                {isSubmitting ? <Loader2 size={15} className='animate-spin' /> : editMenuId ? <Save size={15} /> : <Check size={15} />}
                <span>{editMenuId ? "อัปเดตเมนู" : "บันทึกเมนู"}</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
