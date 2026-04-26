import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Modal
 *
 * Props:
 *   isOpen  — boolean
 *   onClose — callback to close
 *   title   — string header title
 *   children
 */
const Modal = ({ isOpen, onClose, title, maxWidth = 'max-w-md', children }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh] ${maxWidth} animate-slide-up`}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
