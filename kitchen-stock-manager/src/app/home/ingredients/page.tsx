"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/share/ui/card";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Badge } from "@/share/ui/badge";
import SearchBox from "@/share/order/SearchBox_v2";
import { ingredient } from "@/models/menu_card/MenuCard-model";
import MenuCard from "@/share/order/MenuCard";
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
import { Package, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const IngredientManagement = () => {
  const chunkSize = 20;
  const [allIngredient, setIngredient] = useState<ingredient[]>([]);
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchingredients = async () => {
      try {
        setLoading(true);
        const res = await fetch("api/get/ingredients");
        if (!res.ok) throw new Error("Failed to fetch menu list");
        const data = await res.json();
        setIngredient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchingredients();
  }, []);
  
  // const filteredIngredient = allIngredient.filter((ingredient) =>
  //   ingredient.ingredient_name
  //     ?.toLowerCase()
  //     .includes(searchQuery.toLowerCase())
  // );
  
  // กรองข้อมูลตามคำค้นหาและสถานะ
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

  const loadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + chunkSize, filteredIngredient.length)
    );
  };

  const ingredients = allIngredient
    .map((ingredient) => ingredient.ingredient_name)
    .filter(
      (ingredient_name): ingredient_name is string =>
        typeof ingredient_name === "string"
    );

  // ฟังก์ชันตรวจสอบสถานะสต็อก
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

  // const [searchTerm] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  // const [newIngredient, setNewIngredient] = useState<NewIngredient>({
  //   name: "",
  //   unit: "",
  //   currentStock: 0,
  //   threshold: 0,
  // });


  // ฟังก์ชันจัดการการเปลี่ยนสถานะ
  const handleStatusFilterChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
  };

  const lowStockIngredients = allIngredient.filter((ingredient) => {
    const total = Number(ingredient.ingredient_total) || 0;
    const alert = Number(ingredient.ingredient_total_alert) || 0;
    const isLow = total <= alert;
    // console.log(
    //   `🔎 ${ingredient.ingredient_name}: total = ${total}, alert = ${alert} → isLow: ${isLow}`
    // );

    // return isLow;
  });

  const handleAddIngredient = (): void => {
    // if (!newIngredient.name || !newIngredient.unit) {
    //   toast("ข้อมูลไม่ครบถ้วน", {
    //     description: "กรุณากรอกชื่อวัตถุดิบและหน่วยให้ครบถ้วน",
    //   });
    //   return;
    // }

    // const ingredient: Ingredient = {
    //   // id: Math.max(...ingredients.map((i) => i.id)) + 1,
    //   // ...newIngredient,
    //   lastUpdated: new Date().toISOString().split("T")[0],
    // };

    // setIngredients([...ingredients, ingredient]);
    // setNewIngredient({ name: "", unit: "", currentStock: 0, threshold: 0 });
    setIsAddDialogOpen(false);

    toast.success("เพิ่มวัตถุดิบเสร็จสิ้น");
  };

  const handleUpdateStock = (id: number, newStock: number): void => {
    // setIngredients(
    //   ingredients.map((ingredient: ingredient) =>
    //     ingredient.id === id
    //       ? {
    //           ...ingredient,
    //           currentStock: newStock,
    //           lastUpdated: new Date().toISOString().split("T")[0],
    //         }
    //       : ingredient
    //   )
    // );

    toast.success("อัปเดตสต็อกเสร็จสิ้น");
  };

  return (
    <div className="min-h-screen bg-white ">
      {/* Low Stock Alert ที่ปรับปรุงแล้ว */}
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
          {/* SearchBox */}
          <div className="relative flex-1 min-w-[120px] ml-4">
            <SearchBox
              dataSource={ingredients}
              onSelect={(val) => console.log("Selected:", val)}
            />
          </div>

          <div className="flex flex-row justify-center sm:justify-end gap-2 w-full sm:w-auto">
            {/* Status Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  {/* <Filter className="w-4 h-4" /> */}
                  <span>status</span>
                  {selectedStatuses.length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes("ใกล้หมด")}
                  onCheckedChange={() =>
                    handleStatusFilterChange(
                      selectedStatuses.includes("ใกล้หมด")
                        ? selectedStatuses.filter((s) => s !== "ใกล้หมด")
                        : [...selectedStatuses, "ใกล้หมด"]
                    )
                  }
                >
                  ใกล้หมด
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes("ปานกลาง")}
                  onCheckedChange={() =>
                    handleStatusFilterChange(
                      selectedStatuses.includes("ปานกลาง")
                        ? selectedStatuses.filter((s) => s !== "ปานกลาง")
                        : [...selectedStatuses, "ปานกลาง"]
                    )
                  }
                >
                  ปานกลาง
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes("เพียงพอ")}
                  onCheckedChange={() =>
                    handleStatusFilterChange(
                      selectedStatuses.includes("เพียงพอ")
                        ? selectedStatuses.filter((s) => s !== "เพียงพอ")
                        : [...selectedStatuses, "เพียงพอ"]
                    )
                  }
                >
                  เพียงพอ
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* เพิ่มวัตถุดิบใหม่ */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  {/* <Package className="w-4 h-4" /> */}
                  create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">ชื่อวัตถุดิบ</Label>
                    <Input
                      id="name"
                      // value={newIngredient.name}
                      // onChange={(e) =>
                      //   setNewIngredient({ ...newIngredient, name: e.target.value })
                      // }
                      placeholder="เช่น ข้าวสวย, ไข่ไก่"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">หน่วย</Label>
                    <Select
                    // value={newIngredient.unit}
                    // onValueChange={(value: string) =>
                    //   setNewIngredient({ ...newIngredient, unit: value })
                    // }
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
                      // value={newIngredient.currentStock}
                      // onChange={(e) =>
                      //   setNewIngredient({
                      //     ...newIngredient,
                      //     currentStock: Number(e.target.value),
                      //   })
                      // }
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">ระดับแจ้งเตือน</Label>
                    <Input
                      id="threshold"
                      type="number"
                      // value={newIngredient.threshold}
                      // onChange={(e) =>
                      //   setNewIngredient({
                      //     ...newIngredient,
                      //     threshold: Number(e.target.value),
                      //   })
                      // }
                      placeholder="จำนวนที่ต้องการแจ้งเตือน"
                    />
                  </div>
                  <Button onClick={handleAddIngredient} className="w-full">
                    เพิ่มวัตถุดิบ
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && <p className="has-text-danger">Error: {error}</p>}
        {loading && <p>Loading...</p>}

        <div className="justify-center columns grid is-multiline">
          {visibleingredient.map((ingredient, idx) => (
            <MenuCard mode="ingredient" key={idx} item={ingredient} />
          ))}
        </div>

        {visibleCount < filteredIngredient.length && (
          <div ref={loadMoreRef} style={{ height: "1px" }} />
        )}
      </div>

      {/* ส่วนแสดงผลแบบการ์ดสำหรับหน้าจอขนาดเล็ก */}
      {/* <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredIngredients.map((ingredient) => {
          const status = getStockStatus(ingredient);
          return (
            <Card
              key={ingredient.ingredient_id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ingredient.ingredient_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                    variant={status.color}  
                    >
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {ingredient.currentStock} {ingredient.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    เตือนที่ {ingredient.threshold}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {ingredient.lastUpdated}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        เพิ่มสต็อก
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>เพิ่มสต็อก: {ingredient.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>
                            จำนวนที่ต้องการเพิ่ม ({ingredient.unit})
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            onChange={(e) => {
                              const addAmount = Number(e.target.value);
                              if (addAmount > 0) {
                                handleUpdateStock(
                                  ingredient.id,
                                  ingredient.currentStock + addAmount
                                );
                              }
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          สต็อกปัจจุบัน: {ingredient.currentStock}{" "}
                          {ingredient.unit}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div> */}

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
  );
};

export default IngredientManagement;
