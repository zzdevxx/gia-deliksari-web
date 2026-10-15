import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Card + LinkCard — editorial surface for content blocks.
 *
 * Material layers, not shadows:
 *   - flat     : default. Border + canvas tint. Sits in the document flow.
 *   - raised   : border + one surface step up. For anything clickable, so it
 *                reads as interactive before the pointer arrives.
 *   - outlined : transparent, border only. For cards on an already-tinted panel.
 *   - inverted : always-dark panel, for use on a light canvas.
 *
 * Why no shadow on the static variants: pairing a 1px border with a soft drop
 * shadow is the "ghost-card" pattern. The border already separates the surface,
 * so the shadow adds weight without adding information, and repeating it across
 * a grid is the single loudest signal that a layout was assembled rather than
 * designed. Depth here comes from the surface ramp (`--background` →
 * `--card` → `--surface-raised`), which survives a theme switch and costs
 * nothing to composite.
 *
 * The exception is `floating`, which is genuinely lifted out of the page plane
 * (sticky header, open dialog, lightbox). DESIGN.md permits a shadow only there.
 *
 * Implementation split:
 *   - Card     : <div>/<article>/<li> with HTMLAttributes
 *   - LinkCard : <a> with AnchorHTMLAttributes (separate for strict typing)
 */

type Variant = 'flat' | 'raised' | 'outlined' | 'inverted';
type Elevation = 'ground' | 'floating';

const VARIANT_MAP: Record<Variant, string> = {
  // One surface step above the canvas, no shadow.
  flat: 'bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]',
  // The same surface, marked interactive by its border rather than a shadow.
  raised:
    'bg-[var(--card)] border border-[var(--border-strong)]/60 dark:border-[var(--border-strong)]/60',
  outlined: 'bg-transparent border border-[var(--border)] dark:border-[var(--border)]',
  inverted: 'bg-[var(--card-inverted-bg)] text-[var(--card-inverted-fg)] border border-[var(--card-inverted-border)]',
};

/**
 * `floating` is for surfaces lifted out of the page plane. It is the only
 * elevation that carries a shadow, and it is deliberately a separate axis from
 * `variant` so a card cannot become floating by accident.
 */
const ELEVATION_MAP: Record<Elevation, string> = {
  ground: '',
  floating: 'shadow-sm',
};

const BASE_CLASSES =
  'block rounded-2xl overflow-hidden transition-all duration-200 ease-out-strong motion-reduce:transition-none';

interface CardBaseProps {
  variant?: Variant;
  elevation?: Elevation;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

function cardClasses(
  variant: Variant,
  elevation: Elevation,
  hoverable: boolean,
  extra?: string,
) {
  return cn(
    BASE_CLASSES,
    VARIANT_MAP[variant],
    ELEVATION_MAP[elevation],
    // Hover is a border-colour shift plus a 2px lift. The lift alone is a weak
    // cue on a card that already has a border, and adding a shadow here would
    // make every hovered card the ghost-card pattern.
    hoverable &&
      'hover:-translate-y-0.5 hover:border-[var(--brand-text)]/50 motion-reduce:hover:translate-y-0',
    extra,
  );
}

interface CardProps
  extends CardBaseProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className'> {
  as?: 'div' | 'article' | 'li';
}

export function Card({
  variant = 'flat',
  elevation = 'ground',
  hoverable = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag className={cardClasses(variant, elevation, hoverable, className)} {...rest}>
      {children}
    </Tag>
  );
}

interface LinkCardProps
  extends CardBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> {
  href: string;
}

export function LinkCard({
  variant = 'flat',
  elevation = 'ground',
  hoverable = false,
  className,
  children,
  ...rest
}: LinkCardProps) {
  return (
    <a className={cardClasses(variant, elevation, hoverable, className)} {...rest}>
      {children}
    </a>
  );
}