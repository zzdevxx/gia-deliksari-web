'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Heart,
  Users,
  Sparkles,
  Play
} from 'lucide-react';
import { YouTubeIcon } from './Icons';
import { Button } from '@/components/ui/Button';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date();
      
      const currentDay = now.getDay();
      const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
      
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(9, 0, 0, 0);

      if (currentDay === 0 && now.getTime() > nextSunday.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diff = nextSunday.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="beranda" className="relative pt-8 pb-20 sm:pt-14 sm:pb-28 overflow-hidden">
      {/* The Crimson Field — the one place a gradient is allowed, and only as
          the furthest back layer. Everything inside stays flat. */}
      <div className="gia-field" aria-hidden="true" />
      {/* Veil between the gradient and the type. Without it the crimson sits
          directly under the headline and the page has no place for the eye to
          rest. This is a legibility surface, not decoration. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[var(--field-veil)] pointer-events-none"
      />
      {/* Geometric brand anchor — flat, no glow. A blurred orb at 4% opacity
          read as a smudge on a white canvas rather than as depth. */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-16 w-72 h-72 rounded-full border border-[var(--border)] dark:border-[var(--border)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-6 right-24 w-40 h-40 rounded-full border border-[var(--border)] dark:border-[var(--border)] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Countdown Pill Banner */}
        <div className="flex justify-center mb-8">
          <div
            role="status"
            aria-live="polite"
            aria-label={`Ibadah Raya Minggu dalam ${timeLeft.days} hari ${timeLeft.hours} jam ${timeLeft.minutes} menit`}
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]"
          >
            <span className="flex items-center gap-1.5 text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">Ibadah Raya Berikutnya · Minggu 09.00 WIB:</span>
            </span>
            <span
              aria-hidden="true"
              className="font-mono font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] px-2.5 py-0.5 rounded-lg border border-[var(--border)] dark:border-[var(--border)]"
            >
              {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m {timeLeft.seconds}d
            </span>
          </div>
        </div>

        {/* Hero Grid: Editorial Asymmetric Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Vision & Action */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[var(--ink-strong)]" aria-hidden="true" />
              <span>Gerakan Tumbuh dalam Iman & Kasih</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] leading-[1.12] tracking-tight">
              Rumah Kasih, <br className="hidden sm:inline" />
              <span className="text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                Pertumbuhan Rohani
              </span>{' '}
              & Pengharapan
            </h1>

            {/* Subtitle / Church Spirit */}
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Selamat datang di persekutuan jemaat yang berakar kuat dalam firman Tuhan, saling mengasihi, dan membimbing setiap generasi untuk bertumbuh dan berdampak nyata bagi sesama.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                as="link"
                href="#kunjungan"
                variant="primary"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Rencanakan Kunjungan
              </Button>

              <Button
                as="link"
                href="/info"
                variant="outline"
                size="lg"
                iconLeft={<Calendar className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Jadwal Ibadah
              </Button>

              <Button
                as="link"
                href="https://www.youtube.com/@GIADeliksariSemarang"
                variant="ghost"
                size="md"
                external
                iconLeft={<YouTubeIcon className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Live Streaming
              </Button>
            </div>

            {/* 3 Quick Micro Stats — meaningful numbers only */}
            <div className="pt-6 border-t border-[var(--border)] dark:border-[var(--border)] grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] font-mono">4</span>
                <p className="text-[11px] sm:text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Komunitas Ibadah</p>
              </div>
              <div className="space-y-1 border-x border-[var(--border)] dark:border-[var(--border)] px-2 sm:px-4">
                <span className="text-xl sm:text-2xl font-extrabold text-[var(--brand-text)] dark:text-[var(--brand-text)] font-mono">09.00</span>
                <p className="text-[11px] sm:text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">WIB · Minggu</p>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] font-mono">UNNES</span>
                <p className="text-[11px] sm:text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Kawasan Sekaran</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">

              {/* Main Visual Sanctuary Card */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border)] dark:border-[var(--border)] shadow-xs bg-white dark:bg-[var(--card)] p-6 sm:p-8 flex flex-col justify-between">
                {/* Top Badge & Status */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[11px] font-bold border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ibadah Onsite & Persekutuan</span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] tracking-wider">
                    GIA DELIKSARI
                  </span>
                </div>

                {/* Center: Clean Official Church Logo */}
                <div className="my-auto py-4 text-center space-y-4">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-2xl overflow-hidden border border-[var(--border)] dark:border-[var(--border)] bg-[var(--card)] dark:bg-[var(--card)] p-2">
                    <Image
                      src="/images/logo.png"
                      alt="Logo Resmi GIA Deliksari"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight leading-tight">
                      GEREJA ISA ALMASIH DELIKSARI
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] italic">
                      &ldquo;A Growing Church in Faith, Love, and Hope&rdquo;
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[10px] font-medium text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
                    Kawasan Sekaran · UNNES Gunungpati
                  </div>
                </div>

                {/* Bottom Card Text */}
                <div className="pt-4 border-t border-[var(--border)] dark:border-[var(--border)] space-y-1 text-left">
                  <p className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">
                    Jl. Kolonel HR Hadijanto, Sekaran, Gunungpati
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                    Gedung Sanctuary Utama & Ruang Bethel · Semarang 50229
                  </p>
                </div>
              </div>

              {/* Floating Pastoral Card — sits clear BELOW the address block.
                  It was -bottom-5/-bottom-6, which parked it on top of the
                  street address at every width (28–31px of overlap). The card
                  carries the 4/5 aspect ratio, so padding the address cannot
                  help: the height is fixed and my-auto absorbs the slack. The
                  only lever is where the float is anchored. */}
              <div className="absolute -bottom-14 -left-5 sm:-left-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm flex items-center gap-3.5 max-w-[260px]">
                <div className="w-11 h-11 rounded-xl bg-[var(--brand)] dark:bg-[var(--brand)] flex items-center justify-center text-white shadow-xs" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M10.5 3.5h3v7h7v3h-3v7h-3v-7h-7v-3h3z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] block">
                    Ibadah Onsite Aktif
                  </span>
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                    Datang & Beribadah Bersama
                  </span>
                </div>
              </div>

              {/* Floating Quick Access — Jadwal Singkat */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                  Ibadah Berikutnya
                </p>
                <p className="text-sm font-extrabold text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                  Minggu · 09.00 WIB
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Scroll Indicator — the top padding keeps it clear of the pastoral card,
          which now hangs below the hero card; without it they overlap by
          33–53px on the single-column layouts. */}
      <div className="flex justify-center pt-16 pb-6 sm:pb-10">
        <a
          href="#kunjungan"
          aria-label="Scroll ke bawah untuk konten selanjutnya"
          className="inline-flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] transition-colors group"
        >
          <span>Scroll</span>
          <span aria-hidden="true" className="block w-5 h-8 rounded-full border border-current relative overflow-hidden">
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-current transition-transform duration-300 group-hover:translate-y-1" />
          </span>
        </a>
      </div>
    </section>
  );
}
