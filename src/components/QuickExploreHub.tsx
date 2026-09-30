'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Film, HeartHandshake, Heart, ArrowRight, Sparkles } from 'lucide-react';

export default function QuickExploreHub() {
  const hubs = [
    {
      title: 'Warta & Jadwal Ibadah',
      badge: 'Update Mingguan',
      description: 'Papan pengumuman jemaat, susunan petugas pelayanan (roster), dan buletin cetak A4.',
      href: '/info',
      icon: <Calendar className="w-6 h-6 text-[#C5222E] dark:text-[#E03643]" />,
      actionText: 'Buka Warta & Jadwal',
      bgHover: 'hover:border-[#C5222E]/40',
      badgeColor: 'bg-[#FDF0F0] text-[#9A1620] dark:bg-[#331418] dark:text-[#F2828C] border-[#F5CDD0] dark:border-[#521E25]',
    },
    {
      title: 'Khotbah & Galeri Foto',
      badge: 'Media & Dokumentasi',
      description: 'Saksikan video khotbah YouTube Data API v3 dan arsip foto dokumentasi ibadah jemaat.',
      href: '/media',
      icon: <Film className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      actionText: 'Lihat Khotbah & Galeri',
      bgHover: 'hover:border-amber-500/40',
      badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    {
      title: 'Layanan & Permohonan Doa',
      badge: 'Pendampingan Jemaat',
      description: 'Kirimkan pokok doa, jadwalkan konseling pastoral, pendaftaran baptisan, dan komsel.',
      href: '/layanan',
      icon: <HeartHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      actionText: 'Ajukan Permohonan',
      bgHover: 'hover:border-blue-500/40',
      badgeColor: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    },
    {
      title: 'Persembahan & QRIS',
      badge: 'Dukungan Pelayanan',
      description: 'Salin nomor rekening BCA & BRI resmi, scan QRIS digital, dan konfirmasi persembahan.',
      href: '/persembahan',
      icon: <Heart className="w-6 h-6 fill-[#C5222E] text-[#C5222E]" />,
      actionText: 'Info Persembahan',
      bgHover: 'hover:border-emerald-500/40',
      badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#150B0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Pusat Informasi & Pelayanan Jemaat</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Akses Cepat Layanan Gereja
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] max-w-2xl mx-auto">
            Temukan informasi warta, jadwal ibadah, video firman Tuhan, dan formulir permohonan doa pada modul khusus yang telah disediakan.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub) => (
            <Link
              key={hub.title}
              href={hub.href}
              className={`group p-6 rounded-[2rem] bg-[#FDFBF7] dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${hub.bgHover}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {hub.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${hub.badgeColor}`}>
                    {hub.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-[#1F1617] dark:text-[#F5EFEB] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors">
                    {hub.title}
                  </h3>
                  <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                    {hub.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center justify-between text-xs font-bold text-[#C5222E] dark:text-[#E03643] group-hover:translate-x-0.5 transition-transform">
                <span>{hub.actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
