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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FEF9EC] dark:bg-[#332612] text-[#B87A14] dark:text-[#F0BE5E] text-[11px] font-bold border border-[#F8E3B5] dark:border-[#543E19]">
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
    switch (category) {
      case 'general':
        return {
          label: 'Umum & Ibadah Raya',
          color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',
        };
      case 'youth':
        return {
          label: 'Grow Generation Youth',
          color: 'bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7] dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]',
        };
      case 'kidz':
        return {
          label: 'COC Kidz',
          color: 'bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]',
        };
      case 'hana':
        return {
          label: 'Wanita Hana & Komsel',
          color: 'bg-[#FDF0F4] text-[#A6264A] border-[#F7C6D5] dark:bg-[#33121E] dark:text-[#EA7FA0] dark:border-[#541D30]',
        };
      default:
        return {
          label: 'Warta Jemaat',
          color: 'bg-[#F7F2E8] text-[#5A4D4E] border-[#EBDDCF] dark:bg-[#2A161A] dark:text-[#D5C2C4] dark:border-[#3A1C20]',
        };
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
    <section id="warta" className="py-24 bg-[#FDFBF7] dark:bg-[#150B0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-[#C5222E]" />
              <span>Warta Jemaat & Informasi Kegiatan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
              Papan Pengumuman & Agenda Gereja
            </h2>
            <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base leading-relaxed">
              Ikuti perkembangan kegiatan, warta sakramen, dan agenda pelayanan terkini di GIA Deliksari Semarang.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Printer className="w-4 h-4 text-[#C5222E] dark:text-[#E03643]" />
              <span>Cetak Lembar Warta</span>
            </button>
          </div>
        </div>

        {/* Next Service Countdown */}
        <div className="mb-8">
          <CountdownTimer service="auto" showFullDetails={true} />
        </div>

        {/* Category & Time Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#EBDDCF] dark:border-[#3A1C20]">
          
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
                    ? 'bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white shadow-xs'
                    : 'bg-white dark:bg-[#221215] text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F7F2E8] dark:bg-[#221215] p-1 rounded-xl border border-[#EBDDCF] dark:border-[#3A1C20]">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeFilter === 'upcoming'
                  ? 'bg-white dark:bg-[#2A161A] text-[#1F1617] dark:text-white shadow-xs'
                  : 'text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#1F1617]'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>Akan Datang</span>
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === 'all'
                  ? 'bg-white dark:bg-[#2A161A] text-[#1F1617] dark:text-white shadow-xs'
                  : 'text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#1F1617]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeFilter === 'past'
                  ? 'bg-white dark:bg-[#2A161A] text-[#1F1617] dark:text-white shadow-xs'
                  : 'text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#1F1617]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sudah Berlalu</span>
            </button>
          </div>

        </div>

        {/* Empty state (depends on filter) */}
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] space-y-3">
            <Bell className="w-8 h-8 text-[#C5222E] mx-auto opacity-40" />
            <p className="text-base font-bold text-[#1F1617] dark:text-[#F5EFEB]">
              {timeFilter === 'past'
                ? 'Belum ada warta yang sudah berlalu.'
                : 'Belum ada warta untuk filter ini.'}
            </p>
            <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
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
                        <Hourglass className="w-4 h-4 text-[#C5222E]" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#C5222E]">
                          Akan Datang ({upcoming.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map((item) => {
                          const badgeInfo = getCategoryBadge(item.category);
                          return (
                            <div
                              key={item.id}
                              className={`p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${
                                item.isPinned ? 'ring-2 ring-[#C5222E]/40' : ''
                              }`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                                    {badgeInfo.label}
                                  </span>
                                  {item.isPinned && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#C5222E] dark:text-[#E03643]">
                                      <Pin className="w-3.5 h-3.5 fill-[#C5222E] dark:fill-[#E03643]" />
                                      <span>Penting</span>
                                    </span>
                                  )}
                                </div>

                                <MiniCountdown targetDate={item.eventDate} />

                                <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB] leading-snug">
                                  {item.title}
                                </h3>

                                <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed line-clamp-4">
                                  {item.content}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center justify-between text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-[#C5222E]" />
                                  <span>{item.eventDate}</span>
                                </div>

                                <a
                                  href="#layanan"
                                  className="font-bold text-[#C5222E] dark:text-[#E03643] hover:underline flex items-center gap-0.5"
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
                      <summary className="cursor-pointer flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6E5D5F] dark:text-[#B5A1A3] hover:text-[#1F1617] dark:hover:text-[#F5EFEB] list-none">
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
                              className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] flex flex-col justify-between space-y-6"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                                    {badgeInfo.label}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB] leading-snug line-through opacity-60">
                                  {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed line-clamp-3">
                                  {item.content}
                                </p>
                              </div>
                              <div className="pt-4 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center justify-between text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
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
                      className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 opacity-70"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeInfo.color}`}>
                            {badgeInfo.label}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB] leading-snug line-through opacity-60">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center justify-between text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
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
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#221215] rounded-[2.5rem] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EBDDCF] dark:border-[#3A1C20]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDF0F0] dark:bg-[#331418] flex items-center justify-center text-[#C5222E]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                    Warta Jemaat Mingguan GIA Deliksari
                  </h4>
                  <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
                    Lembar Ringkasan Ibadah & Warta Cetak
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl text-[#5A4D4E] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulletin Content Preview */}
            <div className="p-6 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A0E10] border border-[#EBDDCF] dark:border-[#3A1C20] space-y-6">
              
              {/* Header Bulletin */}
              <div className="text-center pb-4 border-b border-[#EBDDCF] dark:border-[#3A1C20] space-y-1">
                <h5 className="font-extrabold text-base text-[#1F1617] dark:text-[#F5EFEB]">
                  GEREJA ISA ALMASIH DELIKSARI SEMARANG
                </h5>
                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
                  Jl. Kolonel HR Hadijanto, Sekaran, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50229
                </p>
                <p className="text-xs font-bold text-[#C5222E]">
                  Tema Bulanan: &ldquo;Bertumbuh Kuat dalam Iman & Buah Roh&rdquo; (1 Kor 15:58)
                </p>
              </div>

              {/* Schedules List */}
              <div className="space-y-2">
                <h6 className="font-bold text-xs uppercase tracking-wider text-[#1F1617] dark:text-[#F5EFEB]">
                  Jadwal Ibadah Minggu Ini:
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20]">
                    <span className="font-bold block">Ibadah Raya Umum</span>
                    <span className="text-[#6E5D5F] dark:text-[#B5A1A3]">Minggu, 09.00 - 11.00 WIB (Gedung Utama)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20]">
                    <span className="font-bold block">Grow Generation Youth</span>
                    <span className="text-[#6E5D5F] dark:text-[#B5A1A3]">Sabtu, 18.00 - 20.00 WIB (Bergantian: Minggu 1&3 Youth, 2&4 Komsel)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20]">
                    <span className="font-bold block">COC Kidz (Sekolah Minggu)</span>
                    <span className="text-[#6E5D5F] dark:text-[#B5A1A3]">Minggu, 09.30 - 10.30 WIB (Ruang Anak)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20]">
                    <span className="font-bold block">HANA Wanita / Komsel Ekklesia</span>
                    <span className="text-[#6E5D5F] dark:text-[#B5A1A3]">Minggu, 18.00/18.30 WIB (Bergantian: Minggu 1&3 HANA, 2&4 Komsel)</span>
                  </div>
                </div>
              </div>

              {/* Active Announcements List */}
              <div className="space-y-3">
                <h6 className="font-bold text-xs uppercase tracking-wider text-[#1F1617] dark:text-[#F5EFEB]">
                  Warta & Pokok Doa:
                </h6>
                <div className="space-y-2">
                  {announcements.slice(0, 4).map((warta) => (
                    <div key={warta.id} className="text-xs p-3 rounded-xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{warta.title}</span>
                        <span className="text-[#C5222E]">{warta.eventDate}</span>
                      </div>
                      <p className="text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">{warta.content}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5A4D4E] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white text-xs font-bold shadow-sm flex items-center gap-2"
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
