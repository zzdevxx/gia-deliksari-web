'use client';

import React from 'react';
import type { MinistryCategory } from '@/types';

interface CategoryBadgeProps {
  category: MinistryCategory;
}

const CONFIG: Record<MinistryCategory, { label: string; color: string }> = {
  general: {
    label: 'Ibadah Raya',
    color: 'bg-[var(--brand-tint)] dark:bg-[var(--brand-tint-ink)] text-[var(--brand-text)] dark:text-[var(--brand-text)] border-[var(--brand-tint-border)] dark:border-[var(--brand-tint-border)]',
  },
  youth: {
    label: 'Grow Youth',
    color: 'bg-[var(--foreground)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border-strong)]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[var(--foreground)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border)]',
  },
  hana: {
    label: 'Wanita Hana',
    color: 'bg-[var(--brand-tint)] dark:bg-[var(--brand-tint)] text-[var(--brand-text)] dark:text-[var(--brand-text)] border-[var(--brand-tint-border)] dark:border-[var(--brand-tint-border)]',
  },
  all: {
    label: 'Umum',
    color: 'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border)]',
  },
};

/**
 * Color-coded badge for the 5 community categories used across /info and
 * /admin. Color tokens match DESIGN.md ministry table.
 */
const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const c = CONFIG[category];
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${c.color}`}>
      {c.label}
    </span>
  );
};

export default CategoryBadge;