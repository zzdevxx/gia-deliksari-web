import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockDb, queryAll, queryFirst, execute } from '@/lib/d1';
import { hashPassword, verifyPassword, validateNewPassword } from '@/lib/auth';

describe('Cloudflare D1 Database Abstraction', () => {
  beforeEach(() => {
    setMockDb(null);
  });

  it('should queryAll using D1 prepare and all', async () => {
    const mockRows = [
      { id: '1', title: 'Warta 1', is_published: 1 },
      { id: '2', title: 'Warta 2', is_published: 1 },
    ];

    const mockDb: any = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: mockRows }),
      }),
    };

    setMockDb(mockDb);

    const results = await queryAll('SELECT * FROM announcements WHERE is_published = ?', [1]);
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Warta 1');
    expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM announcements WHERE is_published = ?');
  });

  it('should queryFirst using D1 prepare and first', async () => {
    const mockRow = { id: 'usr-01', username: 'andreas', active: 1 };

    const mockDb: any = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockRow),
      }),
    };

    setMockDb(mockDb);

    const result = await queryFirst('SELECT * FROM users WHERE id = ?', ['usr-01']);
    expect(result).not.toBeNull();
    expect(result?.username).toBe('andreas');
  });

  it('should execute statement using D1 run', async () => {
    const mockDb: any = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
      }),
    };

    setMockDb(mockDb);

    const res = await execute('DELETE FROM announcements WHERE id = ?', ['ann-01']);
    expect(res.success).toBe(true);
  });
});

describe('Authentication & Password Hashing', () => {
  it('should validate PIN correctly (minimum 4 digits)', () => {
    expect(validateNewPassword('5050')).toEqual({ ok: true, value: '5050' });
    expect(validateNewPassword('12')).toEqual({ ok: false, error: 'Password minimal 4 karakter' });
    expect(validateNewPassword(1234)).toEqual({ ok: false, error: 'Password harus string' });
  });

  it('should enforce a longer floor when a caller raises it (super accounts)', () => {
    // A super can mint and revoke every identity, so it may not use the
    // treasurer/kidz 4-digit PIN. The floor is passed explicitly, not inferred.
    expect(validateNewPassword('short', 8)).toEqual({
      ok: false,
      error: 'Password minimal 8 karakter',
    });
    expect(validateNewPassword('longenough', 8)).toEqual({ ok: true, value: 'longenough' });
  });

  it('should trim the stored value but measure the raw length', () => {
    // Documented behaviour, not an accident: min-length is checked before the
    // trim, so a caller cannot pad a short secret with spaces to clear it.
    expect(validateNewPassword('  padded  ', 8)).toEqual({
      ok: false,
      error: 'Password minimal 8 karakter',
    });
    expect(validateNewPassword('         ', 8)).toEqual({
      ok: false,
      error: 'Password minimal 8 karakter',
    });
    // Once it clears the floor, the stored value is the trimmed one.
    expect(validateNewPassword('  longenough  ', 8)).toEqual({ ok: true, value: 'longenough' });
  });

  // hashPassword/verifyPassword are covered below; the self-escalation and
  // last-super guards live in the route handler and are exercised by the
  // Playwright mutation suite, which runs against a real session + D1.

  it('should hash and verify passwords using bcryptjs', async () => {
    const plain = '5050';
    const hash = await hashPassword(plain);
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);

    const isMatch = await verifyPassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword('wrong', hash);
    expect(isWrong).toBe(false);
  });
});

describe('Admin Data Store Deletions', () => {
  it('should call DELETE /api/admin/data with correct table and id', async () => {
    const { adminDataStore } = await import('@/lib/storage');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    const res = await adminDataStore.deleteAnnouncement('ann-123');
    expect(res).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/data?table=announcements&id=ann-123',
      expect.objectContaining({ method: 'DELETE' }),
    );

    const resRoster = await adminDataStore.deleteRoster('rst-456');
    expect(resRoster).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/data?table=servant_rosters&id=rst-456',
      expect.objectContaining({ method: 'DELETE' }),
    );

    const resInv = await adminDataStore.deleteInventory('inv-789');
    expect(resInv).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/data?table=inventory_items&id=inv-789',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
