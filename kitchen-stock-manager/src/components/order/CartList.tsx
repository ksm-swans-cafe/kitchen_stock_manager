"use client";

import React, { useEffect, useState } from "react";
import { registerLocale, DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Swal from "sweetalert2";
import { create } from "zustand";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/store";

import { useAuth } from "@/lib/auth/AuthProvider";

import { th } from "date-fns/locale/th";

import { LunchBox } from "@/stores/store";

import SetFoodSelect from "@/assets/set_food_select.png";
import Edit from "@/assets/edit.png";

registerLocale("th", th);

interface cartList {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  errors: string[];
  setErrors: (errors: string[]) => void;
  success: boolean;
  setSuccess: (success: boolean) => void;
  rawDate: string;
  setRawDate: (rawDate: string) => void;
  lunchbox: LunchBox[];
  setLunchbox: (lunchbox: LunchBox[]) => void;
  availableSets: string[];
  setAvailableSets: (availableSets: string[]) => void;
}

const useCartList = create<cartList>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
  errors: [],
  setErrors: (errors) => set({ errors }),
  success: false,
  setSuccess: (success) => set({ success }),
  rawDate: "",
  setRawDate: (rawDate) => set({ rawDate }),
  lunchbox: [],
  setLunchbox: (lunchbox) => set({ lunchbox }),
  availableSets: [],
  setAvailableSets: (availableSets) => set({ availableSets }),
}));

export default function CartList() {
  const {
    items,
    addItem,
    removeItem,
    clearCart,
    setItemQuantity,
    cart_customer_name,
    cart_channel_access,
    cart_customer_tel,
    cart_location_send,
    cart_delivery_date,
    cart_export_time,
    cart_receive_time,
    cart_shipping_cost,
    cart_receive_name,
    cart_invoice_tex,
    cart_pay_type,
    cart_pay_deposit,
    cart_pay_isdeposit,
    cart_pay_cost,
    cart_pay_charge,
    cart_total_remain,
    cart_total_cost,
    cart_lunch_box,
    selected_lunchboxes,
    setCustomerInfo,
    removeLunchbox,
    updateLunchboxQuantity,
    updateLunchboxTotalCost,
  } = useCartStore();

  const { loading, setLoading, errors, setErrors, success, setSuccess, rawDate, setRawDate, lunchbox, setLunchbox, availableSets, setAvailableSets } = useCartList();
  const { userName, userRole } = useAuth();
  const router = useRouter();
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [copyText, setCopyText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const handle = {
    LunchboxTotalCostChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (!numericValue) {
        updateLunchboxTotalCost(index, "");
        return;
      }
      const formattedValue = Number(numericValue).toLocaleString("th-TH");
      updateLunchboxTotalCost(index, formattedValue);
    },
    EditLunchbox: (index: number) => {
      const lunchboxToEdit = selected_lunchboxes[index];

      sessionStorage.setItem("editingLunchboxIndex", index.toString());
      sessionStorage.setItem("editingLunchboxData", JSON.stringify(lunchboxToEdit));

      router.push("/home/order/menu-picker?edit=true");
    },
    PhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, "");
      const digitsOnly = value;
      const len = digitsOnly.length;

      if (len === 0) value = "";
      else if (len === 9 && digitsOnly.startsWith("0")) {
        if (len <= 2) value = digitsOnly;
        else if (len <= 5) value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
        else value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 5)}-${digitsOnly.slice(5, 9)}`;
      } else if (len <= 8) {
        if (len > 4) value = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}`;
        else value = digitsOnly;
      } else {
        if (len <= 3) value = digitsOnly;
        else if (len <= 6) value = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
        else value = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
      setCustomerInfo({ tel: value });
    },
    ShippingCostChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (!numericValue) {
        setCustomerInfo({ cart_shipping_cost: "" });
        return;
      }
      const formattedValue = Number(numericValue).toLocaleString("th-TH");
      setCustomerInfo({ cart_shipping_cost: formattedValue });
    },
    TaxInvoiceNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^\d]/g, "");
      if (numericValue.length <= 13) {
        setCustomerInfo({ invoice_tex: numericValue });
      }
    },
    ChangeQuantity: (cartItemId: string, quantity: number) => {
      if (quantity >= 1) setItemQuantity(cartItemId, quantity);
    },
  };

  const validate = {
    BasicInfo: (): boolean => {
      return (
        cart_receive_name.trim() !== "" &&
        cart_channel_access.trim() !== "" &&
        cart_customer_tel.trim() !== "" &&
        cart_location_send.trim() !== "" &&
        cart_delivery_date.trim() !== "" &&
        cart_export_time.trim() !== "" &&
        cart_receive_time.trim() !== "" &&
        cart_shipping_cost.trim() !== "" &&
        cart_customer_name.trim() !== "" &&
        cart_invoice_tex.trim() !== "" &&
        cart_invoice_tex.length === 13
      );
    },
    Inputs: (): boolean => {
      const newErrors: string[] = [];

      if (!cart_customer_name.trim()) newErrors.push("กรุณากรอกชื่อลูกค้า");
      if (!cart_customer_tel.trim()) {
        newErrors.push("กรุณากรอกเบอร์โทรลูกค้า");
      } else {
        const phonePattern8 = /^\d{4}-\d{4}$/;
        const phonePattern9 = /^0\d-\d{3}-\d{4}$/;
        const phonePattern10 = /^\d{3}-\d{3}-\d{4}$/;
        if (!phonePattern8.test(cart_customer_tel) && !phonePattern9.test(cart_customer_tel) && !phonePattern10.test(cart_customer_tel)) {
          newErrors.push("เบอร์โทรต้องอยู่ในรูปแบบ 1234-5678, 02-123-4567 หรือ 081-234-5678");
        }
      }
      if (!cart_location_send.trim()) newErrors.push("กรุณากรอกสถานที่จัดส่ง");
      if (!cart_delivery_date.trim()) newErrors.push("กรุณาเลือกวันที่จัดส่ง");
      if (!cart_export_time.trim()) newErrors.push("กรุณาเลือกเวลาส่งอาหาร");
      if (!cart_receive_time.trim()) newErrors.push("กรุณาเลือกเวลารับอาหาร");

      if (!cart_invoice_tex.trim()) newErrors.push("กรุณากรอกเลขใบกำกับภาษี");
      else if (cart_invoice_tex.length !== 13) newErrors.push("เลขใบกำกับภาษีต้องเป็น 13 หลักเท่านั้น");

      if (selected_lunchboxes.length > 0) {
        if (!cart_pay_type.trim()) {
          newErrors.push("กรุณาเลือกรูปแบบการชำระเงิน");
        } else {
          if (!cart_pay_deposit || !cart_pay_deposit.trim()) {
            newErrors.push("กรุณาเลือกรูปแบบการมัดจำ");
          } else if (cart_pay_deposit !== "no") {
            if (!cart_pay_cost.trim()) {
              newErrors.push("กรุณาใส่จำนวนเงินมัดจำ");
            } else {
              const payCostNum = Number(cart_pay_cost.replace(/[^\d]/g, ""));
              if (payCostNum === 0) {
                newErrors.push("จำนวนเงินมัดจำต้องมากกว่า 0");
              }
            }
          }
        }
      }

      if (selected_lunchboxes.length === 0) newErrors.push("กรุณาเลือกโปรโมชั่นอาหารอย่างน้อย 1 อย่าง");

      setErrors(newErrors);
      return newErrors.length === 0;
    },
  };

  const confirmOrder = async () => {
    if (!validate.Inputs()) return;
    if (cart_export_time >= cart_receive_time) {
      Swal.fire({
        icon: "error",
        title: "เวลาไม่ถูกต้อง",
        text: "เวลาส่งอาหารต้องน้อยกว่าเวลารับอาหาร",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#e74c3c",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "info",
      title: "กรุณาตรวจสอบข้อมูลก่อนยืนยัน",
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: "ย้อนกลับ",
      confirmButtonText: "ยืนยัน",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      width: "500px",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setErrors([]);
    try {
      const response = await axios.post("/api/post/cart", {
        cart_username: userName,
        cart_channel_access,
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
          lunchbox_limit: lunchbox.lunchbox_limit,
          lunchbox_quantity: lunchbox.quantity,
          lunchbox_total_cost: lunchbox.lunchbox_total_cost.replace(/[^\d]/g, ""),
          lunchbox_menus: lunchbox.selected_menus.map((menu, menuIndex) => ({
            menu_name: menu.menu_name,
            menu_subname: menu.menu_subname,
            menu_category: menu.menu_category,
            menu_total: lunchbox.quantity,
            menu_cost: menu.lunchbox_cost || 0,
            menu_ingredients:
              menu.menu_ingredients?.map((ingredient) => ({
                ...ingredient,
                useItem: ingredient.useItem * lunchbox.quantity,
              })) || [],
            menu_description: menu.menu_description,
            menu_order_id: menuIndex + 1,
            menu_cost: (menu as any).menu_cost || menu.lunchbox_cost || 0, // ใช้ menu_cost หรือ lunchbox_cost เป็น fallback
          })),
        })),
        cart_receive_name: cart_receive_name,
        cart_invoice_tex: cart_invoice_tex,
        cart_pay_type: cart_pay_type,
        cart_pay_deposit: cart_pay_deposit,
        cart_pay_isdeposit: cart_pay_isdeposit,
        cart_total_cost_lunchbox: selected_lunchboxes
          .reduce((sum, lb) => {
            return sum + (Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0);
          }, 0)
          .toString(),
        cart_total_cost: cart_total_cost,
        cart_pay_cost: cart_pay_cost,
        cart_pay_charge: cart_pay_charge,
        cart_total_remain: cart_total_remain,
      });

      if (response.status !== 201) throw new Error("เกิดข้อผิดพลาดในการสั่งซื้อ");

      // setSuccess(true);

      const lunchboxList = selected_lunchboxes
        .map((lb, index) => {
          const lunchboxCost = Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0;
          const costPerBox = lunchboxCost / lb.quantity;
          const menuList = lb.selected_menus.map((menu, menuIndex) => `+ ${menu.menu_name}`).join("\n      ");

          return `${index + 1}.${lb.lunchbox_name} - ${lb.lunchbox_set}
      ${menuList}
      เซ็ตละ ${costPerBox.toLocaleString("th-TH")} บาท 
      จำนวน ${lb.quantity} กล่อง 
      รวม ${costPerBox.toLocaleString("th-TH")}x${lb.quantity} = ${lunchboxCost.toLocaleString("th-TH")} บาท`;
        })
        .join("\n\n      ");

      // คำนวณยอดรวม
      const totalLunchboxCost = selected_lunchboxes.reduce((sum, lb) => {
        return sum + (Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0);
      }, 0);

      const shippingCostNum = Number(cart_shipping_cost.replace(/[^\d]/g, "")) || 0;
      const chargeNum = Number(cart_pay_charge.replace(/[^\d]/g, "")) || 0;
      const totalCostNum = totalLunchboxCost + shippingCostNum + chargeNum;

      // คำนวณยอดมัดจำ
      let depositText = "";
      let depositValue = "";
      if (cart_pay_deposit === "percent") {
        const payCostNum = Number(cart_pay_cost.replace(/[^\d]/g, "")) || 0;
        const depositAmount = (totalCostNum * payCostNum) / 100;
        depositText = `${cart_pay_cost}%`;
        depositValue = `(${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท)`;
      } else if (cart_pay_deposit === "full") {
        const depositAmount = Number(cart_pay_cost.replace(/[^\d]/g, "")) / 100;
        depositText = `${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
        depositValue = `(${Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท)`;
      } else {
        depositText = "-";
      }

      // คำนวณยอดคงเหลือ
      const remainNum = Number(cart_total_remain.replace(/[^\d.]/g, "")) || 0;

      const copyTextContent = `
📌รับออเดอร์ คุณ ${cart_receive_name} 
ช่องทางที่สั่ง : ${cart_channel_access}
✅ รายละเอียดสำหรับจัดส่ง
1.วันที่รับสินค้า : ${cart_delivery_date}
2.เวลาส่งสินค้า : ${cart_export_time}
3.เวลารับสินค้า : ${cart_receive_time}
4.สถานที่จัดส่ง : ${cart_location_send}
5.ชื่อผู้รับสินค้า : ${cart_receive_name}
6.เบอร์โทร : ${cart_customer_tel}
7.ออกบิลในนาม : ${cart_customer_name}
8.ที่อยู่ : ${cart_location_send}
9.เลขประจำตัวผู้เสียภาษี : ${cart_invoice_tex}

✅รายการอาหาร ${selected_lunchboxes.reduce((sum, lb) => sum + lb.quantity, 0)} กล่อง 
      ${lunchboxList}

✅รวมค่าอาหาร ${totalLunchboxCost.toLocaleString("th-TH")} บาท
ค่าจัดส่ง ${cart_shipping_cost} บาท
${chargeNum > 0 ? `ค่าธรรมเนียม ${cart_pay_charge} บาท\n` : ""}
✅รวมทั้งหมด ${totalCostNum.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
มัดจำ ${depositText}
ชำระ ${depositValue} (ชำระเรียบร้อยเเล้ว)`;
      // คงเหลือ ${remainNum > 0 ? `${Number(remainNum.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : "-"}

      setCopyText(copyTextContent);
      setSuccess(true);
      navigator.clipboard.writeText(copyTextContent).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#e74c3c",
      });

      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const groupMenusByLimit = (menus: any[], limit: number) => {
    if (limit === 0 || !limit) return menus.length > 0 ? [menus] : [];

    const groups = [];
    for (let i = 0; i < menus.length; i += limit) groups.push(menus.slice(i, i + limit));
    return groups;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Fallback: เลือกข้อความใน textarea
      const textarea = document.getElementById("copy-textarea") as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // สำหรับ mobile
        try {
          document.execCommand("copy");
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (e) {
          console.error("Failed to copy:", e);
        }
      }
    }
  };

  const handleFinish = () => {
    setSuccess(false);
    setIsCopied(false);
    clearCart();

    // แสดง notification ที่มุมขวาบน
    toast.success("ดำเนินการเสร็จสิ้น", {
      duration: 3000, // แสดง 3 วินาที
    });

    // พาไปหน้า summaryList หลังจาก notification หายไป
    setTimeout(() => {
      router.push("/home/summarylist");
    }, 3000);
  };

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
    } else setRawDate("");
  }, [cart_delivery_date]);

  useEffect(() => {
    const fetchLunchbox = async () => {
      try {
        const response = await axios.get("/api/get/lunchbox");
        const data = response.data;
        setLunchbox(data);
      } catch (error) {
        console.error("Error fetching lunchbox data:", error);
      }
    };
    fetchLunchbox();
  }, []);

  useEffect(() => {
    if (cart_lunch_box && lunchbox.length > 0) {
      const sets = lunchbox.filter((item) => item.lunchbox_name === cart_lunch_box).map((item) => item.lunchbox_set);
      setAvailableSets([...new Set(sets)]);
    } else setAvailableSets([]);
  }, [cart_lunch_box, lunchbox]);

  useEffect(() => {
    const lunchboxTotal = selected_lunchboxes.reduce((sum, lb) => {
      const cost = Number(lb.lunchbox_total_cost.replace(/[^\d]/g, "")) || 0;
      return sum + cost;
    }, 0);

    const shippingCost = Number(cart_shipping_cost.replace(/[^\d]/g, "")) || 0;

    // คำนวณค่าธรรมเนียม
    let charge = 0;
    if (cart_pay_type === "card" && selected_lunchboxes.length > 0) {
      const totalForFee = lunchboxTotal + shippingCost;
      charge = totalForFee * 0.03;
    } else if (cart_pay_type === "cash" || cart_pay_type === "transfer") {
      charge = 0;
    }

    const totalCost = lunchboxTotal + shippingCost + charge;

    setCustomerInfo({
      total_cost: totalCost > 0 ? totalCost.toLocaleString("th-TH") : "",
      pay_charge: charge > 0 ? charge.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : cart_pay_type && selected_lunchboxes.length > 0 ? "0.00" : "",
    });
  }, [selected_lunchboxes, cart_shipping_cost, cart_pay_type]);

  useEffect(() => {
    if (cart_pay_deposit === "percent" && cart_pay_type) {
      const currentPayCost = cart_pay_cost.replace(/[^\d]/g, "");
      if (currentPayCost !== "50") {
        setCustomerInfo({ pay_cost: "50" });
      }
    } else if (cart_pay_deposit === "full" && cart_total_cost) {
      const totalCostStr = cart_total_cost.replace(/,/g, ""); // ลบ comma
      const totalCostNum = parseFloat(totalCostStr) || 0;
      const totalCostInSatang = Math.round(totalCostNum * 100); // แปลงเป็นสตางค์เพื่อเก็บใน pay_cost
      const currentPayCost = Number(cart_pay_cost.replace(/[^\d]/g, "")) || 0;

      if (currentPayCost !== totalCostInSatang && totalCostInSatang > 0) {
        setCustomerInfo({ pay_cost: totalCostInSatang.toString() });
      }
    }
  }, [cart_pay_deposit, cart_pay_type, cart_pay_cost, cart_total_cost]);

  useEffect(() => {
    const totalCostStr = cart_total_cost.replace(/,/g, "");
    const totalCostNum = parseFloat(totalCostStr) || 0;
    const totalCostInSatang = Math.round(totalCostNum * 100); // แปลงเป็นสตางค์

    const payCostNum = Number(cart_pay_cost.replace(/[^\d]/g, "")) || 0;

    if (!cart_pay_deposit || totalCostNum === 0) {
      setCustomerInfo({ total_remain: "" });
      return;
    }

    let depositAmount = 0;
    if (cart_pay_deposit === "full") depositAmount = payCostNum / 100; // แปลงจากสตางค์กลับเป็นบาท
    else if (cart_pay_deposit === "percent") depositAmount = (totalCostNum * payCostNum) / 100;

    const remaining = totalCostNum - depositAmount;
    const formattedRemaining = remaining >= 0 ? Number(remaining.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    setCustomerInfo({ total_remain: formattedRemaining });
  }, [cart_total_cost, cart_pay_deposit, cart_pay_cost]);

  useEffect(() => {
    if (errors.length > 0) {
      setIsErrorVisible(true);
      const timer = setTimeout(() => {
        setIsErrorVisible(false);
        setTimeout(() => {
          setErrors([]);
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsErrorVisible(false);
    }
  }, [errors]);

  return (
    <main className='min-h-screen text-black'>
      {/* Success Modal */}
      {success && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='flex w-full items-center justify-center p-4 border-b bg-green-50 rounded-t-lg'>
              <div className='flex items-center gap-2 text-xl font-bold text-green-700'>
                <svg className='!w-5 !h-5 text-green-600' viewBox='0 0 117 117' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
                  <g fill='none' fillRule='evenodd' id='Page-1' stroke='none' strokeWidth='1'>
                    <g fillRule='nonzero' id='correct'>
                      <path
                        d='M34.5,55.1 C32.9,53.5 30.3,53.5 28.7,55.1 C27.1,56.7 27.1,59.3 28.7,60.9 L47.6,79.8 C48.4,80.6 49.4,81 50.5,81 C50.6,81 50.6,81 50.7,81 C51.8,80.9 52.9,80.4 53.7,79.5 L101,22.8 C102.4,21.1 102.2,18.5 100.5,17 C98.8,15.6 96.2,15.8 94.7,17.5 L50.2,70.8 L34.5,55.1 Z'
                        fill='#17AB13'
                        id='Shape'
                      />

                      <path
                        d='M89.1,9.3 C66.1,-5.1 36.6,-1.7 17.4,17.5 C-5.2,40.1 -5.2,77 17.4,99.6 C28.7,110.9 43.6,116.6 58.4,116.6 C73.2,116.6 88.1,110.9 99.4,99.6 C118.7,80.3 122,50.7 107.5,27.7 C106.3,25.8 103.8,25.2 101.9,26.4 C100,27.6 99.4,30.1 100.6,32 C113.1,51.8 110.2,77.2 93.6,93.8 C74.2,113.2 42.5,113.2 23.1,93.8 C3.7,74.4 3.7,42.7 23.1,23.3 C39.7,6.8 65,3.9 84.8,16.2 C86.7,17.4 89.2,16.8 90.4,14.9 C91.6,13 91,10.5 89.1,9.3 Z'
                        fill='#4A4A4A'
                        id='Shape'
                      />
                    </g>
                  </g>
                </svg>
                <p>สั่งซื้อสำเร็จ!</p>
              </div>
            </div>

            {/* Content */}
            <div className='p-4 overflow-y-auto flex-1'>
              <p className='text-gray-700 mb-4'>กรุณาคัดลอกข้อความด้านล่างเพื่อส่งให้ลูกค้า:</p>

              {/* Textarea สำหรับแสดงข้อความ (fallback สำหรับการคัดลอก) */}
              <textarea
                id='copy-textarea'
                value={copyText}
                readOnly
                className='w-full p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500'
                rows={15}
                onClick={(e) => {
                  (e.target as HTMLTextAreaElement).select();
                }}
              />

              {/* ปุ่มคัดลอก */}
              <div className='mt-4 flex justify-end gap-2'>
                <button onClick={handleCopyText} className={`w-auto px-4 py-2 rounded-lg font-semibold transition-all ${isCopied ? "!bg-green-600 !text-white" : "!bg-gray-500 !text-white hover:!bg-gray-600"}`}>
                  {isCopied ? (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                      คัดลอกสำเร็จแล้ว!
                    </span>
                  ) : (
                    <span className='flex items-center justify-end gap-2'>
                      <svg className='!w-5 !h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                      คัดลอกข้อความ
                    </span>
                  )}
                </button>
              </div>

              <p className='text-xs text-gray-500 mt-2 text-center'>💡 หากปุ่มคัดลอกไม่ทำงาน กรุณาเลือกข้อความในช่องด้านบนแล้วกด Ctrl+C (หรือ Cmd+C บน Mac)</p>
            </div>

            {/* Footer */}
            <div className='p-4 border-t bg-gray-50 rounded-b-lg'>
              <div className='w-full flex justify-center items-center'>
                <button onClick={handleFinish} className='w-auto px-4 py-3 !bg-green-600 !text-white rounded-lg font-semibold hover:!bg-green-700 transition-colors'>
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Toast - Top Right */}
      {errors.length > 0 && (
        <div className={`fixed top-4 right-4 z-50 flex w-3/4 h-24 overflow-hidden bg-white shadow-lg max-w-96 rounded-xl transition-all duration-300 ease-in-out ${isErrorVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}>
          <svg xmlns='http://www.w3.org/2000/svg' height='96' width='16'>
            <path
              strokeLinecap='round'
              strokeWidth='2'
              stroke='indianred'
              fill='indianred'
              d='M 8 0 
                   Q 4 4.8, 8 9.6 
                   T 8 19.2 
                   Q 4 24, 8 28.8 
                   T 8 38.4 
                   Q 4 43.2, 8 48 
                   T 8 57.6 
                   Q 4 62.4, 8 67.2 
                   T 8 76.8 
                   Q 4 81.6, 8 86.4 
                   T 8 96 
                   L 0 96 
                   L 0 0 
                   Z'
            />
          </svg>
          <div className='mx-2.5 overflow-hidden w-full'>
            <p className='mt-1.5 text-xl font-bold text-[indianred] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap'>เกิดข้อผิดพลาดการยืนยันคำสั่งซื้อ</p>
            <div className='overflow-hidden leading-5 break-all text-zinc-400 max-h-10'>
              {errors.map((err: string, i: number) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className='p-4 max-w-md mx-auto'>
        <h1 className='text-2xl !font-bold mb-4 flex items-center gap-2'>
          <svg
            version='1.1'
            id='Layer_1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            x='0px'
            y='0px'
            viewBox='0 0 115.35 122.88'
            // style={{ enableBackground: 'new 0 0 115.35 122.88' }}
            xmlSpace='preserve'
            className='inline !w-6 !h-6'>
            <g>
              <path d='M25.27,86.92c-1.81,0-3.26-1.46-3.26-3.26s1.47-3.26,3.26-3.26h21.49c1.81,0,3.26,1.46,3.26,3.26s-1.46,3.26-3.26,3.26 H25.27L25.27,86.92L25.27,86.92z M61.1,77.47c-0.96,0-1.78-0.82-1.78-1.82c0-0.96,0.82-1.78,1.78-1.78h4.65c0.04,0,0.14,0,0.18,0 c1.64,0.04,3.1,0.36,4.33,1.14c1.37,0.87,2.37,2.19,2.92,4.15c0,0.04,0,0.09,0.05,0.14l0.46,1.82h39.89c1,0,1.78,0.82,1.78,1.78 c0,0.18-0.05,0.36-0.09,0.55l-4.65,18.74c-0.18,0.82-0.91,1.37-1.73,1.37l0,0l-29.18,0c0.64,2.37,1.28,3.65,2.14,4.24 c1.05,0.68,2.87,0.73,5.93,0.68h0.04l0,0h20.61c1,0,1.78,0.82,1.78,1.78c0,1-0.82,1.78-1.78,1.78H87.81l0,0 c-3.79,0.04-6.11-0.05-7.98-1.28c-1.92-1.28-2.92-3.46-3.92-7.43l0,0L69.8,80.2c0-0.05,0-0.05-0.04-0.09 c-0.27-1-0.73-1.69-1.37-2.05c-0.64-0.41-1.5-0.59-2.51-0.59c-0.05,0-0.09,0-0.14,0H61.1L61.1,77.47L61.1,77.47z M103.09,114.13 c2.42,0,4.38,1.96,4.38,4.38s-1.96,4.38-4.38,4.38s-4.38-1.96-4.38-4.38S100.67,114.13,103.09,114.13L103.09,114.13L103.09,114.13z M83.89,114.13c2.42,0,4.38,1.96,4.38,4.38s-1.96,4.38-4.38,4.38c-2.42,0-4.38-1.96-4.38-4.38S81.48,114.13,83.89,114.13 L83.89,114.13L83.89,114.13z M25.27,33.58c-1.81,0-3.26-1.47-3.26-3.26c0-1.8,1.47-3.26,3.26-3.26h50.52 c1.81,0,3.26,1.46,3.26,3.26c0,1.8-1.46,3.26-3.26,3.26H25.27L25.27,33.58L25.27,33.58z M7.57,0h85.63c2.09,0,3.99,0.85,5.35,2.21 s2.21,3.26,2.21,5.35v59.98h-6.5V7.59c0-0.29-0.12-0.56-0.31-0.76c-0.2-0.19-0.47-0.31-0.76-0.31l0,0H7.57 c-0.29,0-0.56,0.12-0.76,0.31S6.51,7.3,6.51,7.59v98.67c0,0.29,0.12,0.56,0.31,0.76s0.46,0.31,0.76,0.31h55.05 c0.61,2.39,1.3,4.48,2.23,6.47H7.57c-2.09,0-3.99-0.85-5.35-2.21C0.85,110.24,0,108.34,0,106.25V7.57c0-2.09,0.85-4,2.21-5.36 S5.48,0,7.57,0L7.57,0L7.57,0z M25.27,60.25c-1.81,0-3.26-1.46-3.26-3.26s1.47-3.26,3.26-3.26h50.52c1.81,0,3.26,1.46,3.26,3.26 s-1.46,3.26-3.26,3.26H25.27L25.27,60.25L25.27,60.25z' />
            </g>
          </svg>
          รายการในตะกร้า
        </h1>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='col-span-2 flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <label className='font-bold'>ช่องทาง</label>
            </div>
            <div className='grid grid-cols-2 items-center gap-2'>
              <div>
                <input type='radio' id='facebook' name='channel' value='facebook' checked={cart_channel_access === "facebook"} onChange={(e) => setCustomerInfo({ channel_access: e.target.value })} />
                <label htmlFor='facebook'>Facebook</label>
              </div>
              <div>
                <input type='radio' id='line' name='channel' value='line' checked={cart_channel_access === "line"} onChange={(e) => setCustomerInfo({ channel_access: e.target.value })} />
                <label htmlFor='line'>Line</label>
              </div>
              <div>
                <input type='radio' id='instagram' name='channel' value='instagram' checked={cart_channel_access === "instagram"} onChange={(e) => setCustomerInfo({ channel_access: e.target.value })} />
                <label htmlFor='instagram'>Instagram</label>
              </div>
              <div>
                <input type='radio' id='other' name='channel' value='other' checked={cart_channel_access === "other"} onChange={(e) => setCustomerInfo({ channel_access: e.target.value })} />
                <label htmlFor='other'>Other</label>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <label className='font-bold'>ชื่อลูกค้า</label>
            <input type='text' value={cart_receive_name} onChange={(e) => setCustomerInfo({ receive_name: e.target.value })} placeholder='ชื่อลูกค้า' className='border rounded px-3 py-2' />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='font-bold'>เบอร์โทรลูกค้า</label>
            <input type='text' value={cart_customer_tel} onChange={handle.PhoneChange} placeholder='081-234-5678' className='border rounded px-3 py-2' />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold'>สถานที่จัดส่ง</label>
            <input type='text' value={cart_location_send} onChange={(e) => setCustomerInfo({ location: e.target.value })} placeholder='สถานที่จัดส่ง' className='w-full border rounded px-3 py-2' />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold'>วันที่จัดส่ง</label>
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

          <div className='flex flex-col gap-1'>
            <label htmlFor='food-delivery-time' className='font-bold'>
              เวลาส่งอาหาร
            </label>
            <div className='flex items-center gap-2'>
              <input
                id='food-delivery-time'
                type='text'
                value={cart_export_time}
                onChange={(e) => {
                  let raw = e.target.value.replace(/[^0-9:]/g, "");
                  let digits = raw.replace(/:/g, "");

                  if (digits.length === 0) {
                    setCustomerInfo({ exportTime: "" });
                    return;
                  }

                  if (digits.length <= 2) {
                    setCustomerInfo({ exportTime: digits });
                    return;
                  }

                  let hours = parseInt(digits.slice(0, 2), 10);
                  if (hours > 23) hours = 23;
                  let minutes = digits.slice(2, 4);
                  if (minutes.length === 2) {
                    let mins = parseInt(minutes, 10);
                    if (mins > 59) minutes = "59";
                  }

                  let value = hours.toString().padStart(2, "0") + ":" + minutes;
                  setCustomerInfo({ exportTime: value });
                }}
                onBlur={(e) => {
                  let value = e.target.value;
                  if (!value) return;

                  let digits = value.replace(/[^0-9]/g, "");
                  if (digits.length === 0) return;

                  let hours = digits.slice(0, 2).padStart(2, "0");
                  let mins = digits.slice(2, 4).padEnd(2, "0");

                  let h = parseInt(hours, 10);
                  let m = parseInt(mins, 10);
                  if (h > 23) h = 23;
                  if (m > 59) m = 59;

                  setCustomerInfo({ exportTime: h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0") });
                }}
                maxLength={5}
                className='w-full border border-gray-300 rounded px-3 py-2 font-mono'
                placeholder='__:__'
              />
              <span className='text-gray-600'>น.</span>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='food-pickup-time' className='font-bold'>
              เวลารับอาหาร
            </label>
            <div className='flex items-center gap-2'>
              <input
                id='food-pickup-time'
                type='text'
                value={cart_receive_time}
                onChange={(e) => {
                  let raw = e.target.value.replace(/[^0-9:]/g, "");
                  let digits = raw.replace(/:/g, "");

                  if (digits.length === 0) {
                    setCustomerInfo({ receiveTime: "" });
                    return;
                  }

                  if (digits.length <= 2) {
                    setCustomerInfo({ receiveTime: digits });
                    return;
                  }

                  let hours = parseInt(digits.slice(0, 2), 10);
                  if (hours > 23) hours = 23;
                  let minutes = digits.slice(2, 4);
                  if (minutes.length === 2) {
                    let mins = parseInt(minutes, 10);
                    if (mins > 59) minutes = "59";
                  }

                  let value = hours.toString().padStart(2, "0") + ":" + minutes;
                  setCustomerInfo({ receiveTime: value });
                }}
                onBlur={(e) => {
                  let value = e.target.value;
                  if (!value) return;

                  let digits = value.replace(/[^0-9]/g, "");
                  if (digits.length === 0) return;

                  let hours = digits.slice(0, 2).padStart(2, "0");
                  let mins = digits.slice(2, 4).padEnd(2, "0");
                  let h = parseInt(hours, 10);
                  let m = parseInt(mins, 10);
                  if (h > 23) h = 23;
                  if (m > 59) m = 59;

                  setCustomerInfo({ receiveTime: h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0") });
                }}
                maxLength={5}
                className='w-full border border-gray-300 rounded px-3 py-2 font-mono'
                placeholder='__:__'
              />
              <span className='text-gray-600'>น.</span>
            </div>
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold'>ค่าจัดส่ง</label>
            <input type='text' value={cart_shipping_cost} onChange={handle.ShippingCostChange} placeholder='ใส่ค่าจัดส่ง' className='border rounded px-3 py-2' />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold' htmlFor=''>
              ออกบิลในนาม
            </label>
            <textarea
              value={cart_customer_name}
              onChange={(e) => setCustomerInfo({ name: e.target.value })}
              className='border rounded px-3 py-2 min-h-[80px] resize-none overflow-hidden'
              placeholder='ออกบิลในนาม'
              rows={3}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.max(80, target.scrollHeight) + "px";
              }}
            />
          </div>

          <div className='col-span-2 flex flex-col gap-1'>
            <label className='font-bold' htmlFor=''>
              เลขใบกำกับภาษี
            </label>
            <input className='border rounded px-3 py-2' type='text' inputMode='numeric' pattern='[0-9]*' value={cart_invoice_tex} onChange={handle.TaxInvoiceNumberChange} placeholder='เลขใบกำกับภาษี ( 13 หลัก)' maxLength={13} />
          </div>
        </div>

        {/* Regular Menu Items */}
        <ul className='space-y-4 mb-4'>
          {items.map((item) =>
            item.cart_item_id ? (
              <li key={item.cart_item_id} className='border p-4 rounded flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='font-medium'>{item.menu_name}</div>
                  {item.menu_description && <div className='text-sm text-gray-600 mt-1 italic'>หมายเหตุ: {item.menu_description}</div>}
                </div>
                <div className='flex items-center space-x-2'>
                  <button onClick={() => removeItem(item.cart_item_id!)} className='px-3 py-1 bg-red-500 text-white rounded'>
                    −
                  </button>
                  <input type='number' value={item.menu_total} onChange={(e) => handle.ChangeQuantity(item.cart_item_id!, Number(e.target.value))} className='w-16 text-center border rounded' />
                  <button onClick={() => addItem(item, item.menu_description || "")} className='px-3 py-1 bg-green-500 text-white rounded'>
                    +
                  </button>
                </div>
              </li>
            ) : null
          )}
        </ul>

        {/* Selected Lunchboxes */}
        {selected_lunchboxes.length > 0 && (
          <div className='space-y-3 mb-4'>
            <div className='flex items-end'>
              <img className='w-8 h-8' src={SetFoodSelect.src} alt='' />
              <h3 className='ml-2 !font-bold'>ชุดอาหารที่เลือก</h3>
            </div>
            {selected_lunchboxes
              .slice()
              .reverse()
              .map((lunchbox, reversedIndex) => {
                const actualIndex = selected_lunchboxes.length - 1 - reversedIndex;
                const menuGroups = groupMenusByLimit(lunchbox.selected_menus, lunchbox.lunchbox_limit);

                return (
                  <div key={actualIndex} className='border p-4 rounded bg-gray-50'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h4 className='font-medium'>
                          {lunchbox.lunchbox_name} - {lunchbox.lunchbox_set}
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          Swal.fire({
                            icon: "question",
                            title: "ยืนยันการลบ",
                            text: `คุณต้องการลบชุดอาหาร "${lunchbox.lunchbox_name} - ${lunchbox.lunchbox_set}" หรือไม่?`,
                            showCancelButton: true,
                            reverseButtons: true,
                            confirmButtonText: "ลบ",
                            cancelButtonText: "ยกเลิก",
                            confirmButtonColor: "#e74c3c",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              removeLunchbox(actualIndex);
                              Swal.fire({
                                icon: "success",
                                title: "ลบสำเร็จ",
                                text: "ชุดอาหารถูกลบเรียบร้อยแล้ว",
                                timer: 1500,
                                showConfirmButton: false,
                              });
                            }
                          });
                        }}
                        className='px-2 py-1 w-auto !bg-red-500 !text-white rounded text-sm hover:!font-semibold hover:!bg-red-700'>
                        ลบ
                      </button>
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <label className='text-sm'>จำนวน:</label>
                      <input type='number' value={lunchbox.quantity} onChange={(e) => updateLunchboxQuantity(actualIndex, Number(e.target.value))} min='1' className='w-20 border rounded px-2 py-1 text-center' />
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <label className='text-sm'>ราคารวม:</label>
                      <input disabled={true} type='text' value={lunchbox.lunchbox_total_cost} onChange={(e) => handle.LunchboxTotalCostChange(actualIndex, e)} placeholder='ใส่ราคารวม' className='w-32 border rounded px-2 py-1 text-center' />
                      <span className='text-sm text-gray-500'>บาท</span>
                    </div>

                    <div className='mb-2'>
                      <p className='text-sm font-medium'>เมนูที่เลือก:</p>
                      {menuGroups.length > 0 ? (
                        menuGroups.map((group, groupIndex) => (
                          <div key={groupIndex} className='mb-2'>
                            <p className='text-xs text-gray-600'>ชุดที่ {groupIndex + 1}:</p>
                            <div className='flex flex-col gap-1 mt-1 items-start'>
                              {group.map((menu, menuIndex) => (
                                <span key={menuIndex} className='inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                                  {menuIndex + 1}. {menu.menu_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className='text-sm text-gray-500'>ยังไม่ได้เลือกเมนู</p>
                      )}
                    </div>

                    {/* แสดง Note ถ้ามี */}
                    {lunchbox.note && (
                      <div className='mb-2'>
                        <p className='text-sm font-medium text-green-600'>📝 หมายเหตุ:</p>
                        <p className='text-sm text-gray-700 bg-green-50 p-2 rounded border-l-4 border-green-200'>{lunchbox.note}</p>
                      </div>
                    )}

                    <button onClick={() => handle.EditLunchbox(actualIndex)} className='w-auto mx-auto flex !items-center !justify-center gap-2 px-3 py-2 rounded hover:!bg-gray-300 hover:!font-semibold text-sm'>
                      <img className='w-7 h-7' src={Edit.src} alt='' /> แก้ไขทั้งหมด
                    </button>
                  </div>
                );
              })}
          </div>
        )}

        <div className='border p-4 rounded mb-4'>
          <button
            onClick={() => {
              if (validate.BasicInfo()) {
                router.push("/home/order/menu-picker");
              } else {
                const missingFields = [];
                if (!cart_channel_access.trim()) missingFields.push("• ช่องทาง");
                if (!cart_receive_name.trim()) missingFields.push("• ชื่อลูกค้า");
                if (!cart_customer_tel.trim()) missingFields.push("• เบอร์โทรลูกค้า");
                if (!cart_location_send.trim()) missingFields.push("• สถานที่จัดส่ง");
                if (!cart_delivery_date.trim()) missingFields.push("• วันที่จัดส่ง");
                if (!cart_export_time.trim()) missingFields.push("• เวลาส่งอาหาร");
                if (!cart_receive_time.trim()) missingFields.push("• เวลารับอาหาร");
                if (!cart_shipping_cost.trim()) missingFields.push("• ค่าจัดส่ง");
                if (!cart_customer_name.trim()) missingFields.push("• ออกบิลในนาม");
                if (!cart_invoice_tex.trim()) missingFields.push("• เลขใบกำกับภาษี");
                else if (cart_invoice_tex.length !== 13) missingFields.push("• เลขใบกำกับภาษี (ต้องเป็น 13 หลัก)");

                Swal.fire({
                  icon: "warning",
                  title: "ข้อมูลไม่ครบถ้วน",
                  html: `<div style="text-align: left;">กรุณากรอกข้อมูลให้ครบถ้วนก่อน:<br><br>${missingFields.join("<br>")}</div>`,
                  confirmButtonText: "ตกลง",
                  confirmButtonColor: "#f39c12",
                });
              }
            }}
            disabled={!validate.BasicInfo()}
            className={`w-full text-center px-4 py-2 text-white rounded transition-all duration-300 ${validate.BasicInfo() ? "bg-green-500 hover:bg-green-600 hover:scale-110 hover:font-semibold cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-60"}`}>
            <svg viewBox='0 0 1024 1024' className='icon relative -top-0.5 !w-10 !h-10' version='1.1' xmlns='http://www.w3.org/2000/svg'>
              <path d='M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z' fill={validate.BasicInfo() ? "#4CAF50" : "#9CA3AF"} />
              <path d='M448 298.666667h128v426.666666h-128z' fill='#FFFFFF' />
              <path d='M298.666667 448h426.666666v128H298.666667z' fill='#FFFFFF' />
            </svg>
            เพิ่มชุดอาหาร
          </button>

          {/* แสดงรายการข้อมูลที่ยังไม่ได้กรอก */}
          {!validate.BasicInfo() && (
            <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded'>
              <p className='text-sm font-medium text-yellow-800 mb-2'>📋 กรุณากรอกข้อมูลให้ครบถ้วน:</p>
              <ul className='text-xs text-yellow-700 space-y-1'>
                {!cart_channel_access.trim() && <li>• ช่องทาง</li>}
                {!cart_receive_name.trim() && <li>• ชื่อลูกค้า</li>}
                {!cart_customer_tel.trim() && <li>• เบอร์โทรลูกค้า</li>}
                {!cart_location_send.trim() && <li>• สถานที่จัดส่ง</li>}
                {!cart_delivery_date.trim() && <li>• วันที่จัดส่ง</li>}
                {!cart_export_time.trim() && <li>• เวลาส่งอาหาร</li>}
                {!cart_receive_time.trim() && <li>• เวลารับอาหาร</li>}
                {!cart_shipping_cost.trim() && <li>• ค่าจัดส่ง</li>}
                {!cart_customer_name.trim() && <li>• ออกบิลในนาม</li>}
                {!cart_invoice_tex.trim() && <li>• เลขใบกำกับภาษี</li>}
                {cart_invoice_tex.trim() && cart_invoice_tex.length !== 13 && <li>• เลขใบกำกับภาษี (ต้องเป็น 13 หลัก)</li>}
              </ul>
            </div>
          )}
        </div>

        {/* แสดงส่วนการชำระเงินเมื่อมีชุดอาหารที่เลือกเท่านั้น */}
        {selected_lunchboxes.length > 0 && (
          <>
            <div className='flex items-center gap-2 mb-4'>
              <label className='font-bold'>รูปแบบการชำระเงิน</label>
              <select value={cart_pay_type} onChange={(e) => setCustomerInfo({ pay_type: e.target.value })} className='w-auto border rounded px-3 py-2'>
                <option value=''>เลือกรูปแบบการชำระเงิน</option>
                <option value='cash'>ชำระด้วยเงินสด</option>
                <option value='transfer'>ชำระด้วยโอนเงิน</option>
                <option value='card'>ชำระด้วยบัตรเครดิต</option>
              </select>
            </div>

            {/* Show deposit section only when payment method is selected */}
            {cart_pay_type && (
              <>
                <div className='flex items-center gap-2 mb-4'>
                  <div className='flex'>
                    <label className='font-bold'>รูปแบบการมัดจำ</label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input type='radio' id='deposit-full' name='deposit' value='full' checked={cart_pay_deposit === "full" && cart_pay_isdeposit === true} onChange={(e) => setCustomerInfo({ pay_deposit: e.target.value, pay_isdeposit: true })} />
                    <label htmlFor='deposit-full'>จำนวนเต็ม</label>

                    <input type='radio' id='deposit-percent' name='deposit' value='percent' checked={cart_pay_deposit === "percent" && cart_pay_isdeposit === true} onChange={(e) => setCustomerInfo({ pay_deposit: e.target.value, pay_isdeposit: true })} />
                    {/* <label htmlFor='deposit-percent'>`${cart_pay_type === "card" ? "50" : ""}%`</label> */}
                    <label htmlFor='deposit-percent'>50%</label>
                  </div>
                </div>
              </>
            )}

            <div className='border rounded p-4 mb-4 bg-gray-50'>
              <div className='flex justify-between items-center py-2 border-b'>
                <label className='font-bold'>ค่าอาหาร </label>
                <span className='text-lg'>{Array.isArray(selected_lunchboxes) && selected_lunchboxes.length > 0 ? `${selected_lunchboxes.reduce((sum, lb) => sum + (Number(lb.lunchbox_total_cost?.replace(/[^\d]/g, "")) || 0), 0).toLocaleString("th-TH")} บาท` : "-"}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <label className='font-bold'>ค่าส่ง </label>
                <span className='text-lg'>{cart_shipping_cost ? `${cart_shipping_cost} บาท` : "-"}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <label className='font-bold'>ค่าธรรมเนียม </label>
                <span className='text-lg'>{cart_pay_charge ? `${cart_pay_charge} บาท` : "-"}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <label className='font-bold'>ยอดทั้งหมด </label>
                <span className='text-lg'>{cart_total_cost ? `${cart_total_cost} บาท` : "-"}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b'>
                <label className='font-bold'>ค่ามัดจำ</label>
                <span className='text-lg text-orange-600'>
                  {cart_pay_deposit && cart_pay_cost
                    ? cart_pay_deposit === "percent"
                      ? `${cart_pay_cost}% (${(() => {
                          const totalCostStr = cart_total_cost.replace(/,/g, "");
                          const totalCostNum = parseFloat(totalCostStr) || 0;
                          const payCostNum = Number(cart_pay_cost.replace(/[^\d]/g, "")) || 0;
                          const depositAmount = (totalCostNum * payCostNum) / 100;
                          return Number(depositAmount.toFixed(2)).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()} บาท)`
                      : `${(Number(cart_pay_cost.replace(/[^\d]/g, "") || 0) / 100).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`
                    : "-"}
                </span>
              </div>
              <div className='flex justify-between items-center py-2'>
                <label className='font-bold text-green-700'>คงเหลือ</label>
                <span className='text-xl font-bold text-green-700'>{cart_total_remain ? `${Number(cart_total_remain).toFixed(2)} บาท` : "-"}</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={confirmOrder}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a0aec0" : errors.length === 0 ? "#38a169" : "#e53e3e",
            cursor: loading ? "not-allowed" : "pointer",
            color: "white",
          }}
          className={`w-full py-2 rounded font-bold transition ${loading ? "" : errors.length === 0 ? "hover:!bg-green-400" : "hover:bg-red-400"}`}>
          {loading ? "กำลังส่ง..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </div>
    </main>
  );
}
