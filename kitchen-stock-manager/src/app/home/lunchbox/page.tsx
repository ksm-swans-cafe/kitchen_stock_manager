"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import Swal from "sweetalert2";
import {
  PackageOpen,
  Layers,
  ListOrdered,
  ImageOff,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  CirclePlus,
  CircleX,
  Save,
  Search,
  Utensils,
  Beef,
} from "lucide-react";
import { fetcher } from "@/lib/utils";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ensureWebP } from "@/lib/utils/imageConverter";
import { PERMISSIONS } from "@/lib/permissions";
import { Dialog, DialogContent, DialogTitle } from "@/share/ui/dialog";
import { MEAT_TYPES, DEFAULT_MEAT_SURCHARGE, resolveMeatType } from "@/lib/menu/dishMeatType";
import { usePermission } from "@/lib/hooks/usePermission";

interface LunchboxOrderRule {
  lunchbox_menu_category: string;
  lunchbox_menu_category_limit: string;
  lunchbox_menu_category_sequence: string;
}

interface LunchboxItem {
  id: string;
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number;
  lunchbox_name_image: string | null;
  lunchbox_set_name_image: string | null;
  lunchbox_image_path: string | null;
  lunchbox_check_all: boolean;
  lunchbox_order_select: LunchboxOrderRule[];
}

interface LunchboxApiResponse {
  success: boolean;
  data: LunchboxItem[];
}

interface SetMenuItem {
  menu_id: string | number;
  menu_name: string;
  menu_subname: string;
  menu_category: string;
  menu_cost: number;
  lunchbox_cost: number;
  lunchbox_dish_type?: string | null;
  lunchbox_meat_type?: string | null;
}

interface SetMenuApiResponse {
  success: boolean;
  data: SetMenuItem[];
}

const DEFAULT_LUNCHBOX_IMAGE_FOLDER = process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
const BLOB_STORE_BASE_URL = process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL;

function getLunchboxImageUrl(lb: LunchboxItem): string | null {
  const fileName = lb.lunchbox_set_name_image || lb.lunchbox_name_image;
  if (!fileName || !BLOB_STORE_BASE_URL) return null;

  const folder = lb.lunchbox_image_path || DEFAULT_LUNCHBOX_IMAGE_FOLDER;
  return `${BLOB_STORE_BASE_URL}/${folder}/${fileName}`;
}

function LunchboxImage({ lb }: { lb: LunchboxItem }) {
  const [failed, setFailed] = useState(false);
  const url = getLunchboxImageUrl(lb);

  if (!url || failed) {
    return <ImageOff className="text-gray-300" size={32} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${lb.lunchbox_name} ${lb.lunchbox_set_name}`}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

interface LunchboxFormState {
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: string;
  lunchbox_check_all: boolean;
  lunchbox_order_select: LunchboxOrderRule[];
}

type LunchboxImageType = "lunchbox_name_image" | "lunchbox_set_name_image";

interface EditingImagesState {
  lunchbox_name_image: string | null;
  lunchbox_set_name_image: string | null;
  lunchbox_image_path: string | null;
}

const emptyEditingImages: EditingImagesState = {
  lunchbox_name_image: null,
  lunchbox_set_name_image: null,
  lunchbox_image_path: null,
};

const emptyForm: LunchboxFormState = {
  lunchbox_name: "",
  lunchbox_set_name: "",
  lunchbox_limit: "1",
  lunchbox_check_all: false,
  lunchbox_order_select: [],
};

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const labelClass = "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700";

interface MeatSurchargeApiResponse {
  success: boolean;
  data: { meat_name: string; surcharge: number }[];
}

interface EditingSetIdentity {
  lunchbox_name: string;
  lunchbox_set_name: string;
}

interface PendingImageState {
  file: File;
  previewUrl: string;
}

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "กรุณาเลือกไฟล์รูปภาพเท่านั้น";
  if (file.size > 5 * 1024 * 1024) return "ขนาดไฟล์ต้องไม่เกิน 5MB";
  return null;
}

function LunchboxContent() {
  const { data, error, isLoading, mutate } = useSWR<LunchboxApiResponse>("/api/get/lunchbox/all", fetcher, {
    revalidateOnFocus: true,
  });

  const { isAdmin, isDeveloper } = usePermission();
  const canEditSurcharge = isAdmin || isDeveloper;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LunchboxFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingImages, setEditingImages] = useState<EditingImagesState>(emptyEditingImages);
  const [uploadingImageType, setUploadingImageType] = useState<LunchboxImageType | null>(null);
  // รูปที่เลือกไว้ก่อนบันทึกครั้งแรก (ตอนสร้างชุดใหม่ ยังไม่มี id ให้อัปโหลดจริง) จะอัปโหลดจริงหลังสร้างสำเร็จ
  const [pendingImages, setPendingImages] = useState<Partial<Record<LunchboxImageType, PendingImageState>>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [setMenuItems, setSetMenuItems] = useState<SetMenuItem[]>([]);
  const [loadingSetMenus, setLoadingSetMenus] = useState(false);

  const [editingSetIdentity, setEditingSetIdentity] = useState<EditingSetIdentity | null>(null);

  const meatSurchargeKey = editingSetIdentity
    ? `/api/get/meat-surcharge?lunchbox_name=${encodeURIComponent(editingSetIdentity.lunchbox_name)}&lunchbox_set_name=${encodeURIComponent(editingSetIdentity.lunchbox_set_name)}`
    : null;

  const { data: meatSurchargeData, mutate: mutateMeatSurcharge } = useSWR<MeatSurchargeApiResponse>(meatSurchargeKey, fetcher, {
    revalidateOnFocus: true,
  });

  // รายการ "ประเภทเนื้อสัตว์" ดึงจาก DB เดียวกับที่หน้าจัดการเมนูใช้ (แอดมินเพิ่มเองได้ ไม่ fixed แล้ว)
  const { data: meatTypeOptions } = useSWR<string[]>("/api/get/meat-type", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
  const availableMeatTypes = meatTypeOptions && meatTypeOptions.length > 0 ? meatTypeOptions : [...MEAT_TYPES];

  // รายการเนื้อสัตว์ที่แอดมิน "เพิ่ม" ไว้เองสำหรับชุดนี้ (เพิ่ม/ลบ/แก้ไขได้อิสระ ไม่ผูกกับเมนูในชุด)
  const [surchargeRows, setSurchargeRows] = useState<{ meat_name: string; surcharge: string }[]>([]);
  const [surchargeSynced, setSurchargeSynced] = useState(false);

  useEffect(() => {
    setSurchargeSynced(false);
    setSurchargeRows([]);
  }, [editingSetIdentity]);

  useEffect(() => {
    if (!meatSurchargeData?.data || surchargeSynced) return;
    setSurchargeRows(meatSurchargeData.data.map((item) => ({ meat_name: item.meat_name, surcharge: String(item.surcharge) })));
    setSurchargeSynced(true);
  }, [meatSurchargeData, surchargeSynced]);

  const surchargeMap = useMemo(() => {
    const map: Record<string, number> = {};
    surchargeRows.forEach((row) => {
      map[row.meat_name] = Number(row.surcharge) || 0;
    });
    return map;
  }, [surchargeRows]);

  const addSurchargeRow = () => {
    const availableMeat = availableMeatTypes.find((m) => !surchargeRows.some((r) => r.meat_name === m));
    if (!availableMeat) return;
    setSurchargeRows((prev) => [...prev, { meat_name: availableMeat, surcharge: String(DEFAULT_MEAT_SURCHARGE[availableMeat] ?? 0) }]);
  };

  const removeSurchargeRow = (idx: number) => {
    setSurchargeRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSurchargeRow = (idx: number, field: "meat_name" | "surcharge", value: string) => {
    setSurchargeRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const setPendingImage = (imageType: LunchboxImageType, file: File | null) => {
    setPendingImages((prev) => {
      const next = { ...prev };
      const existing = next[imageType];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      if (file) next[imageType] = { file, previewUrl: URL.createObjectURL(file) };
      else delete next[imageType];
      return next;
    });
  };

  const clearPendingImages = () => {
    setPendingImages((prev) => {
      Object.values(prev).forEach((p) => p && URL.revokeObjectURL(p.previewUrl));
      return {};
    });
  };

  // เคลียร์รูปที่ยังไม่ได้อัปโหลดทิ้งเมื่อปิด dialog (ยกเลิก/กด X) กัน object URL ค้าง
  useEffect(() => {
    if (!dialogOpen) clearPendingImages();
  }, [dialogOpen]);

  const lunchboxes = data?.data ?? [];

  const filteredLunchboxes = searchQuery.trim()
    ? lunchboxes.filter((lb) => {
        const query = searchQuery.trim().toLowerCase();
        return lb.lunchbox_name.toLowerCase().includes(query) || lb.lunchbox_set_name.toLowerCase().includes(query);
      })
    : lunchboxes;

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setEditingImages(emptyEditingImages);
    clearPendingImages();
    setSetMenuItems([]);
    setEditingSetIdentity(null);
    setDialogOpen(true);
  };

  // ตั้งค่า state ของ dialog ให้อยู่ในโหมด "แก้ไข" สำหรับ record ที่มีอยู่แล้ว (ใช้ทั้งตอนเปิดแก้ไขจากรายการ
  // และตอนสร้างชุดใหม่สำเร็จ เพื่อให้อัปโหลดรูป/ตั้งราคาบวกเพิ่มต่อได้เลยโดยไม่ต้องปิด-เปิด dialog ใหม่)
  const enterEditMode = async (lb: LunchboxItem) => {
    setEditingId(lb.id);
    setForm({
      lunchbox_name: lb.lunchbox_name,
      lunchbox_set_name: lb.lunchbox_set_name,
      lunchbox_limit: String(lb.lunchbox_limit ?? 0),
      lunchbox_check_all: lb.lunchbox_check_all,
      lunchbox_order_select: lb.lunchbox_order_select || [],
    });
    setEditingImages({
      lunchbox_name_image: lb.lunchbox_name_image,
      lunchbox_set_name_image: lb.lunchbox_set_name_image,
      lunchbox_image_path: lb.lunchbox_image_path,
    });
    setEditingSetIdentity({ lunchbox_name: lb.lunchbox_name, lunchbox_set_name: lb.lunchbox_set_name });

    setSetMenuItems([]);
    setLoadingSetMenus(true);
    try {
      const res = await axios.get<SetMenuApiResponse>("/api/get/lunchbox/categories", {
        params: { lunchbox_name: lb.lunchbox_name, lunchbox_set_name: lb.lunchbox_set_name },
      });
      setSetMenuItems(res.data?.data ?? []);
    } catch (err) {
      setSetMenuItems([]);
    } finally {
      setLoadingSetMenus(false);
    }
  };

  const openEditDialog = async (lb: LunchboxItem) => {
    setFormError(null);
    clearPendingImages();
    setDialogOpen(true);
    await enterEditMode(lb);
  };

  const buildEditImageUrl = (imageName: string | null) => {
    if (!imageName || !BLOB_STORE_BASE_URL) return null;
    const folder = editingImages.lunchbox_image_path || DEFAULT_LUNCHBOX_IMAGE_FOLDER;
    return `${BLOB_STORE_BASE_URL}/${folder}/${imageName}`;
  };

  const handleImageChange = async (imageType: LunchboxImageType, file: File | null) => {
    if (!file || !editingId) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setUploadingImageType(imageType);
    setFormError(null);
    try {
      // Convert image to WebP format with high quality
      const webpFile = await ensureWebP(file, { quality: 0.9 });

      const payload = new FormData();
      payload.append("image", webpFile);
      payload.append("image_type", imageType);

      const res = await axios.patch(`/api/edit/lunchbox-image/${editingId}`, payload);
      setEditingImages((prev) => ({
        ...prev,
        [imageType]: res.data?.lunchbox?.[imageType] ?? prev[imageType],
      }));
      await mutate();
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : null;
      setFormError(message || "อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setUploadingImageType(null);
    }
  };

  const handleImageDelete = async (imageType: LunchboxImageType) => {
    if (!editingId) return;
    if (!confirm("ต้องการลบรูปภาพนี้ใช่หรือไม่?")) return;

    setUploadingImageType(imageType);
    setFormError(null);
    try {
      await axios.delete(`/api/edit/lunchbox-image/${editingId}?image_type=${imageType}`);
      setEditingImages((prev) => ({ ...prev, [imageType]: "" }));
      await mutate();
    } catch (err) {
      setFormError("ลบรูปภาพไม่สำเร็จ");
    } finally {
      setUploadingImageType(null);
    }
  };

  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      lunchbox_order_select: [
        ...prev.lunchbox_order_select,
        { lunchbox_menu_category: "", lunchbox_menu_category_limit: "1", lunchbox_menu_category_sequence: String(prev.lunchbox_order_select.length + 1) },
      ],
    }));
  };

  const removeRule = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      lunchbox_order_select: prev.lunchbox_order_select.filter((_, i) => i !== idx),
    }));
  };

  const updateRule = (idx: number, field: keyof LunchboxOrderRule, value: string) => {
    setForm((prev) => ({
      ...prev,
      lunchbox_order_select: prev.lunchbox_order_select.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.lunchbox_name.trim() || !form.lunchbox_set_name.trim()) {
      setFormError("กรุณาระบุชื่อกล่องอาหารและชื่อชุด");
      return;
    }

    const isCreating = !editingId;

    setIsSubmitting(true);
    try {
      const payload = {
        lunchbox_name: form.lunchbox_name.trim(),
        lunchbox_set_name: form.lunchbox_set_name.trim(),
        lunchbox_limit: Number(form.lunchbox_limit) || 0,
        lunchbox_check_all: form.lunchbox_check_all,
        lunchbox_order_select: form.lunchbox_order_select,
      };

      if (isCreating) {
        const res = await axios.post("/api/post/lunchbox", payload);
        const created: LunchboxItem | undefined = res.data?.data;
        // แทนที่จะปิด dialog ให้สลับเข้าโหมด "แก้ไข" ทันที เพื่อให้อัปโหลดรูป/ตั้งราคาบวกเพิ่มต่อได้เลย
        if (created?.id) {
          await enterEditMode(created);

          // อัปโหลดรูปที่เลือกไว้ตั้งแต่ก่อนบันทึก (ถ้ามี) ตอนนี้ที่มี id แล้ว
          for (const [imageType, pending] of Object.entries(pendingImages) as [LunchboxImageType, PendingImageState][]) {
            setUploadingImageType(imageType);
            try {
              const uploadPayload = new FormData();
              uploadPayload.append("image", pending.file);
              uploadPayload.append("image_type", imageType);
              const uploadRes = await axios.patch(`/api/edit/lunchbox-image/${created.id}`, uploadPayload);
              setEditingImages((prev) => ({ ...prev, [imageType]: uploadRes.data?.lunchbox?.[imageType] ?? prev[imageType] }));
            } catch (uploadErr) {
              setFormError("สร้างชุดกล่องอาหารสำเร็จ แต่อัปโหลดรูปบางรูปไม่สำเร็จ กรุณาอัปโหลดใหม่อีกครั้ง");
            } finally {
              setUploadingImageType(null);
            }
          }
          clearPendingImages();
        }
      } else {
        await axios.patch(`/api/edit/lunchbox/${editingId}`, payload);

        const items = surchargeRows.map((row) => ({ meat_name: row.meat_name, surcharge: Number(row.surcharge) || 0 }));
        await axios.patch("/api/edit/meat-surcharge", { lunchbox_name: payload.lunchbox_name, lunchbox_set_name: payload.lunchbox_set_name, items });
        await mutateMeatSurcharge();
      }

      await mutate();
      if (!isCreating) {
        setDialogOpen(false);
      }
      Swal.fire({
        icon: "success",
        title: isCreating ? "เพิ่มชุดกล่องอาหารสำเร็จ!" : "แก้ไขชุดกล่องอาหารสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : null;
      const errorText = message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setFormError(errorText);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorText,
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lb: LunchboxItem) => {
    if (!confirm(`ต้องการลบ "${lb.lunchbox_name} - ${lb.lunchbox_set_name}" ใช่หรือไม่?`)) return;

    setDeletingId(lb.id);
    try {
      await axios.delete(`/api/delete/lunchbox/${lb.id}`);
      await mutate();
      Swal.fire({
        icon: "success",
        title: "ลบชุดกล่องอาหารสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถลบชุดกล่องอาหารได้",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <PackageOpen className="text-emerald-600" size={22} />
              <span>ข้อมูลกล่องอาหาร (Lunchbox)</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">รายการชุดกล่องอาหารทั้งหมดในระบบ</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อกล่องอาหารหรือชื่อชุด"
                className="w-full min-w-[220px] truncate rounded-md border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <Link
              href="/home/lunchbox/menulists"
              className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <Utensils size={16} />
              <span>จัดการเมนู</span>
            </Link>
            <button
              onClick={openCreateDialog}
              className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
              <Plus size={16} />
              <span>เพิ่มชุดกล่องอาหาร</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" size={28} />
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={18} />
            <span>ไม่สามารถโหลดข้อมูลกล่องอาหารได้</span>
          </div>
        ) : lunchboxes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
            <PackageOpen className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="font-medium text-gray-700">ยังไม่มีข้อมูลกล่องอาหาร</p>
          </div>
        ) : filteredLunchboxes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
            <Search className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="font-medium text-gray-700">ไม่พบชุดกล่องอาหารที่ค้นหา &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery("")} className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
              ล้างการค้นหา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLunchboxes.map((lb) => {
              const rules = [...(Array.isArray(lb.lunchbox_order_select) ? lb.lunchbox_order_select : [])].sort(
                (a, b) => Number(a.lunchbox_menu_category_sequence) - Number(b.lunchbox_menu_category_sequence)
              );

              return (
                <div key={lb.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="flex h-32 items-center justify-center bg-gray-50">
                    <LunchboxImage lb={lb} />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{lb.lunchbox_name}</p>
                        <p className="text-sm text-gray-500">ชุด {lb.lunchbox_set_name}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        จำกัด {lb.lunchbox_limit} เมนู
                      </span>
                    </div>

                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <ListOrdered size={13} />
                        <span>หมวดหมู่ในกล่อง</span>
                      </p>
                      {rules.length === 0 ? (
                        <p className="text-xs text-gray-400">ไม่มีข้อมูลหมวดหมู่</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {rules.map((rule, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700">
                              <span className="flex items-center gap-1.5">
                                <Layers size={12} className="text-indigo-500" />
                                {rule.lunchbox_menu_category}
                              </span>
                              <span className="text-gray-400">จำกัด {rule.lunchbox_menu_category_limit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {lb.lunchbox_check_all && (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                        <CheckCircle2 size={12} />
                        เลือกวัตถุดิบทั้งหมดอัตโนมัติ
                      </span>
                    )}

                    <div className="mt-auto flex gap-2 pt-2">
                      <button
                        onClick={() => openEditDialog(lb)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100">
                        <Pencil size={13} />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(lb)}
                        disabled={deletingId === lb.id}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
                        {deletingId === lb.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-0">
        <div className="overflow-y-auto p-6">
          <DialogTitle>{editingId ? "แก้ไขชุดกล่องอาหาร" : "เพิ่มชุดกล่องอาหาร"}</DialogTitle>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <ImageIcon size={13} />
              <span>รูปภาพประกอบ</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(["lunchbox_set_name_image", "lunchbox_name_image"] as const).map((imageType) => {
                const pending = pendingImages[imageType];
                const savedUrl = buildEditImageUrl(editingImages[imageType]);
                const previewUrl = pending?.previewUrl ?? savedUrl;
                const isUploading = uploadingImageType === imageType;
                const inputId = `lunchbox-image-upload-${imageType}`;

                return (
                  <div key={imageType}>
                    <label className={labelClass}>
                      <ImageIcon size={15} className="text-purple-600" />
                      <span>{imageType === "lunchbox_name_image" ? "รูปโลโก้กล่องอาหาร" : "รูปชุดอาหาร (ตามชื่อชุด)"}</span>
                    </label>
                    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-emerald-600" size={22} />
                      ) : previewUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => (pending ? setPendingImage(imageType, null) : handleImageDelete(imageType))}
                            className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-white">
                            <X size={12} />
                          </button>
                          {pending && (
                            <span className="absolute bottom-1 left-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">รอบันทึก</span>
                          )}
                        </>
                      ) : (
                        <ImageOff className="text-gray-300" size={24} />
                      )}
                      {!isUploading && (
                        <label
                          htmlFor={inputId}
                          className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-transparent hover:bg-black/40 hover:text-white">
                          <Upload size={16} />
                        </label>
                      )}
                      <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (editingId) {
                            handleImageChange(imageType, file);
                          } else if (file) {
                            const validationError = validateImageFile(file);
                            if (validationError) setFormError(validationError);
                            else {
                              setFormError(null);
                              setPendingImage(imageType, file);
                            }
                          }
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {editingId && (
            <div>
              <p className="my-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Utensils size={13} />
                <span>เมนูที่มีในชุดนี้ {setMenuItems.length > 0 && `(${setMenuItems.length} รายการ)`}</span>
              </p>
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2">
                {loadingSetMenus ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                    <Loader2 size={15} className="animate-spin" />
                    <span>กำลังโหลดรายการเมนู...</span>
                  </div>
                ) : setMenuItems.length === 0 ? (
                  <p className="py-2 text-center text-xs text-gray-400">ยังไม่มีเมนูที่ผูกกับชุดนี้</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {setMenuItems.map((menu) => {
                      const cost = Number(menu.lunchbox_cost ?? menu.menu_cost ?? 0);
                      const meatType = resolveMeatType(menu);
                      const surcharge = meatType ? surchargeMap[meatType] ?? 0 : 0;
                      const base = surcharge > 0 ? cost - surcharge : cost;

                      return (
                        <div key={menu.menu_id} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-xs shadow-sm">
                          <span className="flex items-center gap-1.5 text-gray-700">
                            <Utensils size={12} className="text-emerald-500" />
                            {menu.menu_name}
                            {menu.menu_subname && <span className="text-gray-400">({menu.menu_subname})</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            {menu.menu_category && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">{menu.menu_category}</span>
                            )}
                            <span className="text-gray-500">
                              ฿{base.toLocaleString("th-TH")}
                              {surcharge > 0 && meatType ? ` + ${surcharge.toLocaleString("th-TH")} (${meatType})` : ""}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {editingId ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <Beef size={13} className="text-rose-600" />
                  <span>ราคาบวกเพิ่มเนื้อสัตว์ (เฉพาะชุดนี้)</span>
                </h2>
                {canEditSurcharge && (
                  <button
                    type="button"
                    onClick={addSurchargeRow}
                    disabled={surchargeRows.length >= availableMeatTypes.length}
                    className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50">
                    <CirclePlus size={14} />
                    <span>เพิ่มเนื้อสัตว์</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {surchargeRows.map((row, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={row.meat_name}
                      onChange={(e) => updateSurchargeRow(idx, "meat_name", e.target.value)}
                      disabled={!canEditSurcharge}
                      className={`${inputClass} flex-1`}>
                      {availableMeatTypes.filter((m) => m === row.meat_name || !surchargeRows.some((r) => r.meat_name === m)).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      className={`${inputClass} text-right`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={row.surcharge}
                      disabled={!canEditSurcharge}
                      onChange={(e) => updateSurchargeRow(idx, "surcharge", e.target.value.replace(/\D/g, ""))}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.value = "";
                      }}
                      style={{ width: "90px" }}
                    />
                    {canEditSurcharge && (
                      <button
                        type="button"
                        onClick={() => removeSurchargeRow(idx)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                        <CircleX size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {surchargeRows.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีการตั้งราคาบวกเพิ่มเนื้อสัตว์สำหรับชุดนี้</p>}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              บันทึกชุดกล่องอาหารก่อน จึงจะสามารถตั้งราคาบวกเพิ่มเนื้อสัตว์ได้
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  <PackageOpen size={15} className="text-emerald-600" />
                  <span>ชื่อกล่องอาหาร</span>
                </label>
                <input
                  className={inputClass}
                  type="text"
                  value={form.lunchbox_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, lunchbox_name: e.target.value }))}
                  placeholder="เช่น Lunch Box"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Layers size={15} className="text-indigo-600" />
                  <span>ชื่อชุด</span>
                </label>
                <input
                  className={inputClass}
                  type="text"
                  value={form.lunchbox_set_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, lunchbox_set_name: e.target.value }))}
                  placeholder="เช่น A"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  <ListOrdered size={15} className="text-amber-600" />
                  <span>จำนวนเมนูที่จำกัดในกล่องอาหาร</span>
                </label>
                <input
                  className={`${inputClass} text-right`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.lunchbox_limit}
                  onChange={(e) => setForm((prev) => ({ ...prev, lunchbox_limit: e.target.value.replace(/\D/g, "") }))}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.value = "";
                  }}
                  required
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.lunchbox_check_all}
                    onChange={(e) => setForm((prev) => ({ ...prev, lunchbox_check_all: e.target.checked }))}
                  />
                  <span>เลือกวัตถุดิบทั้งหมดอัตโนมัติ</span>
                </label>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass + " mb-0"}>
                  <Layers size={15} className="text-indigo-600" />
                  <span>หมวดหมู่ในกล่อง</span>
                </label>
                <button
                  type="button"
                  onClick={addRule}
                  className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100">
                  <CirclePlus size={14} />
                  <span>เพิ่มหมวดหมู่</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {form.lunchbox_order_select.length > 0 && (
                  <div className="flex gap-2 px-1 text-xs font-medium text-gray-500">
                    <span className="flex-1">ชื่อหมวดหมู่</span>
                    <span className="text-center" style={{ width: "90px" }}>จำกัดจำนวนเมนู</span>
                    <span className="text-center" style={{ width: "90px" }}>ลำดับการเเสดง</span>
                    <span className="w-[52px]" />
                  </div>
                )}
                {form.lunchbox_order_select.map((rule, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className={`${inputClass} flex-1 truncate`}
                      type="text"
                      value={rule.lunchbox_menu_category}
                      onChange={(e) => updateRule(idx, "lunchbox_menu_category", e.target.value)}
                      placeholder="ชื่อหมวดหมู่ เช่น ข้าว+กับข้าว"
                    />
                    <input
                      className={`${inputClass} text-right`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={rule.lunchbox_menu_category_limit}
                      onChange={(e) => updateRule(idx, "lunchbox_menu_category_limit", e.target.value.replace(/\D/g, ""))}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.value = "";
                      }}
                      placeholder="จำกัด"
                      style={{ width: "90px" }}
                    />
                    <input
                      className={`${inputClass} text-right`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={rule.lunchbox_menu_category_sequence}
                      onChange={(e) => updateRule(idx, "lunchbox_menu_category_sequence", e.target.value.replace(/\D/g, ""))}
                      onFocus={(e) => {
                        if (e.target.value === "0") e.target.value = "";
                      }}
                      placeholder="ลำดับ"
                      style={{ width: "90px" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(idx)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                      <CircleX size={14} />
                    </button>
                  </div>
                ))}
                {form.lunchbox_order_select.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีหมวดหมู่ในกล่องนี้</p>}
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <X size={15} />
                <span>ยกเลิก</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>{editingId ? "บันทึกการแก้ไข" : "เพิ่มชุดกล่องอาหาร"}</span>
              </button>
            </div>
          </form>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LunchboxPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_MENU}>
      <LunchboxContent />
    </ProtectedRoute>
  );
}
