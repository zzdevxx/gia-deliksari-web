'use client';

import React, { useState, useEffect } from 'react';
import {
 Heart,
 Copy,
 Check,
 ShieldCheck,
 ExternalLink,
 CreditCard,
 QrCode,
 Box,
 X,
 Maximize2,
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
 const [showQrisModal, setShowQrisModal] = useState(false);

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

 // Handle escape key to close QRIS modal
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && showQrisModal) {
 setShowQrisModal(false);
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [showQrisModal]);

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
 <section id="persembahan" className="py-24 bg-[var(--surface-raised)]/60 dark:bg-[#12141A]/60 border-y border-[var(--border)] dark:border-[var(--border)] transition-colors">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

 {/* Section Header */}
 <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
 <Heart className="w-3.5 h-3.5 fill-[var(--brand)] text-[var(--brand-text)] dark:text-[#E88086]" />
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
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs">
 {categories.map((cat) => {
 const isActive = selectedCategory === cat.id;
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => setSelectedCategory(cat.id)}
 className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
 isActive
 ? 'bg-[var(--brand)] dark:bg-[var(--brand)] text-white shadow-xs scale-[1.02]'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D]'
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
 <p className="text-[11px] text-[var(--brand-text)] dark:text-[#E88086] italic mt-1">
 {currentCategoryObj.verse}
 </p>
 </div>
 </div>

 {/* 3 Giving Methods Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

 {/* 1. Kotak Persembahan (Offline) */}
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm transition-all flex flex-col justify-between space-y-6 ">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[var(--brand)] dark:bg-[var(--brand)]">
 <Box className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[#FBF1F2] text-[var(--brand-text)] border-[#E8C2C5] dark:bg-[#261517] dark:text-[#E88086] dark:border-[#52252A]">
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

 <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)]/80 dark:bg-[#1F232D]/80 border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] space-y-1.5">
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
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm transition-all flex flex-col justify-between space-y-6 ">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[#475569]">
 <CreditCard className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[#F9FAFB] text-[#475569] border-[var(--border)] dark:bg-[#1E293B] dark:text-[#64748B] dark:border-[#334155]">
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
 className={`p-3.5 rounded-2xl bg-[var(--background)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] ${bank.color}`}
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
 : 'bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#4A161D]'
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
 <Copy className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[#E88086]" />
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
 <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm transition-all flex flex-col justify-between space-y-6 ">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[#16A34A]">
 <QrCode className="w-8 h-8" />
 </div>
 <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] dark:bg-[#142A1B] dark:text-[#4ADE80] dark:border-[#052E16]">
 Scan & Bayar (QRIS)
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

 {/* QR Code Card Preview */}
 <div
 onClick={() => setShowQrisModal(true)}
 className="group relative cursor-pointer p-4 rounded-2xl bg-[var(--background)] dark:bg-[#1F232D] border-2 border-dashed border-emerald-300 dark:border-emerald-800 flex flex-col items-center justify-center hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all"
 >
 <div className="w-32 h-32 rounded-xl bg-[var(--card)] dark:bg-[var(--card)] p-2 border border-[var(--border-strong)] flex flex-col items-center justify-center">
 {/* Stylized QR Code SVG */}
 <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
 <rect x="0" y="0" width="30" height="30" rx="4" fill="currentColor" />
 <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
 <rect x="10" y="10" width="10" height="10" fill="currentColor" />
 <rect x="70" y="0" width="30" height="30" rx="4" fill="currentColor" />
 <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
 <rect x="80" y="10" width="10" height="10" fill="currentColor" />
 <rect x="0" y="70" width="30" height="30" rx="4" fill="currentColor" />
 <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
 <rect x="10" y="80" width="10" height="10" fill="currentColor" />
 <rect x="40" y="10" width="20" height="10" fill="currentColor" />
 <rect x="40" y="30" width="10" height="20" fill="currentColor" />
 <rect x="60" y="35" width="15" height="15" fill="currentColor" />
 <rect x="35" y="60" width="25" height="15" fill="currentColor" />
 <rect x="70" y="70" width="20" height="20" rx="2" fill="currentColor" />
 </svg>
 </div>
 <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
 <Maximize2 className="w-3.5 h-3.5" />
 <span>Klik untuk Perbesar QRIS</span>
 </div>
 </div>

 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-center">
 Mendukung seluruh m-Banking dan dompet digital berlogo QRIS Nasional.
 </p>
 </div>

 <button
 type="button"
 onClick={() => setShowQrisModal(true)}
 className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
 >
 <QrCode className="w-4 h-4" />
 <span>Buka QRIS Layar Penuh</span>
 </button>
 </div>

 </div>

 {/* Dynamic WhatsApp Confirmation Strip */}
 <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3.5 text-center sm:text-left">
 <div className="w-11 h-11 rounded-2xl bg-[var(--surface-raised)] dark:bg-[#1F232D] flex items-center justify-center text-[var(--brand-text)] dark:text-[#E88086] shrink-0">
 <ShieldCheck className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Konfirmasi Persembahan {currentCategoryObj.name}
 </h4>
 <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[10px] font-bold text-[var(--brand-text)] dark:text-[#E88086] border border-[var(--border)] dark:border-[var(--border)]">
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
 className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--brand)] hover:bg-[#731820] dark:bg-[var(--brand)] dark:hover:bg-[#A32C36] hover:from-[#A81B26] hover:to-[#6E0F16] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
 >
 <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
 <span>Konfirmasi {currentCategoryObj.name}</span>
 </a>
 </div>

 </div>

 {/* QRIS High-Res Modal Dialog */}
 {showQrisModal && (
 <div
 role="dialog"
 aria-modal="true"
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
 onClick={() => setShowQrisModal(false)}
 >
 <div
 className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] p-6 sm:p-7 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Close Button */}
 <button
 type="button"
 onClick={() => setShowQrisModal(false)}
 className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
 aria-label="Tutup QRIS"
 >
 <X className="w-5 h-5" />
 </button>

 {/* Header Modal */}
 <div className="space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-text)] dark:text-[#E88086]">
 QRIS Pembayaran Nasional
 </span>
 <h3 className="text-lg font-black text-[var(--foreground)] dark:text-[var(--foreground)]">
 GIA DELIKSARI SEMARANG
 </h3>
 <p className="text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Tersedia di Meja Penerimaan & Lobi Ibadah Gereja
 </p>
 </div>

 {/* QR Code Container */}
 <div className="p-4 rounded-2xl bg-[var(--card)] dark:bg-[var(--card)] border border-[var(--border-strong)] w-full flex flex-col items-center">
 <div className="w-56 h-56 flex items-center justify-center">
 {/* Clear Stylized QR SVG with Church Monogram Center */}
 <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
 {/* Corner Position Markers */}
 <rect x="2" y="2" width="28" height="28" rx="4" fill="currentColor" />
 <rect x="6" y="6" width="20" height="20" rx="2" fill="white" />
 <rect x="10" y="10" width="12" height="12" rx="1" fill="#8B1E28" />

 <rect x="70" y="2" width="28" height="28" rx="4" fill="currentColor" />
 <rect x="74" y="6" width="20" height="20" rx="2" fill="white" />
 <rect x="78" y="10" width="12" height="12" rx="1" fill="#8B1E28" />

 <rect x="2" y="70" width="28" height="28" rx="4" fill="currentColor" />
 <rect x="6" y="74" width="20" height="20" rx="2" fill="white" />
 <rect x="10" y="78" width="12" height="12" rx="1" fill="#8B1E28" />

 {/* QR Pattern Elements */}
 <rect x="36" y="6" width="8" height="8" rx="1" fill="currentColor" />
 <rect x="48" y="6" width="6" height="6" rx="1" fill="currentColor" />
 <rect x="58" y="6" width="6" height="6" rx="1" fill="currentColor" />
 <rect x="36" y="18" width="12" height="6" rx="1" fill="currentColor" />
 <rect x="52" y="18" width="12" height="8" rx="1" fill="currentColor" />

 <rect x="8" y="36" width="18" height="6" rx="1" fill="currentColor" />
 <rect x="8" y="48" width="8" height="14" rx="1" fill="currentColor" />
 <rect x="20" y="46" width="12" height="6" rx="1" fill="currentColor" />
 <rect x="20" y="56" width="8" height="8" rx="1" fill="currentColor" />

 {/* Center Monogram Shield */}
 <circle cx="50" cy="50" r="14" fill="#8B1E28" />
 <path d="M50 40 L50 60 M44 46 L56 46" stroke="white" strokeWidth="3" strokeLinecap="round" />

 <rect x="70" y="36" width="10" height="8" rx="1" fill="currentColor" />
 <rect x="84" y="36" width="10" height="18" rx="1" fill="currentColor" />
 <rect x="68" y="48" width="12" height="12" rx="1" fill="currentColor" />

 <rect x="36" y="72" width="10" height="12" rx="1" fill="currentColor" />
 <rect x="50" y="72" width="14" height="6" rx="1" fill="currentColor" />
 <rect x="36" y="88" width="28" height="6" rx="1" fill="currentColor" />
 <rect x="68" y="72" width="10" height="10" rx="1" fill="currentColor" />
 <rect x="82" y="72" width="12" height="22" rx="1" fill="currentColor" />
 <rect x="68" y="86" width="10" height="8" rx="1" fill="currentColor" />
 </svg>
 </div>
 <div className="text-[10px] font-bold text-slate-500 mt-2">
 SCAN QRIS RESMI DI MEJA PENERIMAAN GEREJA
 </div>
 </div>

 {/* Instruction Steps */}
 <div className="w-full text-left p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-xs space-y-1.5">
 <div className="font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 Informasi Persembahan Non-Tunai:
 </div>
 <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <li>Barcode QRIS fisik resmi terpasang di kotak persembahan dan lobi gereja.</li>
 <li>Mendukung seluruh m-Banking (BCA, Mandiri, BRI, dll) dan dompet digital (GoPay, OVO, Dana).</li>
 <li>Untuk info rekening gereja terkini, hubungi WhatsApp Pastoral: <strong>0896-2096-1103</strong>.</li>
 </ul>
 </div>

 {/* Buttons */}
 <div className="w-full flex items-center gap-2">
 <button
 type="button"
 onClick={() => setShowQrisModal(false)}
 className="flex-1 py-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] transition-colors"
 >
 Tutup
 </button>
 <a
 href={whatsappConfirmUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
 >
 <WhatsAppIcon className="w-4 h-4 text-emerald-200" />
 <span>Konfirmasi</span>
 </a>
 </div>

 </div>
 </div>
 )}

 </section>
 );
}
