'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
 onLogin: (username: string, password: string) => Promise<void>;
}

/**
 * Login screen for /super. Renders the form, handles local state for the
 * 2 inputs, surfaces errors via the parent's onLogin callback.
 */
const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [authError, setAuthError] = useState<string | null>(null);
 const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setAuthError(null);
 setSubmitting(true);
 try {
 await onLogin(username, password);
 } catch (err) {
 setAuthError(err instanceof Error ? err.message : 'Terjadi kesalahan koneksi');
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="w-full max-w-md bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-8 sm:p-10 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
 <div className="text-center space-y-3">
 <div className="w-16 h-16 rounded-3xl bg-[var(--brand)] dark:bg-[var(--brand)] text-white flex items-center justify-center mx-auto">
 <KeyRound className="w-8 h-8" />
 </div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-white tracking-tight">
 Superuser Portal
 </h1>
 <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Kelola akun pengurus gereja: superuser, admin/operator, dan bendahara youth.
 <br />
 <span className="text-[var(--brand-text)] dark:text-[#E88086] font-bold">
 Akses khusus role = super.
 </span>
 </p>
 </div>

 {authError && (
 <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-bold leading-snug animate-shake">
 {authError}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Username Superuser
 </label>
 <input
 type="text"
 required
 autoFocus
 autoComplete="username"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 placeholder="namapengurus"
 className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] text-sm focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30 focus:border-[#8B1E28] dark:focus:border-[#B8323D] outline-none transition-all placeholder:text-stone-400"
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 PIN / Password
 </label>
 <input
 type="password"
 required
 autoComplete="current-password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••"
 className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-raised)] dark:bg-[#1F232D] border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] dark:text-[var(--foreground)] text-sm focus:ring-2 focus:ring-[#8B1E28]/30 dark:focus:ring-[#B8323D]/30 focus:border-[#8B1E28] dark:focus:border-[#B8323D] outline-none transition-all placeholder:text-stone-400 tracking-widest"
 />
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="w-full py-4 rounded-2xl bg-[var(--brand)] hover:bg-[#731820] dark:bg-[var(--brand)] dark:hover:bg-[#A32C36] text-white font-extrabold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
 >
 <ShieldCheck className="w-4 h-4" />
 <span>{submitting ? 'Memproses…' : 'Masuk Superuser Portal'}</span>
 </button>
 </form>

 <div className="pt-2 text-center space-y-1">
 <Link
 href="/home"
 className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-text)] dark:text-[#E88086] hover:underline"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Kembali ke Beranda Jemaat</span>
 </Link>
 </div>
 </div>
 );
};

export default LoginForm;