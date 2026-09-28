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
      { name: 'Visi & Sejarah', href: '/home#tentang' },
      { name: 'Tim Pelayanan', href: '/home#struktur' },
      { name: '4 Pilar Ibadah', href: '/home#pelayanan' },
    ],
  },
  {
    title: 'Aktivitas',
    links: [
      { name: 'Arsip Khotbah', href: '/home#khotbah' },
      { name: 'Warta Jemaat', href: '/info#warta' },
      { name: 'Jadwal Pelayanan', href: '/info#jadwal' },
      { name: 'Galeri Dokumentasi', href: '/home#galeri' },
    ],
  },
  {
    title: 'Pelayanan & Donasi',
    links: [
      { name: 'Permohonan Doa', href: '/home#layanan' },
      { name: 'Persembahan Online', href: '/home#persembahan' },
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
    <footer className="bg-[#FDFBF7] dark:bg-[#110809] border-t border-[#EBDDCF] dark:border-[#3A1C20] text-[#5A4D4E] dark:text-[#D5C2C4] transition-colors">
      {/* Newsletter Strip — replaces admin CTA, drives connection */}
      <div className="border-b border-[#EBDDCF] dark:border-[#3A1C20] bg-gradient-to-br from-[#FDF0F0] via-[#FDFBF7] to-[#FDF0F0] dark:from-[#1A0E10] dark:via-[#110809] dark:to-[#1A0E10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h3 className="font-extrabold text-lg sm:text-xl text-[#1F1617] dark:text-[#F5EFEB]">
                Warta Mingguan di Inbox Anda
              </h3>
              <p className="mt-1 text-sm text-[#5A4D4E] dark:text-[#D5C2C4]">
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5222E] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full rounded-full border border-[#EBDDCF] dark:border-[#3A1C20] bg-white dark:bg-[#221215] pl-10 pr-4 py-3 text-sm text-[#1F1617] dark:text-[#F5EFEB] placeholder:text-[#9A9180] focus:outline-none focus:ring-2 focus:ring-[#C5222E]/30 focus:border-[#C5222E]"
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white shadow-sm shadow-red-950/20 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#C5222E]/30 bg-white p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png"
                  alt="Logo GIA Deliksari"
                  fill
                  sizes="48px"
                  className="object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-[#1F1617] dark:text-[#F5EFEB] block">
                  GIA Deliksari Semarang
                </span>
                <span className="text-xs font-bold text-[#C5222E] dark:text-[#E03643]">
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
                <MapPin className="w-4 h-4 text-[#C5222E] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Jl. Kolonel Hadijanto, Deliksari, Gunungpati, Semarang 50229</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#C5222E] shrink-0 mt-0.5" aria-hidden="true" />
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
                className="w-10 h-10 rounded-xl bg-[#F7F2E8] dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] flex items-center justify-center text-[#5A4D4E] hover:text-[#C5222E] hover:border-[#C5222E] transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@GIADeliksariSemarang"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube GIA Deliksari"
                className="w-10 h-10 rounded-xl bg-[#F7F2E8] dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] flex items-center justify-center text-[#5A4D4E] hover:text-[#C5222E] hover:border-[#C5222E] transition-colors"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2-4: Grouped nav */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#1F1617] dark:text-[#F5EFEB] mb-3">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm hover:text-[#C5222E] dark:hover:text-[#E03643] transition-colors inline-flex items-center gap-1.5 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#C5222E]/60 group-hover:w-3 group-hover:bg-[#C5222E] transition-all" />
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
        <div className="mt-12 pt-6 border-t border-[#EBDDCF]/60 dark:border-[#3A1C20]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
          <p>
            © {currentYear} Gereja Isa Almasih (GIA) Deliksari Semarang.
            <span className="hidden sm:inline"> Hak Cipta Dilindungi.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 fill-[#C5222E] text-[#C5222E]" aria-hidden="true" />
            <span>untuk Kemuliaan Kristus</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
