"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale/th";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

registerLocale("th", th);

export default function CartList() {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const [deliveryTime, setDeliveryTime] = useState<Date | undefined>(midnight);
  const [pickupTime, setPickupTime] = useState<Date | undefined>(midnight);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [rawDate, setRawDate] = useState<string>("");

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
    setCustomerInfo,

    addItemNote,
    updateItemNote,
    removeItemNote,
  } = useCartStore();

  const { userName } = useAuth();
  const router = useRouter();

  // state หมายเหตุต่อเมนู
  const [noteSelect, setNoteSelect] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [showEditor, setShowEditor] = useState<Record<string, boolean>>({});

  const formatTime = (date?: Date) =>
    date
      ? date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "";

  const sumNotesQty = (notes?: Array<{ qty: number }>) =>
    (notes ?? []).reduce((acc, n) => acc + (Number(n.qty) || 0), 0);

  // เข้ารหัสฟิลด์ข้อความอิสระก่อนส่ง
  const enc = (s: string) => encodeURIComponent(s ?? "");

  // ---------- Phone helpers ----------
  const getMaxDigitsForPhone = (raw: string): number => {
    const s = raw.trim();
    const digits = s.replace(/\D/g, "");
    if (s.startsWith("+")) return 15; // E.164
    if (/^0[689]/.test(digits)) return 10; // มือถือไทย
    if (/^02/.test(digits)) return 9; // บ้าน กทม.
    if (/^0[3-7]/.test(digits)) return 10; // บ้านต่างจังหวัด
    return 15;
  };

  const isValidPhone = (raw: string): boolean => {
    const s = raw.trim();
    const patterns: RegExp[] = [
      /^0[689]\d{8}$/, /^0[689]\d{1}[-\s]?\d{3}[-\s]?\d{4}$/,
      /^02\d{7}$/, /^02[-\s]?\d{3}[-\s]?\d{4}$/,
      /^0[3-7]\d{8}$/, /^0[3-7]\d{1}[-\s]?\d{3}[-\s]?\d{4}$/,
      /^\+66\d{8,9}$/, /^\+66\s?\d{1,2}\s?\d{3}\s?\d{4}$/,
      /^\+?\d{1,4}?[-\s]?\(?\d{1,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}(?:\s?(?:#|x|ext\.?)\s?\d{1,5})?$/i,
    ];
    return patterns.some((re) => re.test(s));
  };

  const formatPhone = (input: string): string => {
    const extMatch = input.match(/\s*(?:#|x|ext\.?)\s*\d{1,5}$/i);
    const ext = extMatch ? extMatch[0] : "";
    const main = ext ? input.replace(ext, "").trim() : input.trim();

    const digits = main.replace(/\D/g, "");
    if (!digits) return (main + ext).trim();

    if (main.startsWith("+66")) {
      const rest = digits.replace(/^66/, "");
      if (!rest) return "+66" + (ext ? " " + ext.trim() : "");
      if (rest[0] === "2") {
        const p1 = rest.slice(0, 1), p2 = rest.slice(1, 4), p3 = rest.slice(4, 8);
        return (["+66", p1, p2, p3].filter(Boolean).join(" ") + (ext ? " " + ext.trim() : "")).trim();
      }
      const p1 = rest.slice(0, 2), p2 = rest.slice(2, 5), p3 = rest.slice(5, 9);
      return (["+66", p1, p2, p3].filter(Boolean).join(" ") + (ext ? " " + ext.trim() : "")).trim();
    }

    if (digits.startsWith("02")) {
      const p1 = digits.slice(0, 2), p2 = digits.slice(2, 5), p3 = digits.slice(5, 9);
      return ([p1, p2, p3].filter(Boolean).join("-") + (ext ? " " + ext.trim() : "")).trim();
    }
    if (digits.startsWith("0")) {
      const p1 = digits.slice(0, 3), p2 = digits.slice(3, 6), p3 = digits.slice(6, 10);
      return ([p1, p2, p3].filter(Boolean).join("-") + (ext ? " " + ext.trim() : "")).trim();
    }
    return (main + (ext ? " " + ext.trim() : "")).trim();
  };
  // -----------------------------------

  // hydrate วันที่ (พ.ศ. -> ค.ศ.)
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

  // hydrate เวลาเมื่อ mount
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

  // เปิด editor อัตโนมัติถ้ายังไม่มีโน้ต
  useEffect(() => {
    setShowEditor((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (it?.menu_id == null) continue;
        const key = String(it.menu_id);
        if (typeof next[key] === "undefined") next[key] = (it.notes?.length ?? 0) === 0;
      }
      return next;
    });
  }, [items]);

  // จำกัดจำนวนหลัก + ฟอร์แมต
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9+\-\s()#xXext.]/g, "");
    const digits = cleaned.replace(/\D/g, "");
    const maxDigits = getMaxDigitsForPhone(cleaned);
    if (digits.length > maxDigits) return;
    const formatted = formatPhone(cleaned);
    setCustomerInfo({ tel: formatted });
  };

  const validateInputs = (): boolean => {
    const newErrors: string[] = [];
    if (!cart_customer_name.trim()) newErrors.push("กรุณากรอกชื่อลูกค้า");

    if (!cart_customer_tel.trim()) {
      newErrors.push("กรุณากรอกเบอร์โทรลูกค้า");
    } else if (!isValidPhone(cart_customer_tel)) {
      newErrors.push("รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678, 02-123-4567, +66 81 234 5678)");
    }

    if (!cart_location_send.trim()) newErrors.push("กรุณากรอกสถานที่จัดส่ง");
    if (!cart_delivery_date.trim()) newErrors.push("กรุณาเลือกวันที่จัดส่ง");
    if (!cart_export_time.trim()) newErrors.push("กรุณาเลือกเวลาส่งอาหาร");
    if (!cart_receive_time.trim()) newErrors.push("กรุณาเลือกเวลารับอาหาร");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // เพิ่มหมายเหตุใหม่ (qty = 1)
  const handleSaveNote = (
    itemId: string | number,
    menuTotal: number,
    currentNotes?: Array<{ qty: number }>
  ) => {
    const key = String(itemId);
    const picked = (noteSelect[key] ?? "").trim();
    const typed = (noteText[key] ?? "").trim();
    const finalNote = picked || typed;
    if (!finalNote) return;

    const totalNow = sumNotesQty(currentNotes);
    if (totalNow + 1 > menuTotal) {
      setErrors(["จำนวนหมายเหตุรวมเกินจำนวนชุดของเมนู"]);
      return;
    }

    addItemNote(itemId, { qty: 1, note: finalNote });
    setNoteSelect((s) => ({ ...s, [key]: "" }));
    setNoteText((s) => ({ ...s, [key]: "" }));
    setShowEditor((s) => ({ ...s, [key]: false }));
  };

  const confirmOrder = async () => {
    if (!validateInputs()) return;

    const hasOverNotes = items.some((it) => sumNotesQty(it.notes) > it.menu_total);
    if (hasOverNotes) {
      setErrors(["มีหมายเหตุย่อยของบางเมนูที่จำนวนรวมเกินจำนวนทั้งหมด"]);
      return;
    }

    setLoading(true);
    setErrors([]);
    try {
      const payload = {
        cart_username: userName,
        cart_customer_name: enc(cart_customer_name),
        cart_customer_tel: cart_customer_tel,
        cart_location_send: enc(cart_location_send),
        cart_delivery_date,
        cart_export_time,
        cart_receive_time,
        cart_menu_items: items.map(({ menu_name, menu_total, menu_ingredients, notes }) => ({
          menu_name,
          menu_total,
          menu_ingredients,
          menu_notes: (notes ?? []).map((n) => ({
            qty: Number(n.qty) || 0,
            note: enc(n.note?.trim() || ""),
          })),
        })),
      };

      const response: Response = await fetch("/api/post/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <main className="min-h-screen text-black">
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🛒 รายการในตะกร้า</h1>

        {/* ฟอร์มข้อมูลลูกค้า/วันที่/เวลา */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium">ชื่อลูกค้า</label>
            <input
              type="text"
              value={cart_customer_name}
              onChange={(e) => setCustomerInfo({ name: e.target.value })}
              placeholder="ชื่อลูกค้า"
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">เบอร์โทรลูกค้า</label>
            <input
              type="text"
              value={cart_customer_tel}
              onChange={handlePhoneChange}
              placeholder="081-234-5678 / 02-123-4567 / +66 81 234 5678"
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="font-medium">สถานที่จัดส่ง</label>
            <input
              type="text"
              value={cart_location_send}
              onChange={(e) => setCustomerInfo({ location: e.target.value })}
              placeholder="สถานที่จัดส่ง"
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="font-medium">วันที่จัดส่ง</label>
            <DatePicker
              selected={rawDate ? new Date(rawDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setRawDate(date.toISOString());
                  const buddhistYear = date.getFullYear() + 543;
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  setCustomerInfo({ deliveryDate: `${day}/${month}/${buddhistYear}` });
                } else {
                  setRawDate("");
                  setCustomerInfo({ deliveryDate: "" });
                }
              }}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              locale="th"
              placeholderText="วัน/เดือน/ปี (พ.ศ.)"
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => {
                const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
                const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
                return (
                  <div className="flex justify-between items-center mb-2 px-2">
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>{"<"}</button>
                    <div className="flex items-center gap-2">
                      <select
                        value={date.getFullYear()}
                        onChange={({ target: { value } }) => changeYear(Number(value))}
                        className="border rounded px-1 py-0.5"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>{year + 543}</option>
                        ))}
                      </select>
                      <select
                        value={date.getMonth()}
                        onChange={({ target: { value } }) => changeMonth(Number(value))}
                        className="border rounded px-1 py-0.5"
                      >
                        {months.map((month, index) => (
                          <option key={index} value={index}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>{">"}</button>
                  </div>
                );
              }}
            />
            {cart_delivery_date && (
              <p className="text-sm text-gray-500 mt-1">วันที่จัดส่ง: {cart_delivery_date}</p>
            )}
          </div>

          {/* เวลาส่งอาหาร */}
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="food-delivery-time" className="font-medium">เวลาส่งอาหาร</label>
            <Flatpickr
              id="food-delivery-time"
              value={deliveryTime || undefined}
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                minuteIncrement: 5,
                allowInput: true,      // พิมพ์ได้
                closeOnSelect: false,  // ไม่ปิดตอนกำลังเลือก/พิมพ์
                disableMobile: true,   // คง UI เดียวกันทุกอุปกรณ์
              }}
              onChange={([time], _dateStr, instance) => {
                if (time instanceof Date && !isNaN(time.getTime())) {
                  setDeliveryTime(time);
                  setCustomerInfo({ exportTime: formatTime(time) });
                  instance.close(); // ✅ ปิดทันทีเมื่อเลือก/กรอกเสร็จ
                }
              }}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-sm text-gray-500">เวลาที่เลือก: {formatTime(deliveryTime)}</p>
          </div>

          {/* เวลารับอาหาร */}
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="food-pickup-time" className="font-medium mt-4 block">เวลารับอาหาร</label>
            <Flatpickr
              id="food-pickup-time"
              value={pickupTime || undefined}
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                minuteIncrement: 5,
                allowInput: true,
                closeOnSelect: false,
                disableMobile: true,
                position: "above"
              }}
              onChange={([time], _dateStr, instance) => {
                if (time instanceof Date && !isNaN(time.getTime())) {
                  setPickupTime(time);
                  setCustomerInfo({ receiveTime: formatTime(time) });
                  instance.close(); // ✅ ปิดอัตโนมัติเมื่อกรอกครบ
                }
              }}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-sm text-gray-500">เวลาที่เลือก: {formatTime(pickupTime)}</p>
          </div>
        </div>

        {/* รายการในตะกร้า */}
        <ul className="space-y-4 mb-4">
          {items.map((item) =>
            item.menu_id != null ? (
              <li key={item.menu_id} className="border rounded-2xl p-4 shadow-sm bg-white">
                {/* ส่วนหัว */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{item.menu_name}</div>
                    <div className="text-gray-500 text-sm">{item.menu_price} ฿</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(item.menu_id!)}
                      className="inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs hover:bg-gray-100"
                      type="button" title="ลบ 1"
                    >−</button>
                    <input
                      type="number" min={1} value={item.menu_total}
                      onChange={(e) => handleChangeQuantity(item.menu_id!, Number(e.target.value))}
                      className="w-16 text-center border rounded-full px-3 py-1 text-sm"
                    />
                    <button
                      onClick={() => addItem(item)}
                      className="inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs hover:bg-gray-100"
                      type="button" title="เพิ่ม 1"
                    >+</button>
                  </div>
                </div>

                {/* หมายเหตุ */}
                <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 ring-1 ring-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-800">หมายเหตุสำหรับเมนูนี้</span>
                    <span className="text-[11px] text-gray-500">
                      รวมหมายเหตุ: {sumNotesQty(item.notes)} / {item.menu_total}
                    </span>
                  </div>

                  {!showEditor[String(item.menu_id)] && (
                    <div className="mb-2">
                      <button
                        type="button"
                        className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100"
                        onClick={() => setShowEditor((s) => ({ ...s, [String(item.menu_id)]: true }))}
                      >
                        + เพิ่มหมายเหตุ
                      </button>
                    </div>
                  )}

                  {showEditor[String(item.menu_id)] && (
                    <div className="grid grid-cols-12 gap-2 items-end mb-2">
                      <div className="col-span-5">
                        <select
                          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          value={noteSelect[String(item.menu_id)] ?? ""}
                          onChange={(e) =>
                            setNoteSelect((s) => ({ ...s, [String(item.menu_id)]: e.target.value }))
                          }
                        >
                          <option value="">— เลือก —</option>
                          <option value="เผ็ดน้อย">เผ็ดน้อย</option>
                          <option value="เผ็ดมาก">เผ็ดมาก</option>
                          <option value="รสจัด">รสจัด</option>
                        </select>
                      </div>
                      <div className="col-span-6">
                        <input
                          type="text"
                          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          placeholder="หรือพิมพ์หมายเหตุ เช่น ไม่ใส่พริก / เพิ่มไข่ดาว"
                          value={noteText[String(item.menu_id)] ?? ""}
                          onChange={(e) =>
                            setNoteText((s) => ({ ...s, [String(item.menu_id)]: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-span-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.menu_id!, item.menu_total, item.notes)}
                          className="flex-1 rounded-xl px-3 py-2 text-sm font-medium text-white
                                     bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90"
                        >
                          ตกลง
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditor((s) => ({ ...s, [String(item.menu_id)]: false }))}
                          className="flex-1 rounded-xl px-3 py-2 text-sm border hover:bg-gray-100"
                          title="ยกเลิก"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}

                  {(item.notes ?? []).length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(item.notes ?? []).map((n) => {
                        const canIncrease = sumNotesQty(item.notes) + 1 <= item.menu_total;
                        return (
                          <div
                            key={n.id}
                            className="group inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2.5 py-1
                                       text-xs text-gray-800 hover:bg-gray-100"
                          >
                            <span className="truncate max-w-[140px]">{n.note}</span>
                            <span className="ml-1 inline-flex items-center rounded-full bg-white px-2 py-0.5 border text-[11px]">
                              x{n.qty ?? 0}
                            </span>
                            <button
                              type="button" title="ลดจำนวน"
                              className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs hover:bg-gray-100"
                              onClick={() =>
                                updateItemNote(item.menu_id!, n.id, { qty: Math.max(0, (n.qty || 0) - 1) })
                              }
                            >−</button>
                            <button
                              type="button" title="เพิ่มจำนวน" disabled={!canIncrease}
                              className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs ${
                                canIncrease ? "hover:bg-gray-100" : "opacity-40 cursor-not-allowed"
                              }`}
                              onClick={() =>
                                canIncrease && updateItemNote(item.menu_id!, n.id, { qty: (n.qty || 0) + 1 })
                              }
                            >+</button>
                            <button
                              type="button" title="ลบหมายเหตุ"
                              onClick={() => {
                                const key = String(item.menu_id);
                                const willLeft = (item.notes?.length ?? 0) - 1;
                                removeItemNote(item.menu_id!, n.id);
                                if (willLeft <= 0) setShowEditor((s) => ({ ...s, [key]: true }));
                              }}
                              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full
                                         bg-white border text-gray-500 hover:text-red-500"
                            >×</button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !showEditor[String(item.menu_id)] && (
                      <p className="mt-2 text-xs text-gray-500">ยังไม่มีหมายเหตุ กด “+ เพิ่มหมายเหตุ” เพื่อเพิ่ม</p>
                    )
                  )}
                </div>
              </li>
            ) : null
          )}

          {/* ปุ่มเพิ่มเมนู */}
          <li className="border rounded-2xl p-4 shadow-sm bg-white">
            <button
              onClick={() => router.push("/home/order/menu")}
              className="w-full text-center rounded-xl px-4 py-2 font-medium text-white
                         bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90"
              type="button"
            >
              ➕ เพิ่มเมนู
            </button>
          </li>
        </ul>

        {/* ปุ่มยืนยัน */}
        <button
          onClick={confirmOrder}
          disabled={loading}
          className={`w-full py-2 rounded-xl font-semibold text-white transition
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {loading ? "กำลังส่ง..." : "ยืนยันคำสั่งซื้อ"}
        </button>

        {errors.length > 0 && (
          <ul className="mt-4 text-red-600 space-y-1 list-disc list-inside text-sm">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm text-center space-y-4 shadow-xl">
            <h2 className="text-xl font-bold">สั่งซื้อสำเร็จ</h2>
            <p className="text-gray-600">คำสั่งซื้อของคุณถูกบันทึกเรียบร้อยแล้ว</p>
            <button
              onClick={handleDone}
              className="px-4 py-2 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
