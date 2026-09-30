'use client';

import React from 'react';
import { Clock, Compass, Sparkles, MapPin, Heart, BookOpen, Flag, Award } from 'lucide-react';

interface Milestone {
  year: string;
  title: string;
  badge: string;
  description: string;
  highlight: string;
  icon: React.ReactNode;
}

export default function ChurchHistorySection() {
  const milestones: Milestone[] = [
    {
      year: '1979',
      badge: 'Masa Perintisan',
      title: 'Awal Mula Persekutuan Doa Deliksari',
      description:
        'Bermula dari kerinduan beberapa keluarga sederhana di perbukitan Deliksari, Gunungpati untuk berkumpul, berdoa, dan membaca firman Tuhan dari rumah ke rumah.',
      highlight: 'Persekutuan doa rumah tangga pertama di kawasan Deliksari.',
      icon: <Compass className="w-5 h-5 text-[#C5222E] dark:text-[#E03643]" />,
    },
    {
      year: '1995',
      badge: 'Pembangunan Fisik',
      title: 'Pendirian Gedung Gereja Permanen',
      description:
        'Melalui kemurahan Tuhan dan gotong royong jemaat, peletakan batu pertama dilakukan di Jl. Kolonel HR Hadijanto. Gedung sanctuary utama resmi berdiri sebagai pusat ibadah jemaat.',
      highlight: 'Gedung gereja permanen pertama diresmikan di Sekaran.',
      icon: <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      year: '2010',
      badge: 'Visi Baru',
      title: 'Penggembalaan Pdt. Yohanes Sutono & Growing Church',
      description:
        'Pdt. Yohanes Sutono, S.Th., M.Ag. bersama Ibu Santini Lidyawati mulai menggembalakan jemaat dengan visi "Growing Church!" — bertumbuh dalam iman, kasih, dan pengharapan.',
      highlight: 'Struktur komsel wilayah dan persekutuan wanita Hana dibentuk.',
      icon: <Heart className="w-5 h-5 text-[#C5222E] dark:text-[#E03643]" />,
    },
    {
      year: '2018',
      badge: 'Generasi Muda',
      title: 'Lahirnya Grow Generation Youth & Komsel Mahasiswa',
      description:
        'Menyambut kehadiran ribuan mahasiswa kampus UNNES di sekitar gereja, wadah pemuda Grow Generation (PRBK) diresmikan bersama Kak Noel Yosan S.Th. untuk memuridkan anak muda.',
      highlight: 'Ibadah kontemporer Sabtu sore & Komsel Ekklesia berkembang.',
      icon: <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      year: '2026',
      badge: 'Era Sekarang',
      title: '47 Tahun Melayani & Transformasi Pelayanan Holistik',
      description:
        'GIA Deliksari terus melangkah sebagai gereja yang relevan bagi keluarga, anak-anak (COC Kidz), pemuda, dan jemaat sepuh, mengintegrasikan pelayanan onsite yang hangat dengan platform digital.',
      highlight: 'Pelayanan terintegrasi, transparan, dan menjangkau lintas generasi.',
      icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  return (
    <section id="sejarah" className="py-24 bg-[#F7F2E8]/40 dark:bg-[#1A0E10] border-y border-[#EBDDCF] dark:border-[#3A1C20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Perjalanan Iman 47 Tahun (1979 - 2026)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Jejak Langkah & Sejarah GIA Deliksari
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
            Menoleh ke belakang untuk bersyukur atas kesetiaan Tuhan yang memelihara jemaat dari masa perintisan sederhana hingga kini menjadi rumah rohani yang berakar dan berbuah.
          </p>
        </div>

        {/* Timeline Desktop & Mobile */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Timeline Spine Line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#C5222E] via-amber-500 to-emerald-500 opacity-30 dark:opacity-40 hidden sm:block" />
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#C5222E] via-amber-500 to-emerald-500 opacity-30 dark:opacity-40 sm:hidden" />

          <div className="space-y-10 sm:space-y-12">
            {milestones.map((m, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={m.year}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Badge Dot in Center */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-[#221215] border-2 border-[#C5222E] dark:border-[#E03643] shadow-md flex items-center justify-center z-10">
                    {m.icon}
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden sm:block sm:w-1/2" />

                  {/* Card Content */}
                  <div className="pl-14 sm:pl-0 sm:w-1/2 sm:px-8 w-full">
                    <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xl font-extrabold text-[#C5222E] dark:text-[#E03643]">
                          {m.year}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF0F0] text-[#9A1620] dark:bg-[#331418] dark:text-[#F2828C] border border-[#F5CDD0] dark:border-[#521E25]">
                          {m.badge}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                        {m.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                        {m.description}
                      </p>

                      <div className="pt-2 text-[11px] font-medium text-[#80141C] dark:text-[#F2828C] border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{m.highlight}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Closing Foundation Quote */}
        <div className="mt-16 text-center max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs">
          <p className="text-sm sm:text-base font-serif italic text-[#1F1617] dark:text-[#F5EFEB]">
            &ldquo;Sampai di sini TUHAN telah menolong kita.&rdquo;
          </p>
          <span className="text-xs font-bold text-[#C5222E] dark:text-[#E03643] mt-1 block">
            1 Samuel 7:12 (Eben-Haezer)
          </span>
        </div>

      </div>
    </section>
  );
}
