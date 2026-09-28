/**
 * Schedule Utilities for GIA Deliksari
 * 
 * Alternating schedule logic:
 * - Youth/Generation Grow: 4-week cycle, weeks 1&3 = Youth, weeks 2&4 = Komsel
 *   Reference: Saturday, August 29, 2026 = Youth (Week 1)
 * - HANA/Women & Komsel Ekklesia: 4-week cycle, weeks 1&3 = HANA, weeks 2&4 = Komsel
 *   Reference: Friday, September 4, 2026 = HANA (Week 1)
 */

export type AlternatingServiceType = 'youth' | 'komsel-youth' | 'hana' | 'komsel-hana';

export interface AlternatingScheduleInfo {
  currentWeek: number;
  serviceType: AlternatingServiceType;
  serviceName: string;
  description: string;
  nextChangeDate: Date;
  daysUntilChange: number;
}

/**
 * Calculate which week of the cycle we're in based on a reference date
 * @param currentDate - The date to check
 * @param referenceDate - The reference date that represents Week 1
 * @param cycleWeeks - Number of weeks in the cycle (default 4)
 * @returns Current week number (1-based)
 */
export function getCycleWeek(
  currentDate: Date,
  referenceDate: Date,
  cycleWeeks: number = 4
): number {
  const current = new Date(currentDate);
  const reference = new Date(referenceDate);
  
  // Normalize to midnight for day comparison
  current.setHours(0, 0, 0, 0);
  reference.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - reference.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  
  // Week number is 1-based, cycling every cycleWeeks
  const weekNumber = ((diffWeeks % cycleWeeks) + cycleWeeks) % cycleWeeks + 1;
  
  return weekNumber;
}

/**
 * Get the service type for Youth/Grow Generation based on date
 * Week 1 & 3 = Youth, Week 2 & 4 = Komsel
 * Reference: Saturday, August 29, 2026 = Youth (Week 1)
 */
export function getYouthServiceType(date: Date = new Date()): AlternatingScheduleInfo {
  const referenceDate = new Date('2026-08-29'); // Saturday, Aug 29, 2026 = Youth
  const week = getCycleWeek(date, referenceDate, 4);
  
  const isYouthWeek = week === 1 || week === 3;
  const serviceType = isYouthWeek ? 'youth' : 'komsel-youth';
  const serviceName = isYouthWeek ? 'Grow Generation Youth' : 'Komsel Generasi Muda';
  const description = isYouthWeek 
    ? 'Ibadah pemuda & remaja Grow Generation' 
    : 'Komsel persekutuan generasi muda (selang-seling dengan Youth)';
  
  // Calculate next change date
  const nextChangeDate = new Date(date);
  const daysUntilWeekEnd = 7 - date.getDay(); // Days until next Saturday
  const daysInCurrentWeek = isYouthWeek ? 7 - daysUntilWeekEnd : daysUntilWeekEnd + 7;
  
  nextChangeDate.setDate(date.getDate() + daysInCurrentWeek);
  nextChangeDate.setHours(0, 0, 0, 0);
  
  const daysUntilChange = Math.ceil((nextChangeDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    currentWeek: week,
    serviceType,
    serviceName,
    description,
    nextChangeDate,
    daysUntilChange: Math.max(0, daysUntilChange)
  };
}

/**
 * Get the service type for HANA/Women based on date
 * Week 1 & 3 = HANA, Week 2 & 4 = Komsel
 * Reference: Friday, September 4, 2026 = HANA (Week 1)
 */
export function getHANAServiceType(date: Date = new Date()): AlternatingScheduleInfo {
  const referenceDate = new Date('2026-09-04'); // Friday, Sep 4, 2026 = HANA
  const week = getCycleWeek(date, referenceDate, 4);
  
  const isHANAWeek = week === 1 || week === 3;
  const serviceType = isHANAWeek ? 'hana' : 'komsel-hana';
  const serviceName = isHANAWeek ? 'HANA Wanita' : 'Komsel Ekklesia';
  const description = isHANAWeek
    ? 'Persekutuan wanita HANA (Hati Nurani Allah)'
    : 'Komsel Ekklesia wanita (selang-seling dengan HANA)';
  
  // Calculate next change date
  const nextChangeDate = new Date(date);
  const daysUntilWeekEnd = 6 - date.getDay(); // Days until next Friday (0=Sun, 6=Sat)
  const daysInCurrentWeek = isHANAWeek ? 7 - daysUntilWeekEnd : daysUntilWeekEnd + 7;
  
  nextChangeDate.setDate(date.getDate() + daysInCurrentWeek);
  nextChangeDate.setHours(0, 0, 0, 0);
  
  const daysUntilChange = Math.ceil((nextChangeDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    currentWeek: week,
    serviceType,
    serviceName,
    description,
    nextChangeDate,
    daysUntilChange: Math.max(0, daysUntilChange)
  };
}

/**
 * Get countdown to a specific event date
 */
export function getEventCountdown(eventDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formatted: string;
} {
  const now = new Date();
  const target = new Date(eventDate);
  
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formatted: 'Sudah berlangsung'
    };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  let formatted = '';
  if (days > 0) formatted += `${days}h `;
  if (hours > 0 || days > 0) formatted += `${hours}j `;
  formatted += `${minutes}m ${seconds}d`;
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formatted
  };
}

/**
 * Format date for Indonesian locale
 */
export function formatIndonesianDate(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get both alternating schedules at once
 */
export function getAllAlternatingSchedules(date: Date = new Date()) {
  return {
    youth: getYouthServiceType(date),
    hana: getHANAServiceType(date)
  };
}
