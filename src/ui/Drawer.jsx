import { useCallback, useEffect, useRef } from 'react';
import { useMotion, useFocusTrap, useEscapeKey } from './useMotion';
import { X } from 'lucide-react';

/**
 * Drawer — slide‑in panel from left or right.
 *
 * Motion: mo-drawer-enter-{side} / mo-drawer-exit-{side} from motion.css.
 * Accessibility: role="dialog", aria-modal, focus trap, ESC closes.
 */
const Drawer = ({ open, onClose, title, children, side = 'right', width = 'max-w-sm' }) => {
  const { visible, entering, leaving, requestClose } = useMotion(open);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const titleId = useRef(`mo-drawer-${Math.random().toString(36).slice(2, 8)}`).current;

  const handleClose = useCallback(() => {
    requestClose(onClose);
  }, [requestClose, onClose]);

  useEscapeKey(handleClose, visible);
  useFocusTrap(panelRef, entering);

  // Lock body scroll
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  if (!visible) return null;

  const isRight = side === 'right';

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex ${isRight ? 'justify-end' : 'justify-start'} ${
        entering ? 'mo-overlay-enter' : leaving ? 'mo-overlay-exit' : ''
      }`}
      style={{
        backgroundColor: 'var(--mo-backdrop-bg)',
        backdropFilter: `blur(var(--mo-backdrop-blur))`,
        WebkitBackdropFilter: `blur(var(--mo-backdrop-blur))`,
      }}
      onClick={(e) => e.target === backdropRef.current && handleClose()}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`${width} w-full h-full bg-white/[0.98] backdrop-blur-2xl shadow-xl border-l border-white/70 flex flex-col ${
          isRight
            ? entering ? 'mo-drawer-enter-right' : leaving ? 'mo-drawer-exit-right' : ''
            : entering ? 'mo-drawer-enter-left' : leaving ? 'mo-drawer-exit-left' : ''
        }`}
        style={{
          boxShadow: isRight
            ? '-16px 0 40px -8px rgba(0,0,0,0.12)'
            : '16px 0 40px -8px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          {title && (
            <h3 id={titleId} className="text-lg font-bold text-slate-800">{title}</h3>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Chiudi pannello"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {typeof children === 'function' ? children(handleClose) : children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
