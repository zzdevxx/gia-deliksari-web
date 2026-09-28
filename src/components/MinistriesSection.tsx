'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Users, 
  Sparkles, 
  Flame, 
  Baby, 
  HeartHandshake, 
  Clock, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { InstagramIcon } from './Icons';

export default function MinistriesSection() {
  const ministries = [
    {
      id: 'general',
      title: 'Ibadah Raya Umum',
      subtitle: 'Persekutuan Seluruh Jemaat & Keluarga',
      schedule: 'Minggu, 09.00 - 11.00 WIB',
      desc: 'Ibadah puncak persekutuan jemaat dengan pujian penyembahan DS Worship, firman penggembalaan, dan sakramen perjamuan kudus.',
      image: '/images/ministry-general.jpg',
      badge: 'Ibadah Utama',
      badgeColor: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',
      accentColor: 'border-l-4 border-l-[#C5222E]',
      instagram: 'https://www.instagram.com/giadeliksari/',
    },
    {
      id: 'youth',
      title: 'Grow Generation Youth',
      subtitle: 'Komunitas Remaja & Pemuda (PRBK)',
      schedule: 'Sabtu, 18.00 - 20.00 WIB',
      desc: 'Wadah fellowship, pemuridan, dan kreativitas generasi muda untuk bertumbuh relevan dalam iman dan kasih persaudaraan.',
      image: '/images/ministry-youth.jpg',
      badge: 'Pemuda & Remaja',
      badgeColor: 'bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7] dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]',
      accentColor: 'border-l-4 border-l-[#C83E20]',
      instagram: 'https://www.instagram.com/growgeneration_/',
    },
    {
      id: 'kidz',
      title: 'COC Kidz (Sekolah Minggu)',
      subtitle: 'Generasi Anak & Balita',
      schedule: 'Minggu, 09.30 - 10.30 WIB',
      desc: 'Pendidikan karakter kristiani yang interaktif, puji-pujian sukacita, dan pengenalan firman Tuhan sejak usia dini.',
      image: '/images/ministry-kidz.jpg',
      badge: 'Sekolah Minggu',
      badgeColor: 'bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]',
      accentColor: 'border-l-4 border-l-[#C59B27]',
      instagram: 'https://www.instagram.com/cockidz/',
    },
    {
      id: 'hana',
      title: 'Wanita Hana & Komsel Ekklesia',
      subtitle: 'Persekutuan Wanita & Sel Keluarga',
      schedule: 'Minggu Bergantian, 18.00 / 18.30 WIB',
      desc: 'Persekutuan wanita Hana (18.00 WIB) dan Komsel Ekklesia (18.30 WIB) yang berjalan selang-seling 4 minggu dalam sebulan.',
      image: '/images/ministry-hana.jpg',
      badge: 'Wanita & Komsel',
      badgeColor: 'bg-[#FDF0F4] text-[#A6264A] border-[#F7C6D5] dark:bg-[#33121E] dark:text-[#EA7FA0] dark:border-[#541D30]',
      accentColor: 'border-l-4 border-l-[#A6264A]',
      instagram: 'https://www.instagram.com/giadeliksari/',
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
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              className={`rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${ministry.accentColor}`}
            >
              <div>
                {/* Photo Top Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F7F2E8] dark:bg-[#2A161A]">
                  <Image
                    src={ministry.image}
                    alt={ministry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#150B0D]/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md ${ministry.badgeColor}`}>
                      {ministry.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#150B0D]/80 backdrop-blur-sm text-xs font-bold text-[#F5CDD0]">
                      <Clock className="w-3.5 h-3.5 text-[#C5222E]" />
                      <span>{ministry.schedule}</span>
                    </div>
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

                <a
                  href="#layanan"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C5222E] dark:text-[#E03643] hover:underline"
                >
                  <span>Daftar / Terhubung</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
