import { FiStar } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';

const StarRating = ({ rating, size = 'sm', interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }[size];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={`${sizeClass} transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          {star <= rating ? (
            <MdStar className="text-amber-400" />
          ) : (
            <MdStar className="text-slate-200" />
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
