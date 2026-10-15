'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

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
 const dialogRef = useFocusTrap<HTMLDivElement>(true, onClose);

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
 <div
 ref={dialogRef}
 role="dialog"
 aria-modal="true"
 aria-labelledby="user-modal-title"
 tabIndex={-1}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
 <div className="w-full max-w-lg bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between">
 <h3 id="user-modal-title" className="text-xl font-extrabold text-[var(--foreground)] dark:text-white">
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
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Username *
 </label>
 <input
 type="text"
 required
 disabled={!!editingId}
 value={form.username}
 onChange={(e) => setForm({ ...form, username: e.target.value })}
 placeholder="contoh: noel"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30 disabled:opacity-60 disabled:cursor-not-allowed"
 />
 {editingId && (
 <p className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Username tidak bisa diubah. Buat user baru jika perlu ganti.
 </p>
 )}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 {editingId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}
 </label>
 <input
 type="password"
 required={!editingId}
 value={form.password}
 onChange={(e) => setForm({ ...form, password: e.target.value })}
 placeholder="••••"
 minLength={4}
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30"
 />
 <p className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Minimal 4 karakter. Disimpan dengan bcrypt (tidak bisa dibaca plain).
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
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
 ? 'border-[var(--brand)] bg-[var(--brand-tint)] dark:border-[var(--brand)] dark:bg-[var(--brand-tint-ink)]'
 : 'border-[var(--border)] dark:border-[var(--border)] bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] hover:border-[var(--brand)]/40 dark:hover:border-[var(--brand)]/40'
 }`}
 >
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => toggleRole(r)}
 className="mt-0.5 rounded text-[var(--brand-text)] dark:text-[var(--brand-text)] focus:ring-[var(--brand)] dark:focus:ring-[var(--brand)]"
 />
 <div className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] leading-tight">
 {meta.emoji} {meta.label}
 <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] font-normal mt-0.5">
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
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Nama Tampilan (opsional)
 </label>
 <input
 type="text"
 value={form.display_name}
 onChange={(e) => setForm({ ...form, display_name: e.target.value })}
 placeholder="contoh: Noel Yosan (Admin)"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand)]/30 dark:focus:ring-[var(--brand)]/30"
 />
 </div>

 <div className="pt-4 flex justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={submitting || form.roles.length === 0}
 className="px-6 py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white text-xs font-bold disabled:opacity-50"
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