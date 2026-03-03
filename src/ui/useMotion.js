import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Duration of the close animation in ms.
 * Matches the longest exit animation (bubble-out 260ms) + buffer.
 */
const CLOSE_MS = 300;

/**
 * Shared motion‑phase state machine for any animated UI surface.
 *
 * Phases: hidden → open → leaving → hidden
 * CSS keyframe animations handle the enter state themselves via `from {}`.
 * No intermediate phase needed — avoids double‑render stutter.
 *
 * @param {boolean} open – controlled open state
 * @returns {{ phase, visible, entering, leaving, requestClose }}
 */
export function useMotion(open) {
  const [phase, setPhase] = useState(open ? 'open' : 'hidden');
  const timer = useRef(null);

  useEffect(() => {
    if (open) {
      if (phase === 'hidden' || phase === 'leaving') {
        clearTimeout(timer.current);
        // Go straight to 'open' — CSS animation plays from its @keyframes 0%
        setPhase('open');
      }
    } else {
      if (phase === 'open') {
        setPhase('leaving');
        timer.current = setTimeout(() => setPhase('hidden'), CLOSE_MS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * Imperatively trigger close animation, then call `cb`.
   * Useful when the component manages its own close (e.g. click‑outside).
   */
  const requestClose = useCallback(
    (cb) => {
      if (phase === 'leaving' || phase === 'hidden') {
        cb?.();
        return;
      }
      setPhase('leaving');
      timer.current = setTimeout(() => {
        setPhase('hidden');
        cb?.();
      }, CLOSE_MS);
    },
    [phase]
  );

  return {
    phase,
    visible: phase !== 'hidden',
    entering: phase === 'open',
    leaving: phase === 'leaving',
    requestClose,
  };
}

/**
 * Focus‑trap hook — keeps TAB/Shift+TAB within `containerRef`.
 * Restores focus to previously active element on deactivation.
 */
export function useFocusTrap(containerRef, active) {
  const prevFocused = useRef(null);

  useEffect(() => {
    if (!active) return;
    prevFocused.current = document.activeElement;

    const el = containerRef.current;
    if (!el) return;

    const FOCUSABLE =
      'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const getFocusable = () => [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);

    // Auto‑focus first focusable element
    requestAnimationFrame(() => {
      const list = getFocusable();
      const auto = el.querySelector('[autofocus],[data-autofocus]');
      (auto || list[0])?.focus();
    });

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('keydown', onKey);
      prevFocused.current?.focus?.();
    };
  }, [active, containerRef]);
}

/**
 * Hook that fires `cb` when Escape key is pressed.
 */
export function useEscapeKey(cb, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        cb();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [cb, active]);
}

/**
 * Hook that fires `cb` when clicking outside `ref`.
 */
export function useClickOutside(ref, cb, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    // Use capture so we intercept before inner handlers
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [ref, cb, active]);
}
