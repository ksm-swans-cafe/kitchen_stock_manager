import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const { path } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ path" },
        { status: 400 }
      );
    }

    // ทำความสะอาด path
    const cleanPath = path.trim().replace(/^\/+|\/+$/g, "");

    if (!cleanPath) {
      return NextResponse.json(
        { success: false, error: "path ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // สร้างไฟล์ .gitkeep เพื่อสร้าง folder ใน blob storage
    // Vercel Blob ไม่มี concept ของ folder จริงๆ แต่จะสร้างเมื่อมีไฟล์ใน path นั้น
    const placeholderPath = `${cleanPath}/.gitkeep`;
    
    // ใช้ Buffer แทน empty string เพราะ Vercel Blob ต้องการ body ที่ไม่ว่าง
    const placeholderContent = Buffer.from("# Placeholder file to create folder structure\n", "utf-8");
    
    const blob = await put(placeholderPath, placeholderContent, {
      access: "public",
      contentType: "text/plain",
    });

    return NextResponse.json({
      success: true,
      message: `สร้าง path "${cleanPath}" สำเร็จ`,
      path: cleanPath,
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error("Error creating blob path:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้าง path ได้" },
      { status: 500 }
    );
  }
}
