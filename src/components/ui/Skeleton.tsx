import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Skeleton — placeholder block with shimmer animation.
 * Use for loading states. Better perceived performance than spinners.
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

const VARIANT_MAP = {
  text: 'h-4 w-full rounded-md',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-xl',
};

export function Skeleton({
  variant = 'rounded',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-[#E5E7EB] via-[#F3F4F6] to-[#E5E7EB] bg-[length:200%_100%]',
        'dark:from-[#2A2F3A] dark:via-[#1F232D] dark:to-[#2A2F3A]',
        VARIANT_MAP[variant],
        className,
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E5E7EB] dark:border-[var(--border)] bg-white dark:bg-[var(--card)] p-6 space-y-4',
        className,
      )}
    >
      <Skeleton variant="rounded" height={160} />
      <Skeleton variant="text" width="40%" />
      <SkeletonText lines={2} />
    </div>
  );
}