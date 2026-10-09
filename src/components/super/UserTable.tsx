'use client';

import React from 'react';
import { Edit2, Trash2, Users, Power } from 'lucide-react';
import type { Role } from './UserModal';

interface User {
  id: string;
  username: string;
  roles: Role[];
  display_name: string | null;
  active: boolean;
  last_login_at: string | null;
}

const ROLE_META: Record<Role, { label: string; color: string; portal: string }> = {
  super: {
    label: 'Superuser',
    color: 'bg-[#FBF1F2] dark:bg-[#261517] text-[var(--brand-text)] dark:text-[#E88086] border-[#E8C2C5] dark:border-[#52252A]',
    portal: '/super',
  },
  admin: {
    label: 'Admin / Operator',
    color: 'bg-[#F9FAFB] dark:bg-[#1E293B] text-[#475569] dark:text-[#64748B] border-[var(--border)] dark:border-[#334155]',
    portal: '/admin',
  },
  treasurer: {
    label: 'Bendahara Youth',
    color: 'bg-[#F9FAFB] dark:bg-[#1F232D] text-[#4B5563] dark:text-[var(--muted-foreground)] border-[var(--border)] dark:border-[var(--border)]',
    portal: '/kas',
  },
};

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentUsername: string | null;
  onEdit: (u: User) => void;
  onDeactivate: (u: User) => void;
}

/**
 * User table for /super dashboard. Receives the list + callbacks from parent.
 * Primary role for badge color = first role in the array (super > admin > treasurer
 * typically, but we just take [0]).
 */
const UserTable: React.FC<UserTableProps> = ({ users, loading, currentUsername, onEdit, onDeactivate }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm">
        <div className="p-8 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Memuat daftar user…</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[var(--foreground)] dark:text-[var(--foreground)] border-b border-[var(--border)] dark:border-[var(--border)]">
          <tr>
            <th className="p-4 font-bold">Username</th>
            <th className="p-4 font-bold">Role</th>
            <th className="p-4 font-bold">Nama Tampilan</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold">Login Terakhir</th>
            <th className="p-4 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] dark:divide-[var(--border)]">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                Belum ada user. Klik "Tambah User Baru" untuk mulai.
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const primaryRole = (u.roles && u.roles[0]) || 'admin';
              const meta = ROLE_META[primaryRole];
              return (
                <tr
                  key={u.id}
                  className={`hover:bg-[var(--background)] dark:hover:bg-[#261317] transition-colors ${!u.active ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <div className="font-mono font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">{u.username}</div>
                    {u.username === currentUsername && (
                      <span className="text-[10px] uppercase font-bold text-[var(--brand-text)] dark:text-[#E88086]">← Anda</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
                      → {meta.portal}
                      {u.roles.length > 1 && ` (+${u.roles.length - 1})`}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--foreground)] dark:text-[var(--foreground)]">
                    {u.display_name || <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] italic">—</span>}
                  </td>
                  <td className="p-4">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                        <Power className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-900/40 dark:text-stone-400 dark:border-stone-800/60">
                        <Power className="w-3 h-3" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : <span className="italic">Belum pernah</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.active && (
                        <button
                          onClick={() => onEdit(u)}
                          title="Edit role / password"
                          className="p-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[#1F232D] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2F3A] border border-[var(--border)] dark:border-[var(--border)]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {u.active && u.username !== currentUsername && (
                        <button
                          onClick={() => onDeactivate(u)}
                          title="Nonaktifkan"
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
export type { User };