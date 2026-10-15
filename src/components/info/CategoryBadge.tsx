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
  // `youth` and `kidz` used to pair `bg-[var(--foreground)]` (#17161A) with
  // `text-[var(--ink-strong)]` (#3A3532). That is 1.49:1 in light mode: dark
  // text on a near-black fill, which reads as an unlabelled dark smudge. All
  // four categories now use the surface ramp, which is the same treatment the
  // `all` variant already had, and which survives a theme switch without a
  // per-case override.
  youth: {
    label: 'Grow Youth',
    color: 'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--card-inverted-fg)] border-[var(--border-strong)] dark:border-[var(--border-strong)]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--card-inverted-fg)] border-[var(--border-strong)] dark:border-[var(--border-strong)]',
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