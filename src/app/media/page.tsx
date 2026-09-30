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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#150B0D] text-[#1F1617] dark:text-[#F5EFEB] transition-colors">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-[#F7F2E8]/50 dark:from-[#150B0D] dark:via-[#150B0D] dark:to-[#1A0E10] border-b border-[#EBDDCF] dark:border-[#3A1C20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider mb-4">
            <Film className="w-3.5 h-3.5 text-[#C5222E]" />
            <span>Pusat Media & Dokumentasi Pelayanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight mb-4">
            Firman Tuhan & Momen Komunitas
          </h1>
          <p className="text-base sm:text-lg text-[#5A4D4E] dark:text-[#D5C2C4] max-w-3xl leading-relaxed">
            Saksikan kembali rekaman firman Tuhan, khotbah ibadah raya, serta potret perjalanan kebersamaan dan persekutuan jemaat GIA Deliksari Semarang.
          </p>

          {/* Quick jump anchor buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="#khotbah"
              className="px-4 py-2 rounded-xl bg-[#C5222E] text-white text-xs font-bold hover:bg-[#A81B26] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-white" />
              <span>Video Khotbah Terbaru</span>
            </a>
            <a
              href="#galeri"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#221215] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] hover:bg-[#FDF0F0] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#C5222E]" />
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
