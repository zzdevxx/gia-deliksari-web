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
  alternates: {
    canonical: '/layanan',
  },
};

export default function LayananPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-12 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-b border-[var(--border)] dark:border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[#E88086] text-xs font-bold uppercase tracking-wider mb-4">
            <HeartHandshake className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[#E88086]" />
            <span>Pusat Pelayanan & Pendampingan Jemaat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight mb-4">
            Layanan Doa, Sakramen & Komunitas
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
            Gereja adalah keluarga Allah yang saling menopang. Apakah Anda memerlukan pokok doa, konseling pastoral, pendaftaran sakramen kudus, atau rindu bertumbuh dalam kelompok sel, tim pastoral kami siap melayani Anda.
          </p>

          {/* Quick Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--brand-text)] dark:text-[#E88086] shrink-0 font-bold">
                🙏
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Doa & Konseling</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Dukungan doa & kunjungan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                💧
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Sakramen Kudus</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Baptisan & penyerahan anak</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 shrink-0 font-bold">
                🏘️
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Komsel Ekklesia</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Kelompok sel & pemuridan</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                ✨
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Volunteer Pelayan</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Musik, media, usher, dll</p>
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
