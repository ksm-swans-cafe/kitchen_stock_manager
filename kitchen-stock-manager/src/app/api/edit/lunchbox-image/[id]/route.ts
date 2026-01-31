import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;
    const formData = await request.formData();

    const imageType = formData.get("image_type")?.toString()?.trim(); // "lunchbox_name_image" or "lunchbox_set_name_image"
    const file = formData.get("image") as File | null;
    const imagePath = formData.get("image_path")?.toString()?.trim(); // path สำหรับเก็บรูปภาพ

    if (!imageType || (imageType !== "lunchbox_name_image" && imageType !== "lunchbox_set_name_image" && imageType !== "lunchbox_image_path")) {
      return NextResponse.json(
        { error: "กรุณาระบุประเภทที่ถูกต้อง (lunchbox_name_image, lunchbox_set_name_image หรือ lunchbox_image_path)" },
        { status: 400 }
      );
    }

    // ค้นหา lunchbox ที่ต้องการแก้ไข
    const existingLunchbox = await prisma.lunchbox.findUnique({
      where: { id: id },
    });

    if (!existingLunchbox) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Lunchbox" }, { status: 404 });
    }

    // ถ้าเป็นการอัปเดต path
    if (imageType === "lunchbox_image_path") {
      const result = await prisma.lunchbox.update({
        where: { id: id },
        data: { lunchbox_image_path: imagePath || null } as any,
      });

      return NextResponse.json({
        success: true,
        message: "อัปเดต path สำเร็จ",
        lunchbox: {
          id: result.id,
          lunchbox_name: result.lunchbox_name,
          lunchbox_set_name: result.lunchbox_set_name,
          lunchbox_image_path: (result as any).lunchbox_image_path,
        },
      });
    }

    let newImageName: string | null = null;

    if (file && file.name && file.size > 0) {
      // ดึง path จาก db หรือใช้ค่าจาก env เป็น fallback
      const lunchboxImagePath = (existingLunchbox as any).lunchbox_image_path || process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
      
      // สร้างชื่อไฟล์ใหม่
      const fileExtension = file.name.split(".").pop() || "jpg";
      const uniqueName = `${randomUUID()}.${fileExtension}`;
      const blobPath = `${lunchboxImagePath}/${uniqueName}`;

      // อัปโหลดรูปภาพใหม่ไปยัง Vercel Blob
      const blob = await put(blobPath, file, {
        access: "public",
      });

      // ดึงเฉพาะชื่อไฟล์จาก URL (ไม่รวม base path)
      const urlParts = blob.url.split("/");
      newImageName = urlParts[urlParts.length - 1];

      // ลบรูปภาพเก่าถ้ามี
      const oldImageName = imageType === "lunchbox_name_image" 
        ? existingLunchbox.lunchbox_name_image 
        : existingLunchbox.lunchbox_set_name_image;

      if (oldImageName) {
        try {
          const oldPath = (existingLunchbox as any).lunchbox_image_path || process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
          const oldImageUrl = `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${oldPath}/${oldImageName}`;
          await del(oldImageUrl);
          console.log("Deleted old image:", oldImageUrl);
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
        }
      }
    }

    // อัปเดตข้อมูลใน database
    const updateData: Record<string, string | null> = {};
    if (newImageName !== null) {
      updateData[imageType] = newImageName;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องอัปเดต" },
        { status: 400 }
      );
    }

    const result = await prisma.lunchbox.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดตรูปภาพสำเร็จ",
      lunchbox: {
        id: result.id,
        lunchbox_name: result.lunchbox_name,
        lunchbox_set_name: result.lunchbox_set_name,
        lunchbox_name_image: result.lunchbox_name_image,
        lunchbox_set_name_image: result.lunchbox_set_name_image,
        lunchbox_image_path: (result as any).lunchbox_image_path,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating lunchbox image:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดตรูปภาพ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// API สำหรับลบรูปภาพ
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const imageType = searchParams.get("image_type");

    if (!imageType || (imageType !== "lunchbox_name_image" && imageType !== "lunchbox_set_name_image")) {
      return NextResponse.json(
        { error: "กรุณาระบุประเภทรูปภาพที่ถูกต้อง" },
        { status: 400 }
      );
    }

    const existingLunchbox = await prisma.lunchbox.findUnique({
      where: { id: id },
    });

    if (!existingLunchbox) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Lunchbox" }, { status: 404 });
    }

    const oldImageName = imageType === "lunchbox_name_image"
      ? existingLunchbox.lunchbox_name_image
      : existingLunchbox.lunchbox_set_name_image;

    if (oldImageName) {
      try {
        const lunchboxPath = (existingLunchbox as any).lunchbox_image_path || process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
        const oldImageUrl = `${process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL}/${lunchboxPath}/${oldImageName}`;
        await del(oldImageUrl);
        console.log("Deleted image:", oldImageUrl);
      } catch (deleteError) {
        console.error("Failed to delete image:", deleteError);
      }
    }

    // อัปเดต database ให้เป็นค่าว่าง
    const updateData: Record<string, string> = {};
    updateData[imageType] = "";

    await prisma.lunchbox.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "ลบรูปภาพสำเร็จ",
    });
  } catch (error: unknown) {
    console.error("Error deleting lunchbox image:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบรูปภาพ" },
      { status: 500 }
    );
  }
}
