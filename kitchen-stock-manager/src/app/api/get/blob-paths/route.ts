import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    // ดึงรายการ paths ที่มีอยู่ใน blob storage
    const { blobs } = await list({
      prefix: "img/",
      limit: 1000,
    });

    // สร้าง Set ของ unique paths จาก blobs
    const pathSet = new Set<string>();
    
    blobs.forEach((blob) => {
      // ดึง path จาก pathname (เช่น img/lunchbox-set-img/file.jpg -> img/lunchbox-set-img)
      const pathParts = blob.pathname.split("/");
      if (pathParts.length >= 2) {
        // เอาเฉพาะ path ไม่รวมชื่อไฟล์
        const path = pathParts.slice(0, -1).join("/");
        if (path) {
          pathSet.add(path);
        }
      }
    });

    // แปลงเป็น array และเรียงลำดับ
    const paths = Array.from(pathSet).sort();

    return NextResponse.json({
      success: true,
      paths,
    });
  } catch (error) {
    console.error("Error fetching blob paths:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงรายการ path ได้" },
      { status: 500 }
    );
  }
}
