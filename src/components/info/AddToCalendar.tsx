'use client';

import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AddToCalendarProps {
  /** Slugs from `WEEKLY_SERVICES`. More than one for a card covering a pair. */
  serviceIds: readonly string[];
  /** Read out by screen readers, since the visible text is only the time. */
  label: string;
  /** The time itself. Typography comes from this component; pass colour only. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Turns a displayed service time into a calendar download.
 *
 * The time is the control, the same move as the hero's 09.00: the fact a reader
 * wants to keep is the one already in front of them, so it becomes the thing
 * they can act on. A separate button in the card footer was the first attempt
 * and was reverted: that footer spreads its ends with `justify-between`, and a
 * third child pushed the location chip out of place on all four cards.
 *
 * The trailing icon is always visible rather than hover-only. Phones have no
 * hover state, so an affordance that appears on hover does not exist for the
 * majority of this site's readers.
 *
 * A plain `<a download>` and not a scripted click: the browser then owns the
 * save, which is what makes this work on iOS Safari and Android Chrome without
 * a blob URL, a library, or a `navigator.share` branch that only some phones
 * honour.
 */
export function AddToCalendar({
  serviceIds,
  label,
  children,
  className,
}: AddToCalendarProps) {
  return (
    <a
      href={`/api/public/calendar?service=${encodeURIComponent(serviceIds.join(','))}`}
      download
      aria-label={label}
      title="Simpan ke kalender"
      className={cn(
        // rounded-lg is the DESIGN.md `control` step (8px), the one for a small
        // screen control. rounded-md (6px) is the print bulletin's step, which
        // DESIGN.md says no screen component uses.
        'inline-flex min-h-11 items-center gap-1.5 rounded-lg font-mono font-bold',
        'transition-colors hover:underline decoration-2 underline-offset-4',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--ring)]',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        {children}
      </span>
      {/* 60%, not 45%. At 45% the icon composites to 2.48:1 against a light
          card, below the 3:1 floor for a non-text indicator, and hover was the
          only way to full strength, which a phone cannot do. 60% clears 3.5:1
          on every card colour in both themes, and the hover step now adds
          emphasis rather than being the only way to see it. */}
      <CalendarPlus
        className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover/card:opacity-100"
        aria-hidden="true"
      />
    </a>
  );
}
