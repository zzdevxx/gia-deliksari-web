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
    'bg-[#FDF0F0] dark:bg-[#331418] text-[#9A1620] dark:text-[#F2828C] ring-1 ring-inset ring-[#F5CDD0] dark:ring-[#521E25]',
  gold:
    'bg-[#FEF3C7] dark:bg-[#3A2D17] text-[#92400E] dark:text-[#FCD34D] ring-1 ring-inset ring-[#FCD34D] dark:ring-[#6B5316]',
  outline:
    'bg-transparent text-[#1F1617] dark:text-[#F5EFEB] ring-1 ring-inset ring-[#EBDDCF] dark:ring-[#3A1C20]',
  success:
    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800/40',
  warning:
    'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800/40',
  danger:
    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-200 dark:ring-red-800/40',
  neutral:
    'bg-[#F7F2E8] dark:bg-[#2A161A] text-[#5A4D4E] dark:text-[#D5C2C4] ring-1 ring-inset ring-[#EBDDCF] dark:ring-[#3A1C20]',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  iconLeft?: React.ReactNode;
}

export function Badge({
  variant = 'maroon',
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