"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/share/ui/card";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Badge } from "@/share/ui/badge";
import SearchBox from "@/share/order/SearchBox_v2";
import { ingredient } from "@/models/menu_card/MenuCard-model";
import { newIngredient } from "@/models/menu_card/MenuCard-model";
import MenuCard from "@/share/order/MenuCard";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/share/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/share/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/share/ui/select";
import { Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import superjson from "superjson";

const IngredientManagement = () => {
  const chunkSize = 20;
  const [allIngredient, setIngredient] = useState<ingredient[]>([]);
  const [visibleCount] = useState(chunkSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [searchQuery] = useState("");

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
  });

  const handleAddIngredient = async () => {
    setLoading(true);
    setError("");
    try {
      // Validate required fields
      if (
        !(newIngredient.ingredient_name?.trim() ?? "") ||
        !newIngredient.ingredient_unit ||
        (newIngredient.ingredient_total ?? 0) <= 0 ||
        (newIngredient.ingredient_total_alert ?? 0) <= 0
      ) {
        setError(
          "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (ชื่อและหน่วยต้องไม่ว่าง, จำนวนต้องมากกว่า 0)"
        );
        return;
      }

      // Prepare payload, omit ingredient_image if empty
      const payload = {
        ingredient_name: newIngredient.ingredient_name?.trim() ?? "",
        ingredient_total: Number(newIngredient.ingredient_total),
        ingredient_unit: newIngredient.ingredient_unit,
        ingredient_total_alert: Number(newIngredient.ingredient_total_alert),
        ...(newIngredient.ingredient_image && {
          ingredient_image: newIngredient.ingredient_image,
        }),
      };
      // console.log("Sending payload:", payload);

      const res = await fetch("/api/post/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: superjson.stringify(payload),
      });

      // อ่าน Response แบบ text ก่อน
      const result = await res.json();
      console.log("Full API Response:", result);

      if (!res.ok) {
        throw new Error(result.message || "Failed to add ingredient");
      }

      // วิธีที่ปลอดภัยที่สุด
      const addedIngredient =
        result?.ingredient?.[0] ?? // ถ้าเป็นรูปแบบ { ingredient: [...] }
        result?.data ?? // ถ้าเป็นรูปแบบ { data: {...} }
        result; // ถ้าเป็น object โดยตรง

      if (!addedIngredient) {
        throw new Error("Invalid response format: No ingredient data");
      }

      setIngredient((prev) => [...prev, addedIngredient]);
      // Reset form
      setNewIngredient({
        ingredient_name: "",
        ingredient_total: 0,
        ingredient_unit: "",
        ingredient_image: "",
        ingredient_total_alert: 0,
      });

      setIsAddDialogOpen(false);
      toast.success("เพิ่มวัตถุดิบสำเร็จ");
    } catch (error) {
      console.error("Error details:", error);
      setError("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ");
      toast.error("เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบ");
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredient = allIngredient.filter((ingredient) => {
    const matchesSearch = ingredient.ingredient_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatuses.length === 0
        ? true
        : selectedStatuses.includes(getStockStatus(ingredient).label);
    return matchesSearch && matchesStatus;
  });

  const visibleingredient = filteredIngredient.slice(0, visibleCount);

  const ingredients = allIngredient
    .map((ingredient) => ingredient.ingredient_name)
    .filter(
      (ingredient_name): ingredient_name is string =>
        typeof ingredient_name === "string"
    );

  const getStockStatus = (
    ingredient: ingredient
  ): { label: string; color: string } => {
    const total = Number(ingredient.ingredient_total ?? 0);
    const alert = Number(ingredient.ingredient_total_alert ?? 0);

    if (total <= alert) {
      return { label: "ใกล้หมด", color: "destructive" };
    } else if (total <= alert * 1.5) {
      return { label: "ปานกลาง", color: "warning" };
    } else {
      return { label: "เพียงพอ", color: "success" };
    }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const handleStatusFilterChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
  };

  const getIngredientStatus = (total: number, alert: number): string => {
    if (total > alert * 2) return "เพียงพอ";
    if (total > alert) return "ปานกลาง";
    return "ใกล้หมด";
  };

  // const filteredIngredients = allIngredient.filter((ingredient) => {
  //   const status = getIngredientStatus(
  //     ingredient.ingredient_total ?? 0,
  //     ingredient.ingredient_total_alert ?? 0
  //   );
  //   return selectedStatuses.length === 0 || selectedStatuses.includes(status);
  // });

  const filteredIngredients = useMemo(() => {
    return allIngredient.filter((ingredient) => {
      const status = getIngredientStatus(
        ingredient.ingredient_total ?? 0,
        ingredient.ingredient_total_alert ?? 0
      );
      return selectedStatuses.length === 0 || selectedStatuses.includes(status);
    });
  }, [ingredients, selectedStatuses]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const lowStockIngredients = allIngredient.filter((ingredient) => {
    const total = Number(ingredient.ingredient_total) || 0;
    const alert = Number(ingredient.ingredient_total_alert) || 0;
    return total <= alert;
  });

  return (
    <div className="min-h-screen bg-white ">
      {lowStockIngredients.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockIngredients.map((ingredient) => (
                <Badge
                  key={ingredient.ingredient_id}
                  variant="destructive"
                  className="whitespace-nowrap"
                >
                  {ingredient.ingredient_name} ({ingredient.ingredient_total} /{" "}
                  {ingredient.ingredient_total_alert})
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="container">
        <div className="flex flex-row items-center gap-2 w-full mb-2">
          <div className="relative flex-1 min-w-[120px] ml-4">
            <SearchBox
              dataSource={ingredients}
              onSelect={(val) => console.log("Selected:", val)}
            />
          </div>

          <div className="flex flex-row justify-center sm:justify-end gap-2 w-full sm:w-auto">
            
            <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <span>สถานะ</span>
            {selectedStatuses.length > 0 && (
              <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                {selectedStatuses.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {["ใกล้หมด", "ปานกลาง", "เพียงพอ"].map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
            
            {/* <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.ingredient_id}
                  className="p-4 border rounded shadow-sm bg-white"
                >
                  <div className="font-semibold">
                    {ingredient.ingredient_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    จำนวน: {ingredient.ingredient_total}{" "}
                    {ingredient.ingredient_unit}
                  </div>
                  <div className="text-sm text-blue-600">
                    สถานะ:{" "}
                    {getIngredientStatus(
                      ingredient.ingredient_total ?? 0,
                      ingredient.ingredient_total_alert ?? 0
                    )}
                  </div>
                </div>
              ))}
            </div> */}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddIngredient();
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">ชื่อวัตถุดิบ</Label>
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

                    <div>
                      <Label htmlFor="unit">หน่วย</Label>
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
                          <SelectItem value="kg">กิโลกรัม</SelectItem>
                          <SelectItem value="ฟอง">ฟอง</SelectItem>
                          <SelectItem value="ลิตร">ลิตร</SelectItem>
                          <SelectItem value="มล.">มิลลิลิตร</SelectItem>
                          <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currentStock">จำนวนปัจจุบัน</Label>
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

                    <div>
                      <Label htmlFor="threshold">ระดับแจ้งเตือน</Label>
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

                    <div>
                      <Label htmlFor="image">URL รูปภาพ (ถ้ามี)</Label>
                      <Input
                        id="image"
                        value={newIngredient.ingredient_image ?? ""}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            ingredient_image: e.target.value,
                          })
                        }
                        placeholder="URL รูปภาพ"
                      />
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

        {error && <p className="has-text-danger">Error: {error}</p>}
        {loading && <p>Loading...</p>}

        <div className="justify-center columns grid is-multiline">
          {filteredIngredients.map((ingredient, idx) => (
            <MenuCard mode="ingredient" key={idx} item={ingredient} />
          ))}
        </div>

        {visibleCount < filteredIngredient.length && (
          <div ref={loadMoreRef} style={{ height: "1px" }} />
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
    </div>
  );
};

export default IngredientManagement;
