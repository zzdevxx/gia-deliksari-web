import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Badge — small status / category label.
 * Variants match brand colors:
 *   - maroon  : primary highlight (Pinned, Utama)
 *   - gold    : secondary highlight (Featured, Service time)
 *   - outline : neutral label (Kategori)
 *   - success : positive status (Active, Selesai)
 *   - warning : attention (Pending)
 *   - danger  : error state (Nonaktif, Failed)
 *   - neutral : default muted (Author)
 */
type Variant = 'maroon' | 'gold' | 'outline' | 'success' | 'warning' | 'danger' | 'neutral';

const VARIANT_MAP: Record<Variant, string> = {
  // Dark used to pair --brand-text (#F08AA4, pink) with --brand-tint-ink
  // (#FBF1F2, near-white) as the fill — pink on white, ~2.1:1, unreadable.
  // The tinted page is --brand-tint (#401A20 dark wine); against it the rose
  // text clears AA at 8.35:1, which is the pairing the light theme already uses.
  maroon:
    'bg-[var(--brand-tint)] dark:bg-[var(--brand-tint)] text-[var(--brand-text)] dark:text-[var(--brand-text)] ring-1 ring-inset ring-[var(--brand-tint-border)] dark:ring-[var(--brand-tint-border)]',
  gold:
    'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border-strong)] dark:ring-[var(--border-strong)]',
  outline:
    'bg-transparent text-[var(--foreground)] dark:text-[var(--foreground)] ring-1 ring-inset ring-[var(--border-strong)] dark:ring-[var(--border-strong)]',
  success:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800/50',
  warning:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800/50',
  danger:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-1 ring-inset ring-rose-200 dark:ring-rose-800/50',
  neutral:
    'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border-strong)] dark:ring-[var(--border-strong)]',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  iconLeft?: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  className,
  children,
  iconLeft,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        VARIANT_MAP[variant],
        className,
      )}
      {...rest}
    >
      {iconLeft}
      {children}
    </span>
  );
}