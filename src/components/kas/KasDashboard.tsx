'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
 Wallet,
 TrendingUp,
 TrendingDown,
 Plus,
 Trash2,
 Edit2,
 X,
 KeyRound,
 ArrowLeft,
 RefreshCw,
 LogOut,
 ExternalLink,
 Calendar,
 Tag,
 FileText,
 Coins,
 Search,
 CheckCircle2,
 AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/admin/useToast';
import { clearClientCachesOnLogout } from '@/lib/storage';

type Role = 'super' | 'admin' | 'treasurer';

interface AuthUser {
 id: string;
 username: string;
 roles: Role[];
 display_name: string | null;
}

interface Transaction {
 id: string;
 transaction_date: string;
 type: 'income' | 'expense';
 category: string;
 amount: number;
 description: string | null;
 created_by: string | null;
 created_at: string;
 updated_at: string;
}

interface Balance {
 total_income: number;
 total_expense: number;
 balance: number;
 income_count: number;
 expense_count: number;
}

const SUGGESTED_CATEGORIES = [
 'iuran_anggota',
 'sumbangan',
 'konsumsi',
 'transportasi',
 'alat',
 'acara',
 'lainnya',
];

function formatIDR(n: number): string {
 return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n);
}

function todayISO(): string {
 return new Date().toISOString().split('T')[0];
}

export default function KasDashboard() {
 const router = useRouter();
 const { showToast, ToastView } = useToast();
 const [authUser, setAuthUser] = useState<AuthUser | null>(null);
 const [authChecked, setAuthChecked] = useState(false);
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [authError, setAuthError] = useState<string | null>(null);

 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [balance, setBalance] = useState<Balance>({
 total_income: 0,
 total_expense: 0,
 balance: 0,
 income_count: 0,
 expense_count: 0,
 });
 const [loading, setLoading] = useState(true);
 const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
 const [searchQuery, setSearchQuery] = useState('');

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [form, setForm] = useState<{
 transaction_date: string;
 type: 'income' | 'expense';
 category: string;
 amount: string;
 description: string;
 }>({
 transaction_date: todayISO(),
 type: 'income',
 category: '',
 amount: '',
 description: '',
 });

 // Check auth on mount
 useEffect(() => {
 fetch('/api/auth/check')
 .then((r) => r.json())
 .then((d) => {
 if (!d.authenticated) {
 // Stay on login screen
 } else if (!d.user?.roles?.some((r: string) => r === 'super' || r === 'treasurer')) {
 showToast('Akses ditolak. /kas khusus untuk bendahara youth.');
 router.replace('/home');
 } else {
 setAuthUser(d.user);
 }
 setAuthChecked(true);
 })
 .catch(() => setAuthChecked(true));
 }, [router, showToast]);

 const loadData = async () => {
 setLoading(true);
 try {
 const res = await fetch('/api/youth-treasury?limit=500');
 const data = await res.json();
 if (!res.ok) {
 showToast(data.error || 'Gagal memuat data');
 if (res.status === 401) router.replace('/kas');
 return;
 }
 setTransactions(data.items || []);
 setBalance(
 data.balance || {
 total_income: 0,
 total_expense: 0,
 balance: 0,
 income_count: 0,
 expense_count: 0,
 },
 );
 } catch {
 showToast('Gagal memuat data');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (authUser) loadData();
 }, [authUser]);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setAuthError(null);
 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password }),
 });
 const data = await res.json();
 if (!res.ok || !data.success) {
 setAuthError(data.error || 'Login gagal');
 return;
 }
 if (!data.user?.roles?.some((r: string) => r === 'super' || r === 'treasurer')) {
 setAuthError('Akses ditolak. /kas khusus untuk bendahara.');
 return;
 }
 setAuthUser(data.user);
 setUsername('');
 setPassword('');
 showToast('Login berhasil. Selamat datang, ' + (data.user.display_name || data.user.username));
 } catch {
 setAuthError('Terjadi kesalahan koneksi');
 }
 };

 const handleLogout = async () => {
 try {
 await fetch('/api/auth/login', { method: 'DELETE' });
 } catch {
 /* ignore */
 }
 clearClientCachesOnLogout();
 setAuthUser(null);
 setTransactions([]);
 showToast('Berhasil logout');
 };

 const openCreateModal = (type: 'income' | 'expense' = 'income') => {
 setEditingId(null);
 setForm({ transaction_date: todayISO(), type, category: '', amount: '', description: '' });
 setIsModalOpen(true);
 };

 const openEditModal = (t: Transaction) => {
 setEditingId(t.id);
 setForm({
 transaction_date: t.transaction_date,
 type: t.type,
 category: t.category,
 amount: t.amount.toString(),
 description: t.description || '',
 });
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 const amountNum = Number(form.amount);
 if (!form.category.trim()) {
 showToast('Kategori wajib diisi');
 return;
 }
 if (!Number.isFinite(amountNum) || amountNum <= 0) {
 showToast('Nominal harus angka > 0');
 return;
 }
 try {
 if (editingId) {
 const res = await fetch(`/api/youth-treasury/${editingId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 transaction_date: form.transaction_date,
 type: form.type,
 category: form.category.trim(),
 amount: amountNum,
 description: form.description.trim() || null,
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 showToast(data.error || 'Gagal update transaksi');
 return;
 }
 showToast('Transaksi diperbarui');
 } else {
 const res = await fetch('/api/youth-treasury', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 transaction_date: form.transaction_date,
 type: form.type,
 category: form.category.trim(),
 amount: amountNum,
 description: form.description.trim() || null,
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 showToast(data.error || 'Gagal menambah transaksi');
 return;
 }
 showToast(`Transaksi ${form.type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil`);
 }
 setIsModalOpen(false);
 setEditingId(null);
 loadData();
 } catch {
 showToast('Terjadi kesalahan koneksi');
 }
 };

 const handleDelete = async (t: Transaction) => {
 if (!confirm(`Hapus transaksi ${t.category} (${formatIDR(t.amount)})? Tindakan ini tidak bisa dibatalkan.`)) return;
 try {
 const res = await fetch(`/api/youth-treasury/${t.id}`, { method: 'DELETE' });
 const data = await res.json();
 if (!res.ok) {
 showToast(data.error || 'Gagal menghapus transaksi');
 return;
 }
 showToast('Transaksi dihapus');
 loadData();
 } catch {
 showToast('Terjadi kesalahan koneksi');
 }
 };

 const filtered = transactions.filter((t) => {
 if (filterType !== 'all' && t.type !== filterType) return false;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 return (
 t.category.toLowerCase().includes(q) ||
 (t.description || '').toLowerCase().includes(q)
 );
 }
 return true;
 });

 // ---------------------- LOGIN SCREEN ----------------------
 if (authChecked && !authUser) {
 return (
 <main className="min-h-screen bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] flex flex-col justify-between selection:bg-[var(--brand)] selection:text-white">
 <Navbar />
 <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-20 relative overflow-hidden">
 <div className="w-full max-w-md bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-8 sm:p-10 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
 <div className="text-center space-y-3">
 <div className="w-16 h-16 rounded-2xl bg-[var(--brand)] dark:bg-[var(--brand)] text-white flex items-center justify-center mx-auto">
 <Wallet className="w-8 h-8" />
 </div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight">
 Kas Grow Generation
 </h1>
 <p className="text-xs sm:text-sm text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] leading-relaxed">
 Portal manajemen keuangan pemuda & remaja GIA Deliksari.
 <br />
 <span className="text-[var(--brand-text)] dark:text-[var(--brand-text)] font-bold">
 Akses khusus role = treasurer.
 </span>
 </p>
 </div>

 {authError && (
 <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-bold leading-snug animate-shake">
 {authError}
 </div>
 )}

 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Username Bendahara
 </label>
 <input
 type="text"
 required
 autoFocus
 autoComplete="username"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 placeholder="namabendahara"
 className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--ring)]/30 dark:focus:ring-[var(--ring)]/30 focus:border-[var(--brand)] dark:focus:border-[var(--brand)] outline-none transition-all placeholder:text-stone-400"
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
 className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--ring)]/30 dark:focus:ring-[var(--ring)]/30 focus:border-[var(--brand)] dark:focus:border-[var(--brand)] outline-none transition-all placeholder:text-stone-400 tracking-widest"
 />
 </div>

 <button
 type="submit"
 className="w-full py-4 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-[var(--brand)] dark:hover:bg-[var(--brand-hover)] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
 >
 <KeyRound className="w-4 h-4" />
 <span>Masuk Portal Kas</span>
 </button>
 </form>

 <div className="pt-2 text-center space-y-1">
 <Link
 href="/home"
 className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-text)] dark:text-[var(--brand-text)] hover:underline"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Kembali ke Beranda Jemaat</span>
 </Link>
 </div>
 </div>
 </div>
 <Footer />
 </main>
 );
 }

 if (!authChecked) {
 return (
 <main className="min-h-screen flex items-center justify-center bg-[var(--background)] dark:bg-[var(--card-inverted-bg)]">
 <div className="animate-pulse text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">Memuat…</div>
 </main>
 );
 }

 // ---------------------- DASHBOARD ----------------------
 return (
 <main className="min-h-screen bg-[var(--background)] dark:bg-[var(--card-inverted-bg)] text-[var(--foreground)] dark:text-[var(--foreground)] flex flex-col justify-between selection:bg-[var(--brand)] selection:text-white">
 <Navbar />

 {ToastView}

 <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
 {/* Top Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--ink-strong)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)]">
 💰 Portal Kas Grow Generation
 </span>
 <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 <Coins className="w-3.5 h-3.5 text-[var(--ink-strong)]" />
 <span>{transactions.length} transaksi tercatat</span>
 </div>
 </div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] dark:text-white tracking-tight">
 Manajemen Kas Youth
 </h1>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Login sebagai{' '}
 <span className="font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 {authUser?.display_name || authUser?.username}
 </span>{' '}
 ({authUser?.roles?.join(', ') || authUser?.username})
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
 <button
 onClick={loadData}
 title="Refresh"
 className="p-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised-hover)] dark:hover:bg-[var(--surface-raised-hover)] border border-[var(--border)] dark:border-[var(--border)] transition-colors flex items-center gap-2 text-xs font-bold"
 >
 <RefreshCw className={`w-4 h-4 text-[var(--ink-strong)] ${loading ? 'animate-spin' : ''}`} />
 <span className="hidden sm:inline">Refresh</span>
 </button>

 <Link
 href="/home"
 className="px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised-hover)] dark:hover:bg-[var(--surface-raised-hover)] border border-[var(--border)] dark:border-[var(--border)] transition-colors text-xs font-bold flex items-center gap-2"
 >
 <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-strong)]" />
 <span>Lihat Website</span>
 </Link>

 <button
 onClick={handleLogout}
 className="px-4 py-3 rounded-2xl bg-white dark:bg-[var(--card)] hover:bg-[var(--surface-raised)] dark:hover:bg-[var(--surface-raised-hover)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] border border-[var(--border)] dark:border-[var(--border)] transition-colors text-xs font-bold flex items-center gap-2"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Keluar</span>
 </button>
 </div>
 </div>

 {/* Balance Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
 Total Pemasukan
 </span>
 <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div className="text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] font-mono">
 {formatIDR(Number(balance.total_income))}
 </div>
 <div className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 {balance.income_count} transaksi pemasukan
 </div>
 </div>

 <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
 Total Pengeluaran
 </span>
 <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
 </div>
 <div className="text-3xl font-extrabold text-[var(--foreground)] dark:text-[var(--foreground)] font-mono">
 {formatIDR(Number(balance.total_expense))}
 </div>
 <div className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 {balance.expense_count} transaksi pengeluaran
 </div>
 </div>

 <div
 className={`p-6 rounded-2xl border space-y-2 ${
 Number(balance.balance) >= 0
 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
 : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] dark:text-[var(--foreground)]">
 Saldo Kas
 </span>
 <Wallet
 className={`w-5 h-5 ${Number(balance.balance) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
 />
 </div>
 <div
 className={`text-3xl font-extrabold font-mono ${
 Number(balance.balance) >= 0
 ? 'text-emerald-700 dark:text-emerald-300'
 : 'text-rose-700 dark:text-rose-300'
 }`}
 >
 {formatIDR(Number(balance.balance))}
 </div>
 <div className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 {Number(balance.balance) < 0 ? '⚠️ Saldo negatif — perlu top-up' : '✓ Kas Grow Generation'}
 </div>
 </div>
 </div>

 {/* Action Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-extrabold text-[var(--foreground)] dark:text-white">Buku Kas</h2>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Catat pemasukan & pengeluaran Grow Generation.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={() => openCreateModal('income')}
 className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2"
 >
 <Plus className="w-4 h-4" />
 <span>Catat Pemasukan</span>
 </button>
 <button
 onClick={() => openCreateModal('expense')}
 className="px-5 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2"
 >
 <Plus className="w-4 h-4" />
 <span>Catat Pengeluaran</span>
 </button>
 </div>
 </div>

 {/* Filter */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
 <div className="flex items-center gap-1 bg-[var(--surface-raised)] dark:bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] dark:border-[var(--border)]">
 {[
 { id: 'all', label: 'Semua' },
 { id: 'income', label: 'Pemasukan' },
 { id: 'expense', label: 'Pengeluaran' },
 ].map((f) => (
 <button
 key={f.id}
 onClick={() => setFilterType(f.id as any)}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
 filterType === f.id
 ? 'bg-white dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-white'
 : 'text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 <div className="relative flex-1">
 <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 placeholder="Cari kategori / deskripsi..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] text-xs text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ink-strong)]/30"
 />
 </div>
 </div>

 {/* Transactions Table */}
 <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]">
 {filtered.length === 0 ? (
 <div className="p-12 text-center space-y-3">
 <Wallet className="w-10 h-10 text-[var(--ink-strong)] mx-auto opacity-60" />
 <h3 className="font-bold text-base text-[var(--foreground)] dark:text-[var(--foreground)]">
 {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi sesuai filter'}
 </h3>
 <p className="text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Klik "Catat Pemasukan" atau "Catat Pengeluaran" untuk mulai.
 </p>
 </div>
 ) : (
 <table className="w-full text-left text-xs sm:text-sm">
 <thead className="bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] border-b border-[var(--border)] dark:border-[var(--border)]">
 <tr>
 <th className="p-4 font-bold">Tanggal</th>
 <th className="p-4 font-bold">Tipe</th>
 <th className="p-4 font-bold">Kategori</th>
 <th className="p-4 font-bold text-right">Nominal</th>
 <th className="p-4 font-bold">Catatan</th>
 <th className="p-4 font-bold text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border)] dark:divide-[var(--border)]">
 {filtered.map((t) => (
 <tr key={t.id} className="hover:bg-[var(--background)] dark:hover:bg-[var(--brand-tint-ink)] transition-colors">
 <td className="p-4">
 <div className="font-mono text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 {t.transaction_date}
 </div>
 <div className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] mt-0.5">
 oleh {t.created_by?.slice(0, 8) || '—'}
 </div>
 </td>
 <td className="p-4">
 {t.type === 'income' ? (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
 <TrendingUp className="w-3 h-3" />
 Pemasukan
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
 <TrendingDown className="w-3 h-3" />
 Pengeluaran
 </span>
 )}
 </td>
 <td className="p-4">
 <div className="font-mono text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
 {t.category}
 </div>
 </td>
 <td
 className={`p-4 text-right font-mono font-extrabold ${
 t.type === 'income'
 ? 'text-emerald-700 dark:text-emerald-300'
 : 'text-rose-800 dark:text-rose-300'
 }`}
 >
 {t.type === 'income' ? '+' : '−'} {formatIDR(Number(t.amount))}
 </td>
 <td className="p-4 text-xs text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] max-w-xs">
 {t.description || <span className="italic-">—</span>}
 </td>
 <td className="p-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => openEditModal(t)}
 title="Edit"
 className="p-2 rounded-xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-[var(--surface-raised-hover)] dark:hover:bg-[var(--surface-raised-hover)] border border-[var(--border)] dark:border-[var(--border)]"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleDelete(t)}
 title="Hapus"
 className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {/* ============== MODAL: ADD / EDIT TRANSACTION ============== */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
 <div className="w-full max-w-lg bg-white dark:bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-extrabold text-[var(--foreground)] dark:text-white">
 {editingId ? 'Edit Transaksi' : form.type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
 </h3>
 <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSave} className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Tanggal
 </label>
 <input
 type="date"
 required
 value={form.transaction_date}
 onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ink-strong)]/30"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Tipe
 </label>
 <select
 value={form.type}
 onChange={(e) => setForm({ ...form, type: e.target.value as any })}
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none"
 >
 <option value="income">📈 Pemasukan</option>
 <option value="expense">📉 Pengeluaran</option>
 </select>
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Kategori *
 </label>
 <input
 type="text"
 required
 list="kas-categories"
 value={form.category}
 onChange={(e) => setForm({ ...form, category: e.target.value })}
 placeholder="contoh: iuran_anggota"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm font-mono text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ink-strong)]/30"
 />
 <datalist id="kas-categories">
 {SUGGESTED_CATEGORIES.map((c) => (
 <option key={c} value={c} />
 ))}
 </datalist>
 <p className="text-[10px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
 Saran: {SUGGESTED_CATEGORIES.join(', ')}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Nominal (Rp) *
 </label>
 <input
 type="number"
 required
 min="1"
 step="1"
 value={form.amount}
 onChange={(e) => setForm({ ...form, amount: e.target.value })}
 placeholder="50000"
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm font-mono text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ink-strong)]/30"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-wider">
 Catatan (opsional)
 </label>
 <textarea
 rows={3}
 value={form.description}
 onChange={(e) => setForm({ ...form, description: e.target.value })}
 placeholder="Detail tambahan: nama penyetor, sumber dana, dll."
 className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] border border-[var(--border)] dark:border-[var(--border)] text-sm text-[var(--foreground)] dark:text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ink-strong)]/30 resize-none"
 />
 </div>

 <div className="pt-4 flex justify-end gap-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-5 py-3 rounded-2xl bg-[var(--surface-raised)] dark:bg-[var(--surface-raised)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] text-xs font-bold"
 >
 Batal
 </button>
 <button
 type="submit"
 className={`px-6 py-3 rounded-2xl text-white text-xs font-bold ${
 form.type === 'income'
 ? 'bg-emerald-600'
 : 'bg-rose-700'
 }`}
 >
 {editingId ? 'Simpan Perubahan' : form.type === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 <Footer />
 </main>
 );
}