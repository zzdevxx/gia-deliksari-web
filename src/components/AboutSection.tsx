'use client';

import React from 'react';
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
      initials: 'YS',
      icon: BookOpen,
      desc: 'Memimpin dan menggembalakan jemaat GIA Deliksari dengan keteladanan firman Tuhan, kerendahan hati, dan doa penggembalaan.',
      badge: 'Gembala Sidang',
      instagram: 'https://www.instagram.com/ps.yohanessutono/',
    },
    {
      name: 'Ibu Santini Lidyawati',
      role: 'Pendamping Gembala',
      initials: 'SL',
      icon: Heart,
      desc: 'Mendampingi penggembalaan jemaat serta memimpin persekutuan kaum wanita Hana dengan kehangatan kasih dan keteladanan hidup.',
      badge: 'Pendamping Gembala',
      instagram: 'https://www.instagram.com/santinilidyawati/',
    },
    {
      name: 'Sdr. Noel Yosan Loveano, S.Th.',
      role: 'Youth Pastor',
      initials: 'NL',
      icon: Sparkles,
      desc: 'Membimbing generasi muda Grow Generation dan melayani pengajaran firman yang kontekstual bagi pemuda dan mahasiswa perantauan.',
      badge: 'Youth Pastor',
      instagram: 'https://www.instagram.com/noelloveano_/',
    },
  ];

  return (
    <section id="tentang" className="py-24 bg-[#FAF7F2] dark:bg-[#141312] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#665E55] dark:text-[#A8A196] text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-[#A37D35]" />
            <span>Mengenal GIA Deliksari</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight">
            Bertumbuh Bersama Sebagai Keluarga Allah
          </h2>
          <p className="text-[#665E55] dark:text-[#A8A196] text-base sm:text-lg leading-relaxed">
            Gereja Isa Almasih (GIA) Deliksari adalah persekutuan keluarga Allah di kawasan Sekaran, Gunungpati, Semarang. Kami rindu membawa terang Kristus, memperlengkapi jemaat dengan firman kebenaran, dan mendampingi setiap generasi.
          </p>
        </div>

        {/* 2 Big Core Pillars: Vision + Values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">

          {/* Vision Banner */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-2xl bg-[#1D1B19] text-[#F5F3EF] border border-[#A37D35]/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#A37D35]/15 text-[#E2C27A] border border-[#A37D35]/40 uppercase tracking-wider">
                Visi Penggembalaan
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F5F3EF] leading-tight">
                GROWING CHURCH!
              </h3>
              <p className="text-sm sm:text-base text-[#D4D0C7] leading-relaxed">
                Menjadi gereja yang senantiasa bertumbuh dalam iman yang berakar pada Kristus, bertumbuh dalam kasih persaudaraan yang tulus, dan bertumbuh dalam perbuatan baik yang memberkati lingkungan sekitar.
              </p>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#C9B98E]">
              <span>Kolose 2:6-7</span>
              <span className="font-semibold">&ldquo;Berakar dan Dibangun di dalam Dia&rdquo;</span>
            </div>
          </div>

          {/* Context & Ministry Characteristics */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] flex items-center justify-center text-[#8B1E28] dark:text-[#B8323D]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1C1917] dark:text-[#F5F3EF]">
                  Berakar Firman
                </h4>
                <p className="text-xs text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                  Pengajaran Alkitab yang setia, kontekstual, dan membangun dasar hidup jemaat dalam menghadapi tantangan zaman.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] flex items-center justify-center text-[#665E55] dark:text-[#A8A196]">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1C1917] dark:text-[#F5F3EF]">
                  Persekutuan Kasih
                </h4>
                <p className="text-xs text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                  Komunitas hangat di mana jemaat lintas generasi saling menguatkan, mendoakan, dan melayani dengan tulus.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF9EC] dark:bg-[#2D2517] flex items-center justify-center text-[#8C6826] dark:text-[#E0B85C]">
                <Church className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1C1917] dark:text-[#F5F3EF]">
                  Gedung & Fasilitas
                </h4>
                <p className="text-xs text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                  Gedung Sanctuary Utama, Ruang Bethel (anak & pemuda), serta Pastori di Jl. Kolonel HR Hadijanto Sekaran.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] flex items-center justify-center text-[#665E55] dark:text-[#A8A196]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[#1C1917] dark:text-[#F5F3EF]">
                  Keluarga & Mahasiswa
                </h4>
                <p className="text-xs text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                  Terbuka bagi keluarga warga Semarang serta menjadi rumah kedua bagi rekan mahasiswa perantauan di sekitar kampus UNNES.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Pastoral Leadership Team */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF]">
            Tim Penggembalaan
          </h3>
          <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A196]">
            Hamba-hamba Tuhan yang melayani jemaat GIA Deliksari dengan keteladanan dan kerendahan hati.
          </p>
        </div>

        {/* 3 Pastoral Leaders Centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pastoralTeam.map((leader) => {
            const LeaderIcon = leader.icon;
            return (
              <div
                key={leader.name}
                className="p-6 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] transition-colors flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Clean Monogram / Avatar Visual Card */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F3EFE6] dark:bg-[#262421] p-6 flex flex-col justify-between text-[#1C1917] dark:text-[#F5F3EF] border border-[#E5DFD5] dark:border-[#332F2B]">
                    <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full border-b border-l border-[#A37D35]/30 dark:border-[#C49B45]/30" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-[#1D1B19]/75 flex items-center justify-center text-[#A37D35] dark:text-[#C49B45] border border-[#E5DFD5] dark:border-[#332F2B]">
                        <LeaderIcon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/70 dark:bg-[#1D1B19]/75 text-[#665E55] dark:text-[#A8A196] border border-[#E5DFD5] dark:border-[#332F2B]">
                        {leader.badge}
                      </span>
                    </div>

                    <div className="text-center my-auto py-2">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-[#A37D35] dark:text-[#C49B45] mb-2">GIA DELIKSARI</span>
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#8B1E28] dark:text-[#B8323D] font-serif">
                        {leader.initials}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/70 dark:bg-[#1D1B19]/75 text-[10px] font-medium text-[#665E55] dark:text-[#A8A196] border border-[#E5DFD5] dark:border-[#332F2B]">
                        Foto resmi belum tersedia
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#1C1917] dark:text-[#F5F3EF] group-hover:text-[#8B1E28] dark:group-hover:text-[#B8323D] transition-colors">
                      {leader.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#A37D35] dark:text-[#C49B45]">
                      {leader.role}
                    </p>
                  </div>

                  <p className="text-xs text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                    {leader.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5DFD5] dark:border-[#332F2B]">
                  <a
                    href={leader.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#665E55] dark:text-[#A8A196] hover:text-[#8B1E28] dark:hover:text-[#B8323D] transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-[#A37D35] dark:text-[#C49B45]" />
                    <span>Media Sosial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
