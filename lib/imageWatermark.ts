/**
 * Image Watermark Utility
 * Adds "Ghardaar24" watermark to property images before upload
 */

/**
 * Applies a watermark to an image file using Canvas API
 * @param imageFile - The original image file
 * @returns A Promise resolving to a watermarked File
 */
export async function applyWatermark(imageFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark text style
      const fontSize = Math.max(img.width * 0.04, 24); // Responsive font size, min 24px
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;

      // Watermark text
      const watermarkText = "Ghardaar24";
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // Position: bottom-right corner with padding
      const padding = Math.max(img.width * 0.02, 15);
      const x = img.width - textWidth - padding;
      const y = img.height - padding;

      // Draw semi-transparent background for better visibility
      const bgPadding = 8;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(
        x - bgPadding,
        y - textHeight,
        textWidth + bgPadding * 2,
        textHeight + bgPadding
      );

      // Draw watermark text with white color
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(watermarkText, x, y);

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
