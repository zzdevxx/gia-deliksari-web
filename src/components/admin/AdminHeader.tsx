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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EE] dark:bg-[#331812] text-[#C83E20] dark:text-[#F88B72] border border-[#FCD2C7] dark:border-[#57241A]">
            {badge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1617] dark:text-white tracking-tight">
          {heading}
        </h1>
        <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">{subheading}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="p-3 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20] border border-[#EBDDCF] dark:border-[#3A1C20] transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 text-[#C5222E] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <Link
          href={websiteLink}
          className="px-4 py-3 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20] border border-[#EBDDCF] dark:border-[#3A1C20] transition-colors text-xs font-bold flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5222E]" />
          <span>Lihat Website</span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-3 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] hover:bg-[#FBE2E4] dark:hover:bg-[#451B21] text-[#9A1620] dark:text-[#F2828C] border border-[#F5CDD0] dark:border-[#521E25] transition-colors text-xs font-bold flex items-center gap-2"
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