'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  /** Badge text shown next to "Portal" label (e.g. "Admin / Operator"). */
  badge: string;
  /** Heading text shown below badge (e.g. "Manajemen Operasional Gereja"). */
  heading: string;
  /** Subheading shown below heading. */
  subheading: string;
  /** "Login sebagai X (roles)" line below the header. */
  greeting: string;
  loading?: boolean;
  onRefresh?: () => void;
  onLogout?: () => void;
  /** Optional link target for "Lihat Website" button (defaults to /home). */
  websiteLink?: string;
}

/**
 * Reusable top header bar used by /admin and /kas portals.
 *
 * Consolidates the badge + heading + action buttons row that was duplicated
 * across both portals with slightly inconsistent styling. Single source of
 * truth for the operator-portal chrome.
 */
const AdminHeader: React.FC<AdminHeaderProps> = ({
  badge,
  heading,
  subheading,
  greeting,
  loading = false,
  onRefresh,
  onLogout,
  websiteLink = '/home',
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F9FAFB] dark:bg-[#1E293B] text-[#475569] dark:text-[#64748B] border border-[var(--border)] dark:border-[#334155]">
            {badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-white tracking-tight">
          {heading}
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">{subheading}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="p-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[var(--border)] dark:border-[var(--border)] transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--brand-text)] dark:text-[var(--brand-text)] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <Link
          href={websiteLink}
          className="px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[var(--border)] dark:border-[var(--border)] transition-colors text-xs font-bold flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
          <span>Lihat Website</span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-3 rounded-2xl bg-white dark:bg-[var(--card)] hover:bg-[var(--surface-raised)] dark:hover:bg-[#1F232D] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)] transition-colors text-xs font-bold flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;