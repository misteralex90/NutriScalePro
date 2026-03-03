import { useCallback, useRef, useState } from 'react';
import { useMotion, useEscapeKey, useClickOutside } from './useMotion';

/* ── Shared glass-bubble surface style tokens ──────────────── */
const BUBBLE_PANEL_CLS =
  'bg-white/65 backdrop-blur-xl backdrop-saturate-[1.8] rounded-2xl border border-white/40';
const BUBBLE_PANEL_SHADOW =
  '0 12px 40px -8px rgba(0,0,0,0.13), 0 4px 14px -3px rgba(0,0,0,0.05), inset 0 0.5px 0 rgba(255,255,255,0.6)';

/**
 * Dropdown — anchor‑relative popover / menu.
 *
 * Motion: mo-pop-enter / mo-pop-exit with transform-origin near anchor.
 * Accessibility: aria-expanded, role="menu", ESC/click‑outside close.
 *
 * @param {ReactNode}  trigger  – render‑prop `(props, open) => <button {...props}>…</button>`
 * @param {string}     align    – 'left' | 'right' | 'center' (transform‑origin)
 * @param {string}     className – extra class on the menu panel
 */
const Dropdown = ({ trigger, children, align = 'left', className = '' }) => {
  const [open, setOpen] = useState(false);
  const { visible, entering, leaving, requestClose } = useMotion(open);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useRef(`mo-menu-${Math.random().toString(36).slice(2, 8)}`).current;

  const close = useCallback(() => {
    requestClose(() => setOpen(false));
  }, [requestClose]);

  const toggle = useCallback(() => {
    if (visible) close();
    else setOpen(true);
  }, [visible, close]);

  useEscapeKey(close, visible);
  useClickOutside(wrapRef, close, visible);

  // Keyboard navigation inside menu
  const onMenuKeyDown = useCallback(
    (e) => {
      const items = menuRef.current?.querySelectorAll('[role="menuitem"],[role="option"]');
      if (!items?.length) return;
      const list = [...items];
      const idx = list.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(idx + 1) % list.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(idx - 1 + list.length) % list.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1]?.focus();
      }
    },
    []
  );

  const origin =
    align === 'right' ? 'top right' : align === 'center' ? 'top center' : 'top left';

  const triggerProps = {
    onClick: toggle,
    'aria-haspopup': 'menu',
    'aria-expanded': visible,
    'aria-controls': visible ? menuId : undefined,
  };

  return (
    <div ref={wrapRef} className="relative inline-block">
      {trigger(triggerProps, visible)}

      {visible && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className={`absolute z-40 mt-1.5 min-w-[160px] ${BUBBLE_PANEL_CLS} py-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${entering ? 'mo-pop-enter' : leaving ? 'mo-pop-exit' : ''} ${className}`}
          style={{ transformOrigin: origin, boxShadow: BUBBLE_PANEL_SHADOW }}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
};

/**
 * DropdownItem — single menu option.
 */
export const DropdownItem = ({ children, onClick, danger = false, className = '' }) => (
  <button
    role="menuitem"
    tabIndex={-1}
    data-dropdown-item=""
    onClick={onClick}
    className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors duration-100 outline-none
      focus:bg-white/40 hover:bg-white/40 rounded-lg mx-0.5
      focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-1
      ${danger ? 'text-red-600 focus:bg-red-50/60 hover:bg-red-50/60' : 'text-slate-700'} ${className}`}
  >
    {children}
  </button>
);

/**
 * Select — custom animated select (replaces native <select>).
 *
 * Motion: reuses the same mo-pop bubble animation as Dropdown.
 * Accessibility: role="listbox" / role="option", aria-expanded, keyboard nav.
 *
 * @param {{ label: string, value: string }[]} options
 * @param {string}   value        – currently selected value
 * @param {function} onChange      – (value) => void
 * @param {string}   placeholder   – shown when no value selected
 * @param {string}   align         – 'left' | 'right'
 * @param {string}   className     – extra class on root element
 * @param {string}   panelClassName – extra class on the options panel
 */
export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleziona…',
  align = 'left',
  className = '',
  panelClassName = '',
}) => {
  const [open, setOpen] = useState(false);
  const { visible, entering, leaving, requestClose } = useMotion(open);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);
  const listId = useRef(`mo-lb-${Math.random().toString(36).slice(2, 8)}`).current;

  const close = useCallback(() => {
    requestClose(() => setOpen(false));
  }, [requestClose]);

  const toggle = useCallback(() => {
    if (visible) close();
    else setOpen(true);
  }, [visible, close]);

  const select = useCallback(
    (val) => {
      onChange?.(val);
      requestClose(() => {
        setOpen(false);
        // Return focus to trigger after selection
        btnRef.current?.focus();
      });
    },
    [onChange, requestClose]
  );

  useEscapeKey(close, visible);
  useClickOutside(wrapRef, close, visible);

  // Keyboard navigation
  const onKeyDown = useCallback(
    (e) => {
      const items = listRef.current?.querySelectorAll('[role="option"]');
      if (!items?.length) return;
      const list = [...items];
      const idx = list.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!visible) { setOpen(true); return; }
        list[(idx + 1) % list.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!visible) { setOpen(true); return; }
        list[(idx - 1 + list.length) % list.length]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!visible) { e.preventDefault(); setOpen(true); }
        else if (idx >= 0) {
          e.preventDefault();
          const val = list[idx].dataset.value;
          if (val !== undefined) select(val);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1]?.focus();
      }
    },
    [visible, select]
  );

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;
  const origin =
    align === 'right' ? 'top right' : align === 'center' ? 'top center' : 'top left';

  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`} onKeyDown={onKeyDown}>
      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={visible}
        aria-controls={visible ? listId : undefined}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-300
          text-sm text-left bg-white
          focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100
          hover:border-slate-400
          transition-colors duration-150 outline-none
          ${value ? 'text-slate-800' : 'text-slate-400'}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${visible ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Listbox panel */}
      {visible && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={value ? `${listId}-${value}` : undefined}
          className={`absolute z-40 mt-1.5 w-full min-w-[140px] ${BUBBLE_PANEL_CLS} py-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${entering ? 'mo-pop-enter' : leaving ? 'mo-pop-exit' : ''} ${panelClassName}`}
          style={{ transformOrigin: origin, boxShadow: BUBBLE_PANEL_SHADOW }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                id={`${listId}-${opt.value}`}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                data-value={opt.value}
                data-dropdown-item=""
                onClick={() => select(opt.value)}
                className={`w-full text-left px-3.5 py-2.5 text-sm rounded-lg mx-0.5
                  transition-colors duration-100 outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-1
                  ${isSelected
                    ? 'bg-cyan-50/70 text-cyan-800 font-medium'
                    : 'text-slate-700 hover:bg-white/40 focus:bg-white/40'
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
