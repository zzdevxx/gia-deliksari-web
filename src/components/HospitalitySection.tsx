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
      color: 'bg-[#FEF9EC] text-[#8C6826] border-[#F5DFAB] dark:bg-[#2D2517] dark:text-[#E0B85C] dark:border-[#52411E]',
    },
    {
      step: '02',
      title: 'Penyambutan Penuh Kasih',
      desc: 'Tim Usher & Welcoming siap menyambut Anda dengan hangat di pintu masuk sanctuary gereja.',
      icon: Smile,
      badge: 'Sambutan Hangat',
      color: 'bg-[#F3EFE6] text-[#665E55] border-[#E5DFD5] dark:bg-[#262421] dark:text-[#A8A196] dark:border-[#332F2B]',
    },
    {
      step: '03',
      title: 'Ibadah Anak COC Kidz',
      desc: 'Anak-anak Anda dididik dalam firman Tuhan dengan penuh sukacita di kelas Sekolah Minggu (09.30 WIB).',
      icon: Baby,
      badge: 'Ramah Keluarga',
      color: 'bg-[#FEF9EC] text-[#8C6826] border-[#F5DFAB] dark:bg-[#2D2517] dark:text-[#E0B85C] dark:border-[#52411E]',
    },
    {
      step: '04',
      title: 'Komunitas Bertumbuh',
      desc: 'Bergabung dalam Komsel Ekklesia, Youth Grow Generation, dan Persekutuan Wanita Hana.',
      icon: Users,
      badge: 'Persekutuan Intim',
      color: 'bg-[#F9EFF3] text-[#7A354A] border-[#E2C3D0] dark:bg-[#26161E] dark:text-[#B0657C] dark:border-[#4A2032]',
    },
  ];

  return (
    <section id="kunjungan" className="py-24 bg-[#F3EFE6]/50 dark:bg-[#16171B]/50 border-y border-[#E5DFD5] dark:border-[#332F2B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#665E55] dark:text-[#A8A196] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#A37D35]" />
            <span>Panduan Jemaat Baru & Tamu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight">
            Baru Pertama Kali ke GIA Deliksari?
          </h2>
          <p className="text-[#665E55] dark:text-[#A8A196] text-base sm:text-lg leading-relaxed">
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
                className="p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-xs hover:border-[#A37D35]/50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-[#A8A196] dark:text-[#57534E]">
                      {item.step}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] flex items-center justify-center text-[#1C1917] dark:text-[#F5F3EF]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1C1917] dark:text-[#F5F3EF]">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#665E55] dark:text-[#A8A196] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner CTA Box: Altar Stone Invitation Box */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#1C1917] dark:bg-[#1D1B19] border border-[#332F2B] text-[#F5F3EF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F3EF]">
              Punya Pertanyaan Sebelum Hadir?
            </h3>
            <p className="text-xs sm:text-sm text-[#A8A196] max-w-xl leading-relaxed">
              Tim pastoral kami siap membantu menjawab pertanyaan mengenai lokasi, ibadah anak, maupun permohonan doa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white text-[#1C1917] hover:bg-[#FAF7F2] font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-transform active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp Pastoral</span>
            </a>

            <a
              href="#kontak"
              className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 border border-white/20 text-[#F5F3EF] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
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
