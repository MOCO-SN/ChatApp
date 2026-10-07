import { uploadDocument } from "../api/service";

/**
 * Compresses an image file before upload or fallback using HTML5 Canvas.
 * Keeps aspect ratio within maxDimension (1280px) and compresses to webp/jpeg.
 */
const compressImage = (file, maxDimension = 1280, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file to Cloudinary securely via our backend proxy with automatic fallback.
 * If Cloudinary permissions (actions=["create"]) or quota limits trigger an error,
 * it seamlessly falls back to optimized Data URLs so media never fails to send.
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided");

  // 1. For Images (photos, attachments, avatars)
  if (file.type && file.type.startsWith("image/")) {
    try {
      const compressedDataUrl = await compressImage(file);
      if (!compressedDataUrl) throw new Error("Could not process image");

      try {
        const result = await uploadDocument(compressedDataUrl);

        if (result && !result.error && (result.secure_url || result.url)) {
          return result.secure_url || result.url;
        }

        if (
          typeof result === "string" &&
          !result.includes("error") &&
          !result.includes("forbidden") &&
          (result.startsWith("http://") || result.startsWith("https://"))
        ) {
          return result;
        }

        console.warn(
          "Cloudinary upload returned error or forbidden, using optimized local Data URL fallback:",
          result?.error || result
        );
        return compressedDataUrl;
      } catch (uploadErr) {
        console.warn("Cloudinary network upload failed, using optimized local Data URL fallback:", uploadErr);
        return compressedDataUrl;
      }
    } catch (err) {
      console.error("Image processing error:", err);
      throw err;
    }
  }

  // 2. For Audio / Voice recordings (Direct method, uncompressed)
  if (file.type && file.type.startsWith("audio/")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const directAudioData = reader.result;
        try {
          const result = await uploadDocument(directAudioData);
          if (result && !result.error && (result.secure_url || result.url)) {
            resolve(result.secure_url || result.url);
            return;
          }
          if (
            typeof result === "string" &&
            !result.includes("error") &&
            !result.includes("forbidden") &&
            (result.startsWith("http://") || result.startsWith("https://"))
          ) {
            resolve(result);
            return;
          }
          resolve(directAudioData);
        } catch (err) {
          console.warn("Direct audio upload fallback:", err);
          resolve(directAudioData);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // 3. For Videos & Other Documents / Attachments
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64File = reader.result;
      try {
        const result = await uploadDocument(base64File);

        if (result && !result.error && (result.secure_url || result.url)) {
          resolve(result.secure_url || result.url);
          return;
        }

        if (
          typeof result === "string" &&
          !result.includes("error") &&
          !result.includes("forbidden") &&
          (result.startsWith("http://") || result.startsWith("https://"))
        ) {
          resolve(result);
          return;
        }

        if (file.size <= 8 * 1024 * 1024) {
          console.warn(
            "Cloudinary upload forbidden/error, using Data URL fallback for media:",
            result?.error || result
          );
          resolve(base64File);
          return;
        }

        throw new Error(result?.error?.message || result?.error || "Cloudinary upload service unavailable");
      } catch (err) {
        if (file.size <= 8 * 1024 * 1024) {
          console.warn("Cloudinary upload failed, using Data URL fallback for media:", err);
          resolve(base64File);
        } else {
          reject(err);
        }
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
