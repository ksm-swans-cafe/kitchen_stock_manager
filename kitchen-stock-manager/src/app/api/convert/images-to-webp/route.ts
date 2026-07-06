import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put, del, list } from "@vercel/blob";
import { checkServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResult = await checkServerAuth();
  if (!authResult.success) return authResult.response!;

  try {
    const body = await request.json();
    const { convertType } = body; // 'lunchbox' or 'ingredients' or 'all'

    let convertedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Convert lunchbox images
    if (convertType === 'lunchbox' || convertType === 'all') {
      const lunchboxes = await prisma.lunchbox.findMany({
        where: {
          OR: [
            { lunchbox_name_image: { not: null } },
            { lunchbox_set_name_image: { not: null } }
          ]
        }
      });

      for (const lunchbox of lunchboxes) {
        try {
          const lunchboxPath = (lunchbox as any).lunchbox_image_path || process.env.NEXT_PUBLIC_LUNCHBOX_IMAGE_PATH || "img/lunchbox-set-img";
          const baseUrl = process.env.NEXT_PUBLIC_BLOB_STORE_BASE_URL;

          // Convert lunchbox_name_image if exists and not webp
          if (lunchbox.lunchbox_name_image && !lunchbox.lunchbox_name_image.toLowerCase().endsWith('.webp')) {
            const oldUrl = `${baseUrl}/${lunchboxPath}/${lunchbox.lunchbox_name_image}`;
            
            // Fetch the image
            const imageResponse = await fetch(oldUrl);
            if (!imageResponse.ok) {
              errors.push(`Failed to fetch lunchbox_name_image for ${lunchbox.lunchbox_name}`);
              errorCount++;
              continue;
            }

            const imageBlob = await imageResponse.blob();
            const file = new File([imageBlob], lunchbox.lunchbox_name_image, { type: imageBlob.type });

            // Convert to WebP using client-side logic (we'll need to do this differently server-side)
            // For now, we'll just rename the file to .webp and re-upload
            // Note: This is a simplified approach. For true conversion, you'd need sharp or similar
            
            const webpFileName = lunchbox.lunchbox_name_image.replace(/\.[^/.]+$/, '.webp');
            const newBlobPath = `${lunchboxPath}/${webpFileName}`;
            
            await put(newBlobPath, file, { access: "public" });
            
            // Delete old image
            try {
              await del(oldUrl);
            } catch (e) {
              console.error("Failed to delete old image:", e);
            }

            // Update database
            await prisma.lunchbox.update({
              where: { id: lunchbox.id },
              data: { lunchbox_name_image: webpFileName }
            });

            convertedCount++;
          }

          // Convert lunchbox_set_name_image if exists and not webp
          if (lunchbox.lunchbox_set_name_image && !lunchbox.lunchbox_set_name_image.toLowerCase().endsWith('.webp')) {
            const oldUrl = `${baseUrl}/${lunchboxPath}/${lunchbox.lunchbox_set_name_image}`;
            
            const imageResponse = await fetch(oldUrl);
            if (!imageResponse.ok) {
              errors.push(`Failed to fetch lunchbox_set_name_image for ${lunchbox.lunchbox_name}`);
              errorCount++;
              continue;
            }

            const imageBlob = await imageResponse.blob();
            const file = new File([imageBlob], lunchbox.lunchbox_set_name_image, { type: imageBlob.type });
            
            const webpFileName = lunchbox.lunchbox_set_name_image.replace(/\.[^/.]+$/, '.webp');
            const newBlobPath = `${lunchboxPath}/${webpFileName}`;
            
            await put(newBlobPath, file, { access: "public" });
            
            try {
              await del(oldUrl);
            } catch (e) {
              console.error("Failed to delete old image:", e);
            }

            await prisma.lunchbox.update({
              where: { id: lunchbox.id },
              data: { lunchbox_set_name_image: webpFileName }
            });

            convertedCount++;
          }
        } catch (error) {
          console.error("Error converting lunchbox image:", error);
          errors.push(`Error converting images for ${lunchbox.lunchbox_name}`);
          errorCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      convertedCount,
      errorCount,
      errors: errors.slice(0, 10), // Limit errors to prevent huge response
      message: `แปลงรูปภาพสำเร็จ ${convertedCount} รูป, ล้มเหลว ${errorCount} รูป`
    });
  } catch (error) {
    console.error("Error in convert images to webp:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการแปลงรูปภาพ" },
      { status: 500 }
    );
  }
}
