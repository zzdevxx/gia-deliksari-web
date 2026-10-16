'use client';

import React, { useState } from 'react';
import {
 Heart,
 Copy,
 Check,
 ShieldCheck,
 ExternalLink,
 CreditCard,
 QrCode,
 Box,
 Download,
 Info
} from 'lucide-react';
import { WhatsAppIcon } from './Icons';

type GivingCategory = 'umum' | 'perpuluhan' | 'pembangunan' | 'diakonia';

interface CategoryOption {
 id: GivingCategory;
 name: string;
 desc: string;
 verse: string;
}

export default function GivingSection() {
 const [selectedCategory, setSelectedCategory] = useState<GivingCategory>('umum');
 const [copiedKey, setCopiedKey] = useState<string | null>(null);

 const categories: CategoryOption[] = [
 {
 id: 'umum',
 name: 'Persembahan Umum',
 desc: 'Kantong persembahan mingguan untuk mendukung jalannya ibadah dan operasional rumah Tuhan.',
 verse: 'Mzm 96:8 — "Berilah kepada TUHAN kemuliaan nama-Nya, bawalah persembahan dan masuklah ke pelataran-Nya!"',
 },
 {
 id: 'perpuluhan',
 name: 'Persepuluhan (Tithe)',
 desc: 'Membawa sepersepuluh hasil kepada perbendaharaan rumah Allah sebagai tanda ketaatan iman.',
 verse: 'Mal 3:10 — "Bawalah seluruh persembahan persepuluhan itu ke dalam rumah perbendaharaan..."',
 },
 {
 id: 'pembangunan',
 name: 'Pembangunan & Fasilitas',
 desc: 'Dukungan renovasi gedung gereja, pemeliharaan sound system, AC, multimedia, dan kursi jemaat.',
 verse: 'Hag 1:8 — "Pergilah ke gunung, bawalah kayu dan bangunlah Rumah itu..."',
 },
 {
 id: 'diakonia',
 name: 'Diakonia & Kasih',
 desc: 'Bantuan kasih untuk jemaat sepuh, keluarga prasejahtera, santunan duka, dan pelayanan sosial Deliksari.',
 verse: 'Ams 19:17 — "Siapa menaruh belas kasihan kepada orang yang lemah, mempiutangi TUHAN..."',
 },
 ];

 // Bank accounts config
 const bankAccounts = [
 {
 id: 'bca',
 bankName: 'Bank Central Asia (BCA)',
 accountNumber: '2521151515',
 accountHolder: 'GIA DELIKSARI SEMARANG',
 note: 'Transfer via ATM / Mobile Banking / Internet Banking',
 color: 'border-[var(--border)] dark:border-[var(--border)]',
 },
 {
 id: 'bri',
 bankName: 'Bank Rakyat Indonesia (BRI)',
 accountNumber: '034201001515150',
 accountHolder: 'GIA DELIKSARI SEMARANG',
 note: 'Dapat transfer dari seluruh jaringan ATM Bersama / Prima',
 color: 'border-[var(--border)] dark:border-[var(--border)]',
 },
 ];

 const handleCopy = (text: string, key: string) => {
 navigator.clipboard.writeText(text);
 setCopiedKey(key);
 setTimeout(() => setCopiedKey(null), 2500);
 };

 const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

 const whatsappConfirmUrl = `https://api.whatsapp.com/send?phone=6289620961103&text=${encodeURIComponent(
 `Syalom Pengurus & Bendahara GIA Deliksari Semarang,\n\nSaya ingin mengonfirmasi bahwa saya telah memberikan persembahan kasih untuk:\n• Pos Persembahan: *${currentCategoryObj.name}*\n• Tanggal Transfer: *${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}*\n\nBerikut bukti transfer saya lampirkan. Terima kasih, Tuhan Yesus Memberkati. 🙏`
 )}`;

 return (
 <section id="persembahan" className="py-24 bg-[var(--surface-raised)]/60 dark:bg-[var(--card)]/60 border-y border-[var(--border)] dark:border-[var(--border)] transition-colors">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

 {/* Section Header */}
 <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
 <Heart className="w-3.5 h-3.5 fill-[var(--brand)] text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>Persembahan Kasih & Persepuluhan</span>
 </div>
 <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
 Mendukung Pekerjaan Rumah Tuhan
 </h2>
 <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
 &ldquo;Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan, sebab Allah mengasihi orang yang memberi dengan sukacita.&rdquo; <span className="font-semibold">(2 Korintus 9:7)</span>
 </p>
 </div>

 {/* Pos Persembahan Selector Tabs */}
 <div className="mb-10 max-w-4xl mx-auto">
 <div className="text-xs font-bold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] uppercase tracking-wider text-center mb-3">
 Pilih Peruntukan Pos Persembahan:
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
 {categories.map((cat) => {
 const isActive = selectedCategory === cat.id;
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => setSelectedCategory(cat.id)}
 className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
 isActive
 ? 'bg-[var(--brand)] dark:bg-[var(--brand)] text-white scale-[1.02]'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--surface-raised-hover)]'
 }`}
 >
 <span>{cat.name}</span>
 </button>
 );
 })}
 </div>
 <div className="mt-3.5 text-center px-4">
 <p className="text-xs sm:text-sm text-[var(--foreground)] dark:text-[var(--foreground)] font-medium">
 {currentCategoryObj.desc}
 </p>
 <p className="text-[11px] text-[var(--brand-text)] dark:text-[var(--brand-text)] italic mt-1">
 {currentCategoryObj.verse}
 </p>
 </div>
 </div>

 {/* 3 Giving Methods Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

 {/* 1. Kotak Persembahan (Offline) */}
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] transition-all flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[var(--brand)] dark:bg-[var(--brand)]">
 <Box className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[var(--brand-tint)] text-[var(--brand-text)] border-[var(--brand-tint-border)] dark:bg-[var(--brand-tint-ink)] dark:text-[var(--brand-text)] dark:border-[var(--brand-tint-border)]">
 Ibadah Onsite
 </span>
 </div>

 <div>
 <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
 Kotak Persembahan
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
 Tersedia di Gedung Gereja
 </p>
 </div>

 <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Dapat dimasukkan langsung ke kotak persembahan yang terletak di lobi utama depan pintu masuk ruang ibadah.
 </p>

 <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)]/80 dark:bg-[var(--surface-raised)]/80 border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] space-y-1.5">
 <div className="font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 3 Kotak Tersedia:
 </div>
 <ul className="list-disc pl-4 space-y-1 text-[11px]">
 <li>Kotak 1 & 2: Persembahan Umum & Persepuluhan</li>
 <li>Kotak Khusus: Pembangunan & Misi Diakonia</li>
 </ul>
 </div>
 </div>

 <div className="pt-2 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Amplop persembahan tersedia di meja usher.
 </div>
 </div>

 {/* 2. Transfer Bank (BCA & BRI) */}
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] transition-all flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[var(--ink-strong)]">
 <CreditCard className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[var(--surface-raised)] text-[var(--ink-strong)] border-[var(--border)] dark:bg-[var(--surface-raised)] dark:text-[var(--muted-foreground)] dark:border-[var(--border-strong)]">
 Transfer Bank
 </span>
 </div>

 <div>
 <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
 Rekening Bank Resmi
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
 Salin nomor rekening dengan 1 klik
 </p>
 </div>

 {/* Bank Cards */}
 <div className="space-y-3">
 {bankAccounts.map((bank) => (
 <div
 key={bank.id}
 className={`p-3.5 rounded-2xl bg-[var(--background)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] ${bank.color}`}
 >
 <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] mb-1">
 <span>{bank.bankName}</span>
 </div>
 <div className="flex items-center justify-between gap-2">
 <span className="font-mono text-base font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-wider">
 {bank.accountNumber}
 </span>
 <button
 type="button"
 onClick={() => handleCopy(bank.accountNumber, bank.id)}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
 copiedKey === bank.id
 ? 'bg-emerald-600 text-white'
 : 'bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--brand-tint-ink)]'
 }`}
 title="Salin Nomor Rekening"
 >
 {copiedKey === bank.id ? (
 <>
 <Check className="w-3.5 h-3.5" />
 <span>Tersalin!</span>
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
 <span>Salin</span>
 </>
 )}
 </button>
 </div>
 <div className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-1">
 a.n. {bank.accountHolder}
 </div>
 </div>
 ))}
 </div>
 </div>

 <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] italic text-center">
 Mohon beri berita transfer: &ldquo;{currentCategoryObj.name}&rdquo;
 </p>
 </div>

 {/* 3. QRIS Digital Payment */}
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] transition-all flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[var(--status-success)]">
 <QrCode className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[var(--status-success-tint)] text-[var(--status-success)] border-[var(--status-success-border)] dark:bg-[var(--status-success-tint)] dark:text-[var(--status-success)] dark:border-[var(--status-success-border)]">
 QRIS di Gedung
 </span>
 </div>

 <div>
 <h3 className="font-extrabold text-lg text-[var(--foreground)] dark:text-[var(--foreground)]">
 QRIS Semua E-Wallet
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
 BCA, Mandiri, GoPay, OVO, Dana, ShopeePay
 </p>
 </div>

 {/* QRIS is physical only, so this card says so rather than drawing a code.
 A previous version showed a hand-built SVG with the finder squares of a QR
 but no encoded data, captioned "Scan & Bayar". It could not be scanned, and
 the caption gave no hint why. A picture that cannot do what its caption
 promises is worse than no picture. */}
 <div className="p-4 rounded-2xl bg-[var(--background)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] space-y-2.5">
 <p className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 QRIS tersedia di gedung gereja
 </p>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Barcode QRIS resmi terpasang fisik di meja penerimaan dan lobi
 ibadah. Untuk memberi dari rumah, gunakan transfer bank di
 samping, atau hubungi WhatsApp pastoral.
 </p>
 </div>
 </div>
 </div>
 </div>


 {/* Dynamic WhatsApp Confirmation Strip */}
 <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3.5 text-center sm:text-left">
 <div className="w-11 h-11 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] flex items-center justify-center text-[var(--brand-text)] dark:text-[var(--brand-text)] shrink-0">
 <ShieldCheck className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Konfirmasi Persembahan {currentCategoryObj.name}
 </h4>
 <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[10px] font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)]">
 Terpilih
 </span>
 </div>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
 Kirimkan bukti transfer untuk pencatatan persembahan dan tanda terima warta jemaat.
 </p>
 </div>
 </div>

 <a
 href={whatsappConfirmUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] hover:from-[var(--brand-hover)] hover:to-[var(--brand-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
 >
 <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
 <span>Konfirmasi {currentCategoryObj.name}</span>
 </a>
 </div>

 </div>


 </section>
 );
}
