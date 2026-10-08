import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Kas Youth',
  robots: {
    index: false,
    follow: false,
  },
};

export default function KasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
