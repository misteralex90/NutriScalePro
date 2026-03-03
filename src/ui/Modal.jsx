import { useCallback, useEffect, useRef } from 'react';
import { useMotion, useFocusTrap, useEscapeKey } from './useMotion';

/**
 * Modal — accessible, animated dialog.
 *
 * Motion: bubble enter / exit from motion.css
 * Accessibility: role="dialog", aria-modal, focus trap, ESC closes.
 */
const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const { visible, entering, leaving, requestClose } = useMotion(open);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const titleId = useRef(`mo-dlg-${Math.random().toString(36).slice(2, 8)}`).current;

  const handleClose = useCallback(() => {
    requestClose(onClose);
  }, [requestClose, onClose]);

  // ESC → close
  useEscapeKey(handleClose, visible);

  // Focus trap when visible
  useFocusTrap(panelRef, entering);

  // Lock body scroll
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
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
        className={`${maxWidth} w-full bg-white/70 backdrop-blur-3xl backdrop-saturate-[1.8] rounded-3xl border border-white/50 p-6 ${
          entering ? 'mo-bubble-enter' : leaving ? 'mo-bubble-exit' : ''
        }`}
        style={{
          boxShadow:
            '0 24px 80px -16px rgba(0,0,0,0.18), 0 8px 24px -6px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.7), inset 0 -0.5px 0 rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center gap-2 mb-4" id={titleId}>
            <div className="w-1 h-5 rounded-full bg-cyan-500" />
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
        )}
        {typeof children === 'function' ? children(handleClose) : children}
      </div>
    </div>
  );
};

export default Modal;
