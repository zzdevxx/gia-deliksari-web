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

 // 2. Fallback to Cloudflare D1 / Local DataStore
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
 <section id="khotbah" className="py-24 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors relative overflow-hidden">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 
 {/* Section Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
 <div className="space-y-4 max-w-2xl">
 <div className="flex flex-wrap items-center gap-2">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
 <Radio className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>Mimbar & Pengajaran Firman</span>
 </div>

 {isLiveSync && (
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
 <Tv className="w-3 h-3" />
 <span>YouTube Data API v3 Live</span>
 </div>
 )}
 </div>

 <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
 Arsip Khotbah & Renungan Rohani
 </h2>
 <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base leading-relaxed">
 Dengarkan kembali firman kebenaran yang memberkati, menguatkan, dan menuntun langkah hidup Anda setiap hari.
 </p>
 </div>

 <div>
 <a
 href="https://www.youtube.com/@GIADeliksariSemarang"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand)] hover:bg-[#731820] dark:bg-[var(--brand)] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
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
 className="rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] overflow-hidden shadow-xs hover:border-[#4B5563]/50 transition-all flex flex-col justify-between group"
 >
 <div>
 {/* Thumbnail Container */}
 <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-raised)] dark:bg-[#1F232D]">
 <Image
 src={sermon.thumbnail && !sermon.thumbnail.includes('gallery-') ? sermon.thumbnail : '/images/logo.png'}
 alt={sermon.title}
 fill
 className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
 
 {/* Play Button Overlay */}
 <a
 href={sermon.youtubeUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="absolute inset-0 flex items-center justify-center group/btn"
 aria-label={`Tonton Khotbah: ${sermon.title}`}
 >
 <div className="w-14 h-14 rounded-2xl bg-[var(--brand)]/90 hover:bg-[var(--brand)] text-white flex items-center justify-center group-hover/btn:scale-110 transition-transform">
 <Play className="w-6 h-6 fill-white ml-0.5" />
 </div>
 </a>

 {/* Category Pill */}
 <div className="absolute top-4 left-4">
 <span className="px-3 py-1 rounded-xl text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
 {sermon.category}
 </span>
 </div>
 </div>

 {/* Content Details */}
 <div className="p-7 space-y-4">
 <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <Calendar className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>{sermon.date}</span>
 </div>

 <h3 className="text-xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] leading-snug line-clamp-2">
 {sermon.title}
 </h3>

 <div className="space-y-1.5 pt-1 text-xs">
 <div className="flex items-center gap-2 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <User className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)] shrink-0" />
 <span className="font-semibold">{sermon.speaker}</span>
 </div>
 <div className="flex items-center gap-2 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <BookOpen className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)] shrink-0" />
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
 className="w-full py-3 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] hover:bg-[var(--surface-raised)] dark:hover:bg-[#2A2F3A] border border-[var(--border)] dark:border-[var(--border)] text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] flex items-center justify-center gap-2 transition-colors"
 >
 <YouTubeIcon className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
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
