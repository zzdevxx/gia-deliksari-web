import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Button — consistent CTA styles.
 *
 * Variants (max 1 primary per screen):
 *   - primary : primary CTA (Lihat Warta, Submit) — Sacred Wine
 *   - neutral : secondary CTA (Login, Save) — cool slate
 *   - outline : tertiary CTA (Cancel, Detail)
 *   - ghost   : minimal (Lewati, Skip)
 *
 * Colours come from the semantic tokens in globals.css, so light/dark and any
 * future palette change happen in one place. Never hardcode a hex here.
 *
 * Sizes match 8pt grid:
 *   - sm : h-8 / text-[13px]
 *   - md : h-10 / text-sm
 *   - lg : h-12 / text-base
 *
 * States: default, hover, active (scale-0.97), focus (wine ring),
 * disabled (50% opacity), loading (auto-disabled + triple-dot pulse).
 */

type Variant = 'primary' | 'neutral' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-all duration-200 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ' +
  'active:scale-[0.97] active:translate-y-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100';

const VARIANT_MAP: Record<Variant, string> = {
  primary:
    'bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white ' +
    // Dark CTA fill (#B8323D) sits at 2.95:1 against the card surface, so it
    // needs an explicit boundary to satisfy WCAG 1.4.11 in dark mode.
    'dark:border dark:border-[var(--border-strong)]',
  neutral:
    'bg-[var(--ink-strong)] hover:bg-[var(--ink-strong)] text-white dark:bg-[var(--muted-foreground)] dark:text-[var(--card-inverted-bg)] dark:hover:bg-[var(--ink-strong)]',
  outline:
    'border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--surface-raised)]',
  ghost:
    'text-[var(--foreground)] hover:bg-[var(--surface-raised)]',
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
    variant = 'primary',
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