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
      tone: 'text-[#475569] dark:text-[#64748B]',
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
      tone: 'text-[#4B5563] dark:text-[#9CA3AF]',
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
      tone: 'text-[#6D28D9] dark:text-[#A78BFA]',
      badge: 'Wanita & Komsel',
      instagram: 'https://www.instagram.com/pwkhana_/',
    },
  ];

  return (
    <section id="pelayanan" className="py-20 sm:py-24 bg-[#F3F4F6]/50 dark:bg-[#0F1115] border-y border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF]">
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>4 Komunitas Ibadah &amp; Pelayanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-[#F9FAFB] tracking-tight">
            Wadah Bertumbuh Bagi Setiap Generasi
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-base sm:text-lg leading-relaxed">
            Dari anak-anak, remaja, pemuda, hingga kaum wanita dan keluarga, temukan komunitas yang tepat untuk bertumbuh bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {ministries.map((ministry) => {
            const MinistryIcon = ministry.icon;
            return (
              <article
                key={ministry.id}
                className="rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] p-6 sm:p-8 flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#F3F4F6] dark:bg-[#1F232D] flex items-center justify-center">
                    <MinistryIcon className={`w-6 h-6 ${ministry.tone}`} aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center rounded-md bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] px-2.5 py-1 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                    {ministry.badge}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">
                    {ministry.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                    {ministry.subtitle}
                  </p>
                </div>

                <p className="mt-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                  {ministry.desc}
                </p>

                <dl className="mt-6 space-y-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1F232D] p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 w-4 h-4 shrink-0 text-[#6B7280] dark:text-[#9CA3AF]" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Jadwal</dt>
                      <dd className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{ministry.schedule}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-[#6B7280] dark:text-[#9CA3AF]" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Lokasi</dt>
                      <dd className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{ministry.location}</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-6 border-t border-[#E5E7EB] dark:border-[#2A2F3A] pt-3">
                  <a
                    href={ministry.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#6B7280] hover:text-[#8B1E28] dark:text-[#9CA3AF] dark:hover:text-[#B8323D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E28] dark:focus-visible:outline-[#B8323D] transition-colors"
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
