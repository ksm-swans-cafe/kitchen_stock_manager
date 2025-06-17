"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/share/ui/card";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Badge } from "@/share/ui/badge";
import SearchBox from "@/share/order/SearchBox_v2";
import { ingredient } from "@/models/menu_card/MenuCard-model";
import { newIngredient } from "@/models/menu_card/MenuCard-model";
import MenuCard from "@/share/order/MenuCard";
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
import { Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function IngredientManagement() {
  const chunkSize = 1000;
  const [allIngredient, setIngredient] = useState<ingredient[]>([]);
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchingredients = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/get/ingredients");
        if (!res.ok) throw new Error("Failed to fetch ingredients list");
        const data = await res.json();
        setIngredient(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchingredients();
  }, []);

  const [newIngredient, setNewIngredient] = useState<newIngredient>({
    ingredient_name: "",
    ingredient_total: 0,
    ingredient_unit: "",
    ingredient_image: "",
    ingredient_total_alert: 0,
    ingredient_status: "",
  });

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const trimmedName = newIngredient.ingredient_name?.trim();
      if (
        !trimmedName ||
        !newIngredient.ingredient_unit?.trim() ||
        !Number.isFinite(newIngredient.ingredient_total ?? 0) ||
        (newIngredient.ingredient_total ?? 0) <= 0 ||
        !Number.isFinite(newIngredient.ingredient_total_alert ?? 0) ||
        (newIngredient.ingredient_total_alert ?? 0) <= 0
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      }

      const formData = new FormData();
      formData.append("ingredient_name", trimmedName);
      formData.append("ingredient_total", String(newIngredient.ingredient_total));
      formData.append("ingredient_unit", newIngredient.ingredient_unit.trim());
      formData.append(
        "ingredient_total_alert",
        String(newIngredient.ingredient_total_alert)
      );
      if (imageFile) {
        formData.append("ingredient_image", imageFile);
      }

      const res = await fetch("/api/post/ingredients", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
        }
        if (res.status === 409) {
          throw new Error("ชื่อวัตถุดิบนี้มีอยู่แล้วในระบบ");
        }
        throw new Error(result.error || "Failed to add ingredient");
      }

      const addedIngredient = result?.ingredient?.[0] ?? result?.data ?? result;

      if (!addedIngredient) {
        throw new Error("Invalid response format: No ingredient data");
      }

      setIngredient((prev) => [...prev, addedIngredient]);
      setNewIngredient({
        ingredient_name: "",
        ingredient_total: 0,
        ingredient_unit: "",
        ingredient_image: "",
        ingredient_total_alert: 0,
      });
      setImageFile(null);
      setIsAddDialogOpen(false);
      toast.success("เพิ่มวัตถุดิบสำเร็จ");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  const getStockStatus = (
    ingredient: ingredient
  ): { label: string; color: string } => {
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
  
  const filteredIngredient = allIngredient.filter((ingredient) => {
    const matchesSearch = ingredient.ingredient_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "ทั้งหมด" ||
      getStockStatus(ingredient).label === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + chunkSize, filteredIngredient.length)
    );
  }, [filteredIngredient.length]);

  const visibleingredient = filteredIngredient.slice(0, visibleCount);

  const ingredients = allIngredient
    .map((ingredient) => ingredient.ingredient_name)
    .filter(
      (ingredient_name): ingredient_name is string =>
        typeof ingredient_name === "string"
    );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const lowStockIngredients = allIngredient.filter((ingredient) => {
    const total = Number(ingredient.ingredient_total) || 0;
    const alert = Number(ingredient.ingredient_total_alert) || 0;
    return total <= alert;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [visibleCount, filteredIngredient]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-white w-full">
      <div className="container">
        {lowStockIngredients.length > 0 && (
          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20 mt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length}{" "}
                  รายการ)
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lowStockIngredients.slice(0, 2).map((ingredient) => (
                  <Badge
                    key={ingredient.ingredient_id}
                    variant="destructive"
                    className="whitespace-nowrap"
                  >
                    {ingredient.ingredient_name} ({ingredient.ingredient_total}{" "}
                    / {ingredient.ingredient_total_alert})
                  </Badge>
                ))}

                {lowStockIngredients.length > 2 && (
                  <Badge variant="destructive" className="whitespace-nowrap">
                    ...
                  </Badge>
                )}

                <div className="px-2 text-sm py-0.5 w-fit text-white shadow bg-red-600 rounded-md hover:bg-gray-200 hover:text-black border">
                  <button onClick={() => setSelectedStatus("ใกล้หมด")}>
                    แสดงวัตถุดิบ
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-row items-center gap-2 w-full mb-2">
          <div className="relative flex-1 min-w-[120px] mt-2">
            <SearchBox
              dataSource={ingredients}
              onSelect={(val) => setSearchQuery(val)}
              onChangeQuery={(val) => {
                setSearchQuery(val);
                setVisibleCount(chunkSize);
              }}
              minLength={1}
            />
          </div>

          <div
            style={{ color: "#000000" }}
            className="flex flex-row justify-center sm:justify-end gap-2 w-full sm:w-auto"
          >
            <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400 transition-colors duration-200">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                  <SelectItem value="เพียงพอ">เพียงพอ</SelectItem>
                  <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                  <SelectItem value="ใกล้หมด">ใกล้หมด</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400 transition-colors duration-200">
                  <Button>เพิ่ม</Button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle style={{ color: "#000000" }}>
                    เพิ่มวัตถุดิบใหม่
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddIngredient}>
                  <div style={{ color: "#000000" }} className="space-y-4">
                    <div>
                      <Label htmlFor="name">ชื่อวัตถุดิบ</Label>
                      <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                        <Input
                          id="name"
                          name="name"
                          value={newIngredient.ingredient_name ?? ""}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              ingredient_name: e.target.value,
                            })
                          }
                          placeholder="เช่น ข้าวสวย, ไข่ไก่"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="unit">หน่วย</Label>
                      <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                        <Select
                          value={newIngredient.ingredient_unit ?? ""}
                          onValueChange={(value) =>
                            setNewIngredient({
                              ...newIngredient,
                              ingredient_unit: value,
                            })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหน่วย" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="กรัม">กรัม</SelectItem>
                            <SelectItem value="กิโลกรัม">กิโลกรัม</SelectItem>
                            <SelectItem value="ฟอง">ฟอง</SelectItem>
                            <SelectItem value="ลิตร">ลิตร</SelectItem>
                            <SelectItem value="มิลลิลิตร">มิลลิลิตร</SelectItem>
                            <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currentStock">จำนวนปัจจุบัน</Label>
                      <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                        <Input
                          id="currentStock"
                          type="number"
                          value={newIngredient.ingredient_total ?? ""}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              ingredient_total: Math.max(
                                0,
                                Number(e.target.value)
                              ),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="threshold">ระดับแจ้งเตือน</Label>
                      <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                        <Input
                          id="threshold"
                          type="number"
                          value={newIngredient.ingredient_total_alert ?? ""}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              ingredient_total_alert: Math.max(
                                0,
                                Number(e.target.value)
                              ),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">รูปภาพวัตถุดิบ (ถ้ามี)</Label>
                      <div className="bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setImageFile(e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "กำลังเพิ่ม..." : "เพิ่มวัตถุดิบ"}
                    </Button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading && <p>Loading...</p>}

        <div className="justify-center columns grid is-multiline">
          {visibleingredient.map((ingredient, idx) => (
            <MenuCard mode="ingredient" key={idx} item={ingredient} />
          ))}
        </div>

        {visibleCount < filteredIngredient.length && (
          <div ref={loadMoreRef} style={{ height: "20%" }} />
        )}

        {filteredIngredient.length === 0 && (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบวัตถุดิบ
            </h3>
            <p className="text-gray-500">
              ลองค้นหาด้วยคำอื่น หรือเพิ่มวัตถุดิบใหม่
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}