'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Pin,
  Calendar,
  Tag,
  Printer,
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Filter,
  Hourglass,
  CheckCircle2
} from 'lucide-react';
import { dataStore } from '@/lib/storage';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/seedData';
import { Announcement, MinistryCategory } from '@/types';
import { CountdownTimer } from './CountdownTimer';

/**
 * MiniCountdown: countdown sederhana per warta (hari, jam, menit).
 * - Jika targetDate <= sekarang → tampil "Sudah Berlalu".
 * - Update setiap 60 detik (cukup untuk akurasi hari).
 */
function MiniCountdown({ targetDate }: { targetDate: string }) {
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-[11px] font-bold border border-[var(--border)] dark:border-[var(--border)]">
      <Hourglass className="w-3 h-3" />
      {cd.days > 0 ? `${cd.days} hari ` : ''}
      {cd.hours}j {cd.minutes}m lagi
    </span>
  );
}

export default function AnnouncementBoard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<MinistryCategory>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dataStore.getAnnouncements();
        if (data && data.length > 0) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.warn('Using initial announcements fallback:', err);
      }
    };
    loadData();
  }, []);

  const getCategoryBadge = (category: MinistryCategory) => {
    const color = 'bg-[var(--surface-raised)] text-[var(--muted-foreground)] border-[var(--border)] dark:bg-[#1F232D] dark:text-[var(--muted-foreground)] dark:border-[var(--border)]';
    switch (category) {
      case 'general':
        return { label: 'Umum & Ibadah Raya', color };
      case 'youth':
        return { label: 'Grow Generation Youth', color };
      case 'kidz':
        return { label: 'COC Kidz', color };
      case 'hana':
        return { label: 'Wanita Hana & Komsel', color };
      default:
        return { label: 'Warta Jemaat', color };
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredAnnouncements = announcements
    .filter((item) => {
      // Hanya tampilkan pengumuman yang dipublikasikan
      if (item.isPublished === false) return false;

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const eventDate = new Date(item.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      let matchesTime = true;
      if (timeFilter === 'upcoming') {
        matchesTime = eventDate >= today;
      } else if (timeFilter === 'past') {
        matchesTime = eventDate < today;
      }

      return matchesCategory && matchesTime;
    })
    .sort((a, b) => {
      // Sematkan yang di-pin di bagian atas
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Upcoming: tanggal terdekat di atas; past: terbaru di atas
      if (timeFilter === 'past') {
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      }
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });

  return (
    <section id="warta" className="py-24 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span>Warta Jemaat & Informasi Kegiatan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
              Papan Pengumuman & Agenda Gereja
            </h2>
            <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base leading-relaxed">
              Ikuti perkembangan kegiatan, warta sakramen, dan agenda pelayanan terkini di GIA Deliksari Semarang.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] text-[var(--foreground)] dark:text-[var(--foreground)] text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Printer className="w-4 h-4 text-[var(--brand-text)] dark:text-[#E88086]" />
              <span>Cetak Lembar Warta</span>
            </button>
          </div>
        </div>

        {/* Next Service Countdown */}
        <div className="mb-8">
          <CountdownTimer service="auto" showFullDetails={true} />
        </div>

        {/* Category & Time Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--border)] dark:border-[var(--border)]">
          
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'general', label: 'Ibadah Raya' },
              { id: 'youth', label: 'Grow Youth' },
              { id: 'kidz', label: 'COC Kidz' },
              { id: 'hana', label: 'Wanita Hana' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-[var(--brand)] text-white shadow-xs'
                    : 'bg-white dark:bg-[var(--card)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-[var(--surface-raised)] dark:bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] dark:border-[var(--border)]">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeFilter === 'upcoming'
                  ? 'bg-white dark:bg-[#1F232D] text-[var(--foreground)] dark:text-white shadow-xs'
                  : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>Akan Datang</span>
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === 'all'
                  ? 'bg-white dark:bg-[#1F232D] text-[var(--foreground)] dark:text-white shadow-xs'
                  : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeFilter === 'past'
                  ? 'bg-white dark:bg-[#1F232D] text-[var(--foreground)] dark:text-white shadow-xs'
                  : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sudah Berlalu</span>
            </button>
          </div>

        </div>

        {/* Empty state (depends on filter) */}
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] space-y-3">
            <Bell className="w-8 h-8 text-[var(--brand-text)] mx-auto opacity-40" />
            <p className="text-base font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
              {timeFilter === 'past'
                ? 'Belum ada warta yang sudah berlalu.'
                : 'Belum ada warta untuk filter ini.'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
              {timeFilter === 'upcoming' && (
                <>Warta yang sudah lewat otomatis dipindahkan ke tab <b>Sudah Berlalu</b>.</>
              )}
              {timeFilter === 'past' && (
                <>Warta lampau tetap tersimpan di arsip admin.</>
              )}
              {timeFilter === 'all' && (
                <>Silakan pilih kategori lain untuk melihat warta jemaat.</>
              )}
            </p>
          </div>
        ) : (
          /* Two-section layout: "Akan Datang" pinned di atas, "Sudah Berlalu" di bawah (collapsed) */
          <div className="space-y-8">
            {timeFilter === 'all' || timeFilter === 'upcoming' ? (() => {
              const upcoming = filteredAnnouncements.filter(
                (item) => new Date(item.eventDate) >= today,
              );
              const past = filteredAnnouncements.filter(
                (item) => new Date(item.eventDate) < today,
              );
              return (
                <>
                  {upcoming.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Hourglass className="w-4 h-4 text-[var(--brand-text)]" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-text)]">
                          Akan Datang ({upcoming.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map((item) => {
                          const badgeInfo = getCategoryBadge(item.category);
                          return (
                            <div
                              key={item.id}
                              className={`p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${
                                item.isPinned ? 'ring-2 ring-[#8B1E28]/40' : ''
                              }`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                                    {badgeInfo.label}
                                  </span>
                                  {item.isPinned && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand-text)] dark:text-[#E88086]">
                                      <Pin className="w-3.5 h-3.5 fill-[var(--brand)] dark:fill-[#E88086]" />
                                      <span>Penting</span>
                                    </span>
                                  )}
                                </div>

                                <MiniCountdown targetDate={item.eventDate} />

                                <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)] leading-snug">
                                  {item.title}
                                </h3>

                                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed line-clamp-4">
                                  {item.content}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-text)]" />
                                  <span>{item.eventDate}</span>
                                </div>

                                <a
                                  href="#layanan"
                                  className="font-bold text-[var(--brand-text)] dark:text-[#E88086] hover:underline flex items-center gap-0.5"
                                >
                                  <span>Layanan</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {past.length > 0 && (
                    <details className="space-y-4 group">
                      <summary className="cursor-pointer flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)] dark:hover:text-[var(--foreground)] list-none">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sudah Berlalu ({past.length})</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 opacity-70">
                        {past.map((item) => {
                          const badgeInfo = getCategoryBadge(item.category);
                          return (
                            <div
                              key={item.id}
                              className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-6"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                                    {badgeInfo.label}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)] leading-snug line-through opacity-60">
                                  {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                                  {item.content}
                                </p>
                              </div>
                              <div className="pt-4 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{item.eventDate}</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Sudah Berlalu</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </>
              );
            })() : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnnouncements.map((item) => {
                  const badgeInfo = getCategoryBadge(item.category);
                  return (
                    <div
                      key={item.id}
                      className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 opacity-70"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                            {badgeInfo.label}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)] leading-snug line-through opacity-60">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.eventDate}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Sudah Berlalu</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Print Bulletin Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] dark:border-[var(--border)] shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] dark:border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--brand-text)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
                    Warta Jemaat Mingguan GIA Deliksari
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                    Lembar Ringkasan Ibadah & Warta Cetak
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulletin Content Preview */}
            <div className="p-6 rounded-2xl bg-[var(--background)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] space-y-6">
              
              {/* Header Bulletin */}
              <div className="text-center pb-4 border-b border-[var(--border)] dark:border-[var(--border)] space-y-1">
                <h5 className="font-extrabold text-base text-[var(--foreground)] dark:text-[var(--foreground)]">
                  GEREJA ISA ALMASIH DELIKSARI SEMARANG
                </h5>
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                  Jl. Kolonel HR Hadijanto, Sekaran, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50229
                </p>
                <p className="text-xs font-bold text-[var(--brand-text)]">
                  Tema Bulanan: &ldquo;Bertumbuh Kuat dalam Iman & Buah Roh&rdquo; (1 Kor 15:58)
                </p>
              </div>

              {/* Schedules List */}
              <div className="space-y-2">
                <h6 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Jadwal Ibadah Minggu Ini:
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
                    <span className="font-bold block">Ibadah Raya Umum</span>
                    <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Minggu, 09.00 - 11.00 WIB (Gedung Utama)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
                    <span className="font-bold block">Grow Generation Youth</span>
                    <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Sabtu, 18.00 - 20.00 WIB (Bergantian: Minggu 1&3 Youth, 2&4 Komsel)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
                    <span className="font-bold block">COC Kidz (Sekolah Minggu)</span>
                    <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Minggu, 09.30 - 10.30 WIB (Ruang Anak)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
                    <span className="font-bold block">HANA Wanita / Komsel Ekklesia</span>
                    <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Minggu, 18.00/18.30 WIB (Bergantian: Minggu 1&3 HANA, 2&4 Komsel)</span>
                  </div>
                </div>
              </div>

              {/* Active Announcements List */}
              <div className="space-y-3">
                <h6 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Warta & Pokok Doa:
                </h6>
                <div className="space-y-2">
                  {announcements.slice(0, 4).map((warta) => (
                    <div key={warta.id} className="text-xs p-3 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{warta.title}</span>
                        <span className="text-[var(--brand-text)]">{warta.eventDate}</span>
                      </div>
                      <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">{warta.content}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[var(--brand)] text-white text-xs font-bold shadow-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Warta (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
