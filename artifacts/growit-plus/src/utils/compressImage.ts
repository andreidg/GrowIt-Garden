/**
 * compressImage — client-side image compression using Canvas.
 *
 * Resizes to at most maxPx on the longest side and encodes as JPEG.
 * Returns a plain base64 string (no data:... prefix) ready for the API.
 */

export interface CompressResult {
  base64:        string;
  widthPx:       number;
  heightPx:      number;
  originalBytes: number;
  compressedBytes: number;
}

export async function compressImage(
  file: File,
  maxPx   = 800,
  quality = 0.72,
): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const originalBytes = file.size;
    const objectUrl     = URL.createObjectURL(file);
    const img           = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxPx || h > maxPx) {
        if (w >= h) { h = Math.round(h * maxPx / w); w = maxPx; }
        else        { w = Math.round(w * maxPx / h); h = maxPx; }
      }

      const canvas  = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas 2D not available")); return; }

      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      // Strip the "data:image/jpeg;base64," prefix
      const base64  = dataUrl.split(",")[1] ?? "";
      const compressedBytes = Math.round(base64.length * 0.75); // base64 → bytes

      resolve({ base64, widthPx: w, heightPx: h, originalBytes, compressedBytes });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}
