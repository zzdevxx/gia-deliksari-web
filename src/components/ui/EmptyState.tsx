import React from 'react';
import { cn } from '@/lib/cn';

/**
 * EmptyState — placeholder for empty lists/data.
 * Editorial: centered icon + title + optional CTA + helper text.
 * Never show a blank screen to the user.
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl',
        'border border-dashed border-[var(--border)] dark:border-[var(--border)]',
        'bg-[var(--surface-raised)]/40 dark:bg-[var(--card)]/40',
        className,
      )}
    >
      {icon && (
        // Muted tile, not a solid brand fill. A wine-filled square reads as an
        // alert, which is the wrong signal for "nothing here yet" — the state
        // is normal, not a problem. The tint carries enough presence to anchor
        // the block without raising its voice.
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-tint)] dark:bg-[var(--brand-tint)] text-[var(--brand-text)] dark:text-[var(--brand-text)] border border-[var(--brand-tint-border)] dark:border-[var(--brand-tint-border)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--foreground)] dark:text-[var(--foreground)]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}