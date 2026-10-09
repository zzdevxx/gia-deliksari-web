'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Navigation,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { YouTubeIcon, InstagramIcon, WhatsAppIcon } from './Icons';

export default function LocationContactSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const gmapsShareUrl = 'https://maps.app.goo.gl/CZt65yeXt7hqxiup6';

  const faqs = [
    {
      q: 'Jam berapa ibadah raya umum hari Minggu di GIA Deliksari?',
      a: 'Ibadah Raya Umum GIA Deliksari diadakan setiap hari Minggu pagi pukul 09.00 - 11.00 WIB di gedung gereja utama (Gedung Utama).',
    },
    {
      q: 'Apakah tersedia ibadah anak (Sekolah Minggu/COC Kidz) saat ibadah raya?',
      a: 'Ya, tersedia Ibadah Anak COC Kidz setiap Minggu pukul 09.30 - 10.30 WIB di Ruang Bethel dengan pembagian kelas sesuai kelompok usia balita hingga anak-anak.',
    },
    {
      q: 'Bagaimana cara bergabung dengan kelompok sel (Komsel Ekklesia) & Pemuda (Grow Generation)?',
      a: 'Anda dapat mengisi formulir pendaftaran di bagian Layanan Jemaat di website ini atau langsung menghubungi nomor WhatsApp Pastoral kami: 089620961103.',
    },
    {
      q: 'Apakah lokasi gereja dekat dengan kampus UNNES Gunungpati?',
      a: 'Benar, GIA Deliksari beralamat di Jl. Kolonel HR Hadijanto, Sekaran, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50229, berjarak hanya beberapa menit dari kawasan kampus UNNES.',
    },
    {
      q: 'Bagaimana jadwal Ibadah Youth (Grow Generation) dan Komsel Youth?',
      a: 'Ibadah Youth & Komsel Youth digelar setiap Sabtu pukul 18.00 - 20.00 WIB di Gedung Utama atau Ruang Bethel. Pola selang-seling 4 minggu: Minggu 1 & 3 = Ibadah Youth, Minggu 2 & 4 = Ibadah Komsel. Referensi: Sabtu 29 Agustus 2026 = Ibadah Youth.',
    },
    {
      q: 'Bagaimana jadwal Ibadah Wanita (HANA) dan Komsel Ekklesia?',
      a: 'Ibadah Wanita (HANA) setiap Jumat pukul 17.30 - 19.00 WIB. Komsel Ekklesia setiap Selasa pukul 18.30 - 20.00 WIB. Keduanya di Gedung Utama. Pola selang-seling 4 minggu: Minggu 1 & 3 = Ibadah HANA, Minggu 2 & 4 = Komsel Ekklesia. Referensi: Jumat 4 September 2026 = Ibadah HANA.',
    },
  ];

  return (
    <section id="kontak" className="py-24 bg-[var(--surface-raised)]/60 dark:bg-[#12141A]/60 border-y border-[var(--border)] dark:border-[var(--border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
            <span>Lokasi Fisik, FAQ & Kontak Pastoral</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
            Kunjungi & Terhubung Bersama Kami
          </h2>
          <p className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
            Pintu gereja dan hati kami senantiasa terbuka menyambut kehadiran Anda dan keluarga di GIA Deliksari.
          </p>
        </div>

        {/* 2 Big Columns: Map & Info + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

          {/* Left Column: Interactive Google Map */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs">
              <div className="flex items-center justify-between pb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--brand)] dark:bg-[var(--brand)]" />
                  <span className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
                    Gereja Isa Almasih Deliksari Semarang
                  </span>
                </div>

                <a
                  href={gmapsShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)] hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Buka Google Maps</span>
                </a>
              </div>

              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[var(--border)] dark:border-[var(--border)]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.6083810141634!2d110.3895251!3d-7.0543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b768e1a8a25%3A0x6b872b226e6dcf38!2sGIA%20Deliksari!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi GIA Deliksari Semarang"
                />
              </div>
            </div>

            {/* Address & Quick Contacts Card */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] flex items-center justify-center text-[var(--brand-text)] dark:text-[var(--brand-text)] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[var(--foreground)] dark:text-[var(--foreground)]">
                    Alamat Gedung Gereja
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed mt-0.5">
                    Jl. Kolonel HR Hadijanto, Sekaran, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50229 (Kawasan UNNES)
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] dark:border-[var(--border)] flex flex-wrap items-center gap-3">
                <a
                  href="https://api.whatsapp.com/send?phone=6289620961103"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#2A2F3A] border border-[var(--border)] dark:border-[var(--border)] text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp: 0896-2096-1103</span>
                </a>

                <a
                  href="mailto:giadeliksarichurch@gmail.com"
                  className="px-4 py-2.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>giadeliksarichurch@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)]">
                <HelpCircle className="w-4 h-4" />
                <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)]">
                Informasi Seputar Ibadah & Pelayanan
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-[var(--brand-text)] dark:text-[var(--brand-text)] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] dark:border-[var(--border)] pt-3 animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Social Channels Card */}
            <div className="p-6 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] space-y-4">
              <h4 className="font-bold text-sm text-[var(--foreground)] dark:text-[var(--foreground)]">
                Kanal Media Sosial Resmi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                <a
                  href="https://www.instagram.com/giadeliksari/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] flex items-center gap-2 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>@giadeliksari (Gereja)</span>
                </a>
                <a
                  href="https://www.instagram.com/growgeneration_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] flex items-center gap-2 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>@growgeneration_ (Youth)</span>
                </a>
                <a
                  href="https://www.instagram.com/cockidz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] flex items-center gap-2 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>@cockidz (Sekolah Minggu)</span>
                </a>
                <a
                  href="https://www.instagram.com/pwkhana_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] flex items-center gap-2 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>@pwkhana_ (Wanita HANA)</span>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                <a
                  href="https://www.youtube.com/@GIADeliksariSemarang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--brand-text)] dark:hover:text-[var(--brand-text)] border border-[var(--border)] dark:border-[var(--border)] flex items-center gap-2 transition-colors"
                >
                  <YouTubeIcon className="w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
                  <span>YouTube: GIA Deliksari</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
