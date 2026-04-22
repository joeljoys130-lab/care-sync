import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Pagination
 *
 * Props:
 *   currentPage  — current active page (1-indexed)
 *   totalPages   — total number of pages
 *   onPageChange — callback(newPage: number)
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  // Build a smart page list: always show first, last, and up to 3 around current
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-white/5 hover:border-primary-300 hover:bg-primary-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-400"
        aria-label="Previous page"
      >
        <FiChevronLeft />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 px-2.5 rounded-xl text-sm font-medium transition border ${
              p === currentPage
                ? 'bg-primary-600 text-white border-primary-600 shadow-2xl'
                : 'border-white/5 text-slate-400 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-white/5 hover:border-primary-300 hover:bg-primary-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-400"
        aria-label="Next page"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
