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
  general: { label: 'Ibadah Raya', bg: 'bg-[#F3F4F6] dark:bg-[#1F232D]', border: 'border-[#E5E7EB] dark:border-[#2A2F3A]', text: 'text-[#6B7280] dark:text-[#9CA3AF]' },
  youth:   { label: 'Grow Youth',  bg: 'bg-[#F3F4F6] dark:bg-[#1F232D]', border: 'border-[#E5E7EB] dark:border-[#2A2F3A]', text: 'text-[#6B7280] dark:text-[#9CA3AF]' },
  kidz:    { label: 'COC Kidz',    bg: 'bg-[#F3F4F6] dark:bg-[#1F232D]', border: 'border-[#E5E7EB] dark:border-[#2A2F3A]', text: 'text-[#6B7280] dark:text-[#9CA3AF]' },
  hana:    { label: 'Wanita Hana', bg: 'bg-[#F3F4F6] dark:bg-[#1F232D]', border: 'border-[#E5E7EB] dark:border-[#2A2F3A]', text: 'text-[#6B7280] dark:text-[#9CA3AF]' },
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
          className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A]"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-[#F9FAFB] capitalize">
          {monthLabel}
        </h3>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A]"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] sm:text-xs">
        {DAY_NAMES_ID.map((d) => (
          <div key={d} className="font-bold text-[#6B7280] dark:text-[#9CA3AF] py-1.5">
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
                isToday ? 'ring-2 ring-[#8B1E28]/40' : '',
                isSelected ? 'border-[#8B1E28] bg-[#F3F4F6] dark:bg-[#1F232D]' : 'border-[#E5E7EB] dark:border-[#2A2F3A]',
                hasEntries ? 'cursor-pointer hover:border-[#8B1E28]/40 hover:bg-[#FFFFFF] dark:hover:bg-[#1F232D]' : 'cursor-default',
              ].join(' ')}
            >
              <div className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-[#8B1E28]' : 'text-[#111827] dark:text-[#F9FAFB]'}`}>
                {date.getDate()}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {cats.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className={`w-1.5 h-1.5 rounded-full ${
                      c === 'general' ? 'bg-[#8B1E28]' :
                      c === 'youth' ? 'bg-[#475569]' :
                      c === 'kidz' ? 'bg-[#4B5563]' :
                      'bg-[#6D28D9]'
                    }`}
                    title={CAT_META[c]?.label ?? c}
                  />
                ))}
                {cats.length > 3 && (
                  <span className="text-[8px] text-[#6B7280] dark:text-[#9CA3AF]">+{cats.length - 3}</span>
                )}
              </div>
              {hasEntries && (
                <div className="text-[9px] sm:text-[10px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                  {entries.length} pelayan
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#111827] dark:text-[#F9FAFB] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8B1E28]" />
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#8B1E28]"
            >
              Tutup
            </button>
          </div>
          {dayEntries.length === 0 ? (
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] italic">Tidak ada jadwal.</p>
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
                      <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">·</span>
                      <span className="text-xs font-extrabold text-[#111827] dark:text-[#F9FAFB]">{r.role}</span>
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                      {r.servantName}
                      {r.status === 'pending' && <span className="ml-2 text-[10px] italic text-[#6B7280] dark:text-[#9CA3AF]">(konfirmasi)</span>}
                      {r.status === 'replacement' && <span className="ml-2 text-[10px] italic text-[#6B7280] dark:text-[#9CA3AF]">(pengganti)</span>}
                    </div>
                    {r.notes && (
                      <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 italic">
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
      <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
        <span className="font-bold">Kategori:</span>
        {Object.entries(CAT_META).map(([key, m]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              'bg-[#8B1E28]'
            }`} />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RosterCalendar;