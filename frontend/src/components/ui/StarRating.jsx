import { FiStar } from 'react-icons/fi';

/**
 * StarRating
 *
 * Props:
 *   rating    — number (e.g. 4.3)
 *   max       — max stars (default 5)
 *   size      — 'sm' | 'md' | 'lg' (default 'md')
 *   showValue — whether to show numeric value next to stars (default true)
 *   count     — optional review count to show
 */
const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const StarRating = ({ rating = 0, max = 5, size = 'md', showValue = true, count }) => {
  const clamped = Math.min(Math.max(Number(rating) || 0, 0), max);

  return (
    <div className={`flex items-center gap-1 ${sizeMap[size]}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(clamped);
        const partial = !filled && i < clamped; // e.g. 4.3 → 5th star is partial

        return (
          <span key={i} className="relative inline-block">
            {/* Empty star base */}
            <FiStar className="text-slate-200" />
            {/* Filled overlay */}
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${(clamped % 1) * 100}%` }}
              >
                <FiStar className="text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}

      {showValue && (
        <span className="text-slate-400 font-medium ml-1 tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-slate-400 text-sm">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
