'use client';

import React from 'react';
import { Plus, Pin, Edit2, Trash2, Calendar } from 'lucide-react';
import type { Announcement, MinistryCategory } from '@/types';

/**
 * Announcements tab content for /admin portal.
 *
 * Pure presentation + callbacks. Parent owns modal state, data fetching,
 * and API mutations. This component just renders the list and emits user
 * intents back up via props.
 *
 * Extracted from AdminDashboard monolith in P7.1.
 */

interface AnnouncementsTabProps {
  announcements: Announcement[];
  onCreate: () => void;
  onEdit: (item: Announcement) => void;
  onTogglePin: (item: Announcement) => void;
  onDelete: (id: string) => void;
  getCategoryLabel: (cat: MinistryCategory) => string;
  getCategoryBadgeClass: (cat: MinistryCategory) => string;
}

const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  onCreate,
  onEdit,
  onTogglePin,
  onDelete,
  getCategoryLabel,
  getCategoryBadgeClass,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F1617] dark:text-white">
            Kelola Warta & Pengumuman Jemaat
          </h2>
          <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
            Warta yang dipublish akan otomatis tayang di halaman utama website jemaat.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C5222E] to-[#80141C] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-900/10 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Warta Baru</span>
        </button>
      </div>

      {/* List Announcements */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-[2rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C5222E]/40 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeClass(item.category)}`}
                >
                  {getCategoryLabel(item.category)}
                </span>
                {item.isPinned && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF9EC] text-[#B87A14] border border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19] flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    <span>Tersemat (Pinned)</span>
                  </span>
                )}
                {!item.isPublished && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7F2E8] text-[#6E5D5F] border border-[#EBDDCF] dark:bg-[#2A161A] dark:text-[#B5A1A3] dark:border-[#3A1C20]">
                    Draft (Tidak Tayang)
                  </span>
                )}
                <span className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C5222E]" />
                  <span>{item.eventDate}</span>
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-[#1F1617] dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4] line-clamp-2 leading-relaxed">
                {item.content}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => onTogglePin(item)}
                title={item.isPinned ? 'Lepas Pin' : 'Sematkan Warta'}
                className={`p-3 rounded-2xl border transition-colors ${
                  item.isPinned
                    ? 'bg-[#FEF9EC] text-[#B87A14] border-[#F8E3B5] dark:bg-[#332612] dark:text-[#F0BE5E] dark:border-[#543E19]'
                    : 'bg-[#F7F2E8] dark:bg-[#2A161A] text-[#5A4D4E] dark:text-[#D5C2C4] border-[#EBDDCF] dark:border-[#3A1C20]'
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit(item)}
                className="p-3 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20] border border-[#EBDDCF] dark:border-[#3A1C20] transition-colors"
                title="Edit Warta"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="p-3 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] hover:bg-[#FBE2E4] dark:hover:bg-[#451B21] text-[#9A1620] dark:text-[#F2828C] border border-[#F5CDD0] dark:border-[#521E25] transition-colors"
                title="Hapus Warta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsTab;
export type { AnnouncementsTabProps };