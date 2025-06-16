'use client';
import { useState, useEffect } from "react";
import { MenuItem, ingredient } from "@/models/menu_card/MenuCard-model";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/share/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";

type Mode = "menu" | "ingredient";

interface MenuCardProps {
  mode: Mode;
  item: MenuItem | ingredient;
}

export default function MenuCard({
  mode,
  item,
}: MenuCardProps) {
  let title: string | undefined;
  let imageUrl: string | undefined;
  let description: string | undefined;
  let total: string | number | undefined;
  let unit: string | undefined;
  let lastUpdate: string | undefined;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState<ingredient>({
    ingredient_name: "",
    ingredient_image: "",
    ingredient_total: 0,
    ingredient_unit: "",
    ingredient_total_alert: 0,
    ingredient_lastupdate: "",
  });

  const ingredientItem = mode === "ingredient" ? (item as ingredient) : undefined;

  // Map ค่าหน่วยจากฐานข้อมูลเป็น display value
  const unitDisplayMap: { [key: string]: string } = {
    "กิโลกรัม": "kg",
    "กก.": "kg",
    "กรัม": "กรัม",
    "ฟอง": "ฟอง",
    "ลิตร": "ลิตร",
    "มิลลิลิตร": "มล.",
    "มล.": "มล.",
    "ชิ้น": "ชิ้น",
  };

  // Map ค่าหน่วยจาก display value ไปยังค่าที่แสดงใน UI
  const unitLabelMap: { [key: string]: string } = {
    "kg": "กิโลกรัม",
    "กรัม": "กรัม",
    "ฟอง": "ฟอง",
    "ลิตร": "ลิตร",
    "มล.": "มิลลิลิตร",
    "ชิ้น": "ชิ้น",
  };

  // ตั้งค่าเริ่มต้นจาก prop item เมื่อเป็น ingredient
  useEffect(() => {
    if (mode === "ingredient") {
      const ingredientItem = item as ingredient;
      console.log("Setting initial ingredient from item:", ingredientItem);
      setNewIngredient({
        ingredient_name: ingredientItem.ingredient_name || "",
        ingredient_image: ingredientItem.ingredient_image || "",
        ingredient_total: ingredientItem.ingredient_total || 0,
        ingredient_unit: unitDisplayMap[ingredientItem.ingredient_unit ?? ""] || ingredientItem.ingredient_unit || "",
        ingredient_total_alert: ingredientItem.ingredient_total_alert || 0,
        ingredient_lastupdate: ingredientItem.ingredient_lastupdate || "",
      });
      if (!ingredientItem.ingredient_id) {
        console.error("No ingredient_id in item:", ingredientItem);
        setError("ไม่พบ ID ของวัตถุดิบในข้อมูล");
      }
    }
  }, [item, mode]);

  // โหลดข้อมูลวัตถุดิบเมื่อเปิด Dialog
  useEffect(() => {
    const fetchIngredient = async () => {
      if (mode !== "ingredient" || !isAddDialogOpen) return;

      const ingredientItem = item as ingredient;
      const rawId = ingredientItem.ingredient_id;
      const id = rawId != null ? String(rawId).trim() : '';
      if (!id) {
        console.error("Invalid or missing ingredient_id:", rawId);
        setError("ID ของวัตถุดิบไม่ถูกต้อง");
        return;
      }

      console.log(`Fetching ingredient with id: ${id}`);
      try {
        setLoading(true);
        const res = await fetch(`/api/get/ingredients/${id}`);
        console.log(`API response status: ${res.status}`);
        console.log(`API response headers:`, Object.fromEntries(res.headers.entries()));

        // ตรวจสอบ Content-Type
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error("Non-JSON response received:", text.slice(0, 100));
          throw new Error("ได้รับข้อมูลที่ไม่ใช่ JSON จากเซิร์ฟเวอร์");
        }

        const data = await res.json();
        console.log("API response data:", data);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("วัตถุดิบไม่พบในระบบ");
          }
          throw new Error(`Failed to load ingredient data: ${data.error || res.statusText}`);
        }

        setNewIngredient({
          ingredient_name: data.ingredient_name || "",
          ingredient_image: data.ingredient_image || "",
          ingredient_total: data.ingredient_total || 0,
          ingredient_unit: unitDisplayMap[data.ingredient_unit ?? ""] || data.ingredient_unit || "",
          ingredient_total_alert: data.ingredient_total_alert || 0,
          ingredient_lastupdate: data.ingredient_lastupdate || "",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลวัตถุดิบได้";
        setError(errorMessage);
        console.error("Fetch error:", errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredient();
  }, [isAddDialogOpen, item, mode]);

  const handleEditIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode !== "ingredient") {
      setError("โหมดไม่ถูกต้องสำหรับการแก้ไขวัตถุดิบ");
      setLoading(false);
      return;
    }

    const ingredientItem = item as ingredient;
    const rawId = ingredientItem.ingredient_id;
    const id = rawId != null ? String(rawId).trim() : '';
    if (!id) {
      setError("ID ของวัตถุดิบไม่ถูกต้อง");
      setLoading(false);
      console.error("No or invalid id provided for edit:", rawId);
      return;
    }

    if (newIngredient.ingredient_total === undefined && newIngredient.ingredient_total_alert === undefined) {
      setError("กรุณากรอกจำนวนปัจจุบันหรือระดับแจ้งเตือนอย่างน้อยหนึ่งรายการ");
      setLoading(false);
      console.error("Missing required fields for edit");
      return;
    }

    try {
      const payload = {
        ingredient_total: newIngredient.ingredient_total,
        ingredient_total_alert: newIngredient.ingredient_total_alert,
      };
      console.log("Sending PATCH request with payload:", payload);

      const res = await fetch(`/api/edit/ingredients/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // ตรวจสอบ Content-Type สำหรับ PATCH
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Non-JSON response received for PATCH:", text.slice(0, 100));
        throw new Error("ได้รับข้อมูลที่ไม่ใช่ JSON จากเซิร์ฟเวอร์");
      }

      const response = await res.json();
      console.log("PATCH response:", response);

      if (!res.ok) {
        throw new Error(response.error || "Failed to update ingredient");
      }

      // อัปเดต state ด้วยข้อมูลที่คืนมาจาก API
      setNewIngredient({
        ...newIngredient,
        ...response.data,
        ingredient_unit: unitDisplayMap[response.data.ingredient_unit ?? ""] || response.data.ingredient_unit || "",
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ไม่สามารถแก้ไขวัตถุดิบได้ กรุณาลองใหม่";
      setError(errorMessage);
      console.error("Patch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "menu") {
    const menuItem = item as MenuItem;
    title = menuItem.menu_name;
    imageUrl = menuItem.imageUrl;
    description = menuItem.description;
    total = menuItem.menu_total;
  } else {
    const ingredientItem = item as ingredient;
    title = ingredientItem.ingredient_name;
    imageUrl = ingredientItem.ingredient_image;
    total = ingredientItem.ingredient_total;
    unit = unitLabelMap[ingredientItem.ingredient_unit ?? ""] || ingredientItem.ingredient_unit || "";
    lastUpdate = ingredientItem.ingredient_lastupdate;
  }

  return (
    <div className="column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-sixth-widescreen">
      <div className="card" style={{ height: "100%" }}>
        <div className="card-image">
          <figure className="image is-4by3">
            <img
              src={
                imageUrl ||
                "https://bulma.io/assets/images/placeholders/1280x960.png"
              }
              alt={title}
            />
          </figure>
          {mode === "ingredient" && (
            <div className="subtitle is-7 tag is-pulled-right">Status</div>
          )}
        </div>

        {/* Mode Menu */}
        {mode === "menu" && (
          <div className="mx-2 my-2">
            <div className="subtitle is-7">{title}</div>
            <div className="subtitle is-7">{description}</div>
          </div>
        )}
        {mode === "menu" && (
          <footer className="card-footer">
            <a href="#" className="card-footer-item">
              <span className="icon">
                <FontAwesomeIcon icon={faPlus} />
              </span>
            </a>
            <div className="card-footer-item">
              <span className="subtitle is-6">{total}</span>
            </div>
            <a href="#" className="card-footer-item">
              <span className="icon">
                <FontAwesomeIcon icon={faMinus} />
              </span>
            </a>
          </footer>
        )}

        {/* Mode Ingredient */}
        {mode === "ingredient" && (
          <div className="mx-2 my-2">
            <div className="subtitle is-7">{title}</div>
            <div className="subtitle is-7">total {total} {unit}</div>
            <span className="subtitle is-7">{lastUpdate}</span>
          </div>
        )}
        {mode === "ingredient" && (
          <footer className="card-footer">
            <a href="#" className="card-footer-item">
              Add
            </a>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={!ingredientItem?.ingredient_id}
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>แก้ไขวัตถุดิบ</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditIngredient}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">ชื่อวัตถุดิบ</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newIngredient.ingredient_name}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            ingredient_name: e.target.value,
                          })
                        }
                        placeholder="เช่น ข้าวสวย, ไข่ไก่"
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">หน่วย</Label>
                      {newIngredient.ingredient_unit && !Object.values(unitDisplayMap).includes(newIngredient.ingredient_unit) ? (
                        <Input
                          id="unit"
                          value={newIngredient.ingredient_unit}
                          disabled
                        />
                      ) : (
                        <Select
                          value={newIngredient.ingredient_unit || ""}
                          onValueChange={(value) =>
                            setNewIngredient({
                              ...newIngredient,
                              ingredient_unit: value,
                            })
                          }
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหน่วย" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="กรัม">กรัม</SelectItem>
                            <SelectItem value="kg">กิโลกรัม</SelectItem>
                            <SelectItem value="ฟอง">ฟอง</SelectItem>
                            <SelectItem value="ลิตร">ลิตร</SelectItem>
                            <SelectItem value="มล.">มิลลิลิตร</SelectItem>
                            <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {newIngredient.ingredient_unit && !Object.values(unitDisplayMap).includes(newIngredient.ingredient_unit) && (
                        <p className="text-red-500 text-sm">หน่วยไม่ตรงกับตัวเลือกที่กำหนด</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="currentStock">จำนวนปัจจุบัน</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={newIngredient.ingredient_total}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            ingredient_total: Math.max(0, Number(e.target.value)),
                          })
                        }
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="threshold">ระดับแจ้งเตือน</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={newIngredient.ingredient_total_alert}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            ingredient_total_alert: Math.max(0, Number(e.target.value)),
                          })
                        }
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">URL รูปภาพ</Label>
                      <Input
                        id="image"
                        value={newIngredient.ingredient_image}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            ingredient_image: e.target.value,
                          })
                        }
                        placeholder="URL รูปภาพ"
                        disabled
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "กำลังแก้ไข..." : "แก้ไขวัตถุดิบ"}
                    </Button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </footer>
        )}
      </div>
    </div>
  );
}