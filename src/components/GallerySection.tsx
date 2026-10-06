'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Upload,
  HardDrive,
  ExternalLink,
  FolderOpen,
  RotateCw,
  User,
  Images
} from 'lucide-react';
import { dataStore } from '@/lib/storage';
import { GalleryItem } from '@/types';
import { INITIAL_GALLERY } from '@/lib/seedData';
import UploadPhotoModal from './UploadPhotoModal';

const PAGE_SIZE = 12; // 12 foto random per "halaman" etalase
const MAX_DISPLAY = 60; // batas atas kumulatif (5 halaman) untuk mencegah beban

export default function GallerySection() {
  const [allItems, setAllItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [displayed, setDisplayed] = useState<GalleryItem[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ibadah' | 'worship' | 'youth' | 'komunitas' | 'umum'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0); // perubahan seed = re-shuffle

  const googleDriveFolderUrl = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_GALLERY_URL || 'https://drive.google.com/drive/folders/1T_ahqCtmOjdFl0L-MNu7bIQo-8Oz8y9h';

  useEffect(() => {
    async function loadGallery() {
      try {
        // Minta batch terbesar (60) langsung dari server; server sudah shuffle deterministik.
        // Fallback ke full getGallery() jika endpoint random bermasalah.
        const data = await dataStore.getRandomGallery(MAX_DISPLAY);
        if (data && data.length > 0) {
          setAllItems(data);
        } else {
          const fallback = await dataStore.getGallery();
          if (fallback && fallback.length > 0) setAllItems(fallback);
        }
      } catch (err) {
        console.warn('Error loading gallery from dataStore:', err);
      }
    }
    loadGallery();
  }, []);

  /**
   * Fisher-Yates shuffle deterministik — di-seed dengan date + user-triggered counter.
   * Algoritma ini menjamin:
   * - Randomness cukup untuk etalase (tidak kelihatan pola)
   * - Stabilitas dalam satu hari (tidak berubah tiap detik → tidak ada layout shift)
   * - Tombol "Tampilkan Lebih Banyak" menghasilkan set baru
   */
  const shuffleWithSeed = useCallback((arr: GalleryItem[], seed: number): GalleryItem[] => {
    const result = arr.slice();
    let s = seed;
    for (let i = result.length - 1; i > 0; i--) {
      // LCG sederhana untuk konsistensi cross-browser
      s = (s * 9301 + 49297) % 233280;
      const j = s % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }, []);

  // Recompute displayed items saat filter/randomSeed/displayedCount/allItems berubah
  useEffect(() => {
    const filtered = activeFilter === 'all'
      ? allItems
      : allItems.filter((item) => item.category === activeFilter);
    // Hanya tampilkan yang isPublished (default true)
    const published = filtered.filter((item) => item.isPublished !== false);
    const shuffled = shuffleWithSeed(published, randomSeed + new Date().getDate());
    setDisplayed(shuffled.slice(0, Math.min(displayedCount, MAX_DISPLAY)));
  }, [allItems, activeFilter, randomSeed, displayedCount, shuffleWithSeed]);

  const handleUploadSuccess = (newItem: GalleryItem) => {
    setAllItems((prev) => [newItem, ...prev]);
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, MAX_DISPLAY));
  };

  const handleShuffle = () => {
    setRandomSeed((prev) => prev + 1);
    setDisplayedCount(PAGE_SIZE); // reset ke halaman pertama dengan set baru
  };

  const handleFilterChange = (id: typeof activeFilter) => {
    setActiveFilter(id);
    setDisplayedCount(PAGE_SIZE);
  };

  const hasMore = displayed.length < allItems.filter(i => activeFilter === 'all' || i.category === activeFilter).length
    && displayed.length < MAX_DISPLAY;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + displayed.length) % displayed.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % displayed.length);
    }
  };

  const selectedItem = selectedPhotoIndex !== null ? displayed[selectedPhotoIndex] : null;

  return (
    <section id="galeri" className="py-24 bg-[#FDFBF7] dark:bg-[#150B0D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-[#C5222E]" />
              <span>Dokumentasi Pelayanan & Momen Kebersamaan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
              Galeri Sukacita Jemaat
            </h2>
            <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base leading-relaxed">
              Momen-momen indah persekutuan, pujian penyembahan, dan kebersamaan keluarga Allah di GIA Deliksari.
              Etalase ini menampilkan cuplikan acak dari arsip Google Drive gereja.
            </p>
          </div>

          {/* Action Buttons: Upload + Google Drive */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C5222E] to-[#80141C] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-900/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Foto Momen</span>
            </button>

            <a
              href={googleDriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-[#F7F2E8] dark:bg-[#221215] hover:bg-[#EBDDCF] dark:hover:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-[#C59B27]" />
              <span>Arsip Google Drive</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { id: 'all', label: 'Semua Momen' },
            { id: 'ibadah', label: 'Ibadah Raya' },
            { id: 'worship', label: 'Praise & Worship' },
            { id: 'youth', label: 'Grow Youth' },
            { id: 'komunitas', label: 'Komunitas & Komsel' },
            { id: 'umum', label: 'Lainnya' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white shadow-sm'
                  : 'bg-white dark:bg-[#221215] text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20]'
              }`}
            >
              {filter.label}
            </button>
          ))}

          {/* Tombol shuffle (acak ulang) di kanan chip */}
          <button
            onClick={handleShuffle}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#5A4D4E] dark:text-[#D5C2C4] hover:text-[#C5222E] dark:hover:text-[#F2828C] hover:bg-[#FDF0F0] dark:hover:bg-[#331418] border border-[#EBDDCF] dark:border-[#3A1C20] transition-all"
            title="Tampilkan momen acak lainnya"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Acak Momen</span>
          </button>
        </div>

        {/* Gallery Grid - 12 foto random, 2/3/4 cols responsif */}
        {displayed.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] flex items-center justify-center text-[#C5222E] mx-auto shadow-sm">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[#F7F2E8] dark:bg-[#2A161A] text-[#6E5D5F] dark:text-[#B5A1A3] border border-[#EBDDCF] dark:border-[#3A1C20] uppercase tracking-wider">
                Dokumentasi Kegiatan
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB]">
                Arsip Foto Sedang Dipersiapkan
              </h3>
              <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed max-w-lg mx-auto">
                Dokumentasi resmi ibadah raya, persekutuan pemuda, sekolah minggu, dan kegiatan jemaat GIA Deliksari akan segera diunggah oleh tim media gereja.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#khotbah"
                className="px-5 py-2.5 rounded-xl bg-[#C5222E] text-white text-xs font-bold hover:bg-[#80141C] shadow-sm transition-all"
              >
                Tonton Video Khotbah
              </a>
              <a
                href={googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs font-bold hover:bg-[#F7F2E8] transition-all flex items-center gap-2"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#C5222E]" />
                <span>Google Drive Master</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayed.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="group relative aspect-square rounded-2xl sm:rounded-[1.75rem] overflow-hidden bg-[#F7F2E8] dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <Image
                  src={item.thumbUrl || item.image || '/images/logo.png'}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#150B0D]/85 via-transparent to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-white/85 backdrop-blur-md text-[#1F1617] flex items-center justify-center shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                  <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#C5222E]/80 backdrop-blur-md inline-block border border-white/20">
                    {item.date}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Tampilkan Lebih Banyak */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              className="px-7 py-3.5 rounded-2xl bg-white dark:bg-[#221215] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Images className="w-4 h-4 text-[#C59B27]" />
              <span>Tampilkan Lebih Banyak</span>
            </button>
          </div>
        )}

        {/* Bottom Archive Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#F7F2E8] to-[#FDFBF7] dark:from-[#221215] dark:to-[#1A0E10] border border-[#EBDDCF] dark:border-[#3A1C20] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#C5222E]">
              <HardDrive className="w-4 h-4" />
              <span>Arsip Master Dokumentasi Cloud Gereja</span>
            </div>
            <h4 className="text-base font-extrabold text-[#1F1617] dark:text-white">
              Mencari foto kegiatan tahun lalu atau album beresolusi penuh?
            </h4>
            <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
              Semua arsip master dokumentasi pelayanan disimpan secara abadi di Google Drive GIA Deliksari.
            </p>
          </div>

          <a
            href={googleDriveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#2A161A] hover:bg-[#FDFBF7] dark:hover:bg-[#331418] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
          >
            <FolderOpen className="w-4 h-4 text-[#C59B27]" />
            <span>Buka Folder Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Lightbox Image */}
            <div className="relative aspect-[16/10] w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/10">
              <Image
                src={selectedItem.image || selectedItem.thumbUrl || '/images/logo.png'}
                alt={selectedItem.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>

            {/* Bottom Caption & Controls */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 text-white px-2 gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-sm sm:text-base">
                  {selectedItem.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                  <span>{selectedItem.date}</span>
                  {selectedItem.uploaderName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Diupload oleh {selectedItem.uploaderName}</span>
                    </span>
                  )}
                </div>
                {selectedItem.driveWebViewLink && (
                  <a
                    href={selectedItem.driveWebViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C59B27] hover:text-[#E8C168] transition-colors mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Lihat Resolusi Penuh di Google Drive</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono text-white/60 px-1">
                  {(selectedPhotoIndex ?? 0) + 1} / {displayed.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

    </section>
  );
}
