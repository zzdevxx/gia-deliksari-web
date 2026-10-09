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
          <h2 className="text-xl font-extrabold text-[#111827] dark:text-white">
            Kelola Warta & Pengumuman Jemaat
          </h2>
          <p className="text-xs text-[#5B6472] dark:text-[#9CA3AF]">
            Warta yang dipublish akan otomatis tayang di halaman utama website jemaat.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2"
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
            className="p-6 rounded-2xl bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#8B1E28]/40 dark:hover:border-[#B8323D]/40 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeClass(item.category)}`}
                >
                  {getCategoryLabel(item.category)}
                </span>
                {item.isPinned && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A] flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    <span>Tersemat (Pinned)</span>
                  </span>
                )}
                {!item.isPublished && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#5B6472] border border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]">
                    Draft (Tidak Tayang)
                  </span>
                )}
                <span className="text-xs text-[#5B6472] dark:text-[#9CA3AF] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#8B1E28] dark:text-[#E88086]" />
                  <span>{item.eventDate}</span>
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-[#111827] dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-[#5B6472] dark:text-[#9CA3AF] line-clamp-2 leading-relaxed">
                {item.content}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => onTogglePin(item)}
                title={item.isPinned ? 'Lepas Pin' : 'Sematkan Warta'}
                className={`p-3 rounded-2xl border transition-colors ${
                  item.isPinned
                    ? 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] dark:bg-[#1F232D] dark:text-[#9CA3AF] dark:border-[#2A2F3A]'
                    : 'bg-[#F3F4F6] dark:bg-[#1F232D] text-[#5B6472] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#2A2F3A]'
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit(item)}
                className="p-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[#E5E7EB] dark:border-[#2A2F3A] transition-colors"
                title="Edit Warta"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors"
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