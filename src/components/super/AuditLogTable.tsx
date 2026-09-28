'use client';

import React from 'react';
import { ScrollText, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  actor_username: string | null;
  actor_roles: string[] | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  summary: string;
  meta: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  source: string;
  created_at: string;
}

interface AuditLogTableProps {
  entries: AuditEntry[];
  total: number;
  loading: boolean;
  offset: number;
  limit: number;
  filter: { actor: string; action: string; since: string; until: string };
  onFilterChange: (f: AuditLogTableProps['filter']) => void;
  onApplyFilter: () => void;
  onRefresh: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  'auth.login_success':  { label: 'Login OK',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60', icon: '🔓' },
  'auth.login_failure':  { label: 'Login Gagal', color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '🔒' },
  'auth.login_lockout':  { label: 'Lockout',     color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',                         icon: '⛔' },
  'auth.logout':         { label: 'Logout',      color: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/40 dark:text-stone-300 dark:border-stone-700/60',                    icon: '🚪' },
  'user.create':         { label: 'Buat User',   color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '➕' },
  'user.update':         { label: 'Update User', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '✏️' },
  'user.deactivate':     { label: 'Nonaktifkan', color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '⛔' },
  'warta.create':        { label: 'Warta +',     color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '📢' },
  'warta.update':        { label: 'Warta ✏️',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '📢' },
  'warta.delete':        { label: 'Warta 🗑️',   color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '📢' },
  'warta.pin':           { label: 'Warta Pin',   color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60',               icon: '📌' },
  'roster.create':       { label: 'Roster +',    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '👥' },
  'roster.update':       { label: 'Roster ✏️',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '👥' },
  'roster.delete':       { label: 'Roster 🗑️',  color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '👥' },
  'inventory.update':    { label: 'Inventaris',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '📦' },
  'sermon.create':       { label: 'Khotbah +',   color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '🎬' },
  'sermon.update':       { label: 'Khotbah ✏️',  color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '🎬' },
  'sermon.delete':       { label: 'Khotbah 🗑️', color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '🎬' },
  'gallery.upload':      { label: 'Upload Foto', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '🖼️' },
  'gallery.delete':      { label: 'Hapus Foto',  color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '🖼️' },
  'ministry_request.update': { label: 'Layanan Jemaat', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',            icon: '🫶' },
  'kas.create':          { label: 'Kas +',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '💰' },
  'kas.update':          { label: 'Kas ✏️',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '💰' },
  'kas.delete':          { label: 'Kas 🗑️',     color: 'bg-[#FDF0F0] text-[#9A1620] border-[#F5CDD0] dark:bg-[#331418] dark:text-[#F2828C] dark:border-[#521E25]',                            icon: '💰' },
};

const AUDIT_LIMIT = 25;

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  entries, total, loading, offset, limit, filter,
  onFilterChange, onApplyFilter, onRefresh, onPrev, onNext,
}) => {
  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F1617] dark:text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#C5222E]" />
            Audit Log ({total})
          </h2>
          <p className="text-xs text-[#5A4D4E] dark:text-[#D5C2C4]">
            Trail siapa melakukan apa di portal gereja. Append-only — hanya super yang bisa membaca.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C5222E] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-[#F7F2E8] dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20]">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E5D5F] dark:text-[#B5A1A3]">Actor</label>
          <input
            type="text"
            placeholder="username"
            value={filter.actor}
            onChange={(e) => onFilterChange({ ...filter, actor: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs text-[#1F1617] dark:text-[#F5EFEB] outline-none focus:ring-2 focus:ring-[#C5222E]/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E5D5F] dark:text-[#B5A1A3]">Action</label>
          <input
            type="text"
            placeholder="e.g. warta.create"
            value={filter.action}
            onChange={(e) => onFilterChange({ ...filter, action: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs text-[#1F1617] dark:text-[#F5EFEB] outline-none focus:ring-2 focus:ring-[#C5222E]/30 font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E5D5F] dark:text-[#B5A1A3]">Dari</label>
          <input
            type="date"
            value={filter.since}
            onChange={(e) => onFilterChange({ ...filter, since: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs text-[#1F1617] dark:text-[#F5EFEB] outline-none focus:ring-2 focus:ring-[#C5222E]/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E5D5F] dark:text-[#B5A1A3]">Sampai</label>
          <input
            type="date"
            value={filter.until}
            onChange={(e) => onFilterChange({ ...filter, until: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-xs text-[#1F1617] dark:text-[#F5EFEB] outline-none focus:ring-2 focus:ring-[#C5222E]/30"
          />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <button
            onClick={onApplyFilter}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5222E] to-[#80141C] text-white text-xs font-bold flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border-b border-[#EBDDCF] dark:border-[#3A1C20]">
            <tr>
              <th className="p-4 font-bold w-40">Waktu (WIB)</th>
              <th className="p-4 font-bold w-44">Action</th>
              <th className="p-4 font-bold">Summary</th>
              <th className="p-4 font-bold w-32">Actor</th>
              <th className="p-4 font-bold w-32">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBDDCF] dark:divide-[#3A1C20]">
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">Memuat…</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
                  Belum ada entry. Aktivitas pertama akan muncul di sini setelah admin login.
                </td>
              </tr>
            ) : (
              entries.map((a) => {
                const meta = ACTION_META[a.action] ?? {
                  label: a.action,
                  color: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/40 dark:text-stone-300 dark:border-stone-700/60',
                  icon: '•',
                };
                const ts = new Date(a.created_at);
                return (
                  <tr key={a.id} className="hover:bg-[#FDFBF7] dark:hover:bg-[#261317] transition-colors">
                    <td className="p-4 text-xs text-[#5A4D4E] dark:text-[#D5C2C4] whitespace-nowrap font-mono">
                      {ts.toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}
                        title={a.action}
                      >
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                    </td>
                    <td className="p-4 text-[#1F1617] dark:text-[#F5EFEB]">
                      {a.summary}
                      {a.target_table && (
                        <div className="text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5 font-mono">
                          {a.target_table}{a.target_id ? ` · ${String(a.target_id).slice(0, 8)}…` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      {a.actor_username ? (
                        <>
                          <div className="font-mono font-bold text-[#1F1617] dark:text-[#F5EFEB]">
                            {a.actor_username}
                          </div>
                          {a.actor_roles && a.actor_roles.length > 0 && (
                            <div className="text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3]">
                              {a.actor_roles.join(', ')}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="italic text-[#6E5D5F] dark:text-[#B5A1A3]">anonim</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-[#6E5D5F] dark:text-[#B5A1A3]">
                      {a.ip || <span className="italic">—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6E5D5F] dark:text-[#B5A1A3]">
            Menampilkan {start}–{end} dari {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev || loading}
              className="px-3 py-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext || loading}
              className="px-3 py-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;
export { AUDIT_LIMIT };