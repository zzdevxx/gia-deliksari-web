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
        'border border-dashed border-[#E5DFD5] dark:border-[#332F2B]',
        'bg-[#F3EFE6]/40 dark:bg-[#1D1B19]/40',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B1E28] dark:bg-[#B8323D] text-white shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F3EF]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[#665E55] dark:text-[#A8A196]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}