
import { uploadDocument } from "../api/service";

/**
 * Uploads a file to Cloudinary securely via our PHP backend proxy.
 * This completely hides our Cloudinary credentials from the frontend!
 */
export const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Convert the File object to a Base64 string for secure transport
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const base64File = reader.result;
        
        // Pass the base64 string to our secure PHP backend via apiService
        const result = await uploadDocument(base64File);
        
        if (result.error) {
          throw new Error(result.error.message || 'Unknown Cloudinary error');
        }
        
        resolve(result); // The PHP backend returns the exact Cloudinary JSON response
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => reject(error);
  });
};


