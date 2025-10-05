"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { MenuItem } from "@/models/menu_card/MenuCard";
import { LunchBox } from "@/stores/store";

registerLocale("th", th);


export default function CartList() {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const [deliveryTime, setDeliveryTime] = useState<Date | undefined>(midnight);
  const [pickupTime, setPickupTime] = useState<Date | undefined>(midnight);

  const formatTime = (date?: Date) => {
    return date
      ? date.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "";
  };

  const {
    items,
    addItem,
    removeItem,
    clearCart,
    setItemQuantity,
    cart_customer_name,
    cart_customer_tel,
    cart_location_send,
    cart_delivery_date,
    cart_export_time,
    cart_receive_time,
    cart_shipping_cost,
    cart_lunch_box,
    cart_lunch_box_set,
    selected_lunchboxes,
    setCustomerInfo,
    addLunchbox,
    removeLunchbox,
    updateLunchboxQuantity,
    updateLunchboxMenus,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [rawDate, setRawDate] = useState<string>("");
  const { userName, userRole } = useAuth();
  const [lunchbox, setLunchbox] = useState<LunchBox[]>([]);
  const [availableSets, setAvailableSets] = useState<string[]>([]);
  const [availableMenus, setAvailableMenus] = useState<MenuItem[]>([]);
  const [showMenuSelection, setShowMenuSelection] = useState(false);
  const [currentLunchboxIndex, setCurrentLunchboxIndex] = useState<number>(-1);
  const [selectedMenus, setSelectedMenus] = useState<MenuItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (cart_delivery_date) {
      const parts = cart_delivery_date.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10) - 543;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) setRawDate(d.toISOString());
      }
    } else {
      setRawDate("");
    }
  }, [cart_delivery_date]);

  useEffect(() => {
    if (cart_export_time) {
      const [hour, minute] = cart_export_time.split(":").map(Number);
      const d = new Date();
      d.setHours(hour, minute, 0, 0);
      setDeliveryTime(d);
    }

    if (cart_receive_time) {
      const [hour, minute] = cart_receive_time.split(":").map(Number);
      const d = new Date();
      d.setHours(hour, minute, 0, 0);
      setPickupTime(d);
    }
  }, []);

  useEffect(() => {
    const fetchLunchbox = async () => {
      try {
        const response = await fetch("/api/get/lunchbox");
        const data = await response.json();
        setLunchbox(data);
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      }
    };
    fetchLunchbox();
  }, []);

  useEffect(() => {
    if (cart_lunch_box && lunchbox.length > 0) {
      const sets = lunchbox.filter((item) => item.lunchbox_name === cart_lunch_box).map((item) => item.lunchbox_set_name);
      setAvailableSets([...new Set(sets)]);
    } else {
      setAvailableSets([]);
    }
  }, [cart_lunch_box, lunchbox]);

  // ฟังก์ชันสำหรับเลือกเมนูใน lunchbox
  const handleSelectMenus = (lunchboxIndex: number) => {
    console.log("handleSelectMenus called with index:", lunchboxIndex);
    console.log("Selected lunchboxes:", selected_lunchboxes);

    setCurrentLunchboxIndex(lunchboxIndex);
    setShowMenuSelection(true);
    // ส่งข้อมูล lunchbox ไปในฟังก์ชัน
    const currentLunchbox = selected_lunchboxes[lunchboxIndex];
    fetchAvailableMenus(currentLunchbox);
  };

  const fetchAvailableMenus = async (lunchboxData?: any) => {
    try {
      // ใช้ข้อมูลที่ส่งมา หรือใช้จาก state
      const currentLunchbox = lunchboxData || selected_lunchboxes[currentLunchboxIndex];

      console.log("Current lunchbox data:", currentLunchbox);

      if (!currentLunchbox) {
        console.log("No lunchbox data found");
        return;
      }

      const url = `/api/get/lunchbox/categories?lunchbox_name=${encodeURIComponent(currentLunchbox.lunchbox_name)}&lunchbox_set_name=${encodeURIComponent(currentLunchbox.lunchbox_set)}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch available menus");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.data) {
        const menuItems: MenuItem[] = data.data.map((menu: any) => ({
          menu_id: menu.menu_id?.toString() || "",
          menu_name: menu.menu_name || "",
          menu_subname: menu.menu_subname || "",
          menu_category: menu.menu_category || "",
          menu_price: menu.menu_cost || 0,
          menu_ingredients: menu.menu_ingredients || [],
          menu_description: menu.menu_description || "",
        }));

        console.log("Processed menu items:", menuItems);
        setAvailableMenus(menuItems);
      } else {
        console.error("API response error:", data.message);
        setAvailableMenus([]);
      }
    } catch (error) {
      console.error("Error fetching available menus:", error);
      setAvailableMenus([]);
    }
  };

  const handleMenuSelection = (menu: MenuItem) => {
    const currentLunchbox = selected_lunchboxes[currentLunchboxIndex];
    const updatedMenus = [...selectedMenus];

    const existingIndex = updatedMenus.findIndex((m) => m.menu_id === menu.menu_id);

    if (existingIndex !== -1) {
      // ถ้าเมนูนี้มีอยู่แล้ว ให้ลบออก
      updatedMenus.splice(existingIndex, 1);
    } else {
      // ถ้าเมนูนี้ยังไม่มี และยังไม่เกิน limit
      if (updatedMenus.length < currentLunchbox.lunchbox_limit) {
        updatedMenus.push(menu);
      } else {
        alert(`สามารถเลือกเมนูได้เพียง ${currentLunchbox.lunchbox_limit} อย่าง`);
      }
    }

    setSelectedMenus(updatedMenus);
  };

  const confirmMenuSelection = () => {
    if (selectedMenus.length === 0) {
      alert("กรุณาเลือกเมนูอย่างน้อย 1 อย่าง");
      return;
    }

    updateLunchboxMenus(currentLunchboxIndex, selectedMenus);
    setShowMenuSelection(false);
    setSelectedMenus([]);
    setCurrentLunchboxIndex(-1);
  };

  const handleLunchboxChange = (selectedLunchbox: string) => {
    setCustomerInfo({ lunchbox: selectedLunchbox, lunchbox_set: "" });
  };

  const handleAddLunchbox = () => {
    if (!cart_lunch_box || !cart_lunch_box_set) {
      alert("กรุณาเลือกโปรโมชั่นและเซทอาหารก่อน");
      return;
    }

    const selectedLunchboxData = lunchbox.find((item) => item.lunchbox_name === cart_lunch_box && item.lunchbox_set_name === cart_lunch_box_set);

    if (selectedLunchboxData) {
      const newLunchbox = {
        lunchbox_name: cart_lunch_box,
        lunchbox_set: cart_lunch_box_set,
        lunchbox_limit: selectedLunchboxData.lunchbox_limit,
        selected_menus: [],
        quantity: 1,
      };

      addLunchbox(newLunchbox);
      // รีเซ็ตการเลือก
      setCustomerInfo({ lunchbox: "", lunchbox_set: "" });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
    setCustomerInfo({ tel: value });
  };

  const handleShippingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^\d]/g, "");
    if (!numericValue) {
      setCustomerInfo({ cart_shipping_cost: "" });
      return;
    }
    const formattedValue = Number(numericValue).toLocaleString("th-TH");
    setCustomerInfo({ cart_shipping_cost: formattedValue });
  };

  const validateInputs = (): boolean => {
    const newErrors: string[] = [];

    if (!cart_customer_name.trim()) newErrors.push("กรุณากรอกชื่อลูกค้า");
    if (!cart_customer_tel.trim()) {
      newErrors.push("กรุณากรอกเบอร์โทรลูกค้า");
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(cart_customer_tel)) {
      newErrors.push("เบอร์โทรต้องอยู่ในรูปแบบ 081-234-5678");
    }
    if (!cart_location_send.trim()) newErrors.push("กรุณากรอกสถานที่จัดส่ง");
    if (!cart_delivery_date.trim()) newErrors.push("กรุณาเลือกวันที่จัดส่ง");
    if (!cart_export_time.trim()) newErrors.push("กรุณาเลือกเวลาส่งอาหาร");
    if (!cart_receive_time.trim()) newErrors.push("กรุณาเลือกเวลารับอาหาร");
    if (selected_lunchboxes.length === 0) newErrors.push("กรุณาเลือกโปรโมชั่นอาหารอย่างน้อย 1 อย่าง");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const confirmOrder = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrors([]);
    try {
      const response = await fetch("/api/post/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_username: userName,
          cart_customer_name,
          cart_customer_tel,
          cart_location_send,
          cart_delivery_date,
          cart_export_time,
          cart_receive_time,
          cart_shipping_cost: cart_shipping_cost.replace(/[^\d]/g, ""),
          cart_menu_items: items.map((item, index) => ({
            menu_name: item.menu_name,
            menu_subname: item.menu_subname,
            menu_category: item.menu_category,
            menu_total: item.menu_total,
            menu_ingredients: item.menu_ingredients,
            menu_description: item.menu_description,
            menu_order_id: index + 1,
          })),
          cart_lunchboxes: selected_lunchboxes.map((lunchbox, index) => ({
            lunchbox_name: lunchbox.lunchbox_name,
            lunchbox_set: lunchbox.lunchbox_set,
            lunchbox_quantity: lunchbox.quantity,
            lunchbox_menus: lunchbox.selected_menus.map((menu, menuIndex) => ({
              menu_name: menu.menu_name,
              menu_subname: menu.menu_subname,
              menu_category: menu.menu_category,
              menu_total: 1,
              menu_ingredients: menu.menu_ingredients,
              menu_description: menu.menu_description,
              menu_order_id: menuIndex + 1,
            })),
          })),
        }),
      });
      console.log("Response:", response);

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการสั่งซื้อ");
      setSuccess(true);
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    clearCart();
    router.push("/home/summarylist");
  };

  const handleChangeQuantity = (cartItemId: string, quantity: number) => {
    if (quantity >= 1) setItemQuantity(cartItemId, quantity);
  };

  return (
    <main className='min-h-screen text-black'>
      <div className='p-4 max-w-md mx-auto'>
        <h1 className='text-2xl font-bold mb-4'>🛒 รายการในตะกร้า</h1>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='flex flex-col gap-1'>
            <label className='font-medium'>ชื่อลูกค้า</label>
            <input type='text' value={cart_customer_name} onChange={(e) => setCustomerInfo({ name: e.target.value })} placeholder='ชื่อลูกค้า' className='border rounded px-3 py-2' />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='font-medium'>เบอร์โทรลูกค้า</label>
            <input type='text' value={cart_customer_tel} onChange={handlePhoneChange} placeholder='081-234-5678' className='border rounded px-3 py-2' />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-medium'>สถานที่จัดส่ง</label>
            <input type='text' value={cart_location_send} onChange={(e) => setCustomerInfo({ location: e.target.value })} placeholder='สถานที่จัดส่ง' className='w-full border rounded px-3 py-2' />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-medium'>วันที่จัดส่ง</label>
            <DatePicker
              selected={rawDate ? new Date(rawDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setRawDate(date.toISOString());
                  const buddhistYear = date.getFullYear() + 543;
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  setCustomerInfo({
                    deliveryDate: `${day}/${month}/${buddhistYear}`,
                  });
                } else {
                  setRawDate("");
                  setCustomerInfo({ deliveryDate: "" });
                }
              }}
              dateFormat='dd/MM/yyyy'
              minDate={userRole === "admin" ? undefined : new Date()}
              locale='th'
              placeholderText='วัน/เดือน/ปี (พ.ศ.)'
              className='w-full border rounded px-3 py-2'
              renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
                const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
                const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

                return (
                  <div className='flex justify-between items-center mb-2 px-2'>
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                      {"<"}
                    </button>

                    <div className='flex items-center gap-2'>
                      <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(Number(value))} className='border rounded px-1 py-0.5'>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year + 543}
                          </option>
                        ))}
                      </select>

                      <select value={date.getMonth()} onChange={({ target: { value } }) => changeMonth(Number(value))} className='border rounded px-1 py-0.5'>
                        {months.map((month, index) => (
                          <option key={index} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                      {">"}
                    </button>
                  </div>
                );
              }}
            />
            {cart_delivery_date && <p className='text-sm text-gray-500 mt-1'>วันที่จัดส่ง: {cart_delivery_date}</p>}
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label htmlFor='food-delivery-time' className='font-medium'>
              เวลาส่งอาหาร
            </label>
            <Flatpickr
              id='food-delivery-time'
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
              }}
              value={deliveryTime}
              onChange={([time]) => {
                setDeliveryTime(time);
                setCustomerInfo({ exportTime: formatTime(time) });
              }}
              className='border border-gray-300 rounded px-3 py-2'
            />
            <p className='text-sm text-gray-500'>เวลาที่เลือก: {formatTime(deliveryTime)}</p>
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label htmlFor='food-pickup-time' className='font-medium'>
              เวลารับอาหาร
            </label>
            <Flatpickr
              id='food-pickup-time'
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
              }}
              value={pickupTime}
              onChange={([time]) => {
                setPickupTime(time);
                setCustomerInfo({ receiveTime: formatTime(time) });
              }}
              className='border border-gray-300 rounded px-3 py-2'
            />
            <p className='text-sm text-gray-500'>เวลาที่เลือก: {formatTime(pickupTime)}</p>
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-medium'>ค่าจัดส่ง</label>
            <input type='text' value={cart_shipping_cost} onChange={handleShippingCostChange} placeholder='ใส่ค่าจัดส่ง' className='border rounded px-3 py-2' />
          </div>
        </div>

        {/* Regular Menu Items */}
        <ul className='space-y-4 mb-4'>
          {items.map((item) =>
            item.cart_item_id ? (
              <li key={item.cart_item_id} className='border p-4 rounded flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='font-medium'>{item.menu_name}</div>
                  <div className='text-gray-500'>{item.menu_price} ฿</div>
                  {item.menu_description && <div className='text-sm text-gray-600 mt-1 italic'>หมายเหตุ: {item.menu_description}</div>}
                </div>
                <div className='flex items-center space-x-2'>
                  <button onClick={() => removeItem(item.cart_item_id!)} className='px-3 py-1 bg-red-500 text-white rounded'>
                    −
                  </button>
                  <input type='number' value={item.menu_total} onChange={(e) => handleChangeQuantity(item.cart_item_id!, Number(e.target.value))} className='w-16 text-center border rounded' />
                  <button onClick={() => addItem(item, item.menu_description || "")} className='px-3 py-1 bg-green-500 text-white rounded'>
                    +
                  </button>
                </div>
              </li>
            ) : null
          )}
        </ul>

        <div className='border p-4 rounded mb-4'>
          <h3 className='font-bold mb-3'>🍱 เลือกโปรโมชั่นอาหาร</h3>

          <div className='grid grid-cols-2 gap-4 mb-3'>
            <div className='flex flex-col gap-1'>
              <label className='font-medium'>ชื่อโปรโมชั่นอาหาร</label>
              <select value={cart_lunch_box} onChange={(e) => handleLunchboxChange(e.target.value)} className='w-full border rounded px-3 py-2'>
                <option value=''>เลือกโปรโมชั่นอาหาร</option>
                {lunchbox.length > 0 &&
                  [...new Set(lunchbox.map((item) => item.lunchbox_name))].map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='font-medium'>ชื่อเซทอาหาร</label>
              <select value={cart_lunch_box_set} onChange={(e) => setCustomerInfo({ lunchbox_set: e.target.value })} className='w-full border rounded px-3 py-2' disabled={!cart_lunch_box || availableSets.length === 0}>
                <option value=''>{cart_lunch_box ? "เลือกเซทอาหาร" : "กรุณาเลือกโปรโมชั่นก่อน"}</option>
                {availableSets.map((set, index) => (
                  <option key={index} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleAddLunchbox} className='w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700' disabled={!cart_lunch_box || !cart_lunch_box_set}>
            ➕ เพิ่มโปรโมชั่น
          </button>
        </div>

        {/* Selected Lunchboxes */}
        {selected_lunchboxes.length > 0 && (
          <div className='space-y-3 mb-4'>
            <h3 className='font-bold'>📦 โปรโมชั่นที่เลือก</h3>
            {selected_lunchboxes.map((lunchbox, index) => (
              <div key={index} className='border p-4 rounded bg-gray-50'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h4 className='font-medium'>
                      {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set}
                    </h4>
                    <p className='text-sm text-gray-600'>เลือกได้ {lunchbox.lunchbox_limit} อย่าง</p>
                  </div>
                  <button onClick={() => removeLunchbox(index)} className='px-2 py-1 bg-red-500 text-white rounded text-sm'>
                    ลบ
                  </button>
                </div>

                <div className='flex items-center gap-2 mb-2'>
                  <label className='text-sm'>จำนวน:</label>
                  <input type='number' value={lunchbox.quantity} onChange={(e) => updateLunchboxQuantity(index, Number(e.target.value))} min='1' className='w-20 border rounded px-2 py-1 text-center' />
                </div>

                <div className='mb-2'>
                  <p className='text-sm font-medium'>เมนูที่เลือก:</p>
                  {lunchbox.selected_menus.length > 0 ? (
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {lunchbox.selected_menus.map((menu, menuIndex) => (
                        <span key={menuIndex} className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                          {menu.menu_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500'>ยังไม่ได้เลือกเมนู</p>
                  )}
                </div>

                <button onClick={() => handleSelectMenus(index)} className='w-full text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>
                  {lunchbox.selected_menus.length > 0 ? "แก้ไขเมนู" : "เลือกเมนู"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Regular Menu Button */}
        <div className='border p-4 rounded mb-4'>
          <button onClick={() => router.push("/home/order/menu")} className='w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
            ➕ เพิ่มเมนูทั่วไป
          </button>
        </div>

        {/* Menu Selection Modal */}
        {showMenuSelection && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
            <div className='bg-white p-6 rounded max-w-md w-full max-h-[80vh] overflow-y-auto'>
              <h3 className='text-lg font-bold mb-4'>เลือกเมนู</h3>
              <p className='text-sm text-gray-600 mb-4'>
                เลือกได้ {selected_lunchboxes[currentLunchboxIndex]?.lunchbox_limit} อย่าง
                <br />
                โปรโมชั่น: {selected_lunchboxes[currentLunchboxIndex]?.lunchbox_name} - {selected_lunchboxes[currentLunchboxIndex]?.lunchbox_set}
              </p>

              <div className='space-y-2 mb-4'>
                {availableMenus.length > 0 ? (
                  availableMenus.map((menu) => (
                    <div key={menu.menu_id} className={`p-3 border rounded cursor-pointer ${selectedMenus.some((m) => m.menu_id === menu.menu_id) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"}`} onClick={() => handleMenuSelection(menu)}>
                      <div className='font-medium'>{menu.menu_name}</div>
                      <div className='text-sm text-gray-600'>{menu.menu_price} ฿</div>
                      {menu.menu_subname && <div className='text-xs text-gray-500'>{menu.menu_subname}</div>}
                    </div>
                  ))
                ) : (
                  <div className='text-center text-gray-500 py-4'>
                    <p>ไม่พบเมนูที่เกี่ยวข้องกับโปรโมชั่นนี้</p>
                    <p className='text-xs mt-1'>
                      {selected_lunchboxes[currentLunchboxIndex]?.lunchbox_name} - {selected_lunchboxes[currentLunchboxIndex]?.lunchbox_set}
                    </p>
                  </div>
                )}
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setShowMenuSelection(false);
                    setSelectedMenus([]);
                    setCurrentLunchboxIndex(-1);
                  }}
                  className='flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'>
                  ยกเลิก
                </button>
                <button onClick={confirmMenuSelection} className='flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={confirmOrder}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a0aec0" : errors.length === 0 ? "#38a169" : "#e53e3e",
            cursor: loading ? "not-allowed" : "pointer",
            color: "white",
          }}
          className='w-full py-2 rounded font-bold transition'>
          {loading ? "กำลังส่ง..." : "ยืนยันคำสั่งซื้อ"}
        </button>

        {errors.length > 0 && (
          <ul className='mt-4 text-red-500 space-y-1 list-disc list-inside text-sm'>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      {success && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white p-6 rounded max-w-sm text-center space-y-4'>
            <h2 className='text-xl font-bold'>สั่งซื้อสำเร็จ</h2>
            <p>คำสั่งซื้อของคุณถูกบันทึกเรียบร้อยแล้ว</p>
            <button onClick={handleDone} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700' style={{ backgroundColor: "#16a34a", color: "#ffffff" }}>
              ตกลง
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
