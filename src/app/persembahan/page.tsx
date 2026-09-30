import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GivingSection from '@/components/GivingSection';
import { Heart, ShieldCheck, CreditCard, QrCode } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Persembahan Kasih & QRIS Digital',
  description:
    'Dukungan pelayanan pekerjaan rumah Tuhan GIA Deliksari Semarang melalui persembahan umum, persepuluhan, pembangunan, dan diakonia via transfer bank dan QRIS digital.',
};

export default function PersembahanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#150B0D] text-[#1F1617] dark:text-[#F5EFEB] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-10 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F7F2E8]/50 dark:from-[#150B0D] dark:via-[#150B0D] dark:to-[#1A0E10] border-b border-[#EBDDCF] dark:border-[#3A1C20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-[#C5222E] text-[#C5222E]" />
            <span>Pemberian Sukacita & Akuntabilitas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight mb-4">
            Persembahan & Dukungan Pelayanan
          </h1>
          <p className="text-base sm:text-lg text-[#5A4D4E] dark:text-[#D5C2C4] max-w-3xl leading-relaxed">
            Terima kasih atas kemurahan hati dan kesetiaan Anda dalam menabur di ladang pelayanan Tuhan di GIA Deliksari Semarang. Setiap persembahan dikelola dengan transparansi dan penuh tanggung jawab.
          </p>
        </div>
      </section>

      {/* Main Giving Section */}
      <main className="flex-1">
        <GivingSection />
      </main>

      <Footer />
    </div>
  );
}
