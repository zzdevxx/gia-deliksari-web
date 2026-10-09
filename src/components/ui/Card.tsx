import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Card + LinkCard — editorial surface for content blocks.
 *
 * Variants:
 *   - elevated : default, shadow-sm + border
 *   - flat     : no shadow, just border
 *   - outlined : transparent, border only
 *   - inverted : maroon gradient bg
 *
 * Implementation split:
 *   - Card      : <div>/<article>/<li> with HTMLAttributes
 *   - LinkCard  : <a> with AnchorHTMLAttributes (separate for strict typing)
 */

type Variant = 'elevated' | 'flat' | 'outlined' | 'inverted';

const VARIANT_MAP: Record<Variant, string> = {
  elevated:
    'bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs',
  flat: 'bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border border-[var(--border)]/80 dark:border-[var(--border)]/80',
  outlined: 'bg-transparent border border-[var(--border)] dark:border-[var(--border)]',
  inverted: 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--ink-strong)]/30',
};

const BASE_CLASSES =
  'block rounded-2xl overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none';

interface CardBaseProps {
  variant?: Variant;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

function cardClasses(variant: Variant, hoverable: boolean, extra?: string) {
  return cn(
    BASE_CLASSES,
    VARIANT_MAP[variant],
    hoverable &&
      'hover:-translate-y-0.5 hover:shadow-sm hover:border-[var(--ink-strong)]/50 motion-reduce:hover:translate-y-0',
    extra,
  );
}

interface CardProps
  extends CardBaseProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className'> {
  as?: 'div' | 'article' | 'li';
}

export function Card({
  variant = 'elevated',
  hoverable = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag className={cardClasses(variant, hoverable, className)} {...rest}>
      {children}
    </Tag>
  );
}

interface LinkCardProps extends CardBaseProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> {
  href: string;
}

export function LinkCard({
  variant = 'elevated',
  hoverable = false,
  className,
  children,
  ...rest
}: LinkCardProps) {
  return (
    <a className={cardClasses(variant, hoverable, className)} {...rest}>
      {children}
    </a>
  );
}