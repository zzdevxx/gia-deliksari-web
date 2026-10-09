'use client';

import React from 'react';
import { 
  Compass, 
  MapPin, 
  Smile, 
  Users, 
  Baby, 
  Heart, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { WhatsAppIcon } from './Icons';

export default function HospitalitySection() {
  const whatsappUrl =
    'https://api.whatsapp.com/send?phone=6289620961103&text=Syalom%20GIA%20Deliksari,%20saya%20jemaat%20baru%20dan%20ingin%20bertanya%20seputar%20ibadah.';

  const steps = [
    {
      step: '01',
      title: 'Akses & Parkir Nyaman',
      desc: 'Lokasi gereja mudah dijangkau di Deliksari Gunungpati dengan area parkir aman untuk motor & mobil.',
      icon: MapPin,
      badge: 'Lokasi Strategis',
      color: 'bg-[#F9FAFB] text-[#4B5563] border-[var(--border)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] dark:border-[var(--border)]',
    },
    {
      step: '02',
      title: 'Penyambutan Penuh Kasih',
      desc: 'Tim Usher & Welcoming siap menyambut Anda dengan hangat di pintu masuk sanctuary gereja.',
      icon: Smile,
      badge: 'Sambutan Hangat',
      color: 'bg-[var(--surface-raised)] text-[var(--muted-foreground)] border-[var(--border)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] dark:border-[var(--border)]',
    },
    {
      step: '03',
      title: 'Ibadah Anak COC Kidz',
      desc: 'Anak-anak Anda dididik dalam firman Tuhan dengan penuh sukacita di kelas Sekolah Minggu (09.30 WIB).',
      icon: Baby,
      badge: 'Ramah Keluarga',
      color: 'bg-[#F9FAFB] text-[#4B5563] border-[var(--border)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] dark:border-[var(--border)]',
    },
    {
      step: '04',
      title: 'Komunitas Bertumbuh',
      desc: 'Bergabung dalam Komsel Ekklesia, Youth Grow Generation, dan Persekutuan Wanita Hana.',
      icon: Users,
      badge: 'Persekutuan Intim',
      color: 'bg-[var(--brand-tint)] text-[var(--brand-text)] border-[var(--brand-tint-border)] dark:bg-[var(--brand-tint)] dark:text-[var(--brand-text)] dark:border-[var(--brand-tint-border)]',
    },
  ];

  return (
    <section id="kunjungan" className="py-24 bg-[var(--surface-raised)]/50 dark:bg-[#12141A]/50 border-y border-[var(--border)] dark:border-[var(--border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#4B5563]" />
            <span>Panduan Jemaat Baru & Tamu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
            Baru Pertama Kali ke GIA Deliksari?
          </h2>
          <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
            Kami sangat bergembira menyambut kehadiran Anda. Berikut langkah sederhana untuk menikmati ibadah bersama kami hari Minggu ini.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs hover:border-[#4B5563]/50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                      {item.step}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center text-[var(--foreground)] dark:text-[var(--foreground)]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner CTA Box: Altar Stone Invitation Box */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#111827] dark:bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)]">
              Punya Pertanyaan Sebelum Hadir?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              Tim pastoral kami siap membantu menjawab pertanyaan mengenai lokasi, ibadah anak, maupun permohonan doa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[var(--card)] dark:bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--surface-raised)] font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-transform active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp Pastoral</span>
            </a>

            <a
              href="#kontak"
              className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 border border-white/20 text-[var(--foreground)] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Petunjuk Lokasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
