/**
 * Image conversion utilities for WebP format
 * Converts images to WebP while maintaining quality
 */

export interface ConvertToWebPOptions {
  quality?: number; // 0.0 to 1.0, default 0.9 for high quality
  maxWidth?: number; // optional max width for resizing
  maxHeight?: number; // optional max height for resizing
}

/**
 * Convert a File object to WebP format using Canvas API
 * @param file - The image file to convert
 * @param options - Conversion options
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(
  file: File,
  options: ConvertToWebPOptions = {}
): Promise<File> {
  const { quality = 0.9, maxWidth, maxHeight } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions (respecting max dimensions if provided)
      let width = img.width;
      let height = img.height;

      if (maxWidth || maxHeight) {
        const ratio = Math.min(
          maxWidth ? maxWidth / width : 1,
          maxHeight ? maxHeight / height : 1
        );
        if (ratio < 1) {
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
      }

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Create new File with WebP extension
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.webp'),
            { type: 'image/webp' }
          );

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Check if a file is already in WebP format
 * @param file - The file to check
 * @returns boolean - True if the file is WebP
 */
export function isWebP(file: File): boolean {
  return file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
}

/**
 * Convert image to WebP only if it's not already WebP
 * @param file - The image file to potentially convert
 * @param options - Conversion options
 * @returns Promise<File> - The WebP file (converted or original)
 */
export async function ensureWebP(
  file: File,
  options?: ConvertToWebPOptions
): Promise<File> {
  if (isWebP(file)) {
    return file;
  }
  return convertToWebP(file, options);
}
