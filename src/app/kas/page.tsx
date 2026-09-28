'use client';

import dynamic from 'next/dynamic';

/**
 * /kas route shell.
 *
 * Lazy-loads the KasDashboard component (~800 LOC) so /home + /info bundles
 * stay light. The portal is for treasurer / super only — small audience,
 * no benefit to eager-loading.
 */
const KasDashboard = dynamic(() => import('@/components/kas/KasDashboard'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF7] dark:bg-[#150B0D]">
      <div className="animate-pulse text-[#6E5D5F] dark:text-[#B5A1A3] text-sm">
        Memuat Portal Kas…
      </div>
    </main>
  ),
});

export default function KasPage() {
  return <KasDashboard />;
}