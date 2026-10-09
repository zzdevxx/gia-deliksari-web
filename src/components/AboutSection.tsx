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
    <section id="tentang" className="py-24 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-[#4B5563]" />
            <span>Mengenal GIA Deliksari</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
            Bertumbuh Bersama Sebagai Keluarga Allah
          </h2>
          <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
            Gereja Isa Almasih (GIA) Deliksari adalah persekutuan keluarga Allah di kawasan Sekaran, Gunungpati, Semarang. Kami rindu membawa terang Kristus, memperlengkapi jemaat dengan firman kebenaran, dan mendampingi setiap generasi.
          </p>
        </div>

        {/* 2 Big Core Pillars: Vision + Values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">

          {/* Vision Banner */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-2xl bg-[var(--card)] text-[var(--foreground)] border border-[#4B5563]/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#4B5563]/15 text-[var(--muted-foreground)] border border-[#4B5563]/40 uppercase tracking-wider">
                Visi Penggembalaan
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] leading-tight">
                GROWING CHURCH!
              </h3>
              <p className="text-sm sm:text-base text-[#E5E7EB] leading-relaxed">
                Menjadi gereja yang senantiasa bertumbuh dalam iman yang berakar pada Kristus, bertumbuh dalam kasih persaudaraan yang tulus, dan bertumbuh dalam perbuatan baik yang memberkati lingkungan sekitar.
              </p>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>Kolose 2:6-7</span>
              <span className="font-semibold">&ldquo;Berakar dan Dibangun di dalam Dia&rdquo;</span>
            </div>
          </div>

          {/* Context & Ministry Characteristics */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Berakar Firman
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                  Pengajaran Alkitab yang setia, kontekstual, dan membangun dasar hidup jemaat dalam menghadapi tantangan zaman.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Persekutuan Kasih
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                  Komunitas hangat di mana jemaat lintas generasi saling menguatkan, mendoakan, dan melayani dengan tulus.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] dark:bg-[#1F232D] flex items-center justify-center text-[#4B5563] dark:text-[var(--muted-foreground)]">
                <Church className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Gedung & Fasilitas
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                  Gedung Sanctuary Utama, Ruang Bethel (anak & pemuda), serta Pastori di Jl. Kolonel HR Hadijanto Sekaran.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
                  Keluarga & Mahasiswa
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                  Terbuka bagi keluarga warga Semarang serta menjadi rumah kedua bagi rekan mahasiswa perantauan di sekitar kampus UNNES.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Pastoral Leadership Team */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">
            Tim Penggembalaan
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
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
                className="p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] transition-colors flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Clean Monogram / Avatar Visual Card */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--surface-raised)] dark:bg-[#1F232D] p-6 flex flex-col justify-between text-[var(--foreground)] dark:text-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)]">
                    <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full border-b border-l border-[#4B5563]/30 dark:border-[#9CA3AF]/30" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-[var(--card)]/75 flex items-center justify-center text-[#4B5563] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
                        <LeaderIcon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/70 dark:bg-[var(--card)]/75 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
                        {leader.badge}
                      </span>
                    </div>

                    <div className="text-center my-auto py-2">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-[#4B5563] dark:text-[var(--muted-foreground)] mb-2">GIA DELIKSARI</span>
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--brand-text)] dark:text-[var(--brand-text)] font-serif">
                        {leader.initials}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/70 dark:bg-[var(--card)]/75 text-[10px] font-medium text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
                        Foto resmi belum tersedia
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[var(--foreground)] dark:text-[var(--foreground)] group-hover:text-[var(--brand-text)] dark:group-hover:text-[var(--brand-text)] transition-colors">
                      {leader.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#4B5563] dark:text-[var(--muted-foreground)]">
                      {leader.role}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                    {leader.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] dark:border-[var(--border)]">
                  <a
                    href={leader.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-[#4B5563] dark:text-[var(--muted-foreground)]" />
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
