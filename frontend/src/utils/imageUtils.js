/**
 * Returns the full URL for an avatar image.
 * Handles both absolute URLs and relative paths from the backend.
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already a full URL (e.g. from a CDN or Google Auth), return it
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // If it's an upload path, we can use a relative path to leverage the Vite proxy
  // This is safer than hardcoding the port
  if (avatarPath.includes('uploads/')) {
    return avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  }

  // Fallback to absolute URL if needed (e.g. for production)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  
  return `${backendUrl}${cleanPath}`;
};
