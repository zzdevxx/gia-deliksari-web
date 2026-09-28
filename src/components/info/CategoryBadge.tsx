'use client';

import React from 'react';
import type { MinistryCategory } from '@/types';

interface CategoryBadgeProps {
  category: MinistryCategory;
}

const CONFIG: Record<MinistryCategory, { label: string; color: string }> = {
  general: {
    label: 'Ibadah Raya',
    color: 'bg-[#FDF0F0] dark:bg-[#331418] text-[#9A1620] dark:text-[#F2828C] border-[#F5CDD0] dark:border-[#521E25]',
  },
  youth: {
    label: 'Grow Youth',
    color: 'bg-[#FFF2EE] dark:bg-[#331812] text-[#C83E20] dark:text-[#F88B72] border-[#FCD2C7] dark:border-[#57241A]',
  },
  kidz: {
    label: 'COC Kidz',
    color: 'bg-[#FEF9EC] dark:bg-[#332612] text-[#B87A14] dark:text-[#F0BE5E] border-[#F8E3B5] dark:border-[#543E19]',
  },
  hana: {
    label: 'Wanita Hana',
    color: 'bg-[#FDF0F4] dark:bg-[#33121E] text-[#A6264A] dark:text-[#EA7FA0] border-[#F7C6D5] dark:border-[#541D30]',
  },
  all: {
    label: 'Umum',
    color: 'bg-[#F7F2E8] dark:bg-[#2A161A] text-[#5A4D4E] dark:text-[#D5C2C4] border-[#EBDDCF] dark:border-[#3A1C20]',
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