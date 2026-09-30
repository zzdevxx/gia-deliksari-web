'use client';

import React from 'react';
import Image from 'next/image';
import {
  Heart,
  Sparkles,
  Users,
  BookOpen,
  MapPin,
  ExternalLink,
  Church,
  GraduationCap
} from 'lucide-react';
import { InstagramIcon } from './Icons';

export default function AboutSection() {
  const pastoralTeam = [
    {
      name: 'Pdt. Yohanes Sutono, S.Th., M.Ag.',
      role: 'Gembala Sidang',
      desc: 'Memimpin dan menggembalakan jemaat GIA Deliksari dengan keteladanan firman Tuhan, kerendahan hati, dan doa penggembalaan.',
      image: '/images/pastor-yohanes.jpg',
      badge: 'Gembala Sidang',
      instagram: 'https://www.instagram.com/ps.yohanessutono/',
    },
    {
      name: 'Ibu Santini Lidyawati',
      role: 'Pendamping Gembala',
      desc: 'Mendampingi penggembalaan jemaat serta memimpin persekutuan kaum wanita Hana dengan kehangatan kasih dan keteladanan hidup.',
      image: '/images/pastor-yohanes.jpg',
      badge: 'Pendamping Gembala',
      instagram: 'https://www.instagram.com/santinilidyawati/',
    },
    {
      name: 'Sdr. Noel Yosan Loveano, S.Th.',
      role: 'Youth Pastor',
      desc: 'Membimbing generasi muda Grow Generation dan melayani pengajaran firman yang kontekstual bagi pemuda dan mahasiswa perantauan.',
      image: '/images/pastor-yohanes.jpg',
      badge: 'Youth Pastor',
      instagram: 'https://www.instagram.com/noelloveano_/',
    },
  ];

  return (
    <section id="tentang" className="py-24 bg-[#FDFBF7] dark:bg-[#150B0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-[#C5222E] text-[#C5222E]" />
            <span>Mengenal GIA Deliksari</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Bertumbuh Bersama Sebagai Keluarga Allah
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
            Gereja Isa Almasih (GIA) Deliksari adalah persekutuan keluarga Allah di kawasan Sekaran, Gunungpati, Semarang. Kami rindu membawa terang Kristus, memperlengkapi jemaat dengan firman kebenaran, dan mendampingi setiap generasi.
          </p>
        </div>

        {/* 2 Big Core Pillars: Vision + Values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">

          {/* Vision Banner */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#C5222E] via-[#A81722] to-[#7B0F17] text-white shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/25 uppercase tracking-wider">
                Visi Penggembalaan
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                GROWING CHURCH!
              </h3>
              <p className="text-sm sm:text-base text-red-100 leading-relaxed">
                Menjadi gereja yang senantiasa bertumbuh dalam iman yang berakar pada Kristus, bertumbuh dalam kasih persaudaraan yang tulus, dan bertumbuh dalam perbuatan baik yang memberkati lingkungan sekitar.
              </p>
            </div>

            <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-red-200">
              <span>Kolose 2:6-7</span>
              <span className="font-semibold">&ldquo;Berakar dan Dibangun di dalam Dia&rdquo;</span>
            </div>
          </div>

          {/* Context & Ministry Characteristics */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] flex items-center justify-center text-[#C5222E] dark:text-[#E03643]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Berakar Firman
                </h4>
                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  Pengajaran Alkitab yang setia, kontekstual, dan membangun dasar hidup jemaat dalam menghadapi tantangan zaman.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] dark:bg-[#331812] flex items-center justify-center text-[#C83E20] dark:text-[#F88B72]">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Persekutuan Kasih
                </h4>
                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  Komunitas hangat di mana jemaat lintas generasi saling menguatkan, mendoakan, dan melayani dengan tulus.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Church className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Gedung & Fasilitas
                </h4>
                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  Gedung Sanctuary Utama, Ruang Bethel (anak & pemuda), serta Pastori di Jl. Kolonel HR Hadijanto Sekaran.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Keluarga & Mahasiswa
                </h4>
                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  Terbuka bagi keluarga warga Semarang serta menjadi rumah kedua bagi rekan mahasiswa perantauan di sekitar kampus UNNES.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Pastoral Leadership Team */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB]">
            Tim Penggembalaan
          </h3>
          <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4]">
            Hamba-hamba Tuhan yang melayani jemaat GIA Deliksari dengan keteladanan dan kerendahan hati.
          </p>
        </div>

        {/* 3 Pastoral Leaders Centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pastoralTeam.map((leader) => (
            <div
              key={leader.name}
              className="p-6 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F2E8] dark:bg-[#2A161A]">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FDF0F0] text-[#9A1620] border border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]">
                      {leader.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-[#1F1617] dark:text-[#F5EFEB] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors">
                    {leader.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#C5222E] dark:text-[#E03643]">
                    {leader.role}
                  </p>
                </div>

                <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                  {leader.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60">
                <a
                  href={leader.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4D4E] dark:text-[#D5C2C4] hover:text-[#C5222E] dark:hover:text-[#E03643] transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#C5222E]" />
                  <span>Media Sosial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
