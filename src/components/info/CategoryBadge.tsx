'use client';

import React from 'react';
import type { MinistryCategory } from '@/types';

interface CategoryBadgeProps {
  category: MinistryCategory;
}

const CONFIG: Record<MinistryCategory, { label: string; color: string }> = {
  general: {
    label: 'Ibadah Raya',
    color: 'bg-[#FBF1F2] dark:bg-[#261517] text-[var(--brand-text)] dark:text-[#E88086] border-[#E8C2C5] dark:border-[#52252A]',
  },
  youth: {
    label: 'Grow Youth',
    color: 'bg-[#F9FAFB] dark:bg-[#1E293B] text-[#475569] dark:text-[#64748B] border-[var(--border)] dark:border-[#334155]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[#F9FAFB] dark:bg-[#1F232D] text-[#4B5563] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border)]',
  },
  hana: {
    label: 'Wanita Hana',
    color: 'bg-[var(--brand-tint)] dark:bg-[var(--brand-tint)] text-[var(--brand-text)] dark:text-[var(--brand-text)] border-[var(--brand-tint-border)] dark:border-[var(--brand-tint-border)]',
  },
  all: {
    label: 'Umum',
    color: 'bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border)]',
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