'use client';

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Disclosure — collapsible section, used to keep /home readable.
 *
 * Why this exists: /home measured 17.9 viewports tall with 98 cards. Nothing in
 * it is wrong, but a visitor on a phone has to scroll past six full sections to
 * reach the address. Collapsing the detail keeps every word available while
 * letting someone reach what they came for without a marathon scroll.
 *
 * Implemented with a plain button + region rather than `<details>` so the
 * summary styling stays under our control, but it keeps the semantics that
 * matter:
 *   - `aria-expanded` on the trigger reflects the state
 *   - `aria-controls` points at the region's id, generated with `useId`
 *     (stable across SSR, unlike an index or a random value)
 *   - the region is `hidden` when collapsed, so its contents leave the
 *     accessibility tree and the tab order instead of being merely invisible
 *
 * Animation uses `grid-template-rows: 0fr -> 1fr`, which is the one technique
 * that animates height smoothly without measuring the content in JavaScript.
 * It is disabled under `prefers-reduced-motion` by the global rule in
 * globals.css, which collapses the duration.
 */
interface DisclosureProps {
  /** Question or label shown on the trigger. */
  summary: string;
  /** Optional supporting line under the summary, always visible. */
  description?: string;
  children: React.ReactNode;
  /** Open on first paint. Use for the one section a visitor most needs. */
  defaultOpen?: boolean;
  className?: string;
}

export function Disclosure({
  summary,
  description,
  children,
  defaultOpen = false,
  className,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={regionId}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-text)] transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-base sm:text-lg font-extrabold text-[var(--foreground)] leading-snug">
            {summary}
          </span>
          {description && (
            <span className="block text-sm text-[var(--muted-foreground)] mt-0.5">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'w-5 h-5 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ease-out-strong',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* The 0fr/1fr grid trick animates an unknown height without measuring it
          in JavaScript. The inner div needs `overflow: hidden` to clip during
          the transition.

          The region stays in the DOM rather than using the `hidden` attribute,
          because `hidden` would kill the animation. It is removed from the
          accessibility tree and the tab order a different way: `inert` on the
          wrapper and `visibility: hidden` once collapsed, which is also what
          stops a collapsed section's links from being reachable by keyboard.
          `aria-hidden` is deliberately NOT used, since the trigger already
          communicates state through `aria-expanded` and duplicating the signal
          makes screen readers announce it twice. */}
      <div
        id={regionId}
        // `inert` removes the whole subtree from the tab order and from
        // assistive tech while collapsed. It is the reason a keyboard user
        // cannot Tab into a section they cannot see. React 19 supports the
        // attribute natively.
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,visibility] duration-300 ease-out-strong',
          open ? 'grid-rows-[1fr] visible' : 'grid-rows-[0fr] invisible',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
