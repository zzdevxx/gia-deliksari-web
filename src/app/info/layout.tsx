import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warta Jemaat & Jadwal Pelayanan',
  description:
    'Papan warta mingguan resmi, jadwal ibadah rutin, dan roster pelayan ibadah jemaat GIA Deliksari Semarang.',
  alternates: {
    canonical: '/info',
  },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
