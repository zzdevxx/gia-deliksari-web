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
    color: 'bg-[#FDF0F0] dark:bg-[#331418] text-[#9A1620] dark:text-[#F2828C] border-[#F5CDD0] dark:border-[#521E25]',
    portal: '/super',
  },
  admin: {
    label: 'Admin / Operator',
    color: 'bg-[#FFF2EE] dark:bg-[#331812] text-[#C83E20] dark:text-[#F88B72] border-[#FCD2C7] dark:border-[#57241A]',
    portal: '/admin',
  },
  treasurer: {
    label: 'Bendahara Youth',
    color: 'bg-[#FEF9EC] dark:bg-[#332612] text-[#B87A14] dark:text-[#F0BE5E] border-[#F8E3B5] dark:border-[#543E19]',
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
      <div className="overflow-x-auto rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm">
        <div className="p-8 text-center text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">Memuat daftar user…</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[2.5rem] bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] border-b border-[#EBDDCF] dark:border-[#3A1C20]">
          <tr>
            <th className="p-4 font-bold">Username</th>
            <th className="p-4 font-bold">Role</th>
            <th className="p-4 font-bold">Nama Tampilan</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold">Login Terakhir</th>
            <th className="p-4 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EBDDCF] dark:divide-[#3A1C20]">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
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
                  className={`hover:bg-[#FDFBF7] dark:hover:bg-[#261317] transition-colors ${!u.active ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <div className="font-mono font-bold text-[#1F1617] dark:text-[#F5EFEB]">{u.username}</div>
                    {u.username === currentUsername && (
                      <span className="text-[10px] uppercase font-bold text-[#C5222E] dark:text-[#E03643]">← Anda</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="text-[10px] text-[#6E5D5F] dark:text-[#B5A1A3] mt-0.5">
                      → {meta.portal}
                      {u.roles.length > 1 && ` (+${u.roles.length - 1})`}
                    </div>
                  </td>
                  <td className="p-4 text-[#1F1617] dark:text-[#F5EFEB]">
                    {u.display_name || <span className="text-[#6E5D5F] dark:text-[#B5A1A3] italic">—</span>}
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
                  <td className="p-4 text-xs text-[#6E5D5F] dark:text-[#B5A1A3]">
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
                          className="p-2 rounded-xl bg-[#F7F2E8] dark:bg-[#2A161A] text-[#1F1617] dark:text-[#F5EFEB] hover:bg-[#EBDDCF] dark:hover:bg-[#3A1C20] border border-[#EBDDCF] dark:border-[#3A1C20]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {u.active && u.username !== currentUsername && (
                        <button
                          onClick={() => onDeactivate(u)}
                          title="Nonaktifkan"
                          className="p-2 rounded-xl bg-[#FDF0F0] dark:bg-[#331418] hover:bg-[#FBE2E4] dark:hover:bg-[#451B21] text-[#9A1620] dark:text-[#F2828C] border border-[#F5CDD0] dark:border-[#521E25]"
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