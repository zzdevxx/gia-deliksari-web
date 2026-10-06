'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Play, 
  ExternalLink, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles,
  Radio,
  RefreshCw,
  Tv
} from 'lucide-react';
import { YouTubeIcon } from './Icons';
import { dataStore } from '@/lib/storage';
import { Sermon } from '@/types';
import { INITIAL_SERMONS } from '@/lib/seedData';

export default function SermonsSection() {
  const [sermons, setSermons] = useState<Sermon[]>(INITIAL_SERMONS);
  const [isLiveSync, setIsLiveSync] = useState(false);

  useEffect(() => {
    async function loadSermons() {
      // 1. Try fetching from YouTube Data API v3 route
      try {
        const res = await fetch('/api/youtube/latest');
        if (res.ok) {
          const data = await res.json();
          if (data.sermons && data.sermons.length > 0) {
            setSermons(data.sermons);
            if (data.source === 'youtube_api') {
              setIsLiveSync(true);
            }
            return;
          }
        }
      } catch (ytErr) {
        console.warn('YouTube API fetch skipped, trying dataStore:', ytErr);
      }

      // 2. Fallback to Supabase / Local DataStore
      try {
        const data = await dataStore.getSermons();
        if (data && data.length > 0) {
          setSermons(data);
        }
      } catch (err) {
        console.warn('Error loading sermons from dataStore:', err);
      }
    }
    loadSermons();
  }, []);

  return (
    <section id="khotbah" className="py-24 bg-[#150B0D] text-white transition-colors relative overflow-hidden">
      {/* Subtle Warm Maroon Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5222E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#80141C]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#331418] border border-[#521E25] text-[#F2828C] text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-[#E03643]" />
                <span>Mimbar & Pengajaran Firman</span>
              </div>

              {isLiveSync && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold animate-pulse">
                  <Tv className="w-3 h-3 text-red-400" />
                  <span>YouTube Data API v3 Live</span>
                </div>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Arsip Khotbah & Renungan Rohani
            </h2>
            <p className="text-[#D5C2C4] text-base leading-relaxed">
              Dengarkan kembali firman kebenaran yang memberkati, menguatkan, dan menuntun langkah hidup Anda setiap hari.
            </p>
          </div>

          <div>
            <a
              href="https://www.youtube.com/@GIADeliksariSemarang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5222E] to-[#80141C] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950/40 transition-all"
            >
              <YouTubeIcon className="w-4 h-4 text-white" />
              <span>Channel YouTube GIA Deliksari</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              className="rounded-[2.5rem] bg-[#221215] border border-[#3A1C20] overflow-hidden shadow-lg hover:border-[#C5222E]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1A0E10]">
                  <Image
                    src={sermon.thumbnail && !sermon.thumbnail.includes('gallery-') ? sermon.thumbnail : '/images/logo.png'}
                    alt={sermon.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#221215] via-transparent to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <a
                    href={sermon.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center group/btn"
                    aria-label={`Tonton Khotbah: ${sermon.title}`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#C5222E]/90 hover:bg-[#C5222E] text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover/btn:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </a>

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#150B0D]/80 backdrop-blur-md text-[#F2828C] border border-[#521E25]">
                      {sermon.category}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#B5A1A3]">
                    <Calendar className="w-3.5 h-3.5 text-[#E03643]" />
                    <span>{sermon.date}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#E03643] transition-colors leading-snug line-clamp-2">
                    {sermon.title}
                  </h3>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center gap-2 text-[#D5C2C4]">
                      <User className="w-3.5 h-3.5 text-[#E03643] shrink-0" />
                      <span className="font-semibold">{sermon.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#B5A1A3]">
                      <BookOpen className="w-3.5 h-3.5 text-[#E03643] shrink-0" />
                      <span className="line-clamp-1">{sermon.passage}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-7 pt-0">
                <a
                  href={sermon.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#2A161A] hover:bg-[#381B21] border border-[#3A1C20] text-xs font-bold text-[#F5EFEB] flex items-center justify-center gap-2 transition-colors"
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-[#E03643]" />
                  <span>Tonton di YouTube</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
