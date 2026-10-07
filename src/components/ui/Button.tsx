import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Button — consistent CTA styles.
 *
 * Variants (use exactly these 4, max 1 primary per screen):
 *   - gold   : primary CTA (Lihat Warta, Submit)
 *   - maroon : secondary CTA (Login, Save)
 *   - outline: tertiary CTA (Cancel, Detail)
 *   - ghost  : minimal (Lewati, Skip)
 *
 * Sizes match 8pt grid:
 *   - sm : h-8 / text-[13px]
 *   - md : h-10 / text-sm
 *   - lg : h-12 / text-base
 *
 * States: default, hover (-translate-y-0.5), active (scale-0.97), focus (gold ring),
 * disabled (50% opacity), loading (auto-disabled + triple-dot pulse).
 */

type Variant = 'gold' | 'maroon' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-all duration-200 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6826] dark:focus-visible:ring-[#C49B45] focus-visible:ring-offset-2 ' +
  'active:scale-[0.97] active:translate-y-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100';

const VARIANT_MAP: Record<Variant, string> = {
  gold:
    'bg-[#8C6826] hover:bg-[#75561E] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-[#C49B45] dark:text-[#141312] dark:hover:bg-[#B38C38]',
  maroon:
    'bg-[#8B1E28] hover:bg-[#731820] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-[#C04050] dark:hover:bg-[#AC3543]',
  outline:
    'border border-[#E5DFD5] dark:border-[#332F2B] text-[#1C1917] dark:text-[#F5F3EF] hover:bg-[#F3EFE6] dark:hover:bg-[#262421]',
  ghost:
    'text-[#1C1917] dark:text-[#F5F3EF] hover:bg-[#F3EFE6] dark:hover:bg-[#262421]',
};

const SIZE_MAP: Record<Size, string> = {
  sm: 'h-8 px-4 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

type LinkButtonProps = CommonProps & {
  as: 'link';
  href: string;
  external?: boolean;
  prefetch?: boolean;
};

type NativeButtonProps = CommonProps & {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

type ButtonComponentProps = LinkButtonProps | NativeButtonProps;

function classes(
  variant: Variant,
  size: Size,
  fullWidth: boolean,
  loading: boolean,
  extra?: string,
) {
  return cn(
    BASE,
    VARIANT_MAP[variant],
    SIZE_MAP[size],
    fullWidth && 'w-full',
    loading && 'cursor-wait',
    extra,
  );
}

function LoadingDot() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
    </span>
  );
}

export function Button(props: ButtonComponentProps) {
  const {
    variant = 'gold',
    size = 'md',
    className,
    children,
    iconLeft,
    iconRight,
    loading = false,
    fullWidth = false,
  } = props;

  const inner = (
    <>
      {loading ? <LoadingDot /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </>
  );

  const computedClasses = classes(variant, size, fullWidth, loading, className);

  if (props.as === 'link') {
    const { href, external, prefetch } = props;
    const linkProps = {
      'aria-busy': loading || undefined,
      'aria-disabled': loading || undefined,
    };
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={computedClasses} {...linkProps}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} prefetch={prefetch} className={computedClasses} {...linkProps}>
        {inner}
      </Link>
    );
  }

  const { type = 'button', disabled, onClick, ariaLabel } = props;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={computedClasses}
    >
      {inner}
    </button>
  );
}