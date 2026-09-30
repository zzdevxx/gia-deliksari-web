'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Flame,
  Baby,
  HeartHandshake,
  Sparkles,
  Music,
  Car,
  ChevronRight,
  ShieldCheck,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { dataStore } from '@/lib/storage';
import { INITIAL_ROSTER } from '@/lib/seedData';
import { ServantRoster } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar as CalendarIcon, Bell as BellIcon } from 'lucide-react';

interface PrimaryService {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
  description: string;
  category: string;
  icon: string;
}

interface WeeklyActivity {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
  description: string;
  category: string;
}

const ROSTER_TABS: { id: 'all' | 'general' | 'youth' | 'kidz' | 'hana'; label: string }[] = [
  { id: 'all', label: 'Semua Komunitas' },
  { id: 'general', label: 'Ibadah Raya' },
  { id: 'youth', label: 'Grow Youth' },
  { id: 'kidz', label: 'COC Kidz' },
  { id: 'hana', label: 'Wanita Hana & Komsel' },
];

export default function ScheduleSection() {
  const [roster, setRoster] = useState<ServantRoster[]>(INITIAL_ROSTER);
  const [selectedRosterCategory, setSelectedRosterCategory] = useState<'all' | 'general' | 'youth' | 'kidz' | 'hana'>('all');
  const [loading, setLoading] = useState(true);
  const [copiedWa, setCopiedWa] = useState(false);

  const generateWhatsAppBroadcast = () => {
    const categoryName = ROSTER_TABS.find((t) => t.id === selectedRosterCategory)?.label || 'Semua Komunitas';
    const items = roster
      .filter((item) => selectedRosterCategory === 'all' || item.serviceCategory === selectedRosterCategory)
      .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

    if (items.length === 0) {
      return `🕊️ *JADWAL PELAYANAN GIA DELIKSARI SEMARANG*\nKategori: *${categoryName}*\n\nBelum ada jadwal yang dipublikasikan.`;
    }

    // Group by serviceDate
    const dateMap = new Map<string, typeof items>();
    items.forEach((item) => {
      const existing = dateMap.get(item.serviceDate) || [];
      existing.push(item);
      dateMap.set(item.serviceDate, existing);
    });

    let text = `🕊️ *JADWAL PELAYANAN GIA DELIKSARI SEMARANG*\n`;
    text += `📋 Kategori: *${categoryName}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    dateMap.forEach((servants, dateStr) => {
      text += `📅 *Tanggal: ${dateStr}*\n`;
      servants.forEach((s) => {
        text += `• *${s.role}*: ${s.servantName} ${s.status === 'replacement' ? '(Pengganti)' : ''}\n`;
      });
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_"Layanilah seorang akan yang lain, sesuai dengan karunia yang telah diperoleh tiap-tiap orang sebagai pengurus yang baik dari kasih karunia Allah." (1 Petrus 4:10)_\n\n`;
    text += `Tuhan Yesus Memberkati pelayanan kita bersama! 🙏✨`;
    return text;
  };

  const handleCopyWaBroadcast = () => {
    const text = generateWhatsAppBroadcast();
    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await dataStore.getRoster();
        if (!cancelled && data && data.length > 0) {
          setRoster(data);
        }
      } catch (err) {
        console.warn('Using initial roster fallback:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryServices: PrimaryService[] = [
    {
      id: 'ibadah-raya',
      name: 'Ibadah Raya Minggu',
      day: 'Minggu',
      time: '09:00 - 11:00',
      location: 'Gedung Utama',
      description: 'Ibadah raya mingguan untuk seluruh jemaat dengan pertemuan firman Tuhan dan doa bersama.',
      category: 'ibadah-raya',
      icon: '🕊️',
    },
    {
      id: 'grow-generation',
      name: 'Grow Generation (Youth & Komsel)',
      day: 'Sabtu',
      time: '18:00 - 20:00',
      location: 'Gedung Utama / Ruang Bethel',
      description: 'Pelayanan remaja & pemuda (SMA - Muda) dengan ibadah, pertemuan sel, dan fellowship. Pola selang-seling 4 minggu.',
      category: 'pemuda',
      icon: '🔥',
    },
    {
      id: 'coc-kidz',
      name: 'COC Kidz (Sekolah Minggu)',
      day: 'Minggu',
      time: '09:30 - 10:30',
      location: 'Ruang Bethel',
      description: 'Pelayanan anak-anak (Balita - SD) dengan pembelajaran Alkitab, pujian, dan kegiatan kreatif sesuai usia.',
      category: 'anak',
      icon: '🌈',
    },
    {
      id: 'hana-ekklesia',
      name: 'Wanita HANA & Komsel Ekklesia',
      day: 'Jumat (HANA) / Selasa (Komsel)',
      time: '17:30 - 19:00 (HANA) / 18:30 - 20:00 (Komsel)',
      location: 'Gedung Utama',
      description: 'Ibadah HANA setiap Jumat 17.30 WIB. Komsel Ekklesia Sel setiap Selasa 18.30 WIB. Pola selang-seling 4-minggu pada ibadah HANA.',
      category: 'wanita',
      icon: '🌸',
    },
    {
      id: 'ibadah-doa-pagi-card',
      name: 'Ibadah Doa Pagi (Selasa–Jumat)',
      day: 'Selasa – Jumat',
      time: '05.00 - 05:30 WIB',
      location: 'Gedung Utama + Zoom',
      description:
        'Doa pagi harian. Onsite di Gedung Utama & online via Zoom. ' +
        'Link Zoom: https://us06web.zoom.us/j/83715591277?pwd=Qc52Xla9k68ZjD3rViMRIaDiXgaWkf.1',
      category: 'doa-pagi',
      icon: '🕯️',
    },
  ];

  const weeklyActivities: WeeklyActivity[] = [
    {
      id: 'ibadah-doa-pagi',
      name: 'Ibadah Doa Pagi',
      day: 'Selasa - Jumat',
      time: '05:00 - 05:30',
      location: 'Gedung Utama + Zoom',
      description: 'Doa pagi bersama secara harian sebelum memulai aktivitas. Tersedia juga via Zoom untuk jemaat yang tidak bisa hadir fisik.',
      category: 'doa',
    },
    {
      id: 'latihan-musik',
      name: 'Latihan Musik / Pujian',
      day: 'Sabtu',
      time: '10:00 - 12:00 & 20:00 - 22:00 (fleksibel)',
      location: 'Gedung Utama',
      description: 'Latihan tim pujian & musik untuk persiapan ibadah Minggu dan acara khusus. Jadwal fleksibel sesuai kebutuhan.',
      category: 'musik',
    },
    {
      id: 'visitasi-jemaat',
      name: 'Visitasi Jemaat',
      day: 'Selasa',
      time: 'Fleksibel',
      location: 'Area Jemaat',
      description: 'Kunjungan pastoral ke rumah jemaat untuk doa, konseling, dan persekutuan.',
      category: 'pastoral',
    },
    {
      id: 'kegiatan-kantor',
      name: 'Kegiatan Kantor Gereja',
      day: 'Selasa - Sabtu',
      time: '08:00 - 15:00',
      location: 'Ruang Gembala / Kantor',
      description: 'Jam operasional kantor gereja untuk administrasi, konseling, dan pertemuan pastoral.',
      category: 'administrasi',
    },
  ];

  // Helper untuk icon dan warna kategori
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'doa': return <Flame className="w-6 h-6" />;
      case 'musik': return <Music className="w-6 h-6" />;
      case 'pastoral': return <Car className="w-6 h-6" />;
      case 'administrasi': return <ShieldCheck className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'doa': return 'bg-[#FDF0F0] text-[#C5222E] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C]';
      case 'musik': return 'bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E]';
      case 'pastoral': return 'bg-[#FDF5F0] text-[#C83E20] border-[#FCD2C7] dark:bg-[#331812] dark:text-[#F88B72]';
      case 'administrasi': return 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] dark:bg-[#142A1B] dark:text-[#4ADE80]';
      default: return 'bg-[#F7F2E8] text-[#5A4D4E] border-[#EBDDCF] dark:bg-[#2A161A] dark:text-[#D5C2C4]';
    }
  };

  return (
    <section id="jadwal" className="py-24 bg-[#F7F2E8]/60 dark:bg-[#1A0E10]/60 border-y border-[#EBDDCF] dark:border-[#3A1C20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Agenda & Waktu Beribadah</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Jadwal Ibadah & Pelayanan Mingguan
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
            Mari hadir bersama keluarga untuk menyembah Tuhan dan bersekutu dalam hadirat-Nya yang kudus di GIA Deliksari.
          </p>
        </div>

        {/* 4 Primary Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {primaryServices.map((service) => (
            <div
              key={service.id}
              className="p-7 sm:p-8 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold border bg-[#FDF0F0] dark:bg-[#331418] text-[#9A1620] dark:text-[#F2828C] border-[#F5CDD0] dark:border-[#521E25]">
                    {service.category}
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5222E] dark:text-[#E03643]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.time}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB]">
                    {service.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                    {service.day}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#6E5D5F] dark:text-[#B5A1A3]">
                  <MapPin className="w-3.5 h-3.5 text-[#C5222E]" />
                  <span>{service.location}</span>
                </div>
                <a
                  href="#layanan"
                  className="font-bold text-[#C5222E] dark:text-[#E03643] hover:underline flex items-center gap-0.5"
                >
                  <span>Daftar Pelayanan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {weeklyActivities.map((act) => (
            <div
              key={act.id}
              className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex items-start gap-5"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${getCategoryColor(act.category)}`}>
                {getCategoryIcon(act.category)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#C5222E] dark:text-[#E03643] bg-[#FDF0F0] dark:bg-[#331418] px-2.5 py-0.5 rounded-lg border border-[#F5CDD0] dark:border-[#521E25]">
                    {act.day}
                  </span>
                  <span className="text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">{act.time}</span>
                </div>
                <h4 className="text-lg font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                  {act.name}
                </h4>
                <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Servant Roster Table */}
        <div className="rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBDDCF] dark:border-[#3A1C20]">
            <div>
              <h3 className="text-xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB]">
                Jadwal Petugas Pelayanan (Roster Ibadah)
              </h3>
              <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
                Susunan pelayan firman, musik, multimedia, dan usher untuk ibadah mendatang
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCopyWaBroadcast}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  copiedWa
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
                title="Salin Jadwal Petugas untuk Broadcast WhatsApp"
              >
                {copiedWa ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Format WA Tersalin!</span>
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Salin Format WA</span>
                  </>
                )}
              </button>

              <a
                href="#layanan"
                className="px-4 py-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#C5222E] dark:text-[#E03643] hover:bg-[#FDF0F0] text-xs font-bold transition-colors"
              >
                Ajukan Jadwal Pelayanan
              </a>
            </div>
          </div>

          {/* Roster Category Filter Tabs */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filter kategori roster"
          >
            {ROSTER_TABS.map((tab) => {
              const isActive = selectedRosterCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedRosterCategory(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5222E] focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-[#C5222E] text-white shadow-xs'
                      : 'bg-[#F7F2E8] dark:bg-[#2A161A] text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-[#EFE6D5] dark:hover:bg-[#33181E] border border-[#EBDDCF] dark:border-[#3A1C20]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          {(() => {
            const filteredRoster = roster
              .filter((item) => selectedRosterCategory === 'all' || item.serviceCategory === selectedRosterCategory)
              .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

            if (loading) {
              return (
                <div className="space-y-3" aria-busy="true" aria-live="polite">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-28" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  ))}
                </div>
              );
            }

            if (filteredRoster.length === 0) {
              return (
                <EmptyState
                  icon={<CalendarIcon className="h-6 w-6" />}
                  title="Belum ada jadwal petugas pelayanan"
                  description={`Jadwal untuk kategori "${ROSTER_TABS.find((t) => t.id === selectedRosterCategory)?.label}" akan tampil di sini setelah admin mempublikasikannya.`}
                />
              );
            }

            return (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#EBDDCF] dark:border-[#3A1C20] text-[#6E5D5F] dark:text-[#B5A1A3]">
                      <th className="pb-3 font-bold">Kategori</th>
                      <th className="pb-3 font-bold">Tanggal</th>
                      <th className="pb-3 font-bold">Tugas / Peran</th>
                      <th className="pb-3 font-bold">Nama Pelayan</th>
                      <th className="pb-3 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBDDCF]/60 dark:divide-[#3A1C20]/60">
                    {filteredRoster.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FDFBF7] dark:hover:bg-[#2A161A] focus-within:bg-[#FDF0F0] dark:focus-within:bg-[#331418] transition-colors"
                      >
                        <td className="py-3.5 pr-3 font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                          {item.serviceCategory === 'general'
                            ? 'Ibadah Raya'
                            : item.serviceCategory === 'youth'
                            ? 'Grow Youth'
                            : item.serviceCategory === 'kidz'
                            ? 'COC Kidz'
                            : 'Hana & Komsel'}
                        </td>
                        <td className="py-3.5 pr-3 text-[#5A4D4E] dark:text-[#D5C2C4] font-mono">
                          {item.serviceDate}
                        </td>
                        <td className="py-3.5 pr-3 font-semibold text-[#C5222E] dark:text-[#E03643]">
                          {item.role}
                        </td>
                        <td className="py-3.5 pr-3 text-[#1F1617] dark:text-[#F5EFEB]">
                          {item.servantName}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              item.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                : item.status === 'replacement'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                                : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800/60'
                            }`}
                          >
                            {item.status === 'confirmed'
                              ? 'Siap Melayani'
                              : item.status === 'replacement'
                              ? 'Pengganti'
                              : 'Menunggu'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

      </div>
    </section>
  );
}
