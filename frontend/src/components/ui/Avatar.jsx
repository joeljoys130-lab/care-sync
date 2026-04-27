import { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../utils/imageUtils.js';

/**
 * A robust Avatar component that handles image loading errors gracefully
 * by falling back to a name-based initial.
 */
const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [error, setError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-20 h-20 text-3xl',
    xl: 'w-32 h-32 text-5xl',
  };

  const finalUrl = getAvatarUrl(src);

  // If there's no URL or an error occurred, show initials
  if (!finalUrl || error) {
    return (
      <div className={`${sizeClasses[size] || size} rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-700 dark:text-primary-400 border border-slate-200 dark:border-slate-700 ${className}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size] || size} rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 ${className}`}>
      <img
        src={finalUrl}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default Avatar;
