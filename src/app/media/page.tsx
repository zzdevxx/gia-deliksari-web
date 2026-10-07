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
};

export default function MediaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#141312] text-[#1C1917] dark:text-[#F5F3EF] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2] to-[#F3EFE6]/50 dark:from-[#141312] dark:via-[#141312] dark:to-[#16171B] border-b border-[#E5DFD5] dark:border-[#332F2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#8B1E28] dark:text-[#E88086] text-xs font-bold uppercase tracking-wider mb-4">
            <Film className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
            <span>Pusat Media & Dokumentasi Pelayanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight mb-4">
            Firman Tuhan & Momen Komunitas
          </h1>
          <p className="text-base sm:text-lg text-[#665E55] dark:text-[#A8A196] max-w-3xl leading-relaxed">
            Saksikan kembali rekaman firman Tuhan, khotbah ibadah raya, serta potret perjalanan kebersamaan dan persekutuan jemaat GIA Deliksari Semarang.
          </p>

          {/* Quick jump anchor buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="#khotbah"
              className="px-4 py-2 rounded-xl bg-[#8B1E28] dark:bg-[#B8323D] text-white text-xs font-bold hover:bg-[#731820] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-white" />
              <span>Video Khotbah Terbaru</span>
            </a>
            <a
              href="#galeri"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1D1B19] text-[#1C1917] dark:text-[#F5F3EF] border border-[#E5DFD5] dark:border-[#332F2B] hover:bg-[#F3EFE6] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
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
