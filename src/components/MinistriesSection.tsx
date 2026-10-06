'use client';

import React from 'react';
import {
  Users,
  Flame,
  Baby,
  HeartHandshake,
  Clock,
  ChevronRight,
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
      gradient: 'from-[#80141C] via-[#C5222E] to-[#520B11]',
      badge: 'Ibadah Utama',
      badgeColor: 'bg-white/20 text-white border-white/25',
      accentColor: 'border-l-4 border-l-[#C5222E]',
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
      gradient: 'from-[#C83E20] via-[#E05333] to-[#80141C]',
      badge: 'Pemuda & Remaja',
      badgeColor: 'bg-white/20 text-white border-white/25',
      accentColor: 'border-l-4 border-l-[#C83E20]',
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
      gradient: 'from-[#B87A14] via-[#D4AF37] to-[#8A5A0A]',
      badge: 'Sekolah Minggu',
      badgeColor: 'bg-white/20 text-white border-white/25',
      accentColor: 'border-l-4 border-l-[#C59B27]',
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
      gradient: 'from-[#A6264A] via-[#C5222E] to-[#7B0F17]',
      badge: 'Wanita & Komsel',
      badgeColor: 'bg-white/20 text-white border-white/25',
      accentColor: 'border-l-4 border-l-[#A6264A]',
      instagram: 'https://www.instagram.com/pwkhana_/',
    },
  ];

  return (
    <section id="pelayanan" className="py-24 bg-[#F7F2E8]/60 dark:bg-[#1A0E10]/60 border-y border-[#EBDDCF] dark:border-[#3A1C20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>4 Komunitas Ibadah & Pelayanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Wadah Bertumbuh Bagi Setiap Generasi
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
            Dari anak-anak, remaja, pemuda, hingga kaum wanita dan keluarga, temukan komunitas yang tepat untuk bertumbuh bersama kami.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ministries.map((ministry) => {
            const MinistryIcon = ministry.icon;
            return (
              <div
                key={ministry.id}
                className={`rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${ministry.accentColor}`}
              >
                <div>
                  {/* Clean Visual Header Template */}
                  <div className={`relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br ${ministry.gradient} p-6 flex flex-col justify-between text-white shadow-inner`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md ${ministry.badgeColor}`}>
                        {ministry.badge}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-sm text-[10px] font-medium text-white/90 border border-white/10">
                        📷 Foto Segera Diperbarui
                      </span>
                    </div>

                    <div className="my-auto py-2 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MinistryIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/30 backdrop-blur-sm text-xs font-bold text-white border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-white" />
                        <span>{ministry.schedule}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-white/90 hidden sm:inline">
                        {ministry.location}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 sm:p-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors">
                        {ministry.title}
                      </h3>
                      <p className="text-xs font-bold text-[#C5222E] dark:text-[#E03643] mt-0.5">
                        {ministry.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                      {ministry.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-7 sm:px-8 pb-7 pt-2 flex items-center justify-between border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60">
                  <a
                    href={ministry.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4D4E] dark:text-[#D5C2C4] hover:text-[#C5222E] dark:hover:text-[#E03643] transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-[#C5222E]" />
                    <span>Instagram</span>
                  </a>

                  <div className="flex items-center gap-1 text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
                    <MapPin className="w-3.5 h-3.5 text-[#C5222E]" />
                    <span>{ministry.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
