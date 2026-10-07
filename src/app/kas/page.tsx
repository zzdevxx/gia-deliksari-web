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
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#141312]">
      <div className="animate-pulse text-[#665E55] dark:text-[#A8A196] text-sm">
        Memuat Portal Kas…
      </div>
    </main>
  ),
});

export default function KasPage() {
  return <KasDashboard />;
}