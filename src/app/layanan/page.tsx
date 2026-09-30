import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MinistryRegistrationSection from '@/components/MinistryRegistrationSection';
import { HeartHandshake, Sparkles, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Layanan Jemaat & Permohonan Doa',
  description:
    'Pusat layanan jemaat GIA Deliksari Semarang: Permohonan Doa, Konseling Pastoral, Pendaftaran Sakramen Baptisan/Penyerahan Anak, Komsel Ekklesia, dan Volunteer Pelayan Ibadah.',
};

export default function LayananPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#150B0D] text-[#1F1617] dark:text-[#F5EFEB] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F7F2E8]/50 dark:from-[#150B0D] dark:via-[#150B0D] dark:to-[#1A0E10] border-b border-[#EBDDCF] dark:border-[#3A1C20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider mb-4">
            <HeartHandshake className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Pusat Pelayanan & Pendampingan Jemaat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight mb-4">
            Layanan Doa, Sakramen & Komunitas
          </h1>
          <p className="text-base sm:text-lg text-[#5A4D4E] dark:text-[#D5C2C4] max-w-3xl leading-relaxed">
            Gereja adalah keluarga Allah yang saling menopang. Apakah Anda memerlukan pokok doa, konseling pastoral, pendaftaran sakramen kudus, atau rindu bertumbuh dalam kelompok sel, tim pastoral kami siap melayani Anda.
          </p>

          {/* Quick Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF0F0] dark:bg-[#331418] flex items-center justify-center text-[#C5222E] shrink-0 font-bold">
                🙏
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB]">Doa & Konseling</h4>
                <p className="text-[11px] text-[#5A4D4E] dark:text-[#D5C2C4]">Dukungan doa & kunjungan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                💧
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB]">Sakramen Kudus</h4>
                <p className="text-[11px] text-[#5A4D4E] dark:text-[#D5C2C4]">Baptisan & penyerahan anak</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 shrink-0 font-bold">
                🏘️
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB]">Komsel Ekklesia</h4>
                <p className="text-[11px] text-[#5A4D4E] dark:text-[#D5C2C4]">Kelompok sel & pemuridan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                ✨
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB]">Volunteer Pelayan</h4>
                <p className="text-[11px] text-[#5A4D4E] dark:text-[#D5C2C4]">Musik, media, usher, dll</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Form */}
      <main className="flex-1">
        <MinistryRegistrationSection />
      </main>

      <Footer />
    </div>
  );
}
