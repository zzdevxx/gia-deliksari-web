'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Root server-error boundary.
 *
 * Next.js renders this when a route throws during rendering or when the
 * server responds with an error status — the cases `ErrorBoundary`
 * (src/components/ErrorBoundary.tsx) cannot see, because that one only catches
 * client render-phase errors. The two are complements, and this half was
 * missing: every route in the app had no error.tsx, so a server fault showed
 * the framework's default page instead of anything the congregation could act
 * on.
 *
 * Written because of a concrete event: on 16 Oct 2026 `/media` returned 503 to
 * visitors (8:13 WIB and 23:12 WIB, confirmed in Cloudflare analytics). The
 * visitor got a bare error page with no explanation, no retry, and no way back
 * into the site.
 *
 * Deliberately does not show `error.message`. In production the digest is
 * enough to correlate with server logs (`wrangler tail`), and leaking internal
 * messages to the public was already fixed in 11 places elsewhere in this
 * codebase — see the audit note in HANDOFF.md.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Workers Logs captures console.error, so this is the server-side trail.
    console.error('[route error]', error.digest ?? 'no-digest', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-tint)] border border-[var(--brand-tint-border)] text-[var(--brand-text)] mb-5">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        Halaman ini sedang tidak bisa dibuka
      </h1>

      <p className="mt-3 max-w-md text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
        Ada gangguan sesaat di server. Coba muat ulang sebentar lagi — biasanya
        langsung normal. Kalau masih gagal, kembali ke beranda.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-[11px] text-[var(--muted-foreground)]">
          Kode gangguan: {error.digest}
        </p>
      )}

      <div className="mt-7 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--brand-text-on-brand)] text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Coba Lagi
        </button>
        <Link
          href="/home"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--secondary)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
