'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export type Role = 'super' | 'admin' | 'treasurer';

interface UserFormData {
  username: string;
  password: string;
  roles: Role[];
  display_name: string;
}

interface UserModalProps {
  initial: UserFormData;
  editingId: string | null;
  onSave: (form: UserFormData) => Promise<void>;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<Role, { label: string; emoji: string; description: string }> = {
  super: { label: 'Superuser', emoji: '🔑', description: 'Akses penuh ke semua portal' },
  admin: { label: 'Admin/Operator', emoji: '📋', description: 'Akses ke /admin' },
  treasurer: { label: 'Bendahara', emoji: '💰', description: 'Akses ke /kas' },
};

/**
 * Modal for creating or editing a user. Pure UI; parent owns persistence.
 */
const UserModal: React.FC<UserModalProps> = ({ initial, editingId, onSave, onClose }) => {
  const [form, setForm] = useState<UserFormData>(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (r: Role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(r) ? prev.roles.filter((x) => x !== r) : [...new Set([...prev.roles, r])],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-[#2A2F3A] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#111827] dark:text-white">
            {editingId ? 'Edit User' : 'Tambah User Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
              Username *
            </label>
            <input
              type="text"
              required
              disabled={!!editingId}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="contoh: noel"
              className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {editingId && (
              <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                Username tidak bisa diubah. Buat user baru jika perlu ganti.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
              {editingId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingId}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••"
              minLength={4}
              className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30"
            />
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
              Minimal 4 karakter. Disimpan dengan bcrypt (tidak bisa dibaca plain).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
              Role * <span className="text-[10px] normal-case opacity-60">(pilih 1 atau lebih)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(ROLE_DESCRIPTIONS) as Role[]).map((r) => {
                const isChecked = form.roles.includes(r);
                const meta = ROLE_DESCRIPTIONS[r];
                return (
                  <label
                    key={r}
                    className={`flex items-start gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-[#8B1E28] bg-[#FBF1F2] dark:border-[#B8323D] dark:bg-[#261517]'
                        : 'border-[#E5E7EB] dark:border-[#2A2F3A] bg-[#F3F4F6] dark:bg-[#1F232D] hover:border-[#8B1E28]/40 dark:hover:border-[#B8323D]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRole(r)}
                      className="mt-0.5 rounded text-[#8B1E28] dark:text-[#E88086] focus:ring-[#8B1E28] dark:focus:ring-[#B8323D]"
                    />
                    <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] leading-tight">
                      {meta.emoji} {meta.label}
                      <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-normal mt-0.5">
                        {meta.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.roles.length === 0 && (
              <p className="text-[10px] text-rose-800 dark:text-rose-300 font-bold">⚠️ Pilih minimal 1 role</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider">
              Nama Tampilan (opsional)
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="contoh: Noel Yosan (Admin)"
              className="w-full px-4 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] border border-[#E5E7EB] dark:border-[#2A2F3A] text-sm text-[#111827] dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#1F232D] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || form.roles.length === 0}
              className="px-6 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs font-bold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Menyimpan…' : editingId ? 'Simpan Perubahan' : 'Buat User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
export type { UserFormData };