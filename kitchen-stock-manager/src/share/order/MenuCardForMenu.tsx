"use client";
import { MenuItem, ingredient } from "@/models/menu_card/MenuCard-model";
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

type Mode = "menu" | "ingredient";

interface MenuCardProps {
  mode: Mode;
  item: MenuItem | ingredient;
  onImageClick?: () => void;
}

interface MenuListItem {
  menu_id: string;
  menu_name: string;
  menu_subname: string;
}

export default function MenuCard({ mode, item }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);

  const [showPopup, setShowPopup] = useState(false);
  const [filteredMenuList, setFilteredMenuList] = useState<MenuListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  let title: string | undefined;

  if (mode === "menu") {
    const menuItem = item as MenuItem;
    title = menuItem.menu_subname;
  }

  // โหลดข้อมูลรายการเมนูที่ตรงกับ title เมื่อเปิด popup
  useEffect(() => {
    if (showPopup && title) {
      setLoading(true);
      fetch("/api/get/menu-list")
        .then((res) => res.json())
        .then((data: MenuListItem[]) => {
          const filtered = data.filter((menu) => menu.menu_subname === title);
          setFilteredMenuList(filtered);

          // ตั้งค่า quantity เริ่มต้นเป็น 1 สำหรับแต่ละเมนู
          const initialQuantities: { [key: string]: number } = {};
          filtered.forEach((menu) => {
            initialQuantities[menu.menu_id] = 1;
          });
          setQuantities(initialQuantities);

          setLoading(false);
        })
        .catch(() => {
          setFilteredMenuList([]);
          setQuantities({});
          setLoading(false);
        });
    }
  }, [showPopup, title]);

  const handleAddClick = () => {
    setShowPopup(true);
  };

  const handleConfirm = () => {
    // เซ็ตจำนวนสินค้าใน store ตาม quantities ของแต่ละเมนู
    filteredMenuList.forEach((menu) => {
      const qty = quantities[menu.menu_id] ?? 1;
      if (qty > 0) {
        setItemQuantity(menu.menu_id, qty);
      }
    });
    setShowPopup(false);
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  // ปรับจำนวนเพิ่ม-ลด-เปลี่ยนค่าจำนวนของแต่ละเมนู
  const handleIncrease = (menu_id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [menu_id]: (prev[menu_id] || 1) + 1,
    }));
  };

  const handleDecrease = (menu_id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [menu_id]: prev[menu_id] > 1 ? prev[menu_id] - 1 : 1,
    }));
  };

  const handleChangeQuantity = (menu_id: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [menu_id]: value < 1 ? 1 : value,
    }));
  };

  return (
    <div className="w-full max-w-sm bg-white shadow-md flex flex-col overflow-hidden rounded-lg">
      <div className="flex flex-col h-full">
        {mode === "menu" && (
          <div className="p-4 text-lg font-bold border-b bg-black text-white text-center">
            {title}
          </div>
        )}
        {mode === "menu" && (
          <div className="mt-auto p-4 bg-gray-100 text-center">
            <button
              style={{ backgroundColor: "#16a34a", color: "#FFFF" }}
              onClick={handleAddClick}
              className="w-full text-xl px-4 py-3 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition"
            >
              เพิ่มรายการ
            </button>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[70vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>

            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : filteredMenuList.length === 0 ? (
              <p className="text-center text-gray-500">ไม่มีรายการที่ตรงกัน</p>
            ) : (
              <ul className="mb-4 max-h-48 overflow-y-auto">
                {filteredMenuList.map((menu) => (
                  <li
                    key={menu.menu_id}
                    className="border-b py-2 flex items-center justify-between"
                  >
                    <span>{menu.menu_name}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(menu.menu_id)}
                        className="px-2 py-1 rounded bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <input
                        type="number"
                        value={quantities[menu.menu_id] ?? 1}
                        onChange={(e) =>
                          handleChangeQuantity(
                            menu.menu_id,
                            Number(e.target.value)
                          )
                        }
                        className="w-16 text-center border rounded px-2 py-1"
                        min={1}
                      />
                      <button
                        onClick={() => handleIncrease(menu.menu_id)}
                        className="px-2 py-1 rounded bg-gray-300 text-gray-700 font-bold hover:bg-gray-400 transition"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={handleCancel}
                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                className="px-6 py-2 rounded font-bold hover:bg-red-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                className="px-6 py-2 rounded font-bold hover:bg-green-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
