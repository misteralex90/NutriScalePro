import { useCallback, useRef, useState } from 'react';

/**
 * Tooltip — hover/focus activated tip bubble.
 *
 * Motion: mo-tip-enter / mo-tip-exit from motion.css.
 * Accessibility: role="tooltip", aria-describedby.
 *
 * @param {string}    content   – tooltip text
 * @param {string}    position  – 'top' | 'bottom' | 'left' | 'right'
 * @param {ReactNode} children  – single child (must accept event handlers)
 */
const Tooltip = ({ content, children, position = 'top', className = '' }) => {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);
  const leaveTimer = useRef(null);
  const tipId = useRef(`mo-tip-${Math.random().toString(36).slice(2, 8)}`).current;

  const open = useCallback(() => {
    clearTimeout(leaveTimer.current);
    clearTimeout(timer.current);
    setLeaving(false);
    timer.current = setTimeout(() => setShow(true), 120); // slight delay
  }, []);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    if (!show) { setShow(false); return; }
    setLeaving(true);
    leaveTimer.current = setTimeout(() => {
      setShow(false);
      setLeaving(false);
    }, 140);
  }, [show]);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <span aria-describedby={show ? tipId : undefined}>
        {children}
      </span>

      {show && (
        <span
          id={tipId}
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium shadow-lg pointer-events-none ${
            posClasses[position] || posClasses.top
          } ${leaving ? 'mo-tip-exit' : 'mo-tip-enter'} ${className}`}
          style={{
            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
