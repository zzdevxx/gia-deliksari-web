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
    <div className="w-full max-w-md bg-white dark:bg-[#221215] border border-[#EBDDCF] dark:border-[#3A1C20] rounded-[2.5rem] shadow-xl p-8 sm:p-10 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#C5222E] to-[#80141C] text-white flex items-center justify-center mx-auto shadow-lg shadow-red-900/20">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1617] dark:text-white tracking-tight">
          Superuser Portal
        </h1>
        <p className="text-xs sm:text-sm text-[#5A4D4E] dark:text-[#D5C2C4] leading-relaxed">
          Kelola akun pengurus gereja: superuser, admin/operator, dan bendahara youth.
          <br />
          <span className="text-[#C5222E] dark:text-[#E03643] font-bold">
            Akses khusus role = super.
          </span>
        </p>
      </div>

      {authError && (
        <div className="p-4 rounded-2xl bg-[#FDF0F0] dark:bg-[#331418] border border-[#F5CDD0] dark:border-[#521E25] text-[#9A1620] dark:text-[#F2828C] text-xs font-bold leading-snug animate-shake">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB] uppercase tracking-wider">
            Username Superuser
          </label>
          <input
            type="text"
            required
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="andreas"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] text-sm focus:ring-2 focus:ring-[#C5222E]/30 focus:border-[#C5222E] outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1F1617] dark:text-[#F5EFEB] uppercase tracking-wider">
            PIN / Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F7F2E8] dark:bg-[#2A161A] border border-[#EBDDCF] dark:border-[#3A1C20] text-[#1F1617] dark:text-[#F5EFEB] text-sm focus:ring-2 focus:ring-[#C5222E]/30 focus:border-[#C5222E] outline-none transition-all placeholder:text-stone-400 tracking-widest"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C5222E] to-[#80141C] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{submitting ? 'Memproses…' : 'Masuk Superuser Portal'}</span>
        </button>
      </form>

      <div className="pt-2 text-center space-y-1">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C5222E] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Jemaat</span>
        </Link>
        <div className="text-[11px] text-[#6E5D5F] dark:text-[#B5A1A3] pt-2">
          Default superuser: <code className="font-mono font-bold text-[#C5222E]">andreas</code> /
          <code className="font-mono font-bold text-[#C5222E]">5050</code>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;