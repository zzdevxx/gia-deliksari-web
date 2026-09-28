'use client';

import { useState, useEffect } from 'react';
import { 
  getYouthServiceType, 
  getHANAServiceType, 
  getEventCountdown,
  formatIndonesianDate,
  AlternatingScheduleInfo 
} from '@/lib/scheduleUtils';

interface CountdownTimerProps {
  service?: 'youth' | 'hana' | 'auto';
  className?: string;
  showFullDetails?: boolean;
}

/**
 * CountdownTimer Component
 * Displays real-time countdown to the next alternating service
 * - For 'youth': Shows countdown to next Youth or Komsel Generasi Muda
 * - For 'hana': Shows countdown to next HANA Wanita or Komsel Ekklesia
 * - For 'auto': Shows whichever service is happening sooner
 */
export function CountdownTimer({ 
  service = 'auto', 
  className = '',
  showFullDetails = true 
}: CountdownTimerProps) {
  const [youthInfo, setYouthInfo] = useState<AlternatingScheduleInfo | null>(null);
  const [hanaInfo, setHanaInfo] = useState<AlternatingScheduleInfo | null>(null);
  const [countdown, setCountdown] = useState<ReturnType<typeof getEventCountdown> | null>(null);
  const [currentService, setCurrentService] = useState<'youth' | 'hana' | null>(null);

  // Update schedules and countdown every second
  useEffect(() => {
    const updateAll = () => {
      const now = new Date();
      const youth = getYouthServiceType(now);
      const hana = getHANAServiceType(now);
      
      setYouthInfo(youth);
      setHanaInfo(hana);

      // Determine which service to show based on prop
      let targetDate: Date;
      let targetService: 'youth' | 'hana';

      if (service === 'youth') {
        targetDate = youth.nextChangeDate;
        targetService = 'youth';
      } else if (service === 'hana') {
        targetDate = hana.nextChangeDate;
        targetService = 'hana';
      } else {
        // Auto: show whichever is sooner
        if (youth.daysUntilChange <= hana.daysUntilChange) {
          targetDate = youth.nextChangeDate;
          targetService = 'youth';
        } else {
          targetDate = hana.nextChangeDate;
          targetService = 'hana';
        }
      }

      setCurrentService(targetService);
      setCountdown(getEventCountdown(targetDate));
    };

    updateAll();
    const interval = setInterval(updateAll, 1000);
    return () => clearInterval(interval);
  }, [service]);

  if (!countdown || !currentService || !youthInfo || !hanaInfo) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-pulse text-[#6E5D5F] dark:text-[#B5A1A3]">
          Memuat jadwal...
        </div>
      </div>
    );
  }

  const info = currentService === 'youth' ? youthInfo : hanaInfo;
  const isYouth = currentService === 'youth';
  
  // Determine service color theme
  const serviceColor = isYouth 
    ? 'text-[#C5222E] dark:text-[#E85D5D]' 
    : 'text-[#8B4513] dark:text-[#D4A574]';
  const serviceBg = isYouth 
    ? 'bg-[#FFF0F0] dark:bg-[#3A1C20]' 
    : 'bg-[#FDF6F0] dark:bg-[#3A2A1C]';
  const serviceBorder = isYouth 
    ? 'border-[#E8B4B4] dark:border-[#5D2E2E]' 
    : 'border-[#E8D4C4] dark:border-[#5D4E2E]';

  const serviceIcon = isYouth ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  return (
    <div className={`${serviceBg} ${serviceBorder} border-2 rounded-2xl p-4 md:p-6 ${className}`}>
      {/* Service Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <span className={`${serviceColor} font-semibold text-base md:text-lg`}>
            {serviceIcon}
          </span>
          <span className={`${serviceColor} font-bold text-lg md:text-xl`}>
            {info.serviceName}
          </span>
        </div>
        <span className={`${serviceColor} text-xs md:text-sm font-medium px-2 py-1 rounded-full bg-white/80 dark:bg-[#221215]/80`}>
          Minggu ke-{info.currentWeek}
        </span>
      </div>

      {/* Description */}
      <p className={`text-sm md:text-base text-[#5A4D4E] dark:text-[#D5C2C4] mb-3 md:mb-4 ${serviceColor}/80`}>
        {info.description}
      </p>

      {/* Countdown Timer */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
        <CountdownItem 
          value={countdown.days} 
          label="Hari" 
          color={serviceColor}
        />
        <CountdownItem 
          value={countdown.hours} 
          label="Jam" 
          color={serviceColor}
        />
        <CountdownItem 
          value={countdown.minutes} 
          label="Menit" 
          color={serviceColor}
        />
        <CountdownItem 
          value={countdown.seconds} 
          label="Detik" 
          color={serviceColor}
        />
      </div>

      {showFullDetails && (
        <div className="pt-3 md:pt-4 border-t border-[#EBDDCF] dark:border-[#3A1C20] space-y-2 text-sm">
          <div className="flex justify-between text-[#5A4D4E] dark:text-[#D5C2C4]">
            <span>Perubahan berikutnya:</span>
            <span className="font-medium text-[#1F1617] dark:text-[#F5EFEB]">
              {formatIndonesianDate(info.nextChangeDate)}
            </span>
          </div>
          <div className="flex justify-between text-[#5A4D4E] dark:text-[#D5C2C4]">
            <span>Sisa waktu:</span>
            <span className="font-medium text-[#1F1617] dark:text-[#F5EFEB]">
              {info.daysUntilChange} hari lagi
            </span>
          </div>
          <div className="flex justify-between text-[#5A4D4E] dark:text-[#D5C2C4]">
            <span>Hari ini:</span>
            <span className="font-medium text-[#1F1617] dark:text-[#F5EFEB]">
              {isYouth ? 'Sabtu' : 'Minggu'}
            </span>
          </div>
          <div className="flex justify-between text-[#5A4D4E] dark:text-[#D5C2C4]">
            <span>Waktu:</span>
            <span className="font-medium text-[#1F1617] dark:text-[#F5EFEB]">
              {isYouth ? '18.00 - 20.00 WIB' : '18.00 / 18.30 WIB'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CountdownItem({ 
  value, 
  label, 
  color 
}: { 
  value: number; 
  label: string; 
  color: string;
}) {
  return (
    <div className="text-center p-2 md:p-3 bg-white/60 dark:bg-[#221215]/60 rounded-xl">
      <div className={`${color} font-mono font-bold text-2xl md:text-3xl leading-tight`}>
        {value.toString().padStart(2, '0')}
      </div>
      <div className={`text-xs md:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] mt-1 ${color}/80`}>
        {label}
      </div>
    </div>
  );
}

/**
 * Dual Countdown Timer - Shows both Youth and HANA countdowns side by side
 */
export function DualCountdownTimer({ 
  className = '' 
}: { 
  className?: string;
}) {
  const [youthInfo] = useState(() => getYouthServiceType(new Date()));
  const [hanaInfo] = useState(() => getHANAServiceType(new Date()));
  const [youthCountdown, setYouthCountdown] = useState<ReturnType<typeof getEventCountdown> | null>(null);
  const [hanaCountdown, setHanaCountdown] = useState<ReturnType<typeof getEventCountdown> | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const youth = getYouthServiceType(now);
      const hana = getHANAServiceType(now);
      
      setYouthCountdown(getEventCountdown(youth.nextChangeDate));
      setHanaCountdown(getEventCountdown(hana.nextChangeDate));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!youthCountdown || !hanaCountdown) {
    return <div className={`text-center py-4 ${className}`}>Memuat...</div>;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <CountdownTimer service="youth" showFullDetails={true} />
      <CountdownTimer service="hana" showFullDetails={true} />
    </div>
  );
}
