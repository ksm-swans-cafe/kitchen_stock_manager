"use client";
import { useState, useEffect } from "react";
import { MenuItem, ingredient } from "@/models/menu_card/MenuCard-model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/share/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { useCartStore } from "@/stores/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { toast } from "sonner";
import useSWR from "swr";
type Mode = "menu" | "ingredient";

interface MenuCardProps {
  mode: Mode;
  item: MenuItem | ingredient;
  onImageClick?: () => void;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
  return res.json();
};

const normalizeThaiVowel = (text: string): string => {
  if (!text) return "";
  return text.replace(/เเ/g, "แ").normalize("NFC");
};

export default function MenuCard({ mode, item, onImageClick }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const { userName } = useAuth(); // ย้าย useAuth ออกนอก try block

  let title: string | undefined;
  let imageUrl: string | undefined;
  let description: string | undefined;
  let total: string | number | undefined;
  let unit: string | undefined;
  let lastUpdate: string | undefined;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [Ingredient, setIngredient] = useState<ingredient>({
    ingredient_name: "",
    ingredient_image: "",
    ingredient_total: 0,
    ingredient_unit: "",
    ingredient_total_alert: 0,
    // ingredient_category: "",
    // ingredient_sub_category: "",
    ingredient_price: 0,
    ingredient_lastupdate: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalTotal, setOriginalTotal] = useState<number>(0); // เพิ่ม state เพื่อเก็บจำนวนเดิม

  const ingredientItem = mode === "ingredient" ? (item as ingredient) : undefined;

  const unitDisplayMap: { [key: string]: string } = {
    กรัม: "กรัม",
    มิลลิลิตร: "มิลลิลิตร",
    ฟอง: "ฟอง",
    ลูก: "ลูก",
    // ชิ้น: "ชิ้น",
  };

  const unitLabelMap: { [key: string]: string } = {
    กรัม: "กรัม",
    มิลลิลิตร: "มิลลิลิตร",
    ฟอง: "ฟอง",
    ลูก: "ลูก",
    // ชิ้น: "ชิ้น",
  };

  const getStepValue = (unit: string): string => {
    if (
      [
        "กรัม",
        "ฟอง",
        ,
        "ลูก",
        // "ชิ้น",
        "มิลลิลิตร",
      ].includes(unit)
    ) {
      return "1";
    }
    return "0.01";
  };

  const formatNumber = (value: number, unit: string): number => {
    if (
      [
        "กรัม",
        "ฟอง",
        ,
        "ลูก",
        // "ชิ้น",
        "มิลลิลิตร",
      ].includes(unit)
    ) {
      return Math.floor(value);
    }
    return value;
  };

  const getStockStatus = (ingredient: ingredient): { label: string; color: string } => {
    const total = Number(ingredient.ingredient_total ?? 0);
    const alert = Number(ingredient.ingredient_total_alert ?? 0);

    if (total >= alert * 2) {
      return { label: "เพียงพอ", color: "success" };
    } else if (total >= 1.5 * alert && total <= 2 * alert) {
      return { label: "ปานกลาง", color: "warning" };
    } else {
      return { label: "ใกล้หมด", color: "destructive" };
    }
  };
  const status = getStockStatus(Ingredient);

  // ตั้งค่าเริ่มต้นจาก prop item เมื่อเป็น ingredient
  useEffect(() => {
    if (mode === "ingredient") {
      const ingredientItem = item as ingredient;
      // console.log("Setting initial ingredient from item:", ingredientItem);
      setIngredient({
        ingredient_name: ingredientItem.ingredient_name || "",
        ingredient_image: ingredientItem.ingredient_image || "",
        ingredient_total: ingredientItem.ingredient_total || 0,
        ingredient_unit: unitDisplayMap[ingredientItem.ingredient_unit ?? ""] || ingredientItem.ingredient_unit || "",
        ingredient_total_alert: ingredientItem.ingredient_total_alert || 0,
        // ingredient_category: ingredientItem.ingredient_category || "",
        // ingredient_sub_category: ingredientItem.ingredient_sub_category || "",
        ingredient_price: ingredientItem.ingredient_price || 0,
        ingredient_lastupdate: ingredientItem.ingredient_lastupdate || "",
      });
      setOriginalTotal(ingredientItem.ingredient_total || 0); // เก็บจำนวนเดิม
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
      const id = rawId != null ? String(rawId).trim() : "";
      if (!id) {
        console.error("Invalid or missing ingredient_id:", rawId);
        setError("ID ของวัตถุดิบไม่ถูกต้อง");
        return;
      }

      // console.log(`Fetching ingredient with id: ${id}`);
      try {
        setLoading(true);
        const res = await fetch(`/api/get/ingredients/${id}`);
        // console.log(`API response status: ${res.status}`);
        // console.log(
        //   `API response headers:`,
        //   Object.fromEntries(res.headers.entries())
        // );

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response received:", text.slice(0, 100));
          throw new Error("ได้รับข้อมูลที่ไม่ใช่ JSON จากเซิร์ฟเวอร์");
        }

        const data = await res.json();
        // console.log("API response data:", data);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("วัตถุดิบไม่พบในระบบ");
          }
          throw new Error(`Failed to load ingredient data: ${data.error || res.statusText}`);
        }

        setIngredient({
          ingredient_name: data.ingredient_name || "",
          ingredient_image: data.ingredient_image || "",
          ingredient_total: data.ingredient_total || 0,
          ingredient_unit: unitDisplayMap[data.ingredient_unit ?? ""] || data.ingredient_unit || "",
          ingredient_total_alert: data.ingredient_total_alert || 0,
          ingredient_price: data.ingredient_price || 0,
          // ingredient_category: data.ingredient_category || "",
          // ingredient_sub_category: data.ingredient_sub_category || "",
          ingredient_lastupdate: data.ingredient_lastupdate || "",
        });
        setOriginalTotal(data.ingredient_total || 0); // อัปเดตจำนวนเดิม
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

  const handleChangeQuantity = (itemId: string | number, quantity: number) => {
    if (quantity >= 1) {
      setItemQuantity(itemId, quantity);
    }
  };

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
    const id = rawId != null ? String(rawId).trim() : "";
    if (!id) {
      setError("ID ของวัตถุดิบไม่ถูกต้อง");
      setLoading(false);
      console.error("No or invalid id provided for edit:", rawId);
      return;
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    const trimmedName = normalizeThaiVowel(Ingredient?.ingredient_name?.trim() || "");
    if (!trimmedName) {
      setError("ชื่อวัตถุดิบต้องไม่ว่างเปล่า");
      setLoading(false);
      return;
    }

    let total = Number(Ingredient.ingredient_total);
    let alert = Number(Ingredient.ingredient_total_alert);
    total = formatNumber(total, Ingredient.ingredient_unit ?? "");
    alert = formatNumber(alert, Ingredient.ingredient_unit ?? "");

    if (isNaN(total) || total <= 0) {
      setError("จำนวนปัจจุบันต้องเป็นตัวเลขที่มากกว่า 0");
      setLoading(false);
      return;
    }

    if (!Ingredient?.ingredient_unit?.trim()) {
      setError("หน่วยต้องไม่ว่างเปล่า");
      setLoading(false);
      return;
    }

    if (isNaN(alert) || alert <= 0) {
      setError("ระดับแจ้งเตือนต้องเป็นตัวเลขที่มากกว่า 0");
      setLoading(false);
      return;
    }

    if (!userName) {
      setError("ไม่พบข้อมูลผู้ใช้สำหรับบันทึกธุรกรรม");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ingredient_name", trimmedName);
      formData.append("ingredient_total", String(total));
      formData.append("ingredient_unit", Ingredient.ingredient_unit.trim());
      formData.append("ingredient_total_alert", String(alert));
      // formData.append("ingredient_category", Ingredient.ingredient_category?.trim() || "");
      // formData.append("ingredient_sub_category", Ingredient.ingredient_sub_category?.trim() || "");
      formData.append("ingredient_price", String(Ingredient.ingredient_price ?? 0));
      if (selectedImage) {
        formData.append("ingredient_image", selectedImage);
      }

      // console.log(
      //   "Sending PATCH request with formData:",
      //   Object.fromEntries(formData)
      // );

      const res = await fetch(`/api/edit/ingredients/${id}`, {
        method: "PATCH",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received for PATCH:", text.slice(0, 100));
        throw new Error("ได้รับข้อมูลที่ไม่ใช่ JSON จากเซิร์ฟเวอร์");
      }

      const response = await res.json();
      // console.log("PATCH response:", response);

      if (!res.ok) {
        throw new Error(response.error || "Failed to update ingredient");
      }

      // คำนวณการเปลี่ยนแปลงของจำนวน
      const type = "change";
      const formDataTransaction = new FormData();
      formDataTransaction.append("transaction_from_username", userName);
      formDataTransaction.append("transaction_total_price", String(Ingredient.ingredient_price ?? 0));
      formDataTransaction.append("transaction_quantity", String(total));
      formDataTransaction.append("transaction_units", Ingredient.ingredient_unit.trim());

      const encodedIngredientName = encodeURIComponent(trimmedName);
      const resTran = await fetch(`/api/post/${type}/stock/${encodedIngredientName}`, {
        method: "POST",
        body: formDataTransaction,
      });

      if (!resTran.ok) {
        const tranError = await resTran.json();
        throw new Error(tranError.error || "เกิดข้อผิดพลาดในการเพิ่มรายการธุรกรรม");
      }

      const tranContentType = resTran.headers.get("content-type");
      if (!tranContentType || !tranContentType.includes("application/json")) {
        const text = await resTran.text();
        console.error("Non-JSON response received for transaction:", text.slice(0, 100));
        throw new Error("ได้รับข้อมูลที่ไม่ใช่ JSON จากเซิร์ฟเวอร์สำหรับธุรกรรม");
      }

      const transactionResult = await resTran.json();
      if (!resTran.ok) {
        throw new Error(transactionResult.error || "เกิดข้อผิดพลาดในการเพิ่มรายการธุรกรรม");
      }

      if (!transactionResult.transaction_type) {
        throw new Error("Invalid transaction response format");
      }

      setIngredient({
        ...Ingredient,
        ...response.ingredient,
        ingredient_unit: unitDisplayMap[response.ingredient.ingredient_unit ?? ""] || response.ingredient.ingredient_unit || "",
      });
      setSelectedImage(null);
      setIsAddDialogOpen(false);
      toast.success("แก้ไขวัตถุดิบและบันทึกธุรกรรมสำเร็จ");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ไม่สามารถแก้ไขวัตถุดิบหรือบันทึกธุรกรรมได้";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error in handleEditIngredient:", err);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "menu") {
    const menuItem = item as MenuItem;
    title = menuItem.menu_name;
    imageUrl = menuItem.imageUrl;
    description = menuItem.description;

    total = useCartStore((state) => state.items.find((i) => i.menu_id === menuItem.menu_id)?.menu_total ?? 0);
  } else {
    const ingredientItem = item as ingredient;
    title = ingredientItem.ingredient_name;
    imageUrl = ingredientItem.ingredient_image;
    total = ingredientItem.ingredient_total;
    unit = unitLabelMap[ingredientItem.ingredient_unit ?? ""] || ingredientItem.ingredient_unit || "";
    lastUpdate = ingredientItem.ingredient_lastupdate;
  }

  const formatTotal = (value: number | undefined): string => {
    if (value === undefined || value === null) return "0";
    if (Number.isInteger(value) || value % 1 === 0) {
      return Math.floor(value).toString();
    }
    return Number(value).toFixed(2);
  };

  return (
    <>
      <div className='column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-sixth-widescreen'>
        <div className='card flex flex-col h-full'>
          <div className='card-image'>
            {/* <figure className="image is-4by3 sm:is-3by2">
              <img
                src={
                  imageUrl ||
                  "https://bulma.io/assets/images/placeholders/1280x960.png"
                }
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
                onClick={onImageClick}
                onTouchStart={onImageClick}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://bulma.io/assets/images/placeholders/1280x960.png";
                }}
              />
            </figure> */}
            {mode === "ingredient" && (
              <div
                style={{ color: "#000000" }}
                className={`mt-2 subtitle text-black is-6 tag is-pulled-right ${status.label === "ใกล้หมด" ? "is-danger" : status.label === "ปานกลาง" ? "is-warning" : "is-success"}`}>
                {status.label}
              </div>
            )}
          </div>

          {mode === "menu" && (
            <div className='flex flex-col px-2 py-2 items-center'>
              <div className='title is-6'>{title}</div>
            </div>
          )}
          {mode === "menu" && (
            <footer className='card-footer' style={{ height: "10%" }}>
              <button className='card-footer-item' onClick={() => removeItem((item as MenuItem).menu_id!)}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <div className='card-footer-item' style={{ flex: 1 }}>
                <input type='number' value={total} onChange={(e) => handleChangeQuantity((item as MenuItem).menu_id!, Number(e.target.value))} className='custom-input' />
              </div>
              <button className='card-footer-item' onClick={() => addItem(item as MenuItem)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </footer>
          )}

          {mode === "ingredient" && (
            <div className='mx-2 my-2'>
              <div className='subtitle is-5'>{title}</div>
              <div className='subtitle is-7'>
                คงเหลือ {formatTotal(total as number)} {unit}
              </div>
              {lastUpdate && (
                <div className='subtitle is-7'>
                  อัปเดตล่าสุด{" "}
                  {new Date(lastUpdate).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  น.
                </div>
              )}
            </div>
          )}
          {mode === "ingredient" && (
            <footer className='card-footer'>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <div className='flex items-center justify-center w-full h-full'>
                    <Button
                      style={{ color: "#ffffff" }}
                      className='flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 text-white font-semibold rounded-md'
                      disabled={!ingredientItem?.ingredient_id}>
                      Edit
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleEditIngredient}>
                    <div className='space-y-4'>
                      <DialogHeader>
                        <DialogTitle style={{ color: "#000000" }}>แก้ไขวัตถุดิบ</DialogTitle>
                      </DialogHeader>
                      <div style={{ color: "#000000" }}>
                        <Label htmlFor='name'>ชื่อวัตถุดิบ</Label>
                        <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                          <Input
                            id='name'
                            name='name'
                            value={Ingredient.ingredient_name}
                            onChange={(e) =>
                              setIngredient({
                                ...Ingredient,
                                ingredient_name: e.target.value,
                              })
                            }
                            placeholder='เช่น ข้าวสวย, ไข่ไก่'
                            required
                          />
                        </div>
                      </div>

                      <div style={{ color: "#000000" }}>
                        <Label htmlFor='unit'>หน่วย</Label>
                        <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                          <Select
                            value={Ingredient.ingredient_unit || ""}
                            onValueChange={(value) =>
                              setIngredient({
                                ...Ingredient,
                                ingredient_unit: value,
                                ingredient_total: 0,
                                ingredient_total_alert: 0,
                              })
                            }
                            required>
                            <SelectTrigger>
                              <SelectValue placeholder='เลือกหน่วย' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='กรัม'>กรัม</SelectItem>
                              <SelectItem value='มิลลิลิตร'>มิลลิลิตร</SelectItem>
                              <SelectItem value='ฟอง'>ฟอง</SelectItem>
                              <SelectItem value='ลูก'>ลูก</SelectItem>
                              {/* <SelectItem value="ชิ้น">ชิ้น</SelectItem> */}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* <div style={{ color: "#000000" }}>
                        <Label htmlFor="category">ประเภท</Label>
                        <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                          <Select
                            value={Ingredient.ingredient_category ?? ""}
                            onValueChange={(value) =>
                              setIngredient({
                                ...Ingredient,
                                ingredient_category: value,
                              })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="วัตถุดิบหลัก">
                                วัตถุดิบหลัก
                              </SelectItem>
                              <SelectItem value="ผักและผลไม้">
                                ผักและผลไม้
                              </SelectItem>
                              <SelectItem value="ธัญพืชและแป้ง">
                                ธัญพืชและแป้ง
                              </SelectItem>
                              <SelectItem value="เครื่องปรุงรส">
                                เครื่องปรุงรส
                              </SelectItem>
                              <SelectItem value="วัตถุดิบแช่แข็งและแปรรูป">
                                วัตถุดิบแช่แข็งและแปรรูป
                              </SelectItem>
                              <SelectItem value="ของแห้งและของแปรรูป">
                                ของแห้งและของแปรรูป
                              </SelectItem>
                              <SelectItem value="เครื่องดื่มและส่วนผสมอื่น">
                                เครื่องดื่มและส่วนผสมอื่น
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}

                      <div style={{ color: "#000000" }}>
                        <Label htmlFor='currentStock'>จำนวนปัจจุบัน</Label>
                        <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                          <Input
                            id='currentStock'
                            type='number'
                            value={Ingredient.ingredient_total}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (["กรัม", "ฟอง", "ชิ้น"].includes(Ingredient.ingredient_unit ?? "")) {
                                value = Math.floor(value);
                              }
                              setIngredient({
                                ...Ingredient,
                                ingredient_total: Math.max(0, Number(e.target.value)),
                              });
                            }}
                            min='0'
                            max='1000'
                            step={getStepValue(Ingredient.ingredient_unit ?? "")}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ color: "#000000" }}>
                        <Label htmlFor='threshold'>ระดับแจ้งเตือน</Label>
                        <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                          <Input
                            id='threshold'
                            type='number'
                            value={Ingredient.ingredient_total_alert}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (["กรัม", "ฟอง", "ชิ้น"].includes(Ingredient.ingredient_unit ?? "")) {
                                value = Math.floor(value);
                              }
                              setIngredient({
                                ...Ingredient,
                                ingredient_total_alert: Math.max(0, Number(e.target.value)),
                              });
                            }}
                            min='0'
                            max='1000'
                            step={getStepValue(Ingredient.ingredient_unit ?? "")}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor='threshold'>ราคา (บาท) </Label>
                        <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                          <Input
                            id='threshold'
                            type='number'
                            value={Ingredient.ingredient_price ?? ""}
                            onChange={(e) => {
                              setIngredient({
                                ...Ingredient,
                                ingredient_price: Number(e.target.value),
                              });
                            }}
                            min='0'
                            max='100000'
                            step='0.01'
                            required
                          />
                        </div>
                      </div>

                      {/* <div style={{ color: "#000000" }}>
                        <Label htmlFor="image">รูปภาพ</Label>
                        <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setSelectedImage(e.target.files?.[0] || null)
                            }
                          />
                          {Ingredient.ingredient_image && (
                            <div className="mt-2">
                              <img
                                src={Ingredient.ingredient_image}
                                alt="Current ingredient"
                                className="h-20 w-20 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div> */}

                      <Button type='submit' className='w-full ' disabled={loading} style={{ color: "#000000" }}>
                        {loading ? "กำลังแก้ไข..." : "แก้ไขวัตถุดิบ"}
                      </Button>
                      {error && <p className='text-red-500 text-sm'>{error}</p>}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </footer>
          )}
        </div>
      </div>
    </>
  );
}
