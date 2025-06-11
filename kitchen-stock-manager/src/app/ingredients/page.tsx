"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SearchBox from "@/components/SearchBox";
import IngredientFilter from "@/ingredients/IngredientFilter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  threshold: number;
  lastUpdated: string;
}

interface NewIngredient {
  name: string;
  unit: string;
  currentStock: number;
  threshold: number;
}

interface StockStatus {
  color: "destructive" | "warning" | "success";
  label: string;
}

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: 1,
      name: "ข้าวสวย",
      unit: "kg",
      currentStock: 25,
      threshold: 10,
      lastUpdated: "2024-06-08",
    },
    {
      id: 2,
      name: "ไข่ไก่",
      unit: "ฟอง",
      currentStock: 15,
      threshold: 30,
      lastUpdated: "2024-06-08",
    },
    {
      id: 3,
      name: "น้ำมันพืช",
      unit: "ลิตร",
      currentStock: 0.5,
      threshold: 2,
      lastUpdated: "2024-06-07",
    },
    {
      id: 4,
      name: "เนื้อหมู",
      unit: "kg",
      currentStock: 8,
      threshold: 5,
      lastUpdated: "2024-06-08",
    },
    {
      id: 5,
      name: "ผักกาดขาว",
      unit: "kg",
      currentStock: 3,
      threshold: 2,
      lastUpdated: "2024-06-08",
    },
    {
      id: 6,
      name: "กุ้งสด",
      unit: "kg",
      currentStock: 1.5,
      threshold: 1,
      lastUpdated: "2024-06-08",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  // const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: "",
    unit: "",
    currentStock: 0,
    threshold: 0,
  });

  const filteredIngredients = ingredients.filter((ingredient: Ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockIngredients = ingredients.filter(
    (ingredient: Ingredient) => ingredient.currentStock <= ingredient.threshold
  );

  const handleAddIngredient = (): void => {
    if (!newIngredient.name || !newIngredient.unit) {
      toast("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณากรอกชื่อวัตถุดิบและหน่วยให้ครบถ้วน",
      });
      return;
    }

    const ingredient: Ingredient = {
      id: Math.max(...ingredients.map((i) => i.id)) + 1,
      ...newIngredient,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({ name: "", unit: "", currentStock: 0, threshold: 0 });
    setIsAddDialogOpen(false);

    toast.success("เพิ่มวัตถุดิบเสร็จสิ้น");
  };

  const handleUpdateStock = (id: number, newStock: number): void => {
    setIngredients(
      ingredients.map((ingredient: Ingredient) =>
        ingredient.id === id
          ? {
              ...ingredient,
              currentStock: newStock,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : ingredient
      )
    );

    toast.success("อัปเดตสต็อกเสร็จสิ้น");
  };

  const getStockStatus = (ingredient: Ingredient): StockStatus => {
    if (ingredient.currentStock <= ingredient.threshold) {
      return { color: "destructive", label: "ใกล้หมด" };
    } else if (ingredient.currentStock <= ingredient.threshold * 1.5) {
      return { color: "warning", label: "ปานกลาง" };
    } else {
      return { color: "success", label: "เพียงพอ" };
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">จัดการวัตถุดิบ</h2>
          <p className="text-muted-foreground">
            เพิ่ม แก้ไข และติดตามวัตถุดิบในคลัง
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Package className="w-4 h-4 mr-2" />
              เพิ่มวัตถุดิบใหม่
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
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  placeholder="เช่น ข้าวสวย, ไข่ไก่"
                />
              </div>
              <div>
                <Label htmlFor="unit">หน่วย</Label>
                <Select
                  value={newIngredient.unit}
                  onValueChange={(value: string) =>
                    setNewIngredient({ ...newIngredient, unit: value })
                  }
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
                  value={newIngredient.currentStock}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      currentStock: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="threshold">ระดับแจ้งเตือน</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newIngredient.threshold}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      threshold: Number(e.target.value),
                    })
                  }
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

      {/* Search Bar ที่ปรับปรุงแล้ว */}

      <div className="w-full max-w-2xl">
        <SearchBox />
      </div>

      {/* status */}
      {/* <IngredientFilter
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onCreate={handleCreate}
      /> */}

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
                  key={ingredient.id}
                  variant="destructive"
                  className="whitespace-nowrap"
                >
                  {ingredient.name} ({ingredient.currentStock} {ingredient.unit}
                  )
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ส่วนแสดงผลแบบตารางสำหรับหน้าจอขนาดใหญ่ */}
      {/* <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ชื่อวัตถุดิบ</th>
                <th scope="col" className="px-6 py-3">คงเหลือ</th>
                <th scope="col" className="px-6 py-3">ระดับแจ้งเตือน</th>
                <th scope="col" className="px-6 py-3">สถานะ</th>
                <th scope="col" className="px-6 py-3">อัปเดตล่าสุด</th>
                <th scope="col" className="px-6 py-3">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient) => {
                const status = getStockStatus(ingredient);
                return (
                  <tr key={ingredient.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {ingredient.name}
                    </td>
                    <td className="px-6 py-4">
                      {ingredient.currentStock} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4">
                      {ingredient.threshold} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                      // variant={status.color}
                      >
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ingredient.lastUpdated}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
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
                        <Label>จำนวนที่ต้องการเพิ่ม ({ingredient.unit})</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          onChange={(e) => {
                            const addAmount = Number(e.target.value);
                            if (addAmount > 0) {
                              handleUpdateStock(ingredient.id, ingredient.currentStock + addAmount);
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        สต็อกปัจจุบัน: {ingredient.currentStock} {ingredient.unit}
                      </p>
                    </div>
                  </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline">
                        แก้ไข
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* ส่วนแสดงผลแบบการ์ดสำหรับหน้าจอขนาดเล็ก */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredIngredients.map((ingredient) => {
          const status = getStockStatus(ingredient);
          return (
            <Card
              key={ingredient.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ingredient.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                    // variant={status.color}
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
      </div>

      {filteredIngredients.length === 0 && (
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
