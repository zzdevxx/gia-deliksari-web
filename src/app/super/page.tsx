'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, RefreshCw, LogOut, ExternalLink, Users } from 'lucide-react';
import { useToast } from '@/components/admin/useToast';
import LoginForm from '@/components/super/LoginForm';
import UserModal, { type Role, type UserFormData } from '@/components/super/UserModal';
import UserTable, { type User } from '@/components/super/UserTable';
import AuditLogTable, { type AuditEntry, AUDIT_LIMIT } from '@/components/super/AuditLogTable';
import { clearClientCachesOnLogout } from '@/lib/storage';

/**
 * /super page orchestrator.
 *
 * Composes 4 focused child components:
 *   - LoginForm (login screen)
 *   - UserTable + UserModal (user CRUD)
 *   - AuditLogTable (read-only audit log with filters)
 *
 * Owns: auth check, data fetching, mutation API calls, modal open/close state.
 * Children are pure-ish (props in, callbacks out).
 */

interface AuthUser {
  id: string;
  username: string;
  roles: Role[];
  display_name: string | null;
}

export default function SuperPage() {
  const router = useRouter();
  const { showToast, ToastView } = useToast();

  // --- Auth state ---
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // --- User CRUD state ---
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    open: boolean;
    editingId: string | null;
    initial: UserFormData;
  }>({
    open: false,
    editingId: null,
    initial: { username: '', password: '', roles: ['admin'], display_name: '' },
  });

  // --- Audit log state ---
  const [auditItems, setAuditItems] = useState<AuditEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditOffset, setAuditOffset] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState({ actor: '', action: '', since: '', until: '' });

  // ---------- Auth ----------
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) {
          router.replace('/super');
        } else if (!d.user?.roles?.includes('super')) {
          showToast('Akses ditolak. Halaman ini khusus superuser.');
          router.replace('/home');
        } else {
          setAuthUser(d.user);
        }
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, [router, showToast]);

  // ---------- User CRUD ----------
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memuat daftar user');
        if (res.status === 401) router.replace('/super');
        return;
      }
      setUsers(data.items || []);
    } catch {
      showToast('Gagal memuat daftar user');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) loadUsers();
  }, [authUser]);

  const handleLogin = async (username: string, password: string): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login gagal');
    }
    if (!data.user?.roles?.includes('super')) {
      throw new Error('Akses ditolak. Halaman ini khusus superuser.');
    }
    setAuthUser(data.user);
    showToast('Login berhasil. Selamat datang, ' + (data.user.display_name || data.user.username));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch {}
    clearClientCachesOnLogout();
    setAuthUser(null);
    setUsers([]);
    showToast('Berhasil logout');
  };

  // ---------- Modal handlers ----------
  const openCreateModal = () => {
    setModalState({
      open: true,
      editingId: null,
      initial: { username: '', password: '', roles: ['admin'], display_name: '' },
    });
  };

  const openEditModal = (u: User) => {
    setModalState({
      open: true,
      editingId: u.id,
      initial: {
        username: u.username,
        password: '',
        roles: u.roles,
        display_name: u.display_name || '',
      },
    });
  };

  const closeModal = () => setModalState((s) => ({ ...s, open: false }));

  const saveUser = async (form: UserFormData) => {
    try {
      if (modalState.editingId) {
        const patch: Record<string, unknown> = {
          roles: form.roles,
          display_name: form.display_name.trim() || null,
          active: true,
        };
        if (form.password) patch.password = form.password;
        const res = await fetch(`/api/users/${modalState.editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Gagal update user');
          return;
        }
        showToast('User berhasil diupdate');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username.trim(),
            password: form.password,
            roles: form.roles,
            display_name: form.display_name.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Gagal membuat user');
          return;
        }
        showToast('User baru berhasil dibuat');
      }
      closeModal();
      loadUsers();
    } catch {
      showToast('Terjadi kesalahan koneksi');
    }
  };

  const deactivateUser = async (u: User) => {
    if (!confirm(`Nonaktifkan user '${u.username}'? User akan diarsipkan dan tidak bisa login lagi.`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menonaktifkan user');
        return;
      }
      showToast(`User '${u.username}' dinonaktifkan`);
      loadUsers();
    } catch {
      showToast('Terjadi kesalahan koneksi');
    }
  };

  // ---------- Audit log ----------
  const fetchAudit = async (offsetToUse: number, reset = false) => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(AUDIT_LIMIT),
        offset: String(offsetToUse),
      });
      if (auditFilter.actor) params.set('actor_username', auditFilter.actor);
      if (auditFilter.action) params.set('action', auditFilter.action);
      if (auditFilter.since) params.set('since', auditFilter.since);
      if (auditFilter.until) params.set('until', auditFilter.until);

      const res = await fetch(`/api/audit-log?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memuat audit log');
        return;
      }
      setAuditItems(data.items || []);
      setAuditTotal(data.total || 0);
      if (reset) setAuditOffset(0);
    } catch {
      showToast('Gagal memuat audit log');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) fetchAudit(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const goToPrev = () => {
    const newOffset = Math.max(0, auditOffset - AUDIT_LIMIT);
    setAuditOffset(newOffset);
    fetchAudit(newOffset);
  };

  const goToNext = () => {
    const newOffset = auditOffset + AUDIT_LIMIT;
    setAuditOffset(newOffset);
    fetchAudit(newOffset);
  };

  // ---------- Render ----------
  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#141312]">
        <div className="animate-pulse text-[#665E55] dark:text-[#A8A196]">Memuat…</div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#141312] text-[#1C1917] dark:text-[#F5F3EF] flex flex-col justify-between selection:bg-[#8B1E28] selection:text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-20 relative overflow-hidden">
          <LoginForm onLogin={handleLogin} />
        </div>
        <Footer />
      </main>
    );
  }

  const activeCount = users.filter((u) => u.active).length;

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#141312] text-[#1C1917] dark:text-[#F5F3EF] flex flex-col justify-between selection:bg-[#8B1E28] selection:text-white">
      <Navbar />
      {ToastView}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBF1F2] dark:bg-[#261517] text-[#8B1E28] dark:text-[#E88086] border border-[#E8C2C5] dark:border-[#52252A]">
                🔑 Superuser Portal
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#665E55] dark:text-[#A8A196]">
                <Users className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
                <span>{activeCount}/{users.length} user aktif</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-white tracking-tight">
              Manajemen Akun Pengurus Gereja
            </h1>
            <p className="text-xs text-[#665E55] dark:text-[#A8A196]">
              Kelola akun superuser, admin/operator, dan bendahara youth. Akun baru otomatis mendapat
              akses ke portal sesuai role-nya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={loadUsers}
              title="Refresh"
              className="p-3 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] text-[#1C1917] dark:text-[#F5F3EF] hover:bg-[#E5DFD5] dark:hover:bg-[#332F2B] border border-[#E5DFD5] dark:border-[#332F2B] transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 text-[#8B1E28] dark:text-[#E88086] ${usersLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/home"
              className="px-4 py-3 rounded-2xl bg-[#F3EFE6] dark:bg-[#262421] text-[#1C1917] dark:text-[#F5F3EF] hover:bg-[#E5DFD5] dark:hover:bg-[#332F2B] border border-[#E5DFD5] dark:border-[#332F2B] transition-colors text-xs font-bold flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8B1E28] dark:text-[#E88086]" />
              <span>Lihat Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-[#1D1B19] hover:bg-[#F3EFE6] dark:hover:bg-[#262421] text-[#665E55] dark:text-[#A8A196] border border-[#E5DFD5] dark:border-[#332F2B] transition-colors text-xs font-bold flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-xs text-[#665E55] dark:text-[#A8A196]">
          Login sebagai{' '}
          <span className="font-bold text-[#1C1917] dark:text-[#F5F3EF]">
            {authUser?.display_name || authUser?.username}
          </span>{' '}
          <span className="text-[#665E55] dark:text-[#A8A196]">
            ({authUser?.roles?.join(', ') || authUser?.username})
          </span>
        </div>

        {/* User Management Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#1C1917] dark:text-white">
              Daftar Akun ({users.length})
            </h2>
            <p className="text-xs text-[#665E55] dark:text-[#A8A196]">
              Tambah akun baru, ubah role, atau nonaktifkan akun yang tidak aktif.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#731820] dark:bg-[#B8323D] dark:hover:bg-[#A32C36] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah User Baru
          </button>
        </div>

        <UserTable
          users={users}
          loading={usersLoading}
          currentUsername={authUser?.username ?? null}
          onEdit={openEditModal}
          onDeactivate={deactivateUser}
        />

        {/* Audit Log */}
        <AuditLogTable
          entries={auditItems}
          total={auditTotal}
          loading={auditLoading}
          offset={auditOffset}
          limit={AUDIT_LIMIT}
          filter={auditFilter}
          onFilterChange={setAuditFilter}
          onApplyFilter={() => fetchAudit(0, true)}
          onRefresh={() => fetchAudit(auditOffset)}
          onPrev={goToPrev}
          onNext={goToNext}
        />

        {/* Quick Access to Other Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] hover:border-[#8B1E28]/40 dark:hover:border-[#B8323D]/40 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-[#1C1917] dark:text-[#F5F3EF]">📋 Portal Admin</h3>
              <p className="text-xs text-[#665E55] dark:text-[#A8A196] mt-0.5">
                Warta, Roster Pelayanan, Inventaris
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8B1E28] dark:text-[#E88086] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/kas"
            className="p-5 rounded-2xl bg-white dark:bg-[#1D1B19] border border-[#E5DFD5] dark:border-[#332F2B] hover:border-[#8B1E28]/40 dark:hover:border-[#B8323D]/40 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-[#1C1917] dark:text-[#F5F3EF]">💰 Portal Kas Youth</h3>
              <p className="text-xs text-[#665E55] dark:text-[#A8A196] mt-0.5">
                Manajemen keuangan Grow Generation
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8B1E28] dark:text-[#E88086] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {modalState.open && (
        <UserModal
          initial={modalState.initial}
          editingId={modalState.editingId}
          onSave={saveUser}
          onClose={closeModal}
        />
      )}

      <Footer />
    </main>
  );
}