/**
 * LoadingSpinner
 *
 * Usage:
 *   <LoadingSpinner />            — default medium size
 *   <LoadingSpinner size="lg" />  — large
 *   <LoadingSpinner size="sm" />  — small
 *   <LoadingSpinner className="h-64" /> — full-height centred in parent
 */
const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <div
        className={`
          ${sizeMap[size] || sizeMap.md}
          rounded-full
          border-primary-200
          border-t-primary-600
          animate-spin
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
