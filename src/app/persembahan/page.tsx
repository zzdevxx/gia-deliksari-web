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
  alternates: {
    canonical: '/persembahan',
  },
};

export default function PersembahanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#141312] text-[#1C1917] dark:text-[#F5F3EF] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-10 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2] to-[#F3EFE6]/50 dark:from-[#141312] dark:via-[#141312] dark:to-[#16171B] border-b border-[#E5DFD5] dark:border-[#332F2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#8B1E28] dark:text-[#E88086] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-[#8B1E28] text-[#8B1E28] dark:text-[#E88086]" />
            <span>Pemberian Sukacita & Akuntabilitas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight mb-4">
            Persembahan & Dukungan Pelayanan
          </h1>
          <p className="text-base sm:text-lg text-[#665E55] dark:text-[#A8A196] max-w-3xl leading-relaxed">
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
