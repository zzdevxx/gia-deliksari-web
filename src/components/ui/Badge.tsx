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
  maroon:
    'bg-[#FBF1F2] dark:bg-[#261517] text-[#8B1E28] dark:text-[#E88086] ring-1 ring-inset ring-[#E8C2C5] dark:ring-[#52252A]',
  gold:
    'bg-[#FEF9EC] dark:bg-[#2D2517] text-[#8C6826] dark:text-[#E0B85C] ring-1 ring-inset ring-[#F5DFAB] dark:ring-[#52411E]',
  outline:
    'bg-transparent text-[#1C1917] dark:text-[#F5F3EF] ring-1 ring-inset ring-[#E5DFD5] dark:ring-[#332F2B]',
  success:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800/50',
  warning:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800/50',
  danger:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-1 ring-inset ring-rose-200 dark:ring-rose-800/50',
  neutral:
    'bg-[#F3EFE6] dark:bg-[#262421] text-[#665E55] dark:text-[#A8A196] ring-1 ring-inset ring-[#E5DFD5] dark:ring-[#332F2B]',
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