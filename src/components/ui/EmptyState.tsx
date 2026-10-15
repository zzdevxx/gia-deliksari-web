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
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] dark:bg-[var(--brand)] text-white">
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