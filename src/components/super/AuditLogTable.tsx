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
  'auth.login_failure':  { label: 'Login Gagal', color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '🔒' },
  'auth.login_lockout':  { label: 'Lockout',     color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',                         icon: '⛔' },
  'auth.logout':         { label: 'Logout',      color: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/40 dark:text-stone-300 dark:border-stone-700/60',                    icon: '🚪' },
  'user.create':         { label: 'Buat User',   color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '➕' },
  'user.update':         { label: 'Update User', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '✏️' },
  'user.deactivate':     { label: 'Nonaktifkan', color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '⛔' },
  'warta.create':        { label: 'Warta +',     color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '📢' },
  'warta.update':        { label: 'Warta ✏️',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '📢' },
  'warta.delete':        { label: 'Warta 🗑️',   color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '📢' },
  'warta.pin':           { label: 'Warta Pin',   color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60',               icon: '📌' },
  'roster.create':       { label: 'Roster +',    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '👥' },
  'roster.update':       { label: 'Roster ✏️',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '👥' },
  'roster.delete':       { label: 'Roster 🗑️',  color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '👥' },
  'inventory.update':    { label: 'Inventaris',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '📦' },
  'sermon.create':       { label: 'Khotbah +',   color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',                       icon: '🎬' },
  'sermon.update':       { label: 'Khotbah ✏️',  color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '🎬' },
  'sermon.delete':       { label: 'Khotbah 🗑️', color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '🎬' },
  'gallery.upload':      { label: 'Upload Foto', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '🖼️' },
  'gallery.delete':      { label: 'Hapus Foto',  color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '🖼️' },
  'ministry_request.update': { label: 'Layanan Jemaat', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',            icon: '🫶' },
  'kas.create':          { label: 'Kas +',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',         icon: '💰' },
  'kas.update':          { label: 'Kas ✏️',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',               icon: '💰' },
  'kas.delete':          { label: 'Kas 🗑️',     color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',                            icon: '💰' },
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
          <h2 className="text-xl font-extrabold text-[var(--foreground)] dark:text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[var(--brand-text)] dark:text-[var(--brand-text)]" />
            Audit Log ({total})
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
            Trail siapa melakukan apa di portal gereja. Append-only — hanya super yang bisa membaca.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[var(--brand-text)] dark:text-[var(--brand-text)] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-[var(--surface-raised)] dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Actor</label>
          <input
            type="text"
            placeholder="username"
            value={filter.actor}
            onChange={(e) => onFilterChange({ ...filter, actor: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Action</label>
          <input
            type="text"
            placeholder="e.g. warta.create"
            value={filter.action}
            onChange={(e) => onFilterChange({ ...filter, action: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30 font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Dari</label>
          <input
            type="date"
            value={filter.since}
            onChange={(e) => onFilterChange({ ...filter, since: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Sampai</label>
          <input
            type="date"
            value={filter.until}
            onChange={(e) => onFilterChange({ ...filter, until: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30"
          />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <button
            onClick={onApplyFilter}
            className="px-4 py-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white text-xs font-bold flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] border-b border-[var(--border)] dark:border-[var(--border)]">
            <tr>
              <th className="p-4 font-bold w-40">Waktu (WIB)</th>
              <th className="p-4 font-bold w-44">Action</th>
              <th className="p-4 font-bold">Summary</th>
              <th className="p-4 font-bold w-32">Actor</th>
              <th className="p-4 font-bold w-32">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] dark:divide-[var(--border)]">
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Memuat…</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
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
                  <tr key={a.id} className="hover:bg-[var(--background)] dark:hover:bg-[var(--brand-tint-ink)] transition-colors">
                    <td className="p-4 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] whitespace-nowrap font-mono">
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
                    <td className="p-4 text-[var(--foreground)] dark:text-[var(--foreground)]">
                      {a.summary}
                      {a.target_table && (
                        <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5 font-mono">
                          {a.target_table}{a.target_id ? ` · ${String(a.target_id).slice(0, 8)}…` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      {a.actor_username ? (
                        <>
                          <div className="font-mono font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
                            {a.actor_username}
                          </div>
                          {a.actor_roles && a.actor_roles.length > 0 && (
                            <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                              {a.actor_roles.join(', ')}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="italic text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">anonim</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
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
          <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
            Menampilkan {start}–{end} dari {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev || loading}
              className="px-3 py-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext || loading}
              className="px-3 py-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
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