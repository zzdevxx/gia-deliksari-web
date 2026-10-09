'use client';

import dynamic from 'next/dynamic';

/**
 * /admin route shell.
 *
 * Lazy-loads the AdminDashboard component (~2.3k LOC) via next/dynamic with
 * ssr:false — the route is gated by client-side auth check anyway, so SSR
 * adds nothing. Public visitors to /home never fetch the admin JS chunk.
 *
 * Lazy-load also lets admin code use heavy deps (lucide icons, modal state,
 * form helpers) without bloating the public bundle.
 */
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0F1115]">
      <div className="animate-pulse text-[#5B6472] dark:text-[#9CA3AF] text-sm">
        Memuat Portal Admin…
      </div>
    </main>
  ),
});

export default function AdminPage() {
  return <AdminDashboard />;
}