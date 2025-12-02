const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Returns the full image URL, handling both Cloudinary URLs and local uploads
 * Returns a placeholder if no image path is provided
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return 'https://via.placeholder.com/400';
  }
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, it's a local upload - prepend API URL
  return `${API_URL}/uploads/${imagePath}`;
}
