"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/share/ui/card";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Badge } from "@/share/ui/badge";
import SearchBox from "@/share/order/SearchBox_v2";
import { ingredient } from "@/models/menu_card/MenuCard-model";
// import { Employee } from "@/models/employee/employee-model";
import MenuCard from "@/share/order/MenuCard";
import {
  Dialog,
  DialogContent,
  // DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/share/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/share/ui/select";
import { Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch ingredients list");
  return res.json();
};

const normalizeThaiVowel = (text: string): string => {
  if (!text) return "";
  return text.replace(/เเ/g, "แ").normalize("NFC");
};

export default function IngredientManagement() {
  const chunkSize = 1000;
  // const [allIngredient, setIngredient] = useState<ingredient[]>([]);
  // const [allEmployee, setEmployee] = useState<Employee[]>([]);
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { userName } = useAuth();

  // Detect mobile device based on window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640); // Tailwind 'sm' breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add Escape key support for closing popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const {
    data: allIngredient,
    error,
    isLoading,
    mutate,
  } = useSWR<ingredient[]>("/api/get/ingredients", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    refreshInterval: 30000,
  });

  const [ingredient, setingredient] = useState<ingredient>({
    ingredient_name: "",
    ingredient_total: 0,
    ingredient_unit: "",
    ingredient_image: "",
    ingredient_total_alert: 0,
    // ingredient_category: "",
    // ingredient_sub_category: "",
    ingredient_status: "",
    ingredient_price: 0,
  });

  // ในฟังก์ชัน getStepValue
  const getStepValue = (unit: string): string => {
    if (["กรัม", "ฟอง", "ลูก", "มิลลิลิตร"].includes(unit)) {
      return "1";
    }
    // else if (["กิโลกรัม", "ลิตร"].includes(unit)) {
    //   return "0.01";
    // }
    return "";
  };

  // ในฟังก์ชัน formatNumber
  const formatNumber = (value: number, unit: string): number => {
    if (["กรัม", "ฟอง", "ลูก", "มิลลิลิตร"].includes(unit)) {
      return Math.floor(value);
    }
    // else if (["กิโลกรัม", "ลิตร", "ถุง"].includes(unit)) {
    //   return Math.round(value * 100) / 100;
    // }
    return value;
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(true); // ป้องกัน dialog ปิดก่อน

    try {
      const trimmedName = normalizeThaiVowel(ingredient.ingredient_name?.trim() || "");
      let total = Number(ingredient.ingredient_total);
      let alert = Number(ingredient.ingredient_total_alert);

      total = formatNumber(total, ingredient.ingredient_unit ?? "");
      alert = formatNumber(alert, ingredient.ingredient_unit ?? "");

      if (!trimmedName || !ingredient.ingredient_unit?.trim() || isNaN(total) || total <= 0 || isNaN(alert) || alert <= 0) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      }

      const formDataIngredient = new FormData();
      formDataIngredient.append("ingredient_name", trimmedName);
      formDataIngredient.append("ingredient_total", String(total));
      formDataIngredient.append("ingredient_unit", ingredient.ingredient_unit.trim());
      formDataIngredient.append("ingredient_total_alert", String(alert));
      formDataIngredient.append("ingredient_price", String(ingredient.ingredient_price ?? 0).trim());
      if (imageFile) {
        formDataIngredient.append("ingredient_image", imageFile);
      }

      const res = await fetch("/api/post/ingredients", {
        method: "POST",
        body: formDataIngredient,
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

      const type = "add";
      const formDataTransaction = new FormData();
      formDataTransaction.append("transaction_from_username", userName ?? "");
      formDataTransaction.append("transaction_total_price", String(ingredient.ingredient_price ?? 0));
      formDataTransaction.append("transaction_quantity", String(total));
      formDataTransaction.append("transaction_units", ingredient.ingredient_unit.trim());

      const encodedIngredientName = encodeURIComponent(trimmedName);
      const resTran = await fetch(`/api/post/${type}/stock/${encodedIngredientName}`, {
        method: "POST",
        body: formDataTransaction,
      });

      if (!resTran.ok) {
        const tranError = await resTran.json();
        throw new Error(tranError.error || "เกิดข้อผิดพลาดในการเพิ่มรายการธุรกรรม");
      }

      const transactionResult = await resTran.json();
      if (!transactionResult.transaction_type) {
        throw new Error("Invalid transaction response format");
      }

      // อัปเดตข้อมูลในแคชด้วย mutate
      mutate(allIngredient ? [...allIngredient, addedIngredient] : [addedIngredient], false);

      setingredient({
        ingredient_name: "",
        ingredient_total: 0,
        ingredient_unit: "",
        ingredient_image: "",
        ingredient_total_alert: 0,
        ingredient_status: "",
        ingredient_price: 0,
      });
      setImageFile(null);
      setIsAddDialogOpen(false);
      toast.success("เพิ่มวัตถุดิบและบันทึกธุรกรรมสำเร็จ");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มวัตถุดิบหรือธุรกรรม";
      toast.error(errorMessage);
    }
  };
  const getStockStatus = (ingredient: ingredient): { label: string; color: string } => {
    const total = Number(ingredient.ingredient_total ?? 0);
    const alert = Number(ingredient.ingredient_total_alert ?? 0);

    if (total >= alert * 2) {
      return { label: "เพียงพอ", color: "success" };
    } else if (total >= 1.5 * alert && total < 2 * alert) {
      return { label: "ปานกลาง", color: "warning" };
    } else {
      return { label: "ใกล้หมด", color: "destructive" };
    }
  };

  const filteredIngredient = useMemo(
    () =>
      (allIngredient || []).filter((ingredient) => {
        const normalizedIngredientName = normalizeThaiVowel(ingredient.ingredient_name || "");
        const normalizedSearchQuery = normalizeThaiVowel(searchQuery);
        const matchesSearch = normalizedIngredientName.toLowerCase().includes(normalizedSearchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "ทั้งหมด" || getStockStatus(ingredient).label === selectedStatus;
        return matchesSearch && matchesStatus;
      }),
    [allIngredient, searchQuery, selectedStatus]
  );

  const visibleIngredients = useMemo(
    () =>
      filteredIngredient.slice(0, visibleCount).sort((a, b) => {
        const aStatus = getStockStatus(a).label;
        const bStatus = getStockStatus(b).label;

        const isALow = aStatus === "ใกล้หมด";
        const isBLow = bStatus === "ใกล้หมด";

        if (isALow && !isBLow) return -1;
        if (!isALow && isBLow) return 1;

        if (isALow && isBLow) {
          return (a.ingredient_total ?? 0) - (b.ingredient_total ?? 0);
        }

        return 0;
      }),
    [filteredIngredient, visibleCount]
  );

  const ingredients = (allIngredient || [])
    .map((ingredient) => normalizeThaiVowel(ingredient.ingredient_name || ""))
    .filter((ingredient_name): ingredient_name is string => typeof ingredient_name === "string");

  const lowStockIngredients = useMemo(
    () =>
      (allIngredient || []).filter((ingredient) => {
        const total = Number(ingredient.ingredient_total) || 0;
        const alert = Number(ingredient.ingredient_total_alert) || 0;
        return total <= alert;
      }),
    [allIngredient]
  );

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + chunkSize, filteredIngredient.length));
  }, [filteredIngredient.length]);

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
  }, [loadMore]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className='flex min-h-screen flex-col items-center pt-4 px-5 overflow-auto'>
      <div className='container'>
        {isLoading && <p>Loading...</p>}
        {error && <p className='text-red-500'>{error.message}</p>}

        {allIngredient && lowStockIngredients.length > 0 && (
          <Card className='p-4 border-red-200 bg-red-50 dark:bg-red-900/20 mt-2'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-red-500' />
                <h3 className='font-semibold text-red-800 dark:text-red-200'>แจ้งเตือน: วัตถุดิบใกล้หมด ({lowStockIngredients.length} รายการ)</h3>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                {lowStockIngredients.slice(0, 2).map((ingredient) => (
                  <Badge key={ingredient.ingredient_id} variant='destructive' className='whitespace-nowrap'>
                    {ingredient.ingredient_name} ({ingredient.ingredient_total} / {ingredient.ingredient_total_alert})
                  </Badge>
                ))}
                {lowStockIngredients.length > 2 && (
                  <Badge variant='destructive' className='whitespace-nowrap'>
                    ...
                  </Badge>
                )}
                <div className='px-2 text-sm py-0.5 w-fit text-black shadow bg-red-400 rounded-md hover:bg-red-600 hover:text-white border'>
                  <button onClick={() => setSelectedStatus("ใกล้หมด")}>แสดงวัตถุดิบ</button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className='flex flex-row  items-center gap-2 w-full mb-2'>
          <div className='relative flex-1 min-w-[120px] padding-right-10 mt-2'>
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
          <div style={{ color: "#000000" }} className='flex flex-row justify-center sm:justify-end gap-2 w-full sm:w-auto'>
            <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400 transition-colors duration-200'>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                }}>
                <SelectTrigger className='inline-flex min-w-fit px-3' style={{ zIndex: 1000 }}>
                  <SelectValue placeholder='เลือกสถานะ' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ทั้งหมด'>ทั้งหมด</SelectItem>
                  <SelectItem value='เพียงพอ'>เพียงพอ</SelectItem>
                  <SelectItem value='ปานกลาง'>ปานกลาง</SelectItem>
                  <SelectItem value='ใกล้หมด'>ใกล้หมด</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400 transition-colors duration-200'>
                  <Button>เพิ่ม</Button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddIngredient}>
                  <DialogTitle style={{ color: "#000000" }}>เพิ่มวัตถุดิบใหม่</DialogTitle>

                  <div style={{ color: "#000000" }} className='space-y-4'>
                    <div>
                      <Label htmlFor='name'>ชื่อวัตถุดิบ</Label>
                      <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                        <Input
                          id='name'
                          name='name'
                          value={ingredient.ingredient_name ?? ""}
                          onChange={(e) =>
                            setingredient({
                              ...ingredient,
                              ingredient_name: e.target.value,
                            })
                          }
                          placeholder='เช่น ข้าวสวย, ไข่ไก่'
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='unit'>หน่วย</Label>
                      <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-200 hover:bg-gray-300 border border-gray-400'>
                        <Select
                          value={ingredient.ingredient_unit ?? ""}
                          onValueChange={(value) =>
                            setingredient({
                              ...ingredient,
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
                            <SelectItem value='กิโลกรัม'>กิโลกรัม</SelectItem>
                            <SelectItem value='มิลลิลิตร'>มิลลิลิตร</SelectItem>
                            <SelectItem value='ลิตร'>ลิตร</SelectItem>
                            <SelectItem value='ชิ้น'>ชิ้น</SelectItem>
                            <SelectItem value='ตัว'>ตัว</SelectItem>
                            <SelectItem value='ซอง'>ซอง</SelectItem>
                            <SelectItem value='ใบ'>ใบ</SelectItem>
                            <SelectItem value='ถ้วย'>ถ้วย</SelectItem>
                            <SelectItem value='กระป๋อง'>กระป๋อง</SelectItem>
                            <SelectItem value='ขวด'>ขวด</SelectItem>
                            <SelectItem value='ก้อน'>ก้อน</SelectItem>
                            <SelectItem value='ฟอง'>ฟอง</SelectItem>
                            <SelectItem value='ลูก'>ลูก</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='currentStock'>จำนวนปัจจุบัน</Label>
                      <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                        <Input
                          id='currentStock'
                          type='number'
                          value={ingredient.ingredient_total ?? ""}
                          onChange={(e) => {
                            let value = Number(e.target.value);
                            if (["กรัม", "ฟอง", "ชิ้น"].includes(ingredient.ingredient_unit ?? "")) {
                              value = Math.floor(value);
                            }
                            setingredient({
                              ...ingredient,
                              ingredient_total: value,
                            });
                          }}
                          min='0'
                          max='1000'
                          step={getStepValue(ingredient.ingredient_unit ?? "")}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='threshold'>ระดับแจ้งเตือน</Label>
                      <div className='bg-white rounded-md shadow hover:bg-gray-200 hover:text-blue-900 border border-gray-400'>
                        <Input
                          id='threshold'
                          type='number'
                          value={ingredient.ingredient_total_alert ?? ""}
                          onChange={(e) => {
                            let value = Number(e.target.value);
                            if (["กรัม", "ฟอง", "ชิ้น"].includes(ingredient.ingredient_unit ?? "")) {
                              value = Math.floor(value);
                            }
                            setingredient({
                              ...ingredient,
                              ingredient_total_alert: value,
                            });
                          }}
                          min='0'
                          max='1000'
                          step={getStepValue(ingredient.ingredient_unit ?? "")}
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
                          value={ingredient.ingredient_price ?? ""}
                          onChange={(e) => {
                            setingredient({
                              ...ingredient,
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
                    <Button type='submit' className='w-full' disabled={loading}>
                      {loading ? "กำลังเพิ่ม..." : "เพิ่มวัตถุดิบ"}
                    </Button>
                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {allIngredient && (
          <div className='justify-center columns grid is-multiline'>
            {visibleIngredients.map((ingredient) => (
              <MenuCard mode='ingredient' key={ingredient.ingredient_id} item={ingredient} onImageClick={() => ingredient.ingredient_image && handleImageClick(ingredient.ingredient_image)} />
            ))}
          </div>
        )}

        {allIngredient && visibleCount < filteredIngredient.length && <div ref={loadMoreRef} style={{ height: "20px" }} />}

        {allIngredient && filteredIngredient.length === 0 && (
          <Card className='p-8 text-center'>
            <Package className='w-12 h-12 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>ไม่พบวัตถุดิบ</h3>
            <p className='text-gray-500'>ลองค้นหาด้วยคำอื่น หรือเพิ่มวัตถุดิบใหม่</p>
          </Card>
        )}

        {selectedImage && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setSelectedImage(null)} role='dialog' aria-label='Image popup'>
            <div className={`relative ${isMobile ? "w-[95vw] h-[80vh]" : "max-w-[90vw] max-h-[90vh]"}`} onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt='Ingredient'
                className='w-full h-full object-contain rounded-lg'
                onError={(e) => {
                  e.currentTarget.src = "https://bulma.io/assets/images/placeholders/1280x960.png";
                }}
              />
              {isMobile && (
                <button className='absolute top-2 right-2 bg-white text-black rounded-full p-2' onClick={() => setSelectedImage(null)} aria-label='Close'>
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
