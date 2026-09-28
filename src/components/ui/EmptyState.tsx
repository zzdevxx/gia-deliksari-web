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
        'flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl',
        'border border-dashed border-[#EBDDCF] dark:border-[#3A1C20]',
        'bg-[#FAF7F2]/50 dark:bg-[#1A0E10]/50',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C5222E] to-[#80141C] text-white shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1F1617] dark:text-[#F5EFEB]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[#5A4D4E] dark:text-[#D5C2C4]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}