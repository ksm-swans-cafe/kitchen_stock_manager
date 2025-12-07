"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import useSWR from "swr";
import { create } from "zustand";
import { Search } from "lucide-react";
import PaginationComponent from "@/components/ui/Totalpage";
import { Ingredient, IngredientOption, MenuItem, IngredientUnit, MenuLunchbox } from "@/models/menu_list/MenuList";

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

  // Fetch all menus when searching (no pagination)
  const {
    data: allMenuData,
    error: allMenuError,
    isLoading: allMenuLoading,
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
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {ingredients.map((ing: Ingredient, idx: number) => {
            const unit = ingredientUnits[ing.ingredient_name.trim().toLowerCase()] || "หน่วย";
            return (
              <div key={idx} style={{ padding: "4px 0", borderBottom: idx < ingredients.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span className='tag is-info is-light'>
                  {ing.ingredient_name} {ing.useItem} {unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    } catch {
      return <span className='has-text-danger'>ข้อมูลไม่ถูกต้อง</span>;
    }
  };

  const formatLunchbox = (lunchbox: MenuLunchbox[] | undefined) => {
    if (!lunchbox || !Array.isArray(lunchbox) || lunchbox.length === 0) {
      return <span className='has-text-grey-light'>-</span>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {lunchbox.map((lb, idx) => (
          <div key={idx} style={{ padding: "6px 0", borderBottom: idx < lunchbox.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span className='tag is-primary is-light'>
                {lb.lunchbox_name}
                {lb.lunchbox_set_name && <span className='ml-1'>({lb.lunchbox_set_name})</span>}
              </span>
              {lb.lunchbox_cost && <span className='tag is-success is-light'>{lb.lunchbox_cost} บาท</span>}
              {lb.lunchbox_menu_category && <span className='tag is-link is-light'>{lb.lunchbox_menu_category}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
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

      // Optimistic update for better UX
      await mutateMenu();

      // Also revalidate related data
      if (ingredientOptions) {
        // Trigger revalidation of ingredient options if needed
      }
    } catch (err) {
      console.error(err);
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

      // Optimistic update after deletion
      await mutateMenu();

      // Show success feedback
      console.log("Menu deleted successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setMenuName(item.menu_name);
    setMenuSubName(item.menu_subname);
    setMenuCategoryName(item.menu_category);
    setMenuCost(item.menu_cost);
    setMenuLunchbox(item.menu_lunchbox || []);
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
        lunchbox_name: "",
        lunchbox_set_name: "",
        lunchbox_cost: 0,
        lunchbox_menu_category: "",
      },
    ]);
  };

  const removeLunchbox = (index: number) => {
    const updated = menuLunchbox.filter((_, i) => i !== index);
    setMenuLunchbox(updated);
  };

  const updateLunchbox = (index: number, field: "lunchbox_name" | "lunchbox_set_name" | "lunchbox_cost" | "lunchbox_menu_category", value: string | number) => {
    const updated = [...menuLunchbox];

    if (field === "lunchbox_cost") updated[index] = { ...updated[index], [field]: Number(value) || 0 };
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

  return (
    <div className='section'>
      {/* Header */}
      <div className='container'>
        <div className='level mb-5'>
          <div className='level-left'>
            <div className='level-item'>
              <div>
                <h1 className='title is-3'>
                  <span className='icon-text'>
                    <span className='icon has-text-success'>
                      <i className='fas fa-utensils'></i>
                    </span>
                    <span>จัดการเมนูอาหาร</span>
                  </span>
                </h1>
                <p className='subtitle is-6 has-text-grey'>
                  <span className='icon-text'>
                    <span className='icon'>
                      <i className='fas fa-info-circle'></i>
                    </span>
                    <span>เพิ่ม แก้ไข และลบเมนูอาหารในระบบ</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className='level-right'>
            <div className='level-item'>
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
                className='button is-success'>
                <span className='icon'>
                  <i className='fas fa-plus'></i>
                </span>
                <span>เพิ่มเมนูใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className='field mb-5'>
          <div className='control has-icons-left has-icons-right'>
            <input
              type='text'
              className='input'
              placeholder='ค้นหาเมนูอาหาร'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: "white", color: "#363636" }}
            />
            <span className='icon is-small is-left' style={{ color: "#7a7a7a" }}>
              <Search size={16} style={{ display: "block" }} />
            </span>
            {searchQuery && (
              <span className='icon is-small is-right' style={{ cursor: "pointer" }} onClick={() => setSearchQuery("")}>
                <i className='fas fa-times'></i>
              </span>
            )}
          </div>
          {searchQuery && (
            <p className='help mt-2'>
              ค้นหา &ldquo;{searchQuery}&rdquo; - พบ {filteredMenuItems.length} รายการ
            </p>
          )}
        </div>

        {/* Error Message */}
        {currentError && (
          <div className='notification is-danger is-light mb-5'>
            <button className='delete' onClick={() => { }}></button>
            <strong>เกิดข้อผิดพลาด</strong>
            <p>{currentError}</p>
          </div>
        )}

        {/* Menu Table */}
        <div className='box' style={{ backgroundColor: "white" }}>
          {shouldShowLoading ? (
            <div className='has-text-centered p-6'>
              <button className='button is-loading is-text is-large mb-4'>Loading</button>
              <p className='has-text-grey'>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className='table-container'>
              <table className='table is-fullwidth is-striped is-hoverable' style={{ backgroundColor: "white" }}>
                <thead style={{ backgroundColor: "#48c78e", color: "white" }}>
                  <tr>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-utensils'></i>
                        </span>
                        <strong>ชื่อเมนู</strong>
                      </span>
                    </th>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-tag'></i>
                        </span>
                        <strong>ประเภท</strong>
                      </span>
                    </th>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-carrot'></i>
                        </span>
                        <strong>วัตถุดิบ</strong>
                      </span>
                    </th>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-box'></i>
                        </span>
                        <strong>กล่องอาหาร</strong>
                      </span>
                    </th>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-coins'></i>
                        </span>
                        <strong>ราคา</strong>
                      </span>
                    </th>
                    <th style={{ color: "white", borderColor: "#48c78e" }}>
                      <span className='icon-text'>
                        <span className='icon'>
                          <i className='fas fa-cog'></i>
                        </span>
                        <strong>การจัดการ</strong>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "white" }}>
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='has-text-centered' style={{ backgroundColor: "white" }}>
                        <div className='content p-6'>
                          <span className='icon is-large has-text-grey-light'>
                            <i className='fas fa-file-alt fa-3x'></i>
                          </span>
                          <p className='has-text-weight-medium'>
                            {searchQuery ? `ไม่พบเมนูที่ค้นหา "${searchQuery}"` : "ไม่มีเมนูอาหาร"}
                          </p>
                          <p className='has-text-grey'>
                            {searchQuery ? "ลองค้นหาด้วยคำอื่น" : "เริ่มต้นด้วยการเพิ่มเมนูอาหารใหม่"}
                          </p>
                          {searchQuery && (
                            <button className='button is-light mt-3' onClick={() => setSearchQuery("")}>
                              ล้างการค้นหา
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMenuItems.map((item: MenuItem) => (
                      <tr key={item.menu_id} style={{ backgroundColor: "white" }}>
                        <td>
                          <p className='has-text-weight-medium has-text-dark'>{item.menu_name}</p>
                          <p className='has-text-grey is-size-7'>{item.menu_subname}</p>
                        </td>
                        <td>
                          <span className='tag is-info'>{item.menu_category}</span>
                        </td>
                        <td>{formatIngredients(item.menu_ingredients)}</td>
                        <td>{formatLunchbox(item.menu_lunchbox)}</td>
                        <td>
                          <strong className='has-text-dark'>฿{item.menu_cost?.toLocaleString() || 0}</strong>
                        </td>
                        <td>
                          <div className='buttons'>
                            <button onClick={() => openEditDialog(item)} className='button is-small is-info is-light'>
                              <span className='icon is-small'>
                                <i className='fas fa-edit'></i>
                              </span>
                              <span>แก้ไข</span>
                            </button>
                            <button onClick={() => deleteMenu(item.menu_id)} className='button is-small is-danger is-light'>
                              <span className='icon is-small'>
                                <i className='fas fa-trash'></i>
                              </span>
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
        <div className='modal is-active'>
          <div className='modal-background' onClick={() => setDialog(false)}></div>
          <div className='modal-card' style={{ width: "90%", maxWidth: "900px", backgroundColor: "white", borderRadius: "4px", overflow: "hidden" }}>
            <header className='modal-card-head' style={{ backgroundColor: "#48c78e", color: "white", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
              <p className='modal-card-title' style={{ color: "white" }}>
                {editMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
              </p>
              <button className='delete' aria-label='close' onClick={() => setDialog(false)}></button>
            </header>
            <section className='modal-card-body' style={{ backgroundColor: "white", borderTopLeftRadius: "4px", borderTopRightRadius: "4px" }}>
              <form onSubmit={handleSubmit}>
                <div className='columns'>
                  <div className='column'>
                    <div className='field'>
                      <label className='label' style={{ color: "#363636" }}>
                        <span className='icon-text'>
                          <span className='icon has-text-success'>
                            <i className='fas fa-drumstick-bite'></i>
                          </span>
                          <span>ชื่อเมนู</span>
                        </span>
                      </label>
                      <div className='control has-icons-left'>
                        <input className='input' type='text' value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder='ชื่อเมนู' required style={{ backgroundColor: "white", color: "#363636" }} />
                        <span className='icon is-small is-left'>
                          <i className='fas fa-drumstick-bite'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='column'>
                    <div className='field'>
                      <label className='label' style={{ color: "#363636" }}>
                        <span className='icon-text'>
                          <span className='icon has-text-info'>
                            <i className='fas fa-align-left'></i>
                          </span>
                          <span>ชื่อรอง</span>
                        </span>
                      </label>
                      <div className='control has-icons-left'>
                        <input className='input' type='text' value={menuSubName} onChange={(e) => setMenuSubName(e.target.value)} placeholder='ชื่อรอง' required style={{ backgroundColor: "white", color: "#363636" }} />
                        <span className='icon is-small is-left'>
                          <i className='fas fa-align-left'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='columns'>
                  <div className='column'>
                    <div className='field'>
                      <label className='label' style={{ color: "#363636" }}>
                        <span className='icon-text'>
                          <span className='icon has-text-link'>
                            <i className='fas fa-list-alt'></i>
                          </span>
                          <span>ประเภท</span>
                        </span>
                      </label>
                      <div className='control has-icons-left'>
                        <input className='input' type='text' value={menuCategoryName} onChange={(e) => setMenuCategoryName(e.target.value)} placeholder='ประเภทเมนู' required style={{ backgroundColor: "white", color: "#363636" }} />
                        <span className='icon is-small is-left'>
                          <i className='fas fa-list-alt'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='column'>
                    <div className='field'>
                      <label className='label' style={{ color: "#363636" }}>
                        <span className='icon-text'>
                          <span className='icon has-text-warning'>
                            <i className='fas fa-money-bill-wave'></i>
                          </span>
                          <span>ราคา (บาท)</span>
                        </span>
                      </label>
                      <div className='control has-icons-left'>
                        <input className='input' type='number' value={menuCost} onChange={(e) => setMenuCost(Number(e.target.value))} placeholder='ราคา' required style={{ backgroundColor: "white", color: "#363636" }} />
                        <span className='icon is-small is-left'>
                          <i className='fas fa-money-bill-wave'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lunchbox Section */}
                <div className='field'>
                  <label className='label' style={{ color: "#363636" }}>
                    <span className='icon-text'>
                      <span className='icon has-text-primary'>
                        <i className='fas fa-box-open'></i>
                      </span>
                      <span>ข้อมูลกล่องอาหาร</span>
                    </span>
                  </label>
                  <div className='field is-grouped is-grouped-right mb-3'>
                    <p className='control'>
                      <button type='button' onClick={addLunchbox} className='button is-info is-light is-small'>
                        <span className='icon is-small'>
                          <i className='fas fa-plus-circle'></i>
                        </span>
                        <span>เพิ่มกล่องอาหาร</span>
                      </button>
                    </p>
                  </div>

                  <div className='content'>
                    {menuLunchbox.map((lb, idx) => (
                      <div key={idx} className='box has-background-light mb-3' style={{ backgroundColor: "#f5f5f5" }}>
                        <div className='columns is-multiline'>
                          <div className='column is-half'>
                            <div className='field'>
                              <label className='label is-small' style={{ color: "#363636" }}>
                                <span className='icon-text'>
                                  <span className='icon has-text-info is-small'>
                                    <i className='fas fa-box'></i>
                                  </span>
                                  <span>ชื่อกล่องอาหาร</span>
                                </span>
                              </label>
                              <div className='control'>
                                <div className='select is-fullwidth'>
                                  <select value={lb.lunchbox_name} onChange={(e) => updateLunchbox(idx, "lunchbox_name", e.target.value)} required style={{ backgroundColor: "white", color: "#363636" }}>
                                    <option value=''>เลือกกล่องอาหาร</option>
                                    {getUniqueLunchboxNames().map((name, nameIdx) => (
                                      <option key={nameIdx} value={name}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='column is-half'>
                            <div className='field'>
                              <label className='label is-small' style={{ color: "#363636" }}>
                                <span className='icon-text'>
                                  <span className='icon has-text-link is-small'>
                                    <i className='fas fa-layer-group'></i>
                                  </span>
                                  <span>ชื่อชุดกล่องอาหาร</span>
                                </span>
                              </label>
                              <div className='control'>
                                <div className='select is-fullwidth'>
                                  <select value={lb.lunchbox_set_name} onChange={(e) => updateLunchbox(idx, "lunchbox_set_name", e.target.value)} required disabled={!lb.lunchbox_name} style={{ backgroundColor: "white", color: "#363636" }}>
                                    <option value=''>เลือกชุดกล่องอาหาร</option>
                                    {getLunchboxSetOptions(lb.lunchbox_name).map((option, optionIdx) => (
                                      <option key={optionIdx} value={option.lunchbox_set_name}>
                                        {option.lunchbox_set_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='column is-half'>
                            <div className='field'>
                              <label className='label is-small' style={{ color: "#363636" }}>
                                <span className='icon-text'>
                                  <span className='icon has-text-warning is-small'>
                                    <i className='fas fa-dollar-sign'></i>
                                  </span>
                                  <span>ราคาชุดกล่องอาหาร</span>
                                </span>
                              </label>
                              <div className='control'>
                                <input className='input' type='number' min='0' value={lb.lunchbox_cost || 0} onChange={(e) => updateLunchbox(idx, "lunchbox_cost", Number(e.target.value) || 0)} required disabled={!lb.lunchbox_name} style={{ backgroundColor: "white", color: "#363636" }} />
                              </div>
                            </div>
                          </div>

                          <div className='column is-half'>
                            <div className='field'>
                              <label className='label is-small' style={{ color: "#363636" }}>
                                <span className='icon-text'>
                                  <span className='icon has-text-success is-small'>
                                    <i className='fas fa-tags'></i>
                                  </span>
                                  <span>ประเภทชุดเมนูอาหาร</span>
                                </span>
                              </label>
                              <div className='control'>
                                <input className='input' type='text' value={lb.lunchbox_menu_category || ""} onChange={(e) => updateLunchbox(idx, "lunchbox_menu_category", e.target.value)} disabled={!lb.lunchbox_name} style={{ backgroundColor: "white", color: "#363636" }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button type='button' onClick={() => removeLunchbox(idx)} className='button is-danger is-light is-small'>
                          <span className='icon is-small'>
                            <i className='fas fa-times-circle'></i>
                          </span>
                          <span>ลบ set อาหาร</span>
                        </button>
                      </div>
                    ))}

                    {menuLunchbox.length === 0 && (
                      <div className='notification is-light has-text-centered'>
                        <span className='icon is-large has-text-grey-light'>
                          <i className='fas fa-box fa-2x'></i>
                        </span>
                        <p className='has-text-grey'>ยังไม่มีข้อมูลกล่องอาหาร</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients Section */}
                <div className='field'>
                  <label className='label' style={{ color: "#363636" }}>
                    <span className='icon-text'>
                      <span className='icon has-text-success'>
                        <i className='fas fa-seedling'></i>
                      </span>
                      <span>วัตถุดิบ</span>
                    </span>
                  </label>
                  <div className='content'>
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className='field has-addons mb-3'>
                        <div className='control is-expanded'>
                          <div className='select is-fullwidth'>
                            <select
                              value={ing.ingredient_name}
                              onChange={(e) => {
                                const updated = [...ingredients];
                                updated[idx].ingredient_name = e.target.value;
                                setIngredients(updated);
                              }}
                              style={{ backgroundColor: "white", color: "#363636" }}>
                              <option value=''>เลือกวัตถุดิบ</option>
                              {(ingredientOptions || []).map((opt) => (
                                <option key={opt.ingredient_id} value={opt.ingredient_name}>
                                  {opt.ingredient_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className='control'>
                          <input
                            className='input'
                            type='number'
                            value={ing.useItem}
                            onChange={(e) => {
                              const updated = [...ingredients];
                              updated[idx].useItem = Number(e.target.value);
                              setIngredients(updated);
                            }}
                            placeholder='จำนวน'
                            style={{ width: "120px", backgroundColor: "white", color: "#363636" }}
                          />
                        </div>
                        <div className='control'>
                          <button type='button' onClick={() => removeIngredient(idx)} className='button is-danger is-light'>
                            <span className='icon is-small'>
                              <i className='fas fa-trash-alt'></i>
                            </span>
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type='button' onClick={() => setIngredients([...ingredients, { useItem: 0, ingredient_name: "" }])} className='button is-info is-light is-small'>
                    <span className='icon is-small'>
                      <i className='fas fa-plus-circle'></i>
                    </span>
                    <span>เพิ่มวัตถุดิบ</span>
                  </button>
                </div>
              </form>
            </section>
            <footer className='modal-card-foot' style={{ backgroundColor: "white" }}>
              <button type='button' onClick={() => setDialog(false)} className='button'>
                <span className='icon'>
                  <i className='fas fa-times'></i>
                </span>
                <span>ยกเลิก</span>
              </button>
              <button type='submit' onClick={handleSubmit} disabled={isSubmitting} className={`button is-primary ${isSubmitting ? "is-loading" : ""}`}>
                <span className='icon'>
                  <i className={editMenuId ? "fas fa-save" : "fas fa-check"}></i>
                </span>
                <span>{editMenuId ? "อัปเดตเมนู" : "บันทึกเมนู"}</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
