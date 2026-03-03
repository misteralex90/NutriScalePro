import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast system — context provider + hook.
 *
 * Motion: mo-toast-enter / mo-toast-exit from motion.css.
 * Position: bottom‑center, stacked.
 */

const ToastContext = createContext(null);

const ICONS = {
  success: <Check size={15} className="text-emerald-600" />,
  error: <AlertTriangle size={15} className="text-red-600" />,
  info: <Info size={15} className="text-cyan-600" />,
};

let _toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const toast = useCallback(
    (message, { variant = 'info', duration = 3500 } = {}) => {
      const id = ++_toastId;
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — fixed bottom center */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col-reverse items-center gap-2 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/65 backdrop-blur-3xl backdrop-saturate-[1.8] border border-white/50 text-sm text-slate-800 ${
                t.leaving ? 'mo-toast-exit' : 'mo-toast-enter'
              }`}
              style={{
                boxShadow: '0 12px 32px -6px rgba(0,0,0,0.14), 0 4px 12px -2px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.6)',
              }}
            >
              {ICONS[t.variant]}
              <span className="max-w-xs">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Chiudi notifica"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

/**
 * Hook to fire toasts.
 *
 * Usage:
 *   const toast = useToast();
 *   toast('Salvato con successo', { variant: 'success' });
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
