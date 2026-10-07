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
    color: 'bg-[#FBF1F2] dark:bg-[#261517] text-[#8B1E28] dark:text-[#E88086] border-[#E8C2C5] dark:border-[#52252A]',
    portal: '/super',
  },
  admin: {
    label: 'Admin / Operator',
    color: 'bg-[#FAF0ED] dark:bg-[#281814] text-[#A0442C] dark:text-[#D96B4F] border-[#EAC9C0] dark:border-[#4D2820]',
    portal: '/admin',
  },
  treasurer: {
    label: 'Bendahara Youth',
    color: 'bg-[#FEF9EC] dark:bg-[#2D2517] text-[#8C6826] dark:text-[#E0B85C] border-[#F5DFAB] dark:border-[#52411E]',
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
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-sm">
        <div className="p-8 text-center text-xs text-[#665E55] dark:text-[#A8A196]">Memuat daftar user…</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F3EFE6] dark:bg-[#262421] text-[#1C1917] dark:text-[#F5F3EF] border-b border-[#E5DFD5] dark:border-[#332F2B]">
          <tr>
            <th className="p-4 font-bold">Username</th>
            <th className="p-4 font-bold">Role</th>
            <th className="p-4 font-bold">Nama Tampilan</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold">Login Terakhir</th>
            <th className="p-4 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5DFD5] dark:divide-[#332F2B]">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-xs text-[#665E55] dark:text-[#A8A196]">
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
                  className={`hover:bg-[#FAF7F2] dark:hover:bg-[#261317] transition-colors ${!u.active ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <div className="font-mono font-bold text-[#1C1917] dark:text-[#F5F3EF]">{u.username}</div>
                    {u.username === currentUsername && (
                      <span className="text-[10px] uppercase font-bold text-[#8B1E28] dark:text-[#E88086]">← Anda</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="text-[10px] text-[#665E55] dark:text-[#A8A196] mt-0.5">
                      → {meta.portal}
                      {u.roles.length > 1 && ` (+${u.roles.length - 1})`}
                    </div>
                  </td>
                  <td className="p-4 text-[#1C1917] dark:text-[#F5F3EF]">
                    {u.display_name || <span className="text-[#665E55] dark:text-[#A8A196] italic">—</span>}
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
                  <td className="p-4 text-xs text-[#665E55] dark:text-[#A8A196]">
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
                          className="p-2 rounded-xl bg-[#F3EFE6] dark:bg-[#262421] text-[#1C1917] dark:text-[#F5F3EF] hover:bg-[#E5DFD5] dark:hover:bg-[#332F2B] border border-[#E5DFD5] dark:border-[#332F2B]"
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