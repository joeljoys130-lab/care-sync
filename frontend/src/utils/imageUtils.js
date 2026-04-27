/**
 * Returns the full URL for an avatar image.
 * Handles both absolute URLs and relative paths from the backend.
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already a full URL (e.g. from a CDN or Google Auth), return it
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // Get backend URL from env or default to localhost:5000
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  // Ensure the path starts with a slash
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  
  return `${backendUrl}${cleanPath}`;
};
