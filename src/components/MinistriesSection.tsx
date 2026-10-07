'use client';

import React from 'react';
import {
  Users,
  Flame,
  Baby,
  HeartHandshake,
  Clock,
  MapPin
} from 'lucide-react';
import { InstagramIcon } from './Icons';

export default function MinistriesSection() {
  const ministries = [
    {
      id: 'general',
      title: 'Ibadah Raya Umum',
      subtitle: 'Persekutuan Seluruh Jemaat & Keluarga',
      schedule: 'Minggu, 09.00 - 11.00 WIB',
      location: 'Gedung Utama (Sanctuary)',
      desc: 'Ibadah puncak persekutuan jemaat dengan pujian penyembahan DS Worship, firman penggembalaan, dan sakramen perjamuan kudus.',
      icon: Users,
      tone: 'text-[#8B1E28] dark:text-[#B8323D]',
      badge: 'Ibadah Utama',
      instagram: 'https://www.instagram.com/giadeliksari/',
    },
    {
      id: 'youth',
      title: 'Grow Generation Youth',
      subtitle: 'Komunitas Remaja & Pemuda (PRBK)',
      schedule: 'Sabtu, 18.00 - 20.00 WIB',
      location: 'Gedung Utama / Ruang Bethel',
      desc: 'Wadah fellowship, pemuridan, dan kreativitas generasi muda untuk bertumbuh relevan dalam iman dan kasih persaudaraan (Pola 4-Minggu: M1 & M3 Youth, M2 & M4 Komsel).',
      icon: Flame,
      tone: 'text-[#A0442C] dark:text-[#D96B4F]',
      badge: 'Pemuda & Remaja',
      instagram: 'https://www.instagram.com/growgeneration_/',
    },
    {
      id: 'kidz',
      title: 'COC Kidz (Sekolah Minggu)',
      subtitle: 'Generasi Anak & Balita',
      schedule: 'Minggu, 09.30 - 10.30 WIB',
      location: 'Ruang Bethel',
      desc: 'Pendidikan karakter kristiani yang interaktif, puji-pujian sukacita, dan pengenalan firman Tuhan sejak usia dini sesuai kelompok umur.',
      icon: Baby,
      tone: 'text-[#8C6826] dark:text-[#E0B85C]',
      badge: 'Sekolah Minggu',
      instagram: 'https://www.instagram.com/cockidz/',
    },
    {
      id: 'hana',
      title: 'Wanita Hana & Komsel Ekklesia',
      subtitle: 'Persekutuan Wanita & Sel Keluarga',
      schedule: 'Jumat 17.30 / Selasa 18.30 WIB',
      location: 'Gedung Utama',
      desc: 'Persekutuan wanita Hana (Jumat 17.30 WIB, pola 4-minggu) dan Komsel Ekklesia Sel (Selasa 18.30 WIB) yang saling menguatkan dalam doa dan kasih.',
      icon: HeartHandshake,
      tone: 'text-[#7A354A] dark:text-[#B0657C]',
      badge: 'Wanita & Komsel',
      instagram: 'https://www.instagram.com/pwkhana_/',
    },
  ];

  return (
    <section id="pelayanan" className="py-20 sm:py-24 bg-[#F3EFE6]/50 dark:bg-[#141312] border-y border-[#E5DFD5] dark:border-[#332F2B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6826] dark:text-[#C49B45]">
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>4 Komunitas Ibadah &amp; Pelayanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight">
            Wadah Bertumbuh Bagi Setiap Generasi
          </h2>
          <p className="text-[#665E55] dark:text-[#A8A196] text-base sm:text-lg leading-relaxed">
            Dari anak-anak, remaja, pemuda, hingga kaum wanita dan keluarga, temukan komunitas yang tepat untuk bertumbuh bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {ministries.map((ministry) => {
            const MinistryIcon = ministry.icon;
            return (
              <article
                key={ministry.id}
                className="rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] p-6 sm:p-8 flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] flex items-center justify-center">
                    <MinistryIcon className={`w-6 h-6 ${ministry.tone}`} aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center rounded-md bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] px-2.5 py-1 text-xs font-semibold text-[#665E55] dark:text-[#A8A196]">
                    {ministry.badge}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    {ministry.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#665E55] dark:text-[#A8A196]">
                    {ministry.subtitle}
                  </p>
                </div>

                <p className="mt-4 text-sm text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                  {ministry.desc}
                </p>

                <dl className="mt-6 space-y-3 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 w-4 h-4 shrink-0 text-[#665E55] dark:text-[#A8A196]" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#665E55] dark:text-[#A8A196]">Jadwal</dt>
                      <dd className="text-sm font-medium text-[#1C1917] dark:text-[#F5F3EF]">{ministry.schedule}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-[#665E55] dark:text-[#A8A196]" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#665E55] dark:text-[#A8A196]">Lokasi</dt>
                      <dd className="text-sm font-medium text-[#1C1917] dark:text-[#F5F3EF]">{ministry.location}</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-6 border-t border-[#E5DFD5] dark:border-[#332F2B] pt-3">
                  <a
                    href={ministry.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#665E55] hover:text-[#8B1E28] dark:text-[#A8A196] dark:hover:text-[#B8323D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E28] dark:focus-visible:outline-[#B8323D] transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4 text-[#8B1E28] dark:text-[#B8323D]" />
                    <span>Instagram</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
