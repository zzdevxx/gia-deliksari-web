import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({
 subsets: ['latin'],
 variable: '--font-sans',
 display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
 subsets: ['latin'],
 variable: '--font-display',
 display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://giadeliksari.my.id';

export const metadata: Metadata = {
 metadataBase: new URL(siteUrl),
 title: {
 default: 'GIA Deliksari Semarang - Growing Church!',
 template: '%s | GIA Deliksari Semarang',
 },
 description:
 'Website Resmi Gereja Isa Almasih (GIA) Deliksari Semarang. Menghadirkan warta jemaat terkini, jadwal ibadah (Ibadah Raya, Grow Generation Youth, COC Kidz, Hana Fellowship, Komsel Ekklesia), arsip khotbah, persembahan digital, dan formulir pendaftaran pelayanan.',
 keywords: [
 'GIA Deliksari',
 'GIA Deliksari Semarang',
 'Gereja Isa Almasih Deliksari',
 'Growing Church Semarang',
 'Ps. Yohanes Sutono',
 'Ibu Santini',
 'Kak Noel Yosan S.Th.',
 'Grow Generation PRBK',
 'COC Kidz',
 'Komsel Ekklesia',
 'Persekutuan Hana',
 'Gereja Gunung Pati Semarang',
 'Ibadah Kristen Semarang',
 ],
 authors: [{ name: 'GIA Deliksari Creative Media Team' }],
 creator: 'GIA Deliksari Semarang',
 publisher: 'GIA Deliksari Semarang',
 formatDetection: {
 email: false,
 address: false,
 telephone: false,
 },
 alternates: {
 canonical: '/',
 },
 openGraph: {
 title: 'GIA Deliksari Semarang - Growing Church!',
 description:
 'Gereja Isa Almasih Deliksari Semarang - Tempat Persekutuan, Pertumbuhan Iman, dan Pelayanan Generasi.',
 url: siteUrl,
 siteName: 'GIA Deliksari Semarang',
 images: [
 {
 url: '/images/logo.png',
 width: 1080,
 height: 1080,
 alt: 'Logo Resmi GIA Deliksari Semarang - Growing Church',
 },
 ],
 locale: 'id_ID',
 type: 'website',
 },
 twitter: {
 card: 'summary_large_image',
 title: 'GIA Deliksari Semarang - Growing Church!',
 description:
 'Gereja Isa Almasih Deliksari Semarang. Jadwal Ibadah, Warta Jemaat, dan Pusat Pelayanan.',
 images: ['/images/logo.png'],
 },
 icons: {
 icon: [
 { url: '/favicon.ico', sizes: '32x32' },
 { url: '/images/logo.png', sizes: '1080x1080', type: 'image/png' },
 ],
 shortcut: '/favicon.ico',
 apple: '/images/logo.png',
 },
};

// Schema.org Structured Data (Church / PlaceOfWorship & FAQ)
const churchSchema = {
 '@context': 'https://schema.org',
 '@type': 'Church',
 name: 'Gereja Isa Almasih Deliksari Semarang',
 alternateName: ['GIA Deliksari', 'GIA Deliksari Growing Church'],
 url: siteUrl,
 logo: `${siteUrl}/images/logo.png`,
 image: `${siteUrl}/images/logo.png`,
 description:
 'Gereja Isa Almasih (GIA) Deliksari adalah komunitas keluarga Allah di Semarang yang berakar dalam iman, kasih, dan pengharapan.',
 telephone: '+6289620961103',
 address: {
 '@type': 'PostalAddress',
 streetAddress: 'Jl. Kolonel Hadijanto, Deliksari',
 addressLocality: 'Gunung Pati',
 addressRegion: 'Jawa Tengah',
 postalCode: '50229',
 addressCountry: 'ID',
 },
 geo: {
 '@type': 'GeoCoordinates',
 latitude: -7.0543,
 longitude: 110.3921,
 },
 openingHoursSpecification: [
 {
 '@type': 'OpeningHoursSpecification',
 dayOfWeek: ['Sunday'],
 opens: '09:00',
 closes: '11:00',
 description: 'Ibadah Raya Umum & Ibadah Pagi',
 },
 {
 '@type': 'OpeningHoursSpecification',
 dayOfWeek: ['Sunday'],
 opens: '09:30',
 closes: '10:30',
 description: 'COC Kidz (Sekolah Minggu)',
 },
 {
 '@type': 'OpeningHoursSpecification',
 dayOfWeek: ['Saturday'],
 opens: '18:00',
 closes: '20:00',
 description: 'Grow Generation (Youth & Teen)',
 },
 ],
 founder: {
 '@type': 'Person',
 name: 'Ps. Yohanes Sutono',
 jobTitle: 'Gembala Sidang',
 },
 sameAs: [
 'https://www.instagram.com/giadeliksari',
 'https://www.youtube.com/@GIADeliksariSemarang',
 ],
};

const faqSchema = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: [
 {
 '@type': 'Question',
 name: 'Kapan jadwal ibadah umum di GIA Deliksari Semarang?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Ibadah Pagi / Ibadah Raya Umum GIA Deliksari diadakan setiap hari Minggu pukul 09.00 - 11.00 WIB.',
 },
 },
 {
 '@type': 'Question',
 name: 'Kapan jadwal ibadah pemuda (Youth) di GIA Deliksari?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Ibadah Grow Generation (PRBK Youth & Teen) diadakan setiap hari Sabtu sore pukul 18.00 - 20.00 WIB.',
 },
 },
 {
 '@type': 'Question',
 name: 'Di mana alamat lokasi fisik GIA Deliksari?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'GIA Deliksari berlokasi di Jl. Kolonel Hadijanto, Deliksari, Gunung Pati, Kota Semarang, Jawa Tengah (dekat kampus UNNES).',
 },
 },
 {
 '@type': 'Question',
 name: 'Siapa gembala sidang GIA Deliksari Semarang?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Gembala Sidang GIA Deliksari adalah Pdt. Yohanes Sutono, S.Th., M.Ag. bersama Ibu Gembala Ibu Santini Lidyawati, didukung Youth Pastor Sdr. Noel Yosan Loveano, S.Th.',
 },
 },
 ],
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="id" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
 <head>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(churchSchema) }}
 />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
 />
 {/* Anti-FOIC: resolve the persisted theme BEFORE first paint so a dark-mode
 visitor never sees a white flash while React hydrates. Single source of
 truth for theme resolution — ThemeProvider reads this back on mount. */}
 <script
 id="theme-init"
 dangerouslySetInnerHTML={{
 __html: `(function(){try{var t=localStorage.getItem('gia_theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`,
 }}
 />
 </head>
 <body className="font-sans antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
 <a
 href="#beranda"
 className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-bold rounded-xl"
 >
 Lewati ke Konten Utama (Skip to Content)
 </a>
 <ThemeProvider>
 <ErrorBoundary>
 {children}
 <ScrollToTop />
 </ErrorBoundary>
 </ThemeProvider>
 {/* Service Worker registration — enables offline access & PWA install.
 Strategy: register on load, defer activation via SKIP_WAITING. */}
 <Script id="sw-register" strategy="afterInteractive">{`
 if ('serviceWorker' in navigator) {
 window.addEventListener('load', function () {
 navigator.serviceWorker.register('/sw.js').then(
 function (reg) {
 // Listen for updates and prompt user to refresh.
 reg.addEventListener('updatefound', function () {
 var w = reg.installing;
 if (!w) return;
 w.addEventListener('statechange', function () {
 if (w.state === 'installed' && navigator.serviceWorker.controller) {
 // New SW available — auto-activate on next navigation.
 w.postMessage({ type: 'SKIP_WAITING' });
 }
 });
 });
 },
 function (err) {
 console.warn('[sw] registration failed:', err);
 }
 );
 });
 }
 `}</Script>
 </body>
 </html>
 );
}
