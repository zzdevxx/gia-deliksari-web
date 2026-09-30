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
      color: 'border-l-4 border-l-blue-600',
    },
    {
      id: 'bri',
      bankName: 'Bank Rakyat Indonesia (BRI)',
      accountNumber: '034201001515150',
      accountHolder: 'GIA DELIKSARI SEMARANG',
      note: 'Dapat transfer dari seluruh jaringan ATM Bersama / Prima',
      color: 'border-l-4 border-l-sky-600',
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
    <section id="persembahan" className="py-24 bg-[#F7F2E8]/60 dark:bg-[#1A0E10]/60 border-y border-[#EBDDCF] dark:border-[#3A1C20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-[#C5222E] text-[#C5222E]" />
            <span>Persembahan Kasih & Persepuluhan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F1617] dark:text-[#F5EFEB] tracking-tight">
            Mendukung Pekerjaan Rumah Tuhan
          </h2>
          <p className="text-[#5A4D4E] dark:text-[#D5C2C4] text-base sm:text-lg leading-relaxed">
            &ldquo;Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan, sebab Allah mengasihi orang yang memberi dengan sukacita.&rdquo; <span className="font-semibold">(2 Korintus 9:7)</span>
          </p>
        </div>

        {/* Pos Persembahan Selector Tabs */}
        <div className="mb-10 max-w-4xl mx-auto">
          <div className="text-xs font-bold text-[#6E5D5F] dark:text-[#B5A1A3] uppercase tracking-wider text-center mb-3">
            Pilih Peruntukan Pos Persembahan:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-[#C5222E] text-white shadow-xs scale-[1.02]'
                      : 'text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-[#F7F2E8] dark:hover:bg-[#2A161A]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3.5 text-center px-4">
            <p className="text-xs sm:text-sm text-[#1F1617] dark:text-[#F5EFEB] font-medium">
              {currentCategoryObj.desc}
            </p>
            <p className="text-[11px] text-[#80141C] dark:text-[#F2828C] italic mt-1">
              {currentCategoryObj.verse}
            </p>
          </div>
        </div>

        {/* 3 Giving Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* 1. Kotak Persembahan (Offline) */}
          <div className="p-7 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 border-t-4 border-t-[#C5222E]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[#C5222E]">
                  <Box className="w-8 h-8" />
                </div>
                <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]">
                  Ibadah Onsite
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Kotak Persembahan
                </h3>
                <p className="text-xs text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                  Tersedia di Gedung Gereja
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
                Dapat dimasukkan langsung ke kotak persembahan yang terletak di lobi utama depan pintu masuk ruang ibadah.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#F7F2E8]/80 dark:bg-[#2A161A]/80 border border-[#EBDDCF] dark:border-[#3A1C20] text-xs text-[#5A4D4E] dark:text-[#D5C2C4] space-y-1.5">
                <div className="font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                  3 Kotak Tersedia:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Kotak 1 & 2: Persembahan Umum & Persepuluhan</li>
                  <li>Kotak Khusus: Pembangunan & Misi Diakonia</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
              Amplop persembahan tersedia di meja usher.
            </div>
          </div>

          {/* 2. Transfer Bank (BCA & BRI) */}
          <div className="p-7 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 border-t-4 border-t-[#C83E20]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-[#C83E20]">
                  <CreditCard className="w-8 h-8" />
                </div>
                <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold border bg-[#FFF2EE] text-[#C83E20] border-[#FCD2C7] dark:bg-[#331812] dark:text-[#F88B72] dark:border-[#57241A]">
                  Transfer Bank
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  Rekening Bank Resmi
                </h3>
                <p className="text-xs text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                  Salin nomor rekening dengan 1 klik
                </p>
              </div>

              {/* Bank Cards */}
              <div className="space-y-3">
                {bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] ${bank.color}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB] mb-1">
                      <span>{bank.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-extrabold text-[#9A1620] dark:text-[#F2828C] tracking-wider">
                        {bank.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bank.accountNumber, bank.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          copiedKey === bank.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#F7F2E8] dark:bg-[#331418] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#FDF0F0] dark:hover:bg-[#4A161D]'
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
                            <Copy className="w-3.5 h-3.5 text-[#C5222E] dark:text-[#E03643]" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-[#6E5D5F] dark:text-[#B5A1A3] mt-1">
                      a.n. {bank.accountHolder}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#6E5D5F] dark:text-[#B5A1A3] italic text-center">
              Mohon beri berita transfer: &ldquo;{currentCategoryObj.name}&rdquo;
            </p>
          </div>

          {/* 3. QRIS Digital Payment */}
          <div className="p-7 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 border-t-4 border-t-[#16A34A]">
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
                <h3 className="font-extrabold text-lg text-[#1F1617] dark:text-[#F5EFEB]">
                  QRIS Semua E-Wallet
                </h3>
                <p className="text-xs text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                  BCA, Mandiri, GoPay, OVO, Dana, ShopeePay
                </p>
              </div>

              {/* QR Code Card Preview */}
              <div
                onClick={() => setShowQrisModal(true)}
                className="group relative cursor-pointer p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#2A161A] border-2 border-dashed border-emerald-300 dark:border-emerald-800 flex flex-col items-center justify-center hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all"
              >
                <div className="w-32 h-32 rounded-xl bg-white p-2 border border-slate-200 flex flex-col items-center justify-center shadow-xs">
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

              <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] text-center">
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
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] flex items-center justify-center text-[#C5222E] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                  Konfirmasi Persembahan {currentCategoryObj.name}
                </h4>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#F7F2E8] dark:bg-[#2A161A] text-[10px] font-bold text-[#80141C] dark:text-[#F2828C] border border-[#EBDDCF] dark:border-[#3A1C20]">
                  Terpilih
                </span>
              </div>
              <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] mt-0.5">
                Kirimkan bukti transfer untuk pencatatan persembahan dan tanda terima warta jemaat.
              </p>
            </div>
          </div>

          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#C5222E] to-[#80141C] hover:from-[#A81B26] hover:to-[#6E0F16] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
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
            className="relative w-full max-w-sm rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
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
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5222E] dark:text-[#E03643]">
                QRIS Pembayaran Nasional
              </span>
              <h3 className="text-lg font-black text-[#1F1617] dark:text-[#F5EFEB]">
                GIA DELIKSARI SEMARANG
              </h3>
              <p className="text-[11px] text-[#6E5D5F] dark:text-[#B5A1A3]">
                NMID: ID102002151515 | Dicetak Resmi untuk Jemaat
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-inner w-full flex flex-col items-center">
              <div className="w-56 h-56 flex items-center justify-center">
                {/* Clear Stylized QR SVG with Church Monogram Center */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Corner Position Markers */}
                  <rect x="2" y="2" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="6" y="6" width="20" height="20" rx="2" fill="white" />
                  <rect x="10" y="10" width="12" height="12" rx="1" fill="#C5222E" />

                  <rect x="70" y="2" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="74" y="6" width="20" height="20" rx="2" fill="white" />
                  <rect x="78" y="10" width="12" height="12" rx="1" fill="#C5222E" />

                  <rect x="2" y="70" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="6" y="74" width="20" height="20" rx="2" fill="white" />
                  <rect x="10" y="78" width="12" height="12" rx="1" fill="#C5222E" />

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
                  <circle cx="50" cy="50" r="14" fill="#C5222E" />
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
                SATU QR CODE UNTUK SEMUA PEMBAYARAN
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="w-full text-left p-3.5 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs space-y-1.5">
              <div className="font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                Cara Melakukan Scan:
              </div>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-[#5A4D4E] dark:text-[#D5C2C4]">
                <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, dll) atau E-Wallet (GoPay, OVO, Dana).</li>
                <li>Pilih menu <strong>Scan QRIS</strong>.</li>
                <li>Arahkan kamera ke layar atau simpan gambar ini.</li>
                <li>Masukkan nominal persembahan & konfirmasi PIN.</li>
              </ol>
            </div>

            {/* Buttons */}
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EBDDCF] dark:border-[#3A1C20] text-xs font-bold text-[#5A4D4E] dark:text-[#D5C2C4] hover:bg-[#F7F2E8] dark:hover:bg-[#331418] transition-colors"
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
