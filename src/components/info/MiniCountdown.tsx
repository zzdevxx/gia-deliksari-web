'use client';

import React, { useEffect, useState } from 'react';
import { Hourglass } from 'lucide-react';

interface MiniCountdownProps {
  targetDate: string;
}

/**
 * Small countdown pill that ticks down to a target date.
 * Updates every 60 seconds. Returns null when target is in the past.
 *
 * Used in /info warta list and /home AnnouncementBoard.
 */
const MiniCountdown: React.FC<MiniCountdownProps> = ({ targetDate }) => {
  const compute = () => {
    const target = new Date(`${targetDate}T00:00:00`).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return { days, hours, minutes };
  };

  const [cd, setCd] = useState(compute);
  useEffect(() => {
    setCd(compute());
    const id = setInterval(() => setCd(compute()), 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (!cd) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F3F4F6] dark:bg-[#1F232D] text-[#5B6472] dark:text-[#9CA3AF] text-[11px] font-bold border border-[#E5E7EB] dark:border-[#2A2F3A]">
      <Hourglass className="w-3 h-3" />
      {cd.days > 0 ? `${cd.days} hari ` : ''}
      {cd.hours}j {cd.minutes}m lagi
    </span>
  );
};

export default MiniCountdown;