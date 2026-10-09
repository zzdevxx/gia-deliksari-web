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
    <div className="min-h-screen flex flex-col bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-10 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-b border-[var(--border)] dark:border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-[var(--brand)] text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
            <span>Pemberian Sukacita & Akuntabilitas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight mb-4">
            Persembahan & Dukungan Pelayanan
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
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
