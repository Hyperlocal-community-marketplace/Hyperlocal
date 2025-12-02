const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Returns the full image URL, handling both Cloudinary URLs and local uploads
 */
export function getImageUrl(imagePath: string | null | undefined): string | undefined {
  if (!imagePath) return undefined;
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, it's a local upload - prepend API URL
  return `${API_URL}/uploads/${imagePath}`;
}
