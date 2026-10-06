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
      color: 'bg-[#FDF0F0] text-[#C5222E] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',
    },
    {
      step: '02',
      title: 'Penyambutan Penuh Kasih',
      desc: 'Tim Usher & Welcoming siap menyambut Anda dengan hangat di pintu masuk sanctuary gereja.',
      icon: Smile,
      badge: 'Sambutan Hangat',
      color: 'bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]',
    },
    {
      step: '03',
      title: 'Ibadah Anak COC Kidz',
      desc: 'Anak-anak Anda dididik dalam firman Tuhan dengan penuh sukacita di kelas Sekolah Minggu (09.30 WIB).',
      icon: Baby,
      badge: 'Ramah Keluarga',
      color: 'bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7] dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]',
    },
    {
      step: '04',
      title: 'Komunitas Bertumbuh',
      desc: 'Bergabung dalam Komsel Ekklesia, Youth Grow Generation, dan Persekutuan Wanita Hana.',
      icon: Users,
      badge: 'Persekutuan Intim',
      color: 'bg-[#FDF0F4] text-[#A6264A] border-[#F7C6D5] dark:bg-[#33121E] dark:text-[#EA7FA0] dark:border-[#541D30]',
    },
  ];

  return (
    <section id="kunjungan" className="py-24 bg-[#F7F2E8]/60 dark:bg-[#1A0E10]/60 border-y border-[#EBDDCF] dark:border-[#3A1C20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Panduan Jemaat Baru & Tamu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Baru Pertama Kali ke GIA Deliksari?
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
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
                className="p-7 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-[#C5222E]/40 dark:text-[#E03643]/40">
                      {item.step}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] flex items-center justify-center text-[#C5222E] dark:text-[#E03643]">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner CTA Box: Sacred Crimson-Maroon Gradient */}
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-r from-[#C5222E] via-[#A81722] to-[#80141C] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Punya Pertanyaan Sebelum Hadir?
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
              Tim pastoral kami siap membantu menjawab pertanyaan mengenai lokasi, ibadah anak, maupun permohonan doa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#80141C] hover:bg-[#FDFBF7] font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp Pastoral</span>
            </a>

            <a
              href="#kontak"
              className="px-5 py-3.5 rounded-2xl bg-red-900/50 hover:bg-red-900/70 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
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
