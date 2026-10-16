'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MiniCountdown from '@/components/info/MiniCountdown';
import { AddToCalendar } from '@/components/info/AddToCalendar';
import CategoryBadge from '@/components/info/CategoryBadge';
import RosterCategoryLabel from '@/components/info/RosterCategoryLabel';
import {
 Bell,
 Calendar,
 Clock,
 MapPin,
 Users,
 Flame,
 Baby,
 HeartHandshake,
 ChevronRight,
 Hourglass,
 CheckCircle2,
 Sparkles,
 Printer,
 Filter,
 Check,
 Music,
 Video,
 Building,
 ExternalLink,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';
import { dataStore } from '@/lib/storage';
import RosterCalendar from '@/components/RosterCalendar';
import { INITIAL_ANNOUNCEMENTS, INITIAL_ROSTER } from '@/lib/seedData';
import { Announcement, ServantRoster, MinistryCategory } from '@/types';

/**
 * Halaman /info — publik, fokus ke:
 * 1. Papan Warta (upcoming + count-down, past collapsed)
 * 2. Jadwal Pelayanan (Roster Ibadah)
 *
 * Tidak menampilkan Hero, About, Galeri, Kontak (ada di /home).
 * Styling konsisten dengan design system utama (Sacred Crimson + Warm Cream).
 */

type TimeFilter = 'all' | 'upcoming' | 'past';

function todayStart(): Date {
 const d = new Date();
 d.setHours(0, 0, 0, 0);
 return d;
}

export default function InfoPage() {
 const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
 const [roster, setRoster] = useState<ServantRoster[]>(INITIAL_ROSTER);
 const [loading, setLoading] = useState(true);
 const [annCategory, setAnnCategory] = useState<MinistryCategory>('all');
 const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
 const [rosterCat, setRosterCat] = useState<'all' | 'general' | 'youth' | 'kidz' | 'hana'>('all');
 const [rosterView, setRosterView] = useState<'list' | 'calendar'>('list');
 const [copiedWa, setCopiedWa] = useState(false);
 const [copiedWartaWa, setCopiedWartaWa] = useState(false);

 useEffect(() => {
 const loadData = async () => {
 try {
 const [annData, rosData] = await Promise.all([
 dataStore.getAnnouncements(),
 dataStore.getRoster(),
 ]);
 if (annData?.length) setAnnouncements(annData);
 if (rosData?.length) setRoster(rosData);
 } catch (err) {
 console.warn('Using initial fallback data:', err);
 } finally {
 setLoading(false);
 }
 };
 loadData();
 }, []);

 const today = todayStart();

 // Group announcements: upcoming vs past
 const upcomingAnn = announcements
 .filter((a) => {
 if (a.isPublished === false) return false;
 if (annCategory !== 'all' && a.category !== annCategory) return false;
 const d = new Date(a.eventDate);
 d.setHours(0, 0, 0, 0);
 return timeFilter === 'past' ? d < today : d >= today;
 })
 .sort((a, b) => {
 if (a.isPinned && !b.isPinned) return -1;
 if (!a.isPinned && b.isPinned) return 1;
 if (timeFilter === 'past') {
 return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
 }
 return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
 });

 const filteredRoster = roster
 .filter((r) => rosterCat === 'all' || r.serviceCategory === rosterCat)
 .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

 const generateWhatsAppBroadcast = () => {
 const categoryLabels: Record<string, string> = {
 all: 'Semua Komunitas',
 general: 'Ibadah Raya',
 youth: 'Grow Youth',
 kidz: 'COC Kidz',
 hana: 'Wanita Hana & Komsel',
 };
 const categoryName = categoryLabels[rosterCat] || 'Semua Komunitas';
 const items = filteredRoster;

 if (items.length === 0) {
 return `🕊️ *JADWAL PELAYANAN GIA DELIKSARI SEMARANG*\nKategori: *${categoryName}*\n\nBelum ada jadwal yang dipublikasikan.`;
 }

 const dateMap = new Map<string, typeof items>();
 items.forEach((item) => {
 const existing = dateMap.get(item.serviceDate) || [];
 existing.push(item);
 dateMap.set(item.serviceDate, existing);
 });

 let text = `🕊️ *JADWAL PELAYANAN GIA DELIKSARI SEMARANG*\n`;
 text += `📋 Kategori: *${categoryName}*\n`;
 text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

 dateMap.forEach((servants, dateStr) => {
 text += `📅 *Tanggal: ${dateStr}*\n`;
 servants.forEach((s) => {
 text += `• *${s.role}*: ${s.servantName} ${s.status === 'replacement' ? '(Pengganti)' : ''}\n`;
 });
 text += `\n`;
 });

 text += `━━━━━━━━━━━━━━━━━━━━━\n`;
 text += `_"Layanilah seorang akan yang lain, sesuai dengan karunia yang telah diperoleh tiap-tiap orang sebagai pengurus yang baik dari kasih karunia Allah." (1 Petrus 4:10)_\n\n`;
 text += `Tuhan Yesus Memberkati pelayanan kita bersama! 🙏✨`;
 return text;
 };

 const handleCopyWaBroadcast = () => {
 const text = generateWhatsAppBroadcast();
 navigator.clipboard.writeText(text);
 setCopiedWa(true);
 setTimeout(() => setCopiedWa(false), 2500);
 };

 const generateWartaWhatsAppBroadcast = () => {
 const items = upcomingAnn;
 if (items.length === 0) {
 return `🕊️ *WARTA JEMAAT GIA DELIKSARI SEMARANG*\n\nBelum ada pengumuman warta aktif saat ini.`;
 }

 let text = `🕊️ *WARTA & PENGUMUMAN JEMAAT GIA DELIKSARI SEMARANG*\n`;
 text += `🔥 _"A Growing Church in Faith, Love, and Hope"_\n`;
 text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

 items.forEach((a, i) => {
 const pin = a.isPinned ? '📌 ' : '';
 const badge = a.badgeText ? ` [${a.badgeText}]` : '';
 text += `${i + 1}. ${pin}*${a.title.toUpperCase()}*${badge}\n`;
 text += `📅 Tanggal: ${a.eventDate}\n`;
 text += `📝 ${a.content}\n\n`;
 });

 text += `━━━━━━━━━━━━━━━━━━━━━\n`;
 text += `🌐 Informasi lengkap & portal jemaat: https://giadeliksari.my.id/info\n\n`;
 text += `Tuhan Yesus Memberkati kita semua! 🙏✨`;
 return text;
 };

 const handleCopyWartaWa = () => {
 const text = generateWartaWhatsAppBroadcast();
 navigator.clipboard.writeText(text);
 setCopiedWartaWa(true);
 setTimeout(() => setCopiedWartaWa(false), 2500);
 };

 return (
 <main className="min-h-screen flex flex-col bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors">
 <Navbar />

 {/* Page Header */}
 <section className="pt-24 pb-12 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-b border-[var(--border)] dark:border-[var(--border)]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider mb-4">
 <Sparkles className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>Informasi Pelayanan Gereja</span>
 </div>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight mb-3">
 Warta Jemaat & Jadwal Pelayanan
 </h1>
 <p className="text-base sm:text-lg text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
 Informasi terbaru seputar kegiatan ibadah, pelayanan, dan susunan
 petugas gereja GIA Deliksari Semarang. Dikontrol langsung oleh
 pengurus gereja melalui Portal Admin.
 </p>
 <div className="mt-6">
 <Link
 href="/info/print"
 target="_blank"
 className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white text-xs sm:text-sm font-bold"
 >
 <Printer className="w-4 h-4" />
 <span>Cetak Bulletin (A4 / PDF)</span>
 </Link>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-2 max-w-2xl">
 Buka tampilan print-friendly A4 formal. Pilih &quot;Save as PDF&quot; di dialog cetak browser untuk menyimpan PDF, atau cetak langsung ke printer fisik.
 </p>
 </div>
 </div>
 </section>

 {/* ============== SECTION 1: PAPAN WARTA ============== */}
 <section id="warta" className="py-16 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
 <div className="space-y-1">
 <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] flex items-center gap-3">
 <Bell className="w-7 h-7 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 Papan Pengumuman & Warta
 </h2>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Warta jemaat, pengumuman kegiatan, dan info terkini.
 </p>
 </div>

 <button
 type="button"
 onClick={handleCopyWartaWa}
 className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto ${
 copiedWartaWa
 ? 'bg-emerald-600 text-white'
 : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
 }`}
 title="Salin Daftar Warta untuk Broadcast WhatsApp"
 >
 {copiedWartaWa ? (
 <>
 <Check className="w-4 h-4" />
 <span>Format WA Tersalin!</span>
 </>
 ) : (
 <>
 <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span>Salin Format WA Warta</span>
 </>
 )}
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-6 border-b border-[var(--border)] dark:border-[var(--border)]">
 <div className="flex flex-wrap items-center gap-2">
 {[
 { id: 'all', label: 'Semua Kategori' },
 { id: 'general', label: 'Ibadah Raya' },
 { id: 'youth', label: 'Grow Youth' },
 { id: 'kidz', label: 'COC Kidz' },
 { id: 'hana', label: 'Wanita Hana' },
 ].map((c) => (
 <button
 key={c.id}
 onClick={() => setAnnCategory(c.id as MinistryCategory)}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
 annCategory === c.id
 ? 'bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white'
 : 'bg-white dark:bg-[var(--card)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--surface-raised-hover)] border border-[var(--border)] dark:border-[var(--border)]'
 }`}
 >
 {c.label}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-1 bg-[var(--surface-raised)] dark:bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] dark:border-[var(--border)]">
 <button
 onClick={() => setTimeFilter('upcoming')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 timeFilter === 'upcoming'
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 <Hourglass className="w-3.5 h-3.5" />
 <span>Akan Datang</span>
 </button>
 <button
 onClick={() => setTimeFilter('all')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 timeFilter === 'all'
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 Semua
 </button>
 <button
 onClick={() => setTimeFilter('past')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 timeFilter === 'past'
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Sudah Berlalu</span>
 </button>
 </div>
 </div>

 {/* Announcements list */}
 {upcomingAnn.length === 0 ? (
 <div className="p-12 text-center rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] space-y-3">
 <Bell className="w-10 h-10 text-[var(--brand-text)] dark:text-[var(--brand-text)] mx-auto opacity-40" />
 <h3 className="font-bold text-base text-[var(--foreground)] dark:text-[var(--foreground)]">
 {timeFilter === 'past' ? 'Belum ada warta yang sudah berlalu.' : 'Belum ada warta untuk filter ini.'}
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Warta diinput oleh pengurus gereja melalui Portal Admin.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {upcomingAnn.map((item) => (
 <div
 key={item.id}
 className={`p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] transition-all flex flex-col justify-between space-y-6 ${
 item.isPinned ? 'ring-2 ring-[var(--brand)]/40' : ''
 }`}
 >
 <div className="space-y-4">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <CategoryBadge category={item.category} />
 {item.isPinned && (
 <span className="text-[11px] font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)]">
 📌 Penting
 </span>
 )}
 </div>

 {timeFilter !== 'past' && <MiniCountdown targetDate={item.eventDate} />}

 <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)] leading-snug">
 {item.title}
 </h3>

 <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed line-clamp-4">
 {item.content}
 </p>
 </div>

 <div className="pt-4 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <div className="flex items-center gap-1.5 font-medium">
 <Calendar className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>{item.eventDate}</span>
 </div>
 {item.author && (
 <span className="text-[10px] uppercase tracking-wider opacity-60">
 {item.author}
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </section>

 {/* ============== SECTION 2: JADWAL & AGENDA IBADAH RUTIN ============== */}
 <section id="agenda" className="py-16 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] border-t border-[var(--border)] dark:border-[var(--border)]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--brand-text)] dark:text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider">
 <Clock className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>Agenda Ibadah & Kegiatan Sepekan</span>
 </div>
 <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Jadwal Ibadah Rutin GIA Deliksari
 </h2>
 <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Ibadah onsite di Gedung Utama / Ruang Bethel serta doa pagi online via Zoom.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {/* 1. Ibadah Raya Minggu */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--surface-raised)] text-[var(--brand-text)] dark:bg-[var(--surface-raised)] dark:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)]">
 Ibadah Raya Umum
 </span>
 <span className="text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)]">Minggu</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 Ibadah Raya Minggu
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Ibadah persekutuan seluruh jemaat dan keluarga dengan firman penggembalaan dan perjamuan kudus.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <AddToCalendar
                    serviceIds={["ibadah-raya"]}
                    label="Unduh jadwal Ibadah Raya Minggu ke kalender: Minggu 09.00 WIB"
                    className="text-[var(--brand-text)] dark:text-[var(--brand-text)]"
                  >
                    <span className="inline-flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 09.00 - 11.00 WIB
 </span>
                  </AddToCalendar>
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" /> Gedung Utama
 </span>
                 </div>
 </div>

 {/* 2. COC Kidz (Sekolah Minggu) */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
 Sekolah Minggu (KAA)
 </span>
 <span className="text-xs font-bold text-[var(--ink-strong)]">Minggu</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 COC Kidz
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Ibadah anak-anak (Balita - SD) dengan pujian sukacita dan aktivitas firman kreatif.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <AddToCalendar
                    serviceIds={["coc-kidz"]}
                    label="Unduh jadwal COC Kidz ke kalender: Minggu 09.30 WIB"
                    className="text-[var(--ink-strong)]"
                  >
                    <span className="inline-flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 09.30 - 10.30 WIB
 </span>
                  </AddToCalendar>
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-[var(--ink-strong)]" /> Ruang Bethel
 </span>
                 </div>
 </div>

 {/* 3. Grow Generation Youth / PRBK */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
 Pemuda & Komsel (4-Minggu)
 </span>
 <span className="text-xs font-bold text-[var(--ink-strong)]">Sabtu</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 Grow Generation Youth
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Pola selang-seling 4 minggu: M1 & M3 Ibadah Youth, M2 & M4 Ibadah Komsel Sel.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <AddToCalendar
                    serviceIds={["grow-generation"]}
                    label="Unduh jadwal Grow Generation Youth ke kalender: Sabtu 18.00 WIB"
                    className="text-[var(--ink-strong)]"
                  >
                    <span className="inline-flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 18.00 - 20.00 WIB
 </span>
                  </AddToCalendar>
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-[var(--ink-strong)]" /> Sanctuary / Bethel
 </span>
                 </div>
 </div>

 {/* 4. Wanita HANA & Komsel Ekklesia */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--brand-tint)] text-[var(--brand-text)] dark:bg-[var(--brand-tint)] dark:text-[var(--brand-text)] border border-[var(--brand-tint-border)] dark:border-[var(--brand-tint-border)]">
 Wanita & Komsel
 </span>
 <span className="text-xs font-bold text-[var(--brand-text)]">Jumat & Selasa</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 Wanita HANA & Komsel
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Ibadah HANA Jumat 17.30 WIB (Pola 4-minggu: M1 & M3 HANA, M2 & M4 Komsel). Komsel Ekklesia Selasa 18.30 WIB.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <AddToCalendar
                    serviceIds={["hana", "komsel-ekklesia"]}
                    label="Unduh jadwal Ibadah Wanita HANA dan Komsel Ekklesia ke kalender: Jumat 17.30 WIB dan Selasa 18.30 WIB"
                    className="text-[var(--brand-text)] dark:text-[var(--brand-text)]"
                  >
                    <span className="inline-flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 17.30 / 18.30 WIB
 </span>
                  </AddToCalendar>
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5 text-[var(--brand-text)]" /> Gedung Utama
 </span>
                 </div>
 </div>

 {/* 5. Ibadah Doa Pagi (Onsite + Zoom) */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
 Doa Harian & Online
 </span>
 <span className="text-xs font-bold text-blue-600">Selasa – Jumat</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 Ibadah Doa Pagi
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Mencari hadirat Tuhan di awal hari. Dapat diikuti onsite di gedung gereja atau online via Zoom.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between gap-2">
 <span className="font-mono text-xs font-bold text-blue-600 flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> 05.00 - 05.30 WIB
 </span>
 <a
 href="https://us06web.zoom.us/j/83715591277?pwd=Qc52Xla9k68ZjD3rViMRIaDiXgaWkf.1"
 target="_blank"
 rel="noopener noreferrer"
 className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
 >
 <Video className="w-3 h-3" />
 <span>Join Zoom</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 </div>
 </div>

 {/* 6. Latihan Musik & Jam Pelayanan Kantor */}
 <div className="group/card p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col justify-between space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
 Pelayanan Musik & Kantor
 </span>
 <span className="text-xs font-bold text-emerald-600">Selasa – Sabtu</span>
 </div>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 Latihan Musik & Kantor Gereja
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Latihan Musik: Sabtu (10.00-12.00 & 20.00-22.00). Jam Kantor: Selasa–Sabtu 08.00–15.00 WIB di Ruang Gembala.
 </p>
 </div>
 <div className="pt-3 border-t border-[var(--border)]/60 dark:border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <span className="flex items-center gap-1">
 <Music className="w-3.5 h-3.5 text-emerald-600" /> Tim Musik
 </span>
 <span className="flex items-center gap-1">
 <Building className="w-3.5 h-3.5 text-emerald-600" /> Ruang Gembala
 </span>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ============== SECTION 3: JADWAL PELAYANAN ============== */}
 <section id="jadwal" className="py-16 bg-[var(--surface-raised)]/40 dark:bg-[var(--card)] border-y border-[var(--border)] dark:border-[var(--border)]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div className="space-y-1">
 <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] flex items-center gap-3">
 <Clock className="w-7 h-7 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 Jadwal Petugas Pelayanan (Roster)
 </h2>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Susunan pelayan firman, worship leader, band, multimedia, dan
 usher untuk ibadah mendatang.
 </p>
 </div>

 <button
 type="button"
 onClick={handleCopyWaBroadcast}
 className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto ${
 copiedWa
 ? 'bg-emerald-600 text-white'
 : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
 }`}
 title="Salin Jadwal Petugas untuk Broadcast WhatsApp"
 >
 {copiedWa ? (
 <>
 <Check className="w-4 h-4" />
 <span>Format WA Tersalin!</span>
 </>
 ) : (
 <>
 <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span>Salin Format WA</span>
 </>
 )}
 </button>
 </div>

 {/* Roster Category Filter */}
 <div className="flex flex-wrap items-center gap-2 mb-4">
 {/* View Toggle */}
 <div className="flex items-center gap-1 bg-[var(--surface-raised)] dark:bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] dark:border-[var(--border)] mr-2">
 <button
 onClick={() => setRosterView('list')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 rosterView === 'list'
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 📋 List
 </button>
 <button
 onClick={() => setRosterView('calendar')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 rosterView === 'calendar'
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 📅 Kalender
 </button>
 </div>
 {[
 { id: 'all', label: 'Semua Komunitas' },
 { id: 'general', label: '1. Ibadah Raya' },
 { id: 'youth', label: '2. Grow Youth' },
 { id: 'kidz', label: '3. COC Kidz' },
 { id: 'hana', label: '4. Wanita Hana' },
 ].map((c) => (
 <button
 key={c.id}
 onClick={() => setRosterCat(c.id as any)}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
 rosterCat === c.id
 ? 'bg-[var(--brand)] dark:bg-[var(--brand)] text-white'
 : 'bg-white dark:bg-[var(--card)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--surface-raised-hover)] border border-[var(--border)] dark:border-[var(--border)]'
 }`}
 >
 {c.label}
 </button>
 ))}
 </div>

 {/* Roster View: List | Calendar */}
 {rosterView === 'calendar' ? (
 <div className="p-6 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
 <RosterCalendar rosters={filteredRoster} filterCategory={rosterCat} />
 </div>
 ) : (
 <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
 {filteredRoster.length === 0 ? (
 <div className="py-8 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Belum ada jadwal petugas pelayanan untuk kategori ini.
 </div>
 ) : (
 <table className="w-full text-left text-xs sm:text-sm">
 <thead className="bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] border-b border-[var(--border)] dark:border-[var(--border)]">
 <tr>
 <th className="p-4 font-bold">Kategori</th>
 <th className="p-4 font-bold">Tanggal</th>
 <th className="p-4 font-bold">Tugas / Peran</th>
 <th className="p-4 font-bold">Nama Pelayan</th>
 <th className="p-4 font-bold">Catatan</th>
 <th className="p-4 font-bold text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border)]/60 dark:divide-[var(--border)]/60">
 {filteredRoster.map((item) => (
 <tr
 key={item.id}
 className="hover:bg-[var(--background)] dark:hover:bg-[var(--surface-raised-hover)] transition-colors"
 >
 <td className="p-4">
 <RosterCategoryLabel category={item.serviceCategory} />
 </td>
 <td className="p-4 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] font-mono">
 {item.serviceDate}
 </td>
 <td className="p-4 font-semibold text-[var(--brand-text)] dark:text-[var(--brand-text)]">
 {item.role}
 </td>
 <td className="p-4 text-[var(--foreground)] dark:text-[var(--foreground)] font-medium">
 {item.servantName}
 </td>
 <td className="p-4 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-xs">
 {item.notes || <span className="italic opacity-60">—</span>}
 </td>
 <td className="p-4 text-right">
 <span
 className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
 item.status === 'confirmed'
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
 : item.status === 'replacement'
 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
 : 'bg-[var(--surface-raised)] text-[var(--muted-foreground)] border-[var(--border)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] dark:border-[var(--border)]'
 }`}
 >
 {item.status === 'confirmed'
 ? 'Siap Melayani'
 : item.status === 'replacement'
 ? 'Pengganti'
 : 'Menunggu'}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 )}
 </div>
 </section>

 {/* Footer CTA */}
 <section className="py-16 bg-[var(--background)] dark:bg-[var(--card-inverted-bg)]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="p-8 sm:p-10 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-center space-y-4">
 <h3 className="text-2xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Ingin Melayani atau Punya Pertanyaan?
 </h3>
 <p className="text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-2xl mx-auto">
 Hubungi WhatsApp pastoral atau gunakan formulir pendaftaran di
 halaman beranda untuk terlibat dalam pelayanan GIA Deliksari.
 </p>
 <a
 href="https://api.whatsapp.com/send?phone=6289620961103"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white font-bold text-sm"
 >
 Hubungi WhatsApp Pastoral
 <ChevronRight className="w-4 h-4" />
 </a>
 </div>
 </div>
 </section>

 <Footer />
 </main>
 );
}