'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import PrintBulletin from '@/components/PrintBulletin';
import { dataStore } from '@/lib/storage';
import { INITIAL_ANNOUNCEMENTS, INITIAL_ROSTER } from '@/lib/seedData';
import { Announcement, ServantRoster } from '@/types';

export default function InfoPrintPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [roster, setRoster] = useState<ServantRoster[]>(INITIAL_ROSTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [anns, ros] = await Promise.all([
          dataStore.getAnnouncements(),
          dataStore.getRoster(),
        ]);
        if (anns?.length) setAnnouncements(anns.filter((a) => a.isPublished !== false));
        if (ros?.length) setRoster(ros);
      } catch (err) {
        console.warn('Failed to load data for print bulletin, using fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute week range (Senin - Minggu pekan ini)
  const today = new Date();
  const day = today.getDay(); // 0 is Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const weekLabel = `${fmt(monday)} – ${fmt(sunday)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] text-[#111827] p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#731820]">
          <div className="w-5 h-5 border-2 border-[#8B1E28] border-t-transparent rounded-full animate-spin" />
          <span>Menyiapkan Buletin Warta Cetak A4...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827]">
      {/* Top action bar - hidden during print */}
      <div className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/info"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#8B1E28] dark:hover:text-[#B8323D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Info</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280] hidden sm:inline">
              Format Kertas: <strong>A4 Portrait</strong>
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1E28] dark:bg-[#B8323D] text-white text-xs font-bold hover:bg-[#731820] shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Print Layout */}
      <main className="py-6 px-2 sm:px-4">
        <PrintBulletin
          announcements={announcements}
          rosters={roster}
          weekLabel={weekLabel}
        />
      </main>
    </div>
  );
}
