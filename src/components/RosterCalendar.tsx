'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import type { ServantRoster, MinistryCategory } from '@/types';

interface CalendarProps {
  rosters: ServantRoster[];
  filterCategory: MinistryCategory | 'all';
}

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CAT_META: Record<string, { label: string; bg: string; border: string; text: string }> = {
  general: { label: 'Ibadah Raya', bg: 'bg-[#FDF0F0] dark:bg-[#331418]', border: 'border-[#F5CDD0] dark:border-[#521E25]', text: 'text-[#9A1620] dark:text-[#F2828C]' },
  youth:   { label: 'Grow Youth',  bg: 'bg-[#FFF2EE] dark:bg-[#331812]', border: 'border-[#FCD2C7] dark:border-[#57241A]', text: 'text-[#C83E20] dark:text-[#F88B72]' },
  kidz:    { label: 'COC Kidz',    bg: 'bg-[#FEF9EC] dark:bg-[#332612]', border: 'border-[#F8E3B5] dark:border-[#543E19]', text: 'text-[#B87A14] dark:text-[#F0BE5E]' },
  hana:    { label: 'Wanita Hana', bg: 'bg-[#FDF0F4] dark:bg-[#33121E]', border: 'border-[#F7C6D5] dark:border-[#541D30]', text: 'text-[#A6264A] dark:text-[#EA7FA0]' },
};

/**
 * Compact monthly calendar grid for roster viewing.
 * Renders 6 weeks (42 cells) at a time. Each cell shows up to 2 dots/entries
 * representing services on that day. Click a day to expand the list of
 * servants below the grid.
 */
const RosterCalendar: React.FC<CalendarProps> = ({ rosters, filterCategory }) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return rosters;
    return rosters.filter((r) => r.serviceCategory === filterCategory);
  }, [rosters, filterCategory]);

  // Group by ISO date
  const byDate = useMemo(() => {
    const m = new Map<string, ServantRoster[]>();
    filtered.forEach((r) => {
      const key = r.serviceDate;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    });
    return m;
  }, [filtered]);

  // Compute the 6-week grid for the current month
  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDayOfWeek = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(1 - startDayOfWeek); // back-up to Sunday
    const arr: { date: Date; iso: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({ date: d, iso, inMonth: d.getMonth() === cursor.getMonth() });
    }
    return arr;
  }, [cursor]);

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthLabel = cursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const dayEntries = selectedDay ? byDate.get(selectedDay) || [] : [];

  return (
    <div className="space-y-4">
      {/* Header: month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20]"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base sm:text-lg font-extrabold text-[#1F1617] dark:text-[#F5EFEB] capitalize">
          {monthLabel}
        </h3>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20]"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] sm:text-xs">
        {DAY_NAMES_ID.map((d) => (
          <div key={d} className="font-bold text-[#6E5D5F] dark:text-[#B5A1A3] py-1.5">
            {d}
          </div>
        ))}
        {cells.map(({ date, iso, inMonth }) => {
          const entries = byDate.get(iso) || [];
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDay;
          const hasEntries = entries.length > 0;
          const cats = Array.from(new Set(entries.map((e) => e.serviceCategory)));

          return (
            <button
              key={iso}
              onClick={() => hasEntries ? setSelectedDay(isSelected ? null : iso) : undefined}
              disabled={!hasEntries}
              className={[
                'min-h-[60px] sm:min-h-[78px] p-1.5 rounded-2xl border text-left flex flex-col gap-1 transition-all',
                inMonth ? '' : 'opacity-40',
                isToday ? 'ring-2 ring-[#C5222E]/40' : '',
                isSelected ? 'border-[#C5222E] bg-[#FDF0F0] dark:bg-[#331418]' : 'border-[#EBDDCF] dark:border-[#3A1C20]',
                hasEntries ? 'cursor-pointer hover:border-[#C5222E]/40 hover:bg-[#FDFBF7] dark:hover:bg-[#261317]' : 'cursor-default',
              ].join(' ')}
            >
              <div className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-[#C5222E]' : 'text-[#1F1617] dark:text-[#F5EFEB]'}`}>
                {date.getDate()}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {cats.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className={`w-1.5 h-1.5 rounded-full ${
                      c === 'general' ? 'bg-[#9A1620]' :
                      c === 'youth' ? 'bg-[#C83E20]' :
                      c === 'kidz' ? 'bg-[#B87A14]' :
                      'bg-[#A6264A]'
                    }`}
                    title={CAT_META[c]?.label ?? c}
                  />
                ))}
                {cats.length > 3 && (
                  <span className="text-[8px] text-[#6E5D5F] dark:text-[#B5A1A3]">+{cats.length - 3}</span>
                )}
              </div>
              {hasEntries && (
                <div className="text-[9px] sm:text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3] truncate">
                  {entries.length} pelayan
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#1F1617] dark:text-[#F5EFEB] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C5222E]" />
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[10px] font-bold text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#C5222E]"
            >
              Tutup
            </button>
          </div>
          {dayEntries.length === 0 ? (
            <p className="text-xs text-[#6E5D5F] dark:text-[#B5A1A3] italic">Tidak ada jadwal.</p>
          ) : (
            <div className="space-y-2">
              {dayEntries.map((r) => {
                const meta = CAT_META[r.serviceCategory] ?? CAT_META.general;
                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-2xl border ${meta.bg} ${meta.border}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3]">·</span>
                      <span className="text-xs font-extrabold text-[#1F1617] dark:text-[#F5EFEB]">{r.role}</span>
                    </div>
                    <div className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] font-medium">
                      {r.servantName}
                      {r.status === 'pending' && <span className="ml-2 text-[10px] italic text-[#B87A14]">(konfirmasi)</span>}
                      {r.status === 'replacement' && <span className="ml-2 text-[10px] italic text-[#C83E20]">(pengganti)</span>}
                    </div>
                    {r.notes && (
                      <div className="text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3] mt-1 italic">
                        {r.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3]">
        <span className="font-bold">Kategori:</span>
        {Object.entries(CAT_META).map(([key, m]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              key === 'general' ? 'bg-[#9A1620]' :
              key === 'youth' ? 'bg-[#C83E20]' :
              key === 'kidz' ? 'bg-[#B87A14]' :
              'bg-[#A6264A]'
            }`} />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RosterCalendar;