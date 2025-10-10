"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import useSWR from "swr";

import PaginationComponent from "@/components/ui/Totalpage";
import { Ingredient, IngredientOption, MenuItem, IngredientUnit, MenuLunchbox } from "@/models/menu_list/MenuList";

interface LunchboxOption {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ useItem: 0, ingredient_name: "" }]);
  const [menuSubName, setMenuSubName] = useState("เมนู");
  const [menuCategoryName, setMenuCategoryName] = useState("");
  const [menuCost, setMenuCost] = useState(0);
  const [menuLunchbox, setMenuLunchbox] = useState<MenuLunchbox[]>([]);
  const [dialog, setDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMenuId, setEditMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 30;

  // SWR hooks
  const {
    data: menuData,
    error: menuError,
    isLoading: menuLoading,
    mutate: mutateMenu,
  } = useSWR(`/api/get/menu/page?page=${currentPage}&limit=${itemsPerPage}`, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { data: ingredientOptions } = useSWR<IngredientOption[]>("/api/get/ingredients", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: lunchboxOptions } = useSWR<LunchboxOption[]>("/api/get/lunchbox", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const uniqueIngredients = menuData?.data
    ? Array.from(
        new Set(
          menuData.data.flatMap((item: MenuItem) => {
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

  const { data: ingredientUnitsData } = useSWR(uniqueIngredients.length > 0 ? `/api/get/ingredients/list?names=${encodeURIComponent(uniqueIngredients.join(","))}` : null, fetcher);

  // แปลงข้อมูลจาก SWR ให้ใช้งานได้
  const menuItems = menuData?.data || [];
  const totalPagesFromData = menuData?.pagination?.totalPages || 1;
  const isLoadingData = menuLoading;
  const errorData = menuError?.message || null;

  // สร้าง ingredientUnits map
  const ingredientUnits = useMemo(() => {
    if (!ingredientUnitsData) return {};
    const unitMap: Record<string, string> = {};
    ingredientUnitsData.forEach((unit: IngredientUnit) => {
      unitMap[unit.ingredient_name.trim().toLowerCase()] = unit.ingredient_unit;
    });
    return unitMap;
  }, [ingredientUnitsData]);

  // อัปเดต states เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (totalPagesFromData) {
      setTotalPages(totalPagesFromData);
    }
  }, [totalPagesFromData]);

  useEffect(() => {
    setIsLoading(isLoadingData);
  }, [isLoadingData]);

  useEffect(() => {
    setError(errorData);
  }, [errorData]);

  const formatIngredients = (data: string | Ingredient[]) => {
    try {
      const ingredients = typeof data === "string" ? JSON.parse(data) : data;
      return (
        <div className='flex flex-wrap gap-1'>
          {ingredients.map((ing: Ingredient, idx: number) => {
            const unit = ingredientUnits[ing.ingredient_name.trim().toLowerCase()] || "หน่วย";
            return (
              <span key={idx} className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                {ing.ingredient_name} {ing.useItem}
                {unit}
              </span>
            );
          })}
        </div>
      );
    } catch {
      return <span className='text-red-500 text-sm'>ข้อมูลไม่ถูกต้อง</span>;
    }
  };

const formatLunchbox = (lunchbox: MenuLunchbox[] | undefined) => {
  if (!lunchbox || !Array.isArray(lunchbox) || lunchbox.length === 0) {
    return <span className='text-gray-500 text-sm'>-</span>;
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {lunchbox.map((lb, idx) => (
        <React.Fragment key={idx}>
          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800'>
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800'>
              {lb.lunchbox_name}
              {lb.lunchbox_set_name && <span className='ml-1 text-purple-600'>({lb.lunchbox_set_name})</span>}
            </span>
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>{lb.lunchbox_cost && <span className='ml-1 text-green-600'>({lb.lunchbox_cost} บาท)</span>}</span>
          </span>
        </React.Fragment>
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

      // ใช้ mutate แทน location.reload() เพื่อ refresh ข้อมูล
      await mutateMenu();
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

      // ใช้ mutate แทน location.reload()
      await mutateMenu();
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
    setMenuLunchbox([...menuLunchbox, { lunchbox_name: "", lunchbox_set_name: "", lunchbox_cost: 0 }]);
  };

  const removeLunchbox = (index: number) => {
    const updated = menuLunchbox.filter((_, i) => i !== index);
    setMenuLunchbox(updated);
  };

  const updateLunchbox = (index: number, field: "lunchbox_name" | "lunchbox_set_name" | "lunchbox_cost", value: any) => {
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
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>จัดการเมนูอาหาร</h1>
              <p className='mt-1 text-sm text-gray-500'>เพิ่ม แก้ไข และลบเมนูอาหารในระบบ</p>
            </div>
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
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              เพิ่มเมนูใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>เกิดข้อผิดพลาด</h3>
                <div className='mt-2 text-sm text-red-700'>{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Table */}
        <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
          {isLoading ? (
            <div className='p-8'>
              <div className='animate-pulse space-y-4'>
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className='flex space-x-4'>
                    <div className='h-4 bg-gray-300 rounded w-1/4'></div>
                    <div className='h-4 bg-gray-300 rounded w-2/4'></div>
                    <div className='h-4 bg-gray-300 rounded w-1/4'></div>
                    <div className='h-4 bg-gray-300 rounded w-1/6'></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      ชื่อเมนู
                    </th>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      ประเภท
                    </th>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      วัตถุดิบ
                    </th>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      กล่องอาหาร
                    </th>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      ราคา
                    </th>
                    <th className='px-6 py-4 text-left text-base font-black text-gray-900 uppercase tracking-wider' style={{ color: "#000000" }}>
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {menuItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='px-6 py-12 text-center'>
                        <div className='flex flex-col items-center'>
                          <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          <h3 className='mt-2 text-sm font-medium text-gray-900'>ไม่มีเมนูอาหาร</h3>
                          <p className='mt-1 text-sm text-gray-500'>เริ่มต้นด้วยการเพิ่มเมนูอาหารใหม่</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item.menu_id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex flex-col'>
                            <div className='text-sm font-medium text-gray-900'>{item.menu_name}</div>
                            <div className='text-sm text-gray-500'>{item.menu_subname}</div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>{item.menu_category}</span>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='max-w-xs'>{formatIngredients(item.menu_ingredients)}</div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='max-w-xs'>{formatLunchbox(item.menu_lunchbox)}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>฿{item.menu_cost?.toLocaleString() || 0}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => openEditDialog(item)}
                              className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                              แก้ไข
                            </button>
                            <button
                              onClick={() => deleteMenu(item.menu_id)}
                              className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                              ลบ
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-8'>
            <PaginationComponent
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {dialog && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              {/* Header */}
              <div className='flex items-center justify-between pb-4 border-b'>
                <h3 className='text-lg font-medium text-gray-900'>{editMenuId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h3>
                <button onClick={() => setDialog(false)} className='text-gray-400 hover:text-gray-600 transition-colors'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className='mt-6 space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>ชื่อเมนู</label>
                    <input type='text' value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder='ชื่อเมนู' className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' required />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>ชื่อรอง</label>
                    <input type='text' value={menuSubName} onChange={(e) => setMenuSubName(e.target.value)} placeholder='ชื่อรอง' className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' required />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>ประเภท</label>
                    <input type='text' value={menuCategoryName} onChange={(e) => setMenuCategoryName(e.target.value)} placeholder='ประเภทเมนู' className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' required />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>ราคา (บาท)</label>
                    <input type='number' value={menuCost} onChange={(e) => setMenuCost(Number(e.target.value))} placeholder='ราคา' className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' required />
                  </div>
                </div>

                {/* Lunchbox Section - แก้ไขส่วนนี้ */}
                <div>
                  <div className='flex justify-between items-center mb-3'>
                    <label className='block text-sm font-medium text-gray-700'>ข้อมูลกล่องอาหาร</label>
                    <button type='button' onClick={addLunchbox} className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                      </svg>
                      เพิ่มกล่องอาหาร
                    </button>
                  </div>

                  <div className='space-y-3'>
                    {menuLunchbox.map((lb, idx) => (
                      <div key={idx} className='flex gap-3 items-center p-4 border border-gray-200 rounded-lg bg-gray-50'>
                        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3'>
                          {/* ช่องเลือกชื่อกล่องอาหาร - แก้ไขส่วนนี้ */}
                          <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>ชื่อกล่องอาหาร</label>
                            <select value={lb.lunchbox_name} onChange={(e) => updateLunchbox(idx, "lunchbox_name", e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm' required>
                              <option value=''>เลือกกล่องอาหาร</option>
                              {getUniqueLunchboxNames().map((name, nameIdx) => (
                                <option key={nameIdx} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* ช่องเลือกชื่อชุดกล่องอาหาร */}
                          <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>ชื่อชุดกล่องอาหาร</label>
                            <select
                              value={lb.lunchbox_set_name}
                              onChange={(e) => updateLunchbox(idx, "lunchbox_set_name", e.target.value)}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                              required
                              disabled={!lb.lunchbox_name}>
                              <option value=''>เลือกชุดกล่องอาหาร</option>
                              {getLunchboxSetOptions(lb.lunchbox_name).map((option, optionIdx) => (
                                <option key={optionIdx} value={option.lunchbox_set_name}>
                                  {option.lunchbox_set_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>ราคาชุดกล่องอาหาร</label>
                            <input
                              type='number'
                              min='0'
                              value={lb.lunchbox_cost || 0}
                              onChange={(e) => updateLunchbox(idx, "lunchbox_cost", Number(e.target.value) || 0)}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                              required
                              disabled={!lb.lunchbox_name}
                            />
                          </div>
                        </div>
                        <button type='button' onClick={() => removeLunchbox(idx)} className='text-red-500 hover:text-red-700 p-2 transition-colors'>
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {menuLunchbox.length === 0 && (
                      <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg'>
                        <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                        </svg>
                        <p className='mt-2 text-sm'>ยังไม่มีข้อมูลกล่องอาหาร</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients Section */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>วัตถุดิบ</label>
                  <div className='space-y-3'>
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className='flex gap-3 items-center'>
                        <select
                          value={ing.ingredient_name}
                          onChange={(e) => {
                            const updated = [...ingredients];
                            updated[idx].ingredient_name = e.target.value;
                            setIngredients(updated);
                          }}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'>
                          <option value=''>เลือกวัตถุดิบ</option>
                          {(ingredientOptions || []).map((opt) => (
                            <option key={opt.ingredient_id} value={opt.ingredient_name}>
                              {opt.ingredient_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type='number'
                          className='w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                          value={ing.useItem}
                          onChange={(e) => {
                            const updated = [...ingredients];
                            updated[idx].useItem = Number(e.target.value);
                            setIngredients(updated);
                          }}
                          placeholder='จำนวน'
                        />
                        <button type='button' onClick={() => removeIngredient(idx)} className='text-red-500 hover:text-red-700 p-2 transition-colors'>
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={() => setIngredients([...ingredients, { useItem: 0, ingredient_name: "" }])}
                    className='mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    เพิ่มวัตถุดิบ
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-md p-4'>
                    <div className='flex'>
                      <div className='flex-shrink-0'>
                        <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-sm font-medium text-red-800'>เกิดข้อผิดพลาด</h3>
                        <div className='mt-2 text-sm text-red-700'>{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex justify-end space-x-3 pt-6 border-t'>
                  <button type='button' onClick={() => setDialog(false)} className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    ยกเลิก
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isSubmitting ? (
                      <div className='flex items-center'>
                        <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        กำลังบันทึก...
                      </div>
                    ) : editMenuId ? (
                      "อัปเดตเมนู"
                    ) : (
                      "บันทึกเมนู"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
