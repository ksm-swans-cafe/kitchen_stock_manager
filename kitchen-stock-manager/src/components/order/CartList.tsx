"use client";

import React, { useState } from "react";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import './style.css'

export default function CartList() {
  const { items, addItem, removeItem, clearCart, setItemQuantity } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { userName } = useAuth();
  const router = useRouter();

  const confirmOrder = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/post/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_username: userName,
          cart_menu_items: items.map(
            ({ menu_name, menu_total, menu_ingredients }) => ({
              menu_name,
              menu_total,
              menu_ingredients,
            })
          ),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setSuccess(true);
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
        }
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    clearCart();
    router.push("/home/orderhistory");
  };

  const handleChangeQuantity = (itemId: string | number, quantity: number) => {
    if (quantity >= 1) {
      setItemQuantity(itemId, quantity);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🛒 Cart Items</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีรายการในตะกร้า</p>
        ) : (
          <>
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
                        style={{
                          MozAppearance: 'textfield',
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.menu_total}
                        onChange={(e) =>
                          handleChangeQuantity(item.menu_id!, Number(e.target.value))
                        }
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
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "กำลังส่ง..." : "Confirm Order"}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}
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
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
