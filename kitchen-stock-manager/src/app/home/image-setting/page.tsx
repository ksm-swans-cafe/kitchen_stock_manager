"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Search, X, Check, Loader2, RefreshCw, Plus, ChevronDown, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

interface LunchboxItem {
  id: string;
  lunchbox_name: string;
  lunchbox_set_name: string;
  lunchbox_limit: number | null;
  lunchbox_name_image: string | null;
  lunchbox_set_name_image: string | null;
  lunchbox_image_path: string | null;
  lunchbox_check_all: boolean;
  lunchbox_order_select: any[];
}

type ImageType = "lunchbox_name_image" | "lunchbox_set_name_image" | "lunchbox_image_path";

function ImageSettingContent() {
  const { hasPermission, canEdit, canDelete } = usePermission();
  const router = useRouter();
  const [lunchboxes, setLunchboxes] = useState<LunchboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<LunchboxItem | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<ImageType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPath, setEditingPath] = useState<string>("");
  const [showPathModal, setShowPathModal] = useState(false);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [newPathInput, setNewPathInput] = useState("");
  const [isCreatingPath, setIsCreatingPath] = useState(false);
  const [showGroupPathModal, setShowGroupPathModal] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedGroupItems, setSelectedGroupItems] = useState<LunchboxItem[]>([]);
  const [showGroupImageModal, setShowGroupImageModal] = useState(false);
  const [groupImageType, setGroupImageType] = useState<"lunchbox_name_image" | "lunchbox_set_name_image" | null>(null);
  const [groupSelectedFile, setGroupSelectedFile] = useState<File | null>(null);
  const [groupPreviewUrl, setGroupPreviewUrl] = useState<string | null>(null);
  const [showGroupDeleteModal, setShowGroupDeleteModal] = useState(false);
  const [groupDeleteType, setGroupDeleteType] = useState<"lunchbox_name_image" | "lunchbox_set_name_image" | "both" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupFileInputRef = useRef<HTMLInputElement>(null);
  const pathDropdownRef = useRef<HTMLDivElement>(null);

  const blobBaseUrl = process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL;
  const defaultLunchboxImagePath = process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";

  const buildImageUrl = (imageName: string | null, customPath?: string | null) => {
    if (!imageName) return null;
    const path = customPath || defaultLunchboxImagePath;
    return `${blobBaseUrl}/${path}/${imageName}`;
  };

  const fetchLunchboxes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/get/lunchbox/all");
      const data = await response.json();
      if (data.success) {
        setLunchboxes(data.data);
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (error) {
      console.error("Error fetching lunchboxes:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLunchboxes();
  }, [fetchLunchboxes]);

  // Fetch available paths from blob storage
  const fetchAvailablePaths = useCallback(async () => {
    setIsLoadingPaths(true);
    try {
      const response = await fetch("/api/get/blob-paths");
      const data = await response.json();
      if (data.success) {
        setAvailablePaths(data.paths);
      }
    } catch (error) {
      console.error("Error fetching paths:", error);
    } finally {
      setIsLoadingPaths(false);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pathDropdownRef.current && !pathDropdownRef.current.contains(event.target as Node)) {
        setShowPathDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create new path in blob storage
  const handleCreateNewPath = async () => {
    if (!newPathInput.trim()) {
      toast.error("กรุณาระบุชื่อ path");
      return;
    }

    setIsCreatingPath(true);
    try {
      const response = await fetch("/api/post/blob-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: newPathInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`สร้าง path "${data.path}" สำเร็จ`);
        setEditingPath(data.path);
        setNewPathInput("");
        await fetchAvailablePaths();
        setShowPathDropdown(false);
      } else {
        toast.error(data.error || "ไม่สามารถสร้าง path ได้");
      }
    } catch (error) {
      console.error("Error creating path:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้าง path");
    } finally {
      setIsCreatingPath(false);
    }
  };

  const filteredLunchboxes = lunchboxes.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.lunchbox_name.toLowerCase().includes(query) ||
      item.lunchbox_set_name.toLowerCase().includes(query)
    );
  });

  // Group by lunchbox_name
  const groupedLunchboxes = filteredLunchboxes.reduce((acc, item) => {
    if (!acc[item.lunchbox_name]) {
      acc[item.lunchbox_name] = [];
    }
    acc[item.lunchbox_name].push(item);
    return acc;
  }, {} as Record<string, LunchboxItem[]>);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedItem || !selectedImageType || !selectedFile) {
      toast.error("กรุณาเลือกรูปภาพก่อน");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("image_type", selectedImageType);

      const response = await fetch(`/api/edit/lunchbox-image/${selectedItem.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("อัปโหลดรูปภาพสำเร็จ");
        await fetchLunchboxes();
        handleCloseModal();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedItem || !selectedImageType) return;

    const currentImage = selectedImageType === "lunchbox_name_image"
      ? selectedItem.lunchbox_name_image
      : selectedItem.lunchbox_set_name_image;

    if (!currentImage) {
      toast.error("ไม่มีรูปภาพที่จะลบ");
      return;
    }

    if (!confirm("คุณต้องการลบรูปภาพนี้หรือไม่?")) return;

    setIsUploading(true);
    try {
      const response = await fetch(
        `/api/edit/lunchbox-image/${selectedItem.id}?image_type=${selectedImageType}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("ลบรูปภาพสำเร็จ");
        await fetchLunchboxes();
        handleCloseModal();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("เกิดข้อผิดพลาดในการลบรูปภาพ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenModal = (item: LunchboxItem, imageType: ImageType) => {
    setSelectedItem(item);
    setSelectedImageType(imageType);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setSelectedImageType(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCurrentImageUrl = () => {
    if (!selectedItem || !selectedImageType) return null;
    if (selectedImageType === "lunchbox_image_path") return null;
    const imageName = selectedImageType === "lunchbox_name_image"
      ? selectedItem.lunchbox_name_image
      : selectedItem.lunchbox_set_name_image;
    return buildImageUrl(imageName, selectedItem.lunchbox_image_path);
  };

  const handleOpenPathModal = (item: LunchboxItem) => {
    setSelectedItem(item);
    setEditingPath(item.lunchbox_image_path || defaultLunchboxImagePath);
    setShowPathModal(true);
    setShowPathDropdown(false);
    setNewPathInput("");
    fetchAvailablePaths();
  };

  const handleClosePathModal = () => {
    setSelectedItem(null);
    setEditingPath("");
    setShowPathModal(false);
  };

  const handleSavePath = async () => {
    if (!selectedItem) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image_type", "lunchbox_image_path");
      formData.append("image_path", editingPath);

      const response = await fetch(`/api/edit/lunchbox-image/${selectedItem.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("อัปเดต Path สำเร็จ");
        await fetchLunchboxes();
        handleClosePathModal();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (error) {
      console.error("Error updating path:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต Path");
    } finally {
      setIsUploading(false);
    }
  };

  // Group Path Modal handlers
  const handleOpenGroupPathModal = (groupName: string, items: LunchboxItem[]) => {
    setSelectedGroupName(groupName);
    setSelectedGroupItems(items);
    setEditingPath(items[0]?.lunchbox_image_path || defaultLunchboxImagePath);
    setShowGroupPathModal(true);
    setShowPathDropdown(false);
    setNewPathInput("");
    fetchAvailablePaths();
  };

  const handleCloseGroupPathModal = () => {
    setSelectedGroupName("");
    setSelectedGroupItems([]);
    setEditingPath("");
    setShowGroupPathModal(false);
  };

  const handleSaveGroupPath = async () => {
    if (selectedGroupItems.length === 0) return;

    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of selectedGroupItems) {
        const formData = new FormData();
        formData.append("image_type", "lunchbox_image_path");
        formData.append("image_path", editingPath);

        const response = await fetch(`/api/edit/lunchbox-image/${item.id}`, {
          method: "PATCH",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`อัปเดต Path ทั้งหมด ${successCount} รายการสำเร็จ`);
      } else {
        toast.warning(`อัปเดตสำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`);
      }

      await fetchLunchboxes();
      handleCloseGroupPathModal();
    } catch (error) {
      console.error("Error updating group path:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต Path");
    } finally {
      setIsUploading(false);
    }
  };

  // Group Image Modal handlers
  const handleOpenGroupImageModal = (groupName: string, items: LunchboxItem[], imageType: "lunchbox_name_image" | "lunchbox_set_name_image") => {
    setSelectedGroupName(groupName);
    setSelectedGroupItems(items);
    setGroupImageType(imageType);
    setGroupSelectedFile(null);
    setGroupPreviewUrl(null);
    setShowGroupImageModal(true);
  };

  const handleCloseGroupImageModal = () => {
    setSelectedGroupName("");
    setSelectedGroupItems([]);
    setGroupImageType(null);
    setGroupSelectedFile(null);
    if (groupPreviewUrl) {
      URL.revokeObjectURL(groupPreviewUrl);
    }
    setGroupPreviewUrl(null);
    setShowGroupImageModal(false);
    if (groupFileInputRef.current) {
      groupFileInputRef.current.value = "";
    }
  };

  const handleGroupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setGroupSelectedFile(file);
      const url = URL.createObjectURL(file);
      setGroupPreviewUrl(url);
    }
  };

  const handleSaveGroupImage = async () => {
    if (selectedGroupItems.length === 0 || !groupImageType || !groupSelectedFile) {
      toast.error("กรุณาเลือกรูปภาพก่อน");
      return;
    }

    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of selectedGroupItems) {
        const formData = new FormData();
        formData.append("image", groupSelectedFile);
        formData.append("image_type", groupImageType);

        const response = await fetch(`/api/edit/lunchbox-image/${item.id}`, {
          method: "PATCH",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`อัปโหลดรูปภาพทั้งหมด ${successCount} รายการสำเร็จ`);
      } else {
        toast.warning(`อัปโหลดสำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`);
      }

      await fetchLunchboxes();
      handleCloseGroupImageModal();
    } catch (error) {
      console.error("Error uploading group image:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setIsUploading(false);
    }
  };

  // Group Delete Modal handlers
  const handleOpenGroupDeleteModal = (groupName: string, items: LunchboxItem[], deleteType: "lunchbox_name_image" | "lunchbox_set_name_image" | "both") => {
    setSelectedGroupName(groupName);
    setSelectedGroupItems(items);
    setGroupDeleteType(deleteType);
    setShowGroupDeleteModal(true);
  };

  const handleCloseGroupDeleteModal = () => {
    setSelectedGroupName("");
    setSelectedGroupItems([]);
    setGroupDeleteType(null);
    setShowGroupDeleteModal(false);
  };

  const handleDeleteGroupImages = async () => {
    if (selectedGroupItems.length === 0 || !groupDeleteType) return;

    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      const typesToDelete = groupDeleteType === "both" 
        ? ["lunchbox_name_image", "lunchbox_set_name_image"] 
        : [groupDeleteType];

      for (const item of selectedGroupItems) {
        for (const imageType of typesToDelete) {
          // ตรวจสอบว่ามีรูปภาพหรือไม่ก่อนลบ
          const hasImage = imageType === "lunchbox_name_image" 
            ? item.lunchbox_name_image 
            : item.lunchbox_set_name_image;

          if (!hasImage) {
            skippedCount++;
            continue;
          }

          const response = await fetch(
            `/api/edit/lunchbox-image/${item.id}?image_type=${imageType}`,
            { method: "DELETE" }
          );

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      if (successCount === 0 && skippedCount > 0) {
        toast.info("ไม่มีรูปภาพที่ต้องลบ");
      } else if (errorCount === 0) {
        toast.success(`ลบรูปภาพ ${successCount} รายการสำเร็จ`);
      } else {
        toast.warning(`ลบสำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ`);
      }

      await fetchLunchboxes();
      handleCloseGroupDeleteModal();
    } catch (error) {
      console.error("Error deleting group images:", error);
      toast.error("เกิดข้อผิดพลาดในการลบรูปภาพ");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  จัดการรูปภาพชุดอาหาร
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  อัปโหลดและแก้ไขรูปภาพสำหรับ Menu Picker
                </p>
              </div>
            </div>
            <button
              onClick={fetchLunchboxes}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชุดอาหาร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {Object.keys(groupedLunchboxes).length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบข้อมูลชุดอาหาร</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLunchboxes).map(([lunchboxName, items]) => (
              <div key={lunchboxName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        ชุด {lunchboxName}
                      </h2>
                      <p className="text-orange-100 text-sm mt-1">
                        {items.length} Set
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenGroupImageModal(lunchboxName, items, "lunchbox_name_image")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        รูปชุดอาหาร
                      </button>
                      <button
                        onClick={() => handleOpenGroupImageModal(lunchboxName, items, "lunchbox_set_name_image")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        รูป Set
                      </button>
                      <button
                        onClick={() => handleOpenGroupPathModal(lunchboxName, items)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Path
                      </button>
                      <button
                        onClick={() => handleOpenGroupDeleteModal(lunchboxName, items, "both")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ลบทั้งหมด
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-800 mb-3">
                          SET {item.lunchbox_set_name}
                        </div>

                        {/* Lunchbox Name Image */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-2">รูปชุดอาหาร (Name)</div>
                          <div
                            onClick={() => handleOpenModal(item, "lunchbox_name_image")}
                            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group border-2 border-dashed border-gray-200 hover:border-orange-400 transition-colors"
                          >
                            {item.lunchbox_name_image ? (
                              <>
                                <img
                                  src={buildImageUrl(item.lunchbox_name_image, item.lunchbox_image_path) || ""}
                                  alt={`${lunchboxName} name`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">แก้ไข</span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                <Upload className="w-6 h-6 mb-1" />
                                <span className="text-xs">อัปโหลด</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lunchbox Set Name Image */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-2">รูป Set อาหาร</div>
                          <div
                            onClick={() => handleOpenModal(item, "lunchbox_set_name_image")}
                            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group border-2 border-dashed border-gray-200 hover:border-orange-400 transition-colors"
                          >
                            {item.lunchbox_set_name_image ? (
                              <>
                                <img
                                  src={buildImageUrl(item.lunchbox_set_name_image, item.lunchbox_image_path) || ""}
                                  alt={`${item.lunchbox_set_name} set`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">แก้ไข</span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                <Upload className="w-6 h-6 mb-1" />
                                <span className="text-xs">อัปโหลด</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Image Path Setting */}
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Path รูปภาพ</div>
                          <button
                            onClick={() => handleOpenPathModal(item)}
                            className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 truncate transition-colors border border-gray-200 hover:border-orange-400"
                            title={item.lunchbox_image_path || defaultLunchboxImagePath}
                          >
                            {item.lunchbox_image_path || defaultLunchboxImagePath}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {selectedItem && selectedImageType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedImageType === "lunchbox_name_image"
                      ? "รูปชุดอาหาร"
                      : "รูป Set อาหาร"}
                  </h3>
                  <p className="text-orange-100 text-sm">
                    {selectedItem.lunchbox_name} - SET {selectedItem.lunchbox_set_name}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Current/Preview Image */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {previewUrl ? "รูปภาพใหม่" : "รูปภาพปัจจุบัน"}
                </div>
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : getCurrentImageUrl() ? (
                    <img
                      src={getCurrentImageUrl() || ""}
                      alt="Current"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">ยังไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors border-2 border-dashed border-gray-300 hover:border-orange-400"
                >
                  <Upload className="w-5 h-5" />
                  <span>เลือกรูปภาพ</span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {getCurrentImageUrl() && !previewUrl && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    <span>ลบรูปภาพ</span>
                  </button>
                )}
                {previewUrl && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    <span>บันทึก</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Path Edit Modal */}
      {showPathModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">แก้ไข Path รูปภาพ</h3>
                  <p className="text-blue-100 text-sm">
                    {selectedItem.lunchbox_name} - SET {selectedItem.lunchbox_set_name}
                  </p>
                </div>
                <button
                  onClick={handleClosePathModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Path Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Path ที่มีอยู่
                </label>
                <div className="relative" ref={pathDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowPathDropdown(!showPathDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-gray-700 truncate">{editingPath || "เลือก path..."}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPathDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showPathDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingPaths ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">กำลังโหลด...</span>
                        </div>
                      ) : (
                        <>
                          {availablePaths.length > 0 ? (
                            availablePaths.map((path) => (
                              <button
                                key={path}
                                type="button"
                                onClick={() => {
                                  setEditingPath(path);
                                  setShowPathDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors text-sm ${
                                  editingPath === path ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
                                }`}
                              >
                                {path}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">ไม่พบ path ที่มีอยู่</div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Create New Path */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  สร้าง Path ใหม่
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPathInput}
                    onChange={(e) => setNewPathInput(e.target.value)}
                    placeholder="เช่น img/new-folder"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewPath}
                    disabled={isCreatingPath || !newPathInput.trim()}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPath ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>สร้าง</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  สร้าง folder ใหม่ใน Blob Storage สำหรับเก็บรูปภาพ
                </p>
              </div>

              {/* Manual Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หรือพิมพ์ Path เอง
                </label>
                <input
                  type="text"
                  value={editingPath}
                  onChange={(e) => setEditingPath(e.target.value)}
                  placeholder="เช่น img/lunchbox-set-img"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-blue-600 font-medium mb-1">ตัวอย่าง URL:</div>
                <div className="text-xs text-blue-800 break-all">
                  {blobBaseUrl}/{editingPath || defaultLunchboxImagePath}/[filename].jpg
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSavePath}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>บันทึก</span>
                </button>
                <button
                  onClick={handleClosePathModal}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Path Edit Modal */}
      {showGroupPathModal && selectedGroupItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">ตั้งค่า Path ทั้งหมด</h3>
                  <p className="text-orange-100 text-sm">
                    ชุด {selectedGroupName} ({selectedGroupItems.length} Set)
                  </p>
                </div>
                <button
                  onClick={handleCloseGroupPathModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Path Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Path ที่มีอยู่
                </label>
                <div className="relative" ref={pathDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowPathDropdown(!showPathDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-gray-700 truncate">{editingPath || "เลือก path..."}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPathDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showPathDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingPaths ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                          <span className="ml-2 text-sm text-gray-500">กำลังโหลด...</span>
                        </div>
                      ) : (
                        <>
                          {availablePaths.length > 0 ? (
                            availablePaths.map((path) => (
                              <button
                                key={path}
                                type="button"
                                onClick={() => {
                                  setEditingPath(path);
                                  setShowPathDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors text-sm ${
                                  editingPath === path ? "bg-orange-100 text-orange-700 font-medium" : "text-gray-700"
                                }`}
                              >
                                {path}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">ไม่พบ path ที่มีอยู่</div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Create New Path */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  สร้าง Path ใหม่
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPathInput}
                    onChange={(e) => setNewPathInput(e.target.value)}
                    placeholder="เช่น img/new-folder"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewPath}
                    disabled={isCreatingPath || !newPathInput.trim()}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingPath ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>สร้าง</span>
                  </button>
                </div>
              </div>

              {/* Manual Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หรือพิมพ์ Path เอง
                </label>
                <input
                  type="text"
                  value={editingPath}
                  onChange={(e) => setEditingPath(e.target.value)}
                  placeholder="เช่น img/lunchbox-set-img"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-xs text-orange-600 font-medium mb-1">จะอัปเดต Path ให้กับ:</div>
                <div className="text-xs text-orange-800">
                  {selectedGroupItems.map((item) => `SET ${item.lunchbox_set_name}`).join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveGroupPath}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>บันทึกทั้งหมด</span>
                </button>
                <button
                  onClick={handleCloseGroupPathModal}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Image Upload Modal */}
      {showGroupImageModal && selectedGroupItems.length > 0 && groupImageType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {groupImageType === "lunchbox_name_image" ? "ตั้งค่ารูปชุดอาหารทั้งหมด" : "ตั้งค่ารูป Set อาหารทั้งหมด"}
                  </h3>
                  <p className="text-green-100 text-sm">
                    ชุด {selectedGroupName} ({selectedGroupItems.length} Set)
                  </p>
                </div>
                <button
                  onClick={handleCloseGroupImageModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Preview Image */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {groupPreviewUrl ? "รูปภาพที่เลือก" : "เลือกรูปภาพ"}
                </div>
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  {groupPreviewUrl ? (
                    <img
                      src={groupPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">ยังไม่ได้เลือกรูปภาพ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input */}
              <div className="mb-6">
                <input
                  ref={groupFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGroupFileSelect}
                  className="hidden"
                  id="group-image-upload"
                />
                <label
                  htmlFor="group-image-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors border-2 border-dashed border-gray-300 hover:border-green-400"
                >
                  <Upload className="w-5 h-5" />
                  <span>เลือกรูปภาพ</span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  รูปภาพนี้จะถูกใช้กับทุก Set ในกลุ่มนี้
                </p>
              </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xs text-green-600 font-medium mb-1">จะอัปโหลดให้กับ:</div>
                <div className="text-xs text-green-800">
                  {selectedGroupItems.map((item) => `SET ${item.lunchbox_set_name}`).join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveGroupImage}
                  disabled={isUploading || !groupSelectedFile}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>อัปโหลดทั้งหมด</span>
                </button>
                <button
                  onClick={handleCloseGroupImageModal}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Delete Confirmation Modal */}
      {showGroupDeleteModal && selectedGroupItems.length > 0 && groupDeleteType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">ยืนยันการลบรูปภาพ</h3>
                  <p className="text-red-100 text-sm">
                    ชุด {selectedGroupName} ({selectedGroupItems.length} Set)
                  </p>
                </div>
                <button
                  onClick={handleCloseGroupDeleteModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  คุณต้องการลบ{groupDeleteType === "both" ? "รูปภาพทั้งหมด" : groupDeleteType === "lunchbox_name_image" ? "รูปชุดอาหาร" : "รูป Set อาหาร"}?
                </p>
                <p className="text-sm text-gray-500">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>

              <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-xs text-red-600 font-medium mb-1">จะลบรูปภาพของ:</div>
                <div className="text-xs text-red-800">
                  {selectedGroupItems.map((item) => `SET ${item.lunchbox_set_name}`).join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteGroupImages}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span>ลบทั้งหมด</span>
                </button>
                <button
                  onClick={handleCloseGroupDeleteModal}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with ProtectedRoute - Developer only
export default function ImageSettingPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DEV_IMAGES}>
      <ImageSettingContent />
    </ProtectedRoute>
  );
}
