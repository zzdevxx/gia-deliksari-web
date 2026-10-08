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
    <main className="min-h-screen flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0F1115]">
      <div className="animate-pulse text-[#6B7280] dark:text-[#9CA3AF] text-sm">
        Memuat Portal Kas…
      </div>
    </main>
  ),
});

export default function KasPage() {
  return <KasDashboard />;
}