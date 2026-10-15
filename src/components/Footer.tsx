'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MapPin,
  Clock,
  Mail,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { YouTubeIcon, InstagramIcon } from './Icons';

const FOOTER_NAV: { title: string; links: { name: string; href: string }[] }[] = [
  {
    title: 'Tentang Kami',
    links: [
      { name: 'Kunjungan Pertama', href: '/home#kunjungan' },
      { name: 'Visi & Nilai', href: '/home#tentang' },
      { name: '4 Pilar Ibadah', href: '/home#pelayanan' },
      { name: 'Lokasi & Kontak', href: '/home#kontak' },
    ],
  },
  {
    title: 'Aktivitas & Media',
    links: [
      { name: 'Warta Jemaat', href: '/info' },
      { name: 'Jadwal Pelayanan Roster', href: '/info#jadwal' },
      { name: 'Video Khotbah', href: '/media#khotbah' },
      { name: 'Galeri Dokumentasi', href: '/media#galeri' },
    ],
  },
  {
    title: 'Layanan & Donasi',
    links: [
      { name: 'Permohonan Doa & Sakramen', href: '/layanan' },
      { name: 'Persembahan & QRIS', href: '/persembahan' },
      { name: 'Lokasi & Kontak', href: '/home#kontak' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-t border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] transition-colors">
      {/* Newsletter Strip */}
      <div className="border-b border-[var(--border)] dark:border-[var(--border)] bg-[var(--surface-raised)]/50 dark:bg-[var(--card)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h3 className="font-extrabold text-lg sm:text-xl text-[var(--foreground)] dark:text-[var(--foreground)]">
                Warta Mingguan di Inbox Anda
              </h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                Dapatkan jadwal ibadah, renungan, dan info kegiatan jemaat setiap minggu.
              </p>
            </div>
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[420px]"
              aria-label="Form langganan warta mingguan"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Alamat email
              </label>
              <div className="relative flex-1">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full rounded-full border border-[var(--border)] dark:border-[var(--border)] bg-white dark:bg-[var(--card)] pl-10 pr-4 py-3 text-sm text-[var(--foreground)] dark:text-[var(--foreground)] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-xs hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terima Kasih!</span>
                  </>
                ) : (
                  <>
                    <span>Berlangganan</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Col 1: Church Brand */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/home" className="flex items-center gap-3 group" aria-label="GIA Deliksari - Beranda">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)] dark:border-[var(--border)] bg-white dark:bg-[var(--card)] p-0.5 shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.avif"
                  alt="Logo GIA Deliksari"
                  fill
                  sizes="48px"
                  className="object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-[var(--foreground)] dark:text-[var(--foreground)] block">
                  GIA Deliksari Semarang
                </span>
                <span className="text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                  Growing Church! 🔥
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm">
              Persekutuan keluarga Allah yang setia berakar dalam firman,
              bertumbuh dalam kasih, dan melayani sesama di Kota Semarang sejak 1979.
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Jl. Kolonel Hadijanto, Deliksari, Gunungpati, Semarang 50229</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Ibadah Raya: Minggu, 09.00 WIB</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://www.instagram.com/giadeliksari/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram GIA Deliksari"
                className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] hover:border-[var(--brand)] dark:hover:border-[var(--brand)] transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@GIADeliksariSemarang"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube GIA Deliksari"
                className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] hover:border-[var(--brand)] dark:hover:border-[var(--brand)] transition-colors"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2-4: Grouped nav */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--foreground)] dark:text-[var(--foreground)] mb-3">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-[var(--ink-strong)]/60 group-hover:w-3 group-hover:bg-[var(--brand)] dark:group-hover:bg-[var(--brand)] transition-all" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] dark:border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
          <p>
            © {currentYear} Gereja Isa Almasih (GIA) Deliksari Semarang.
            <span className="hidden sm:inline"> Hak Cipta Dilindungi.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 fill-[var(--brand)] text-[var(--brand-text)] dark:fill-[var(--brand)] dark:text-[var(--brand-text)]" aria-hidden="true" />
            <span>untuk Kemuliaan Kristus</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
