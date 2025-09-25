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
    setCustomerInfo,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [rawDate, setRawDate] = useState<string>("");
  const { userName, userRole } = useAuth();
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
          cart_menu_items: items.map(({ menu_name, menu_total, menu_ingredients, menu_description }) => ({
            menu_name,
            menu_total,
            menu_ingredients,
            menu_description,
          })),
        }),
      });

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

  const handleChangeQuantity = (itemId: string | number, quantity: number) => {
    if (quantity >= 1) setItemQuantity(itemId, quantity);
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

        <ul className='space-y-4 mb-4'>
          {items.map((item) =>
            item.menu_id != null ? (
              <li key={item.menu_id} className='border p-4 rounded flex justify-between items-center'>
                <div>
                  <div className='font-medium'>{item.menu_name}</div>
                  <div className='text-gray-500'>{item.menu_price} ฿</div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button onClick={() => removeItem(item.menu_id!)} className='px-3 py-1 bg-red-500 text-white rounded'>
                    −
                  </button>
                  <input type='number' value={item.menu_total} onChange={(e) => handleChangeQuantity(item.menu_id!, Number(e.target.value))} className='w-16 text-center border rounded' />
                  <button onClick={() => addItem(item)} className='px-3 py-1 bg-green-500 text-white rounded'>
                    +
                  </button>
                </div>
              </li>
            ) : null
          )}

          <div className='border p-4 rounded'>
            <button onClick={() => router.push("/home/order/menu")} className='w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
              ➕ เพิ่มเมนู
            </button>
          </div>
        </ul>

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
