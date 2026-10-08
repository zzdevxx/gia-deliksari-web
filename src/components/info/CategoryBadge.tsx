'use client';

import React from 'react';
import type { MinistryCategory } from '@/types';

interface CategoryBadgeProps {
  category: MinistryCategory;
}

const CONFIG: Record<MinistryCategory, { label: string; color: string }> = {
  general: {
    label: 'Ibadah Raya',
    color: 'bg-[#FBF1F2] dark:bg-[#261517] text-[#8B1E28] dark:text-[#E88086] border-[#E8C2C5] dark:border-[#52252A]',
  },
  youth: {
    label: 'Grow Youth',
    color: 'bg-[#F9FAFB] dark:bg-[#1E293B] text-[#475569] dark:text-[#64748B] border-[#E5E7EB] dark:border-[#334155]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[#F9FAFB] dark:bg-[#1F232D] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#2A2F3A]',
  },
  hana: {
    label: 'Wanita Hana',
    color: 'bg-[#FAF5FF] dark:bg-[#2E1065] text-[#6D28D9] dark:text-[#A78BFA] border-[#E9D5FF] dark:border-[#4C1D95]',
  },
  all: {
    label: 'Umum',
    color: 'bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#2A2F3A]',
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