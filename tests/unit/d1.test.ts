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
    expect(validateNewPassword('12')).toEqual({ ok: false, error: 'PIN/password minimal 4 karakter' });
    expect(validateNewPassword(1234)).toEqual({ ok: false, error: 'Password harus string' });
  });

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
