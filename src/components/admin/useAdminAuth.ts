'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Admin auth state: login form + cookie check + logout.
 * Used by /admin page (single-page). Centralizes the three side-effects
 * (mount-check, login, logout) so the page component can stay focused on UI.
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Check existing session cookie on mount
  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setIsAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent, onSuccess: () => void) => {
      e.preventDefault();
      setAuthError(null);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
          onSuccess();
        } else {
          setAuthError(data.error || 'Password salah. Silakan periksa kembali kata sandi pengurus.');
        }
      } catch {
        setAuthError('Terjadi kesalahan koneksi saat memverifikasi login.');
      }
    },
    [passwordInput],
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore — clear local state regardless */
    }
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  }, []);

  return {
    isAuthenticated,
    passwordInput,
    setPasswordInput,
    authError,
    setAuthError,
    handleLogin,
    handleLogout,
  };
}