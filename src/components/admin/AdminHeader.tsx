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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F9FAFB] dark:bg-[#1E293B] text-[#475569] dark:text-[#64748B] border border-[#E5E7EB] dark:border-[#334155]">
            {badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
          {heading}
        </h1>
        <p className="text-xs text-[#5B6472] dark:text-[#9CA3AF]">{subheading}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="p-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#8B1E28] dark:text-[#E88086] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <Link
          href={websiteLink}
          className="px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors text-xs font-bold flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
          <span>Lihat Website</span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-3 rounded-2xl bg-white dark:bg-[#171A21] hover:bg-[#F3F4F6] dark:hover:bg-[#1F232D] text-[#5B6472] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors text-xs font-bold flex items-center gap-2"
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