import React from 'react';

type RosterCat = 'general' | 'youth' | 'kidz' | 'hana';

interface RosterCategoryLabelProps {
  category: RosterCat;
}

const LABELS: Record<RosterCat, string> = {
  general: 'Ibadah Raya',
  youth: 'Grow Youth',
  kidz: 'COC Kidz',
  hana: 'Wanita Hana',
};

/**
 * Plain text label for a roster row category. Used in tables where the
 * full CategoryBadge styling is too heavy.
 */
const RosterCategoryLabel: React.FC<RosterCategoryLabelProps> = ({ category }) => {
  return <span className="font-bold text-[#111827] dark:text-[#F9FAFB]">{LABELS[category]}</span>;
};

export default RosterCategoryLabel;