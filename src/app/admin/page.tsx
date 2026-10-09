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
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] dark:bg-[var(--card-inverted-bg)]">
      <div className="animate-pulse text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-sm">
        Memuat Portal Admin…
      </div>
    </main>
  ),
});

export default function AdminPage() {
  return <AdminDashboard />;
}