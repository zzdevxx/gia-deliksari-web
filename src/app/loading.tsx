import React from 'react';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui';

/**
 * Route-level loading state.
 *
 * Every route in this app was missing one, so navigating to a page that does
 * server work showed nothing until it finished. `/layanan` measured 3.3s on a
 * live request (16 Oct 2026) — long enough that a visitor on a phone concludes
 * the page is broken and leaves, because a frozen screen and a dead page look
 * identical.
 *
 * The layout mirrors the shared page frame (banner, heading, then content) so
 * the transition does not jump when real content replaces it. Dimensions match
 * the actual headings and cards rather than being arbitrary heights, which is
 * what keeps the swap from shifting layout.
 *
 * Uses the existing `Skeleton` primitive so the shimmer is the same one already
 * defined in the design system.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="pt-28 pb-12 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton variant="rounded" width={240} height={28} className="mb-4" />
          <Skeleton variant="text" width="60%" height={40} className="mb-4" />
          <Skeleton variant="text" width="85%" height={18} />
        </div>
      </section>

      <main className="flex-1" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Memuat halaman…</span>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <Skeleton variant="rounded" width={44} height={44} className="mb-4" />
                <Skeleton variant="text" width="70%" className="mb-3" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" className="mt-2" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
