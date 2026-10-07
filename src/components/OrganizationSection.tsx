'use client';

import React from 'react';
import { ShieldCheck, Flame, Users, Baby, HeartHandshake, Crown } from 'lucide-react';

interface Member {
  name: string;
  role: string;
}

interface Group {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  members: Member[];
}

/**
 * Struktur Organisasi Pelayanan GIA Deliksari.
 *
 * Data sourced from INFO.md §3–§4 (single source of truth). If you edit
 * here, also update INFO.md and vice versa.
 */
const GROUPS: Group[] = [
  {
    id: 'hamba-tuhan',
    title: 'Hamba Tuhan',
    subtitle: 'Tim Penggembalaan & Pelayanan',
    icon: <Crown className="w-5 h-5" />,
    accentClass:
      'border-[#E5DFD5] dark:border-[#332F2B] bg-[#F3EFE6] dark:bg-[#262421] text-[#8B1E28] dark:text-[#B8323D]',
    members: [
      { name: 'Pdt. Yohanes Sutono, S.Th., M.Ag.', role: 'Bapak Gembala / Senior Pastor' },
      { name: 'Ibu Santini Lidyawati', role: 'Ibu Gembala' },
      { name: 'Sdr. Noel Yosan Loveano, S.Th.', role: 'Youth Pastor' },
    ],
  },
  {
    id: 'youth',
    title: 'Youth / Grow Generation',
    subtitle: 'Pemuda & Remaja (PRBK)',
    icon: <Flame className="w-5 h-5" />,
    accentClass:
      'border-[#EAC9C0] dark:border-[#4D2820] bg-[#FAF0ED] dark:bg-[#281814] text-[#A0442C] dark:text-[#D96B4F]',
    members: [
      { name: 'Sdri. Lara Tampubolon', role: 'Ketua' },
      { name: 'Sdr. Ravael', role: 'Sekretaris' },
      { name: 'Sdri. Mara', role: 'Bendahara' },
      { name: 'Sdr. Irel & Sdr. Bethany', role: 'Sie. Liturgi' },
      { name: 'Sdr. Yosua & Sdr. Shalom', role: 'Sie. Komsel' },
      { name: 'Sdr. Kevin & Sdr. Nando', role: 'Sie. Akomodasi' },
    ],
  },
  {
    id: 'komsel',
    title: 'Komsel (Kelompok Sel)',
    subtitle: 'Komunitas Kecil Persekutuan',
    icon: <Users className="w-5 h-5" />,
    accentClass:
      'border-[#F5DFAB] dark:border-[#52411E] bg-[#FEF9EC] dark:bg-[#2D2517] text-[#8C6826] dark:text-[#E0B85C]',
    members: [
      { name: 'Bpk. Sidik', role: 'Ketua Komsel — Ekklesia Sel' },
      { name: 'Sdri. Yemima', role: 'Ketua Komsel — Amethyst' },
      { name: 'Sdri. Lara', role: 'Ketua Komsel — Daughter of Grace' },
      { name: 'Sdr. Elang', role: 'Ketua Komsel — Nazareth' },
      { name: 'Sdr. Yosua', role: 'Ketua Komsel — Domba Perjuangan' },
    ],
  },
  {
    id: 'sekolah-minggu',
    title: 'Sekolah Minggu (COC Kidz / KAA)',
    subtitle: 'Pelayanan Anak-anak',
    icon: <Baby className="w-5 h-5" />,
    accentClass:
      'border-[#E2C3D0] dark:border-[#4A2032] bg-[#F9EFF3] dark:bg-[#26161E] text-[#7A354A] dark:text-[#B0657C]',
    members: [
      { name: 'Sdri. Yemima Purnamasari', role: 'Ketua' },
      { name: 'Sdri. Kesya', role: 'Sekretaris' },
      { name: 'Ibu Septi', role: 'Bendahara' },
    ],
  },
  {
    id: 'hana',
    title: 'Wanita HANA',
    subtitle: 'Persekutuan Kaum Wanita',
    icon: <HeartHandshake className="w-5 h-5" />,
    accentClass:
      'border-[#E5DFD5] dark:border-[#332F2B] bg-[#F3EFE6] dark:bg-[#262421] text-[#665E55] dark:text-[#A8A196]',
    members: [
      { name: 'Ibu Penskilla', role: 'Ketua' },
      { name: 'Ibu Siska', role: 'Sekretaris' },
      { name: 'Ibu Sulistya', role: 'Bendahara' },
    ],
  },
];

export default function OrganizationSection() {
  return (
    <section
      id="struktur"
      className="py-24 bg-[#FAF7F2] dark:bg-[#141312] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFE6] dark:bg-[#262421] border border-[#E5DFD5] dark:border-[#332F2B] text-[#665E55] dark:text-[#A8A196] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
            <span>Struktur Organisasi Pelayanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F3EF] tracking-tight">
            Tim Penggembalaan & Pelayanan
          </h2>
          <p className="text-[#665E55] dark:text-[#A8A196] text-base sm:text-lg leading-relaxed">
            Mengenal para hamba Tuhan dan tim pelayanan komunitas GIA Deliksari
            Semarang. Berbeda karunia, satu tujuan: melayani jemaat dengan kasih
            Kristus.
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GROUPS.map((group) => (
            <div
              key={group.id}
              className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-sm hover:shadow-md transition-all space-y-5"
            >
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${group.accentClass}`}
              >
                {group.icon}
                <span>{group.title}</span>
              </div>

              <p className="text-xs text-[#665E55] dark:text-[#A8A196] font-semibold uppercase tracking-wider">
                {group.subtitle}
              </p>

              <ul className="space-y-2.5 pt-2 border-t border-[#E5DFD5] dark:border-[#332F2B]">
                {group.members.map((m, idx) => (
                  <li
                    key={`${group.id}-${idx}`}
                    className="flex items-start justify-between gap-3 text-xs sm:text-sm"
                  >
                    <span className="font-bold text-[#1C1917] dark:text-[#F5F3EF] leading-snug">
                      {m.name}
                    </span>
                    <span className="text-[#665E55] dark:text-[#A8A196] text-right text-[11px] sm:text-xs whitespace-nowrap">
                      {m.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#665E55] dark:text-[#A8A196] max-w-2xl mx-auto leading-relaxed">
            Ingin melayani? Hubungi WhatsApp pastoral{' '}
            <a
              href="https://api.whatsapp.com/send?phone=6289620961103"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#8B1E28] dark:text-[#E88086] hover:underline"
            >
              0896-2096-1103
            </a>{' '}
            atau gunakan formulir pendaftaran di section{' '}
            <a href="#layanan" className="font-bold text-[#8B1E28] dark:text-[#E88086] hover:underline">
              Layanan Jemaat
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}