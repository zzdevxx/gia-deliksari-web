'use client';

import React from 'react';
import { X, RefreshCw } from 'lucide-react';

/**
 * Root-level error boundary. Catches render-phase errors in any descendant
 * client component and shows a graceful fallback instead of a blank page.
 *
 * Usage:
 * Wrap children inside layout.tsx. Server errors still bubble to Next.js
 * error.tsx, but this catches client-side crashes (hook failures, render
 * errors, etc.) that would otherwise leave the user with no UI.
 */

interface Props {
 children: React.ReactNode;
 fallback?: React.ReactNode;
}

interface State {
 hasError: boolean;
 error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, info: React.ErrorInfo): void {
 // Log to console — Cloudflare Workers runtime captures console.error/warn into execution logs.
 // (Future: forward to Sentry/PostHog via the observer hook below.)
 console.error('[ErrorBoundary] caught:', error, info.componentStack);
 if (typeof window !== 'undefined') {
 window.dispatchEvent(
 new CustomEvent('gia:error', { detail: { error, info } }),
 );
 }
 }

 private handleReset = () => {
 this.setState({ hasError: false, error: null });
 };

 render() {
 if (this.state.hasError) {
 if (this.props.fallback) return this.props.fallback;
 return (
 <div
 role="alert"
 aria-live="assertive"
 className="min-h-[400px] flex flex-col items-center justify-center px-6 py-12 text-center"
 >
 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white mb-5">
 <X className="h-7 w-7" />
 </div>
 <h2 className="text-2xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
 Terjadi kesalahan
 </h2>
 <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke beranda jika masalah berlanjut.
 </p>
 {process.env.NODE_ENV !== 'production' && this.state.error && (
 <pre className="mt-4 max-w-2xl overflow-auto rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-left text-xs text-red-800 dark:text-red-200">
 {this.state.error.message}
 </pre>
 )}
 <div className="mt-6 flex gap-3">
 <button
 type="button"
 onClick={this.handleReset}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white text-sm font-bold transition-all"
 >
 <RefreshCw className="h-4 w-4" />
 Coba Lagi
 </button>
 <a
 href="/home"
 className="inline-flex items-center px-5 py-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border)] bg-white dark:bg-[var(--card)] text-[var(--foreground)] dark:text-[var(--foreground)] text-sm font-bold hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--surface-raised-hover)] transition-all"
 >
 Ke Beranda
 </a>
 </div>
 </div>
 );
 }
 return this.props.children;
 }
}