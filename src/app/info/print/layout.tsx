import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buletin Warta Siap Cetak A4',
  description: 'Format buletin cetak warta dan roster mingguan GIA Deliksari Semarang.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/info/print',
  },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
