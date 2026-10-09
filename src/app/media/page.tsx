import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SermonsSection from '@/components/SermonsSection';
import GallerySection from '@/components/GallerySection';
import { Film, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';
import { YouTubeIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Khotbah & Galeri Dokumentasi',
  description:
    'Arsip khotbah video YouTube Data API v3 dan galeri dokumentasi foto kegiatan ibadah serta persekutuan jemaat GIA Deliksari Semarang.',
  alternates: {
    canonical: '/media',
  },
};

export default function MediaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-12 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-b border-[var(--border)] dark:border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[#E88086] text-xs font-bold uppercase tracking-wider mb-4">
            <Film className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[#E88086]" />
            <span>Pusat Media & Dokumentasi Pelayanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight mb-4">
            Firman Tuhan & Momen Komunitas
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
            Saksikan kembali rekaman firman Tuhan, khotbah ibadah raya, serta potret perjalanan kebersamaan dan persekutuan jemaat GIA Deliksari Semarang.
          </p>

          {/* Quick jump anchor buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="#khotbah"
              className="px-4 py-2 rounded-xl bg-[var(--brand)] dark:bg-[var(--brand)] text-white text-xs font-bold hover:bg-[#731820] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-white" />
              <span>Video Khotbah Terbaru</span>
            </a>
            <a
              href="#galeri"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] hover:bg-[var(--surface-raised)] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[#E88086]" />
              <span>Galeri Foto Dokumentasi</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="flex-1">
        <SermonsSection />
        <GallerySection />
      </main>

      <Footer />
    </div>
  );
}
