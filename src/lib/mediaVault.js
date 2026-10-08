import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../config/Firebase-temp";

// In-memory cache for resolved media Blob URLs
const mediaBlobCache = new Map();

/**
 * Formats bytes into human-readable string (KB, MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Detects if a file is a video by MIME type or file extension
 */
export const isVideoFile = (file) => {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("video/")) return true;
  if (
    type.includes("mp4") ||
    type.includes("webm") ||
    type.includes("quicktime") ||
    type.includes("matroska") ||
    type.includes("avi") ||
    type.includes("x-msvideo") ||
    type.includes("3gpp") ||
    type.includes("x-flv")
  ) {
    return true;
  }
  const name = (file.name || "").toLowerCase();
  return /\.(mp4|webm|mov|mkv|avi|3gp|flv|wmv|m4v|ts|ogv|m4p|mpg|mpeg|mpe)$/i.test(name);
};

/**
 * Cache a local blob URL for a media URI
 */
export const cacheMediaUrl = (mediaUri, blobUrl) => {
  if (mediaUri && blobUrl) {
    mediaBlobCache.set(mediaUri, blobUrl);
  }
};

/**
 * Convert a File/Blob chunk into Base64 string
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result;
      if (typeof res === "string") {
        const base64 = res.split(",")[1] || "";
        resolve(base64);
      } else {
        reject(new Error("Failed to read chunk as Data URL"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert Base64 string back into Blob
 */
const base64ToBlob = (base64, mimeType = "video/mp4") => {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: mimeType });
};

/**
 * Save video into Firestore chunked media vault with real-time progress.
 * Each chunk is ~450 KB binary (approx 600 KB base64), well below Firestore's 1MB limit.
 */
export const saveVideoToVault = async (file, onProgress, abortSignal) => {
  const CHUNK_SIZE = 450 * 1024; // 450 KB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1;
  const mediaId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mediaUri = `firestore-media://${mediaId}`;

  // Store local object URL in cache immediately for instant playback by sender
  try {
    const localBlobUrl = URL.createObjectURL(file);
    cacheMediaUrl(mediaUri, localBlobUrl);
  } catch (e) {
    console.warn("Could not cache local blob url:", e);
  }

  if (abortSignal?.aborted) {
    throw new Error("Upload aborted by user");
  }

  // Initial progress update (5%)
  if (onProgress) {
    onProgress({
      percent: 5,
      loaded: 0,
      total: file.size,
      stage: "uploading",
    });
  }

  // 1. Create master record
  await setDoc(doc(db, "media_vault", mediaId), {
    mediaId,
    name: file.name || "video.mp4",
    mimeType: file.type || "video/mp4",
    size: file.size,
    totalChunks,
    createdAt: new Date(),
  });

  if (onProgress) {
    onProgress({
      percent: 10,
      loaded: Math.round(file.size * 0.1),
      total: file.size,
      stage: "uploading",
    });
  }

  // 2. Upload chunks in parallel batches of 3
  const BATCH_SIZE = 3;
  let uploadedChunksCount = 0;

  for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
    if (abortSignal?.aborted) {
      throw new Error("Upload aborted by user");
    }

    const batchIndices = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, totalChunks); j++) {
      batchIndices.push(j);
    }

    await Promise.all(
      batchIndices.map(async (chunkIndex) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end, file.type || "video/mp4");
        const chunkBase64 = await blobToBase64(chunkBlob);

        const chunkDocRef = doc(db, "media_vault", mediaId, "chunks", chunkIndex.toString());
        await setDoc(chunkDocRef, {
          index: chunkIndex,
          data: chunkBase64,
          size: chunkBlob.size,
        });

        uploadedChunksCount++;
        if (onProgress) {
          const percent = Math.min(98, 10 + Math.round((uploadedChunksCount / totalChunks) * 88));
          onProgress({
            percent,
            loaded: Math.min(file.size, uploadedChunksCount * CHUNK_SIZE),
            total: file.size,
            stage: "uploading",
          });
        }
      })
    );
  }

  if (onProgress) {
    onProgress({
      percent: 100,
      loaded: file.size,
      total: file.size,
      stage: "complete",
    });
  }

  return mediaUri;
};

/**
 * Resolves a media URI (firestore-media:// or direct URL) to a playable browser URL
 */
export const resolveMediaUrl = async (src) => {
  if (!src || typeof src !== "string") return "";

  // 1. Direct URLs
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  // 2. Check memory cache
  if (mediaBlobCache.has(src)) {
    return mediaBlobCache.get(src);
  }

  // 3. Firestore media vault: firestore-media://{mediaId}
  if (src.startsWith("firestore-media://")) {
    const mediaId = src.replace("firestore-media://", "").trim();
    if (!mediaId) return "";

    try {
      const masterSnap = await getDoc(doc(db, "media_vault", mediaId));
      const mimeType = masterSnap.exists() ? masterSnap.data().mimeType || "video/mp4" : "video/mp4";

      const chunksQuery = query(collection(db, "media_vault", mediaId, "chunks"), orderBy("index", "asc"));
      const chunksSnap = await getDocs(chunksQuery);

      if (chunksSnap.empty) {
        console.warn("No video chunks found for:", mediaId);
        return "";
      }

      const blobs = chunksSnap.docs.map((docSnap) => {
        const chunkData = docSnap.data();
        return base64ToBlob(chunkData.data, mimeType);
      });

      const fullBlob = new Blob(blobs, { type: mimeType });
      const objectUrl = URL.createObjectURL(fullBlob);

      mediaBlobCache.set(src, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error("Error resolving firestore-media URI:", err);
      return "";
    }
  }

  return src;
};

/**
 * Upload video with real-time continuous progress.
 * Directly stores via Firestore chunked media vault (safe from Cloudinary permission/quota errors).
 */
export const uploadVideoWithProgress = async (file, onProgress, abortSignal) => {
  if (!file) throw new Error("No file selected");

  // Validate video file size: 50MB safety limit
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(`Video is too large (${formatFileSize(file.size)}). Maximum supported size is 50 MB.`);
  }

  if (onProgress) {
    onProgress({
      percent: 2,
      loaded: 0,
      total: file.size,
      stage: "uploading",
    });
  }

  const vaultUri = await saveVideoToVault(file, onProgress, abortSignal);
  return vaultUri;
};
 