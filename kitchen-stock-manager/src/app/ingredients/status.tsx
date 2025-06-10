import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Filter, Search } from "lucide-react";

const IngredientFilter = ({
  onSearch,
  onStatusFilter,
  onCreate,
}: {
  onSearch: (term: string) => void;
  onStatusFilter: (status: string | null) => void;
  onCreate: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleStatusSelect = (status: string) => {
    const newStatus = status === selectedStatus ? null : status;
    setSelectedStatus(newStatus);
    onStatusFilter(newStatus);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      {/* ช่องค้นหาชื่อวัตถุดิบ */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Input
          placeholder="Search Name Ingredients"
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 pr-4 py-2 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Dropdown กรองสถานะ */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Status: {selectedStatus || "ทั้งหมด"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuRadioGroup
            value={selectedStatus || ""}
            onValueChange={handleStatusSelect}
          >
            <DropdownMenuRadioItem value="">ทั้งหมด</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="ใกล้หมด">ใกล้หมด</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="ปานกลาง">ปานกลาง</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="เพียงพอ">เพียงพอ</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ปุ่มสร้างวัตถุดิบใหม่ */}
      <Button onClick={onCreate} className="gap-2">
        <PlusCircle className="w-4 h-4" />
        Create
      </Button>
    </div>
  );
};

export default IngredientFilter;