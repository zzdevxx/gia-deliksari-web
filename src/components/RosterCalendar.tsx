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
  general: { label: 'Ibadah Raya', bg: 'bg-[var(--surface-raised)] dark:bg-[#1F232D]', border: 'border-[var(--border)] dark:border-[var(--border)]', text: 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]' },
  youth:   { label: 'Grow Youth',  bg: 'bg-[var(--surface-raised)] dark:bg-[#1F232D]', border: 'border-[var(--border)] dark:border-[var(--border)]', text: 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]' },
  kidz:    { label: 'COC Kidz',    bg: 'bg-[var(--surface-raised)] dark:bg-[#1F232D]', border: 'border-[var(--border)] dark:border-[var(--border)]', text: 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]' },
  hana:    { label: 'Wanita Hana', bg: 'bg-[var(--surface-raised)] dark:bg-[#1F232D]', border: 'border-[var(--border)] dark:border-[var(--border)]', text: 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]' },
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
          className="p-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A]"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] capitalize">
          {monthLabel}
        </h3>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A]"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] sm:text-xs">
        {DAY_NAMES_ID.map((d) => (
          <div key={d} className="font-bold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] py-1.5">
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
                isSelected ? 'border-[#8B1E28] bg-[var(--surface-raised)] dark:bg-[#1F232D]' : 'border-[var(--border)] dark:border-[var(--border)]',
                hasEntries ? 'cursor-pointer hover:border-[#8B1E28]/40 hover:bg-[var(--background)] dark:hover:bg-[#1F232D]' : 'cursor-default',
              ].join(' ')}
            >
              <div className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-[var(--brand-text)]' : 'text-[var(--foreground)] dark:text-[var(--foreground)]'}`}>
                {date.getDate()}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {cats.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className={`w-1.5 h-1.5 rounded-full ${
                      // Four communities need four distinguishable dots, but
                      // violet was never part of this brand. Spread them across
                      // the wine → slate ramp instead: wine stays reserved for
                      // the main service, the rest step down into neutrals.
                      c === 'general' ? 'bg-[var(--brand)]' :
                      c === 'youth' ? 'bg-[#475569]' :
                      c === 'kidz' ? 'bg-[#6B7280]' :
                      'bg-[#9CA3AF]'
                    }`}
                    title={CAT_META[c]?.label ?? c}
                  />
                ))}
                {cats.length > 3 && (
                  <span className="text-[8px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">+{cats.length - 3}</span>
                )}
              </div>
              {hasEntries && (
                <div className="text-[9px] sm:text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] truncate">
                  {entries.length} pelayan
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[var(--foreground)] dark:text-[var(--foreground)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--brand-text)]" />
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[10px] font-bold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)]"
            >
              Tutup
            </button>
          </div>
          {dayEntries.length === 0 ? (
            <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] italic">Tidak ada jadwal.</p>
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
                      <span className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">·</span>
                      <span className="text-xs font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">{r.role}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] font-medium">
                      {r.servantName}
                      {r.status === 'pending' && <span className="ml-2 text-[10px] italic text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">(konfirmasi)</span>}
                      {r.status === 'replacement' && <span className="ml-2 text-[10px] italic text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">(pengganti)</span>}
                    </div>
                    {r.notes && (
                      <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-1 italic">
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
      <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
        <span className="font-bold">Kategori:</span>
        {Object.entries(CAT_META).map(([key, m]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              'bg-[var(--brand)]'
            }`} />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RosterCalendar;