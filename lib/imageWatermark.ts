/**
 * Image Watermark Utility
 * Applies watermark image from public folder to property images before upload
 */

const WATERMARK_PATH = "/watermark.png";

/**
 * Applies a watermark image to a photo using Canvas API
 * @param imageFile - The original image file
 * @returns A Promise resolving to a watermarked File
 */
export async function applyWatermark(imageFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const watermarkImg = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    let mainLoaded = false;
    let watermarkLoaded = false;

    const tryDraw = () => {
      if (!mainLoaded || !watermarkLoaded) return;

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Calculate watermark size (scale to fit, max 20% of image width)
      const maxWatermarkWidth = img.width * 0.25;
      const scale = Math.min(maxWatermarkWidth / watermarkImg.width, 1);
      const watermarkWidth = watermarkImg.width * scale;
      const watermarkHeight = watermarkImg.height * scale;

      // Position: bottom-right corner with padding
      const padding = Math.max(img.width * 0.02, 15);
      const x = img.width - watermarkWidth - padding;
      const y = img.height - watermarkHeight - padding;

      // Draw watermark with slight transparency
      ctx.globalAlpha = 0.85;
      ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0;

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create blob from canvas"));
            return;
          }

          // Create new File with watermark
          const watermarkedFile = new File([blob], imageFile.name, {
            type: imageFile.type || "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(watermarkedFile);
        },
        imageFile.type || "image/jpeg",
        0.92 // Quality for JPEG
      );
    };

    // Load watermark image from public folder
    watermarkImg.onload = () => {
      watermarkLoaded = true;
      tryDraw();
    };
    watermarkImg.onerror = () => {
      reject(new Error("Failed to load watermark image"));
    };
    watermarkImg.src = WATERMARK_PATH;

    // Load main image
    img.onload = () => {
      mainLoaded = true;
      tryDraw();
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Applies watermark to multiple images
 * @param imageFiles - Array of image files
 * @returns Promise resolving to array of watermarked files
 */
export async function applyWatermarkToAll(imageFiles: File[]): Promise<File[]> {
  const watermarkedFiles: File[] = [];

  for (const file of imageFiles) {
    try {
      const watermarkedFile = await applyWatermark(file);
      watermarkedFiles.push(watermarkedFile);
    } catch (error) {
      console.error(`Failed to watermark ${file.name}:`, error);
      // Fall back to original file if watermarking fails
      watermarkedFiles.push(file);
    }
  }

  return watermarkedFiles;
}
