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
  return <span className="font-bold text-[#1F1617] dark:text-[#F5EFEB]">{LABELS[category]}</span>;
};

export default RosterCategoryLabel;