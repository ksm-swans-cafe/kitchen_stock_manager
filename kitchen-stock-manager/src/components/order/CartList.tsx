"use client";

import React, { useState } from "react";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function CartList() {
  const { items, addItem, removeItem, clearCart, setItemQuantity } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const [cart_customer_name, setName] = useState("");
  const [cart_customer_tel, setTel] = useState("");
  const [cart_location_send, setLocation] = useState("");
  const [cart_delivery_date, setDate] = useState("");
  const [rawDate, setRawDate] = useState("");

  const { userName } = useAuth();
  const router = useRouter();

  // ฟังก์ชันจัดการเบอร์โทรแบบเติม "-" อัตโนมัติ
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // ลบทุกอย่างที่ไม่ใช่ตัวเลข

    if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }

    setTel(value);
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
          cart_menu_items: items.map(({ menu_name, menu_total, menu_ingredients }) => ({
            menu_name,
            menu_total,
            menu_ingredients,
          })),
        }),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการสั่งซื้อ");
      setSuccess(true);
    } catch (err: any) {
      setErrors([err.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    clearCart();
    router.push("/home/orderhistory/notsuccess");
  };

  const handleChangeQuantity = (itemId: string | number, quantity: number) => {
    if (quantity >= 1) setItemQuantity(itemId, quantity);
  };

  return (
    <main className="min-h-screen text-black">
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🛒 รายการในตะกร้า</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีรายการในตะกร้า</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium">ชื่อลูกค้า</label>
                <input
                  type="text"
                  value={cart_customer_name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อลูกค้า"
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">เบอร์โทรลูกค้า</label>
                <input
                  type="text"
                  value={cart_customer_tel}
                  onChange={handlePhoneChange}
                  placeholder="081-234-5678"
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-medium">สถานที่จัดส่ง</label>
                <input
                  type="text"
                  value={cart_location_send}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="สถานที่จัดส่ง"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-medium">วันที่จัดส่ง</label>
                <input
                  type="date"
                  value={rawDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRawDate(value);
                    if (value) {
                      const [year, month, day] = value.split("-");
                      const buddhistYear = parseInt(year) + 543;
                      setDate(`${day}/${month}/${buddhistYear}`);
                    } else {
                      setDate("");
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                />
                {cart_delivery_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    วันที่จัดส่ง: {cart_delivery_date}
                  </p>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-4">
              {items.map((item) =>
                item.menu_id ? (
                  <li
                    key={item.menu_id}
                    className="border p-4 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.menu_name}</div>
                      <div className="text-gray-500">{item.menu_price} ฿</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeItem(item.menu_id!)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.menu_total}
                        onChange={(e) => handleChangeQuantity(item.menu_id!, Number(e.target.value))}
                        className="w-16 text-center border rounded"
                      />
                      <button
                        onClick={() => addItem(item)}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ) : null
              )}
            </ul>

            <button
              onClick={confirmOrder}
              disabled={loading}
              style={{
                backgroundColor: loading
                  ? "#a0aec0"
                  : errors.length === 0
                  ? "#38a169" // สีเขียว
                  : "#e53e3e", // สีแดง
                cursor: loading ? "not-allowed" : "pointer",
                color: "white",
              }}
              className="w-full py-2 rounded font-bold transition"
            >
              {loading ? "กำลังส่ง..." : "ยืนยันคำสั่งซื้อ"}
            </button>

            {errors.length > 0 && (
              <ul className="mt-4 text-red-500 space-y-1 list-disc list-inside text-sm">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">✅ สั่งซื้อสำเร็จ!</h2>
            <p className="mb-4">ยืนยันคำสั่งซื้อเรียบร้อยแล้ว</p>
            <button
              onClick={handleDone}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
