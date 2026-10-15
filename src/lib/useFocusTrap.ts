'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Keyboard containment for modal dialogs (WCAG 2.4.3 Focus Order, 2.1.2 No
 * Keyboard Trap — in the "trap within a dialog, release on close" sense).
 *
 * Behaviour, in the order it matters to a screen-reader user:
 *   1. Remember what was focused before opening.
 *   2. Move focus into the dialog (first focusable, else the container).
 *   3. Keep Tab / Shift+Tab cycling inside the dialog.
 *   4. On close, restore focus to the trigger.
 *
 * `active` toggles the trap without unmounting the container — every dialog in
 * this app renders its shell conditionally, but the hook stays correct either
 * way. Returns the ref to attach to the dialog element.
 *
 * The container needs `tabIndex={-1}` so it can receive focus when it holds no
 * focusable children yet (e.g. a loading state inside a modal).
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void,
): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

    const getFocusable = (root: HTMLElement): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');
      return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    };

    // Focus the first interactive element; fall back to the container itself.
    const node = containerRef.current;
    if (node) {
      const focusables = getFocusable(node);
      (focusables[0] ?? node).focus({ preventScroll: true });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const root = containerRef.current;
      if (!root) return;

      const focusables = getFocusable(root);
      if (focusables.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (activeEl === first || activeEl === root)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [active, onEscape]);

  return containerRef;
}
