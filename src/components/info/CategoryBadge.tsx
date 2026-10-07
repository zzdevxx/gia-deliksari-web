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
    color: 'bg-[#FAF0ED] dark:bg-[#281814] text-[#A0442C] dark:text-[#D96B4F] border-[#EAC9C0] dark:border-[#4D2820]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[#FEF9EC] dark:bg-[#2D2517] text-[#8C6826] dark:text-[#E0B85C] border-[#F5DFAB] dark:border-[#52411E]',
  },
  hana: {
    label: 'Wanita Hana',
    color: 'bg-[#F9EFF3] dark:bg-[#26161E] text-[#7A354A] dark:text-[#B0657C] border-[#E2C3D0] dark:border-[#4A2032]',
  },
  all: {
    label: 'Umum',
    color: 'bg-[#F3EFE6] dark:bg-[#262421] text-[#665E55] dark:text-[#A8A196] border-[#E5DFD5] dark:border-[#332F2B]',
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