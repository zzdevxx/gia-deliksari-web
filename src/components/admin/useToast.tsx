'use client';

import { useState, useCallback, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const TOAST_DURATION_MS = 3500;

/**
 * Lightweight toast hook for transient feedback in admin pages.
 * Returns:
 *   - toastMessage: current toast string or null
 *   - showToast(msg): trigger a toast
 *   - ToastView: JSX element to render (place once near the root)
 *
 * Self-dismisses after TOAST_DURATION_MS. Multiple showToast calls reset
 * the timer so the latest message stays visible.
 */
export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toastMessage]);

  const ToastView = toastMessage ? (
    <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#150B0D] text-white border border-[#3A1C20] shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-300">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  ) : null;

  return { toastMessage, showToast, ToastView };
}