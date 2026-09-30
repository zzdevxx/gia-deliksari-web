'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

type NavItem = { name: string; href: string; description?: string };

// UX Pro Max: 5 clean primary nav items for desktop
const PRIMARY_NAV: NavItem[] = [
  { name: 'Beranda', href: '/home', description: 'Pengenalan & sejarah gereja' },
  { name: 'Warta & Jadwal', href: '/info', description: 'Warta jemaat & roster' },
  { name: 'Khotbah & Galeri', href: '/media', description: 'Video firman & foto ibadah' },
  { name: 'Layanan Doa', href: '/layanan', description: 'Permohonan doa & sakramen' },
  { name: 'Persembahan', href: '/persembahan', description: 'Transfer bank & QRIS' },
];

// Grouped sections in mobile sheet for full discovery without nav clutter
const MOBILE_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Gereja & Pengenalan',
    items: [
      { name: 'Beranda', href: '/home', description: 'Halaman muka jemaat' },
      { name: 'Panduan Tamu Onsite', href: '/home#kunjungan', description: 'Panduan untuk jemaat baru' },
      { name: 'Visi & Nilai', href: '/home#tentang', description: 'Visi penggembalaan' },
      { name: '4 Pilar Komunitas', href: '/home#pelayanan', description: 'Ibadah Raya, Youth, Kidz, Hana' },
      { name: 'Lokasi & Kontak', href: '/home#kontak', description: 'Alamat & WhatsApp' },
    ],
  },
  {
    title: 'Aktivitas & Pelayanan',
    items: [
      { name: 'Warta & Jadwal Roster', href: '/info', description: 'Pengumuman & petugas ibadah' },
      { name: 'Khotbah & Galeri Foto', href: '/media', description: 'YouTube streaming & foto' },
      { name: 'Layanan Doa & Sakramen', href: '/layanan', description: 'Konseling, baptisan & komsel' },
      { name: 'Persembahan Kasih (QRIS)', href: '/persembahan', description: 'Dukungan pekerjaan Tuhan' },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Compute scroll progress 0..1
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0);

      // Determine active section via scroll position for anchor links on home
      const sections = ['kunjungan', 'tentang', 'pelayanan', 'kontak'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom > 140) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile sheet open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeSheet = useCallback(() => setIsOpen(false), []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FDFBF7]/95 dark:bg-[#150B0D]/95 backdrop-blur-md shadow-sm border-b border-[#EBDDCF] dark:border-[#3A1C20]'
          : 'bg-[#FDFBF7]/85 dark:bg-[#150B0D]/85 backdrop-blur-sm border-b border-[#EBDDCF]/60 dark:border-[#3A1C20]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity / Logo */}
          <Link
            href="/home"
            className="flex items-center gap-3.5 group transition-transform active:scale-95"
            aria-label="Gereja Isa Almasih Deliksari Semarang - Kembali ke Beranda"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm border border-[#EBDDCF] dark:border-[#3A1C20] bg-white p-0.5 group-hover:border-[#C5222E] dark:group-hover:border-[#E03643] transition-colors">
              <Image
                src="/images/logo.png"
                alt="Logo Resmi GIA Deliksari Semarang"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#1F1617] dark:text-[#F5EFEB] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors">
                  GIA DELIKSARI
                </span>
                <span className="text-[10px] font-bold text-[#80141C] dark:text-[#F2828C] bg-[#FDF0F0] dark:bg-[#331418] px-1.5 py-0.2 rounded border border-[#F5CDD0] dark:border-[#521E25] hidden sm:inline-block">
                  Semarang
                </span>
              </div>
              <span className="text-[11px] font-bold tracking-wide text-[#C5222E] dark:text-[#E03643]">
                Growing Church! 🔥
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — 5 primary items, all visible on lg+ */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
            {PRIMARY_NAV.map((link) => {
              const isCurrentPage =
                pathname === link.href || (pathname === '/' && link.href === '/home');
              const sectionId = link.href.includes('#') ? link.href.split('#')[1] : '';
              const isActive = isCurrentPage || (Boolean(sectionId) && sectionId === activeSection);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-[#C5222E] dark:text-[#E03643] bg-[#FDF0F0] dark:bg-[#331418] font-bold shadow-xs'
                      : 'text-[#5A4D4E] dark:text-[#D5C2C4] hover:text-[#C5222E] dark:hover:text-[#E03643] hover:bg-[#F7F2E8] dark:hover:bg-[#251317]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#C5222E] dark:bg-[#E03643]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Theme Toggle & Admin Shortcut */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/admin"
              aria-label="Masuk Admin Portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C5222E] via-[#A81722] to-[#80141C] hover:opacity-95 text-white shadow-sm shadow-red-950/20 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger & Theme Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#F7F2E8] dark:hover:bg-[#251317] border border-[#EBDDCF] dark:border-[#3A1C20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5222E]"
              aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5 text-[#C5222E]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar at bottom of header */}
      <div
        className="h-[2px] bg-gradient-to-r from-[#C5222E] via-[#D97706] to-[#C5222E] transition-all duration-150 origin-left"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />

      {/* Mobile Drawer Navigation */}
      <div
        role="dialog"
        aria-label="Menu navigasi"
        aria-modal="true"
        hidden={!isOpen}
        className={`lg:hidden bg-[#FDFBF7] dark:bg-[#150B0D] border-t border-[#EBDDCF] dark:border-[#3A1C20] shadow-2xl overflow-hidden transition-[max-height] duration-300 ease-out ${
          isOpen ? 'max-h-[85vh] overflow-y-auto' : 'max-h-0'
        }`}
      >
        <div className="px-4 pt-3 pb-6 space-y-5">
          {MOBILE_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#6E5D5F] dark:text-[#B5A1A3] px-4 mb-2">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeSheet}
                      className="flex items-start gap-3 px-4 py-2.5 rounded-xl hover:bg-[#F7F2E8] dark:hover:bg-[#251317] transition-colors group"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-[#1F1617] dark:text-[#F5EFEB] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors">
                          {link.name}
                        </span>
                        {link.description && (
                          <span className="block text-xs text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                            {link.description}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className="w-4 h-4 -rotate-90 text-[#BFB5A6] dark:text-[#5E574B] group-hover:text-[#C5222E] dark:group-hover:text-[#E03643] transition-colors shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="pt-3 border-t border-[#EBDDCF] dark:border-[#3A1C20]">
            <Link
              href="/admin"
              onClick={closeSheet}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
