import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserTable, { type User } from '@/components/super/UserTable';

const sampleUsers: User[] = [
  {
    id: 'u1',
    username: 'andreas',
    roles: ['super'],
    display_name: 'Andreas (Super)',
    active: true,
    last_login_at: '2026-08-31T03:00:00Z',
  },
  {
    id: 'u2',
    username: 'zzdree',
    roles: ['admin', 'treasurer'],
    display_name: 'Zzdree (Admin+Treasurer)',
    active: true,
    last_login_at: null,
  },
  {
    id: 'u3',
    username: 'inactive',
    roles: ['admin'],
    display_name: null,
    active: false,
    last_login_at: null,
  },
];

describe('UserTable', () => {
  it('renders empty state when no users', () => {
    render(<UserTable users={[]} loading={false} currentUsername={null} onEdit={vi.fn()} onDeactivate={vi.fn()} />);
    expect(screen.getByText(/Belum ada user/i)).toBeInTheDocument();
  });

  it('renders all users with username + role badge + status', () => {
    render(
      <UserTable users={sampleUsers} loading={false} currentUsername="andreas" onEdit={vi.fn()} onDeactivate={vi.fn()} />,
    );

    // Three usernames visible
    expect(screen.getByText('andreas')).toBeInTheDocument();
    expect(screen.getByText('zzdree')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();

    // Role badges — primary role label
    expect(screen.getAllByText('Superuser').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Admin / Operator').length).toBeGreaterThanOrEqual(1);

    // Status badges
    expect(screen.getAllByText(/Aktif/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Nonaktif/i).length).toBeGreaterThanOrEqual(1);

    // Multi-role indicator (+N) shown for zzdree
    expect(screen.getByText(/^.*\+1.*$/)).toBeInTheDocument();
  });

  it('marks current user with "← Anda" tag', () => {
    render(
      <UserTable users={sampleUsers} loading={false} currentUsername="andreas" onEdit={vi.fn()} onDeactivate={vi.fn()} />,
    );
    expect(screen.getByText('← Anda')).toBeInTheDocument();
  });

  it('shows loading state instead of rows', () => {
    render(
      <UserTable users={[]} loading={true} currentUsername={null} onEdit={vi.fn()} onDeactivate={vi.fn()} />,
    );
    expect(screen.getByText(/Memuat daftar user/i)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <UserTable users={sampleUsers} loading={false} currentUsername={null} onEdit={onEdit} onDeactivate={vi.fn()} />,
    );

    const editButtons = screen.getAllByTitle(/Edit role \/ password/i);
    expect(editButtons.length).toBeGreaterThanOrEqual(2); // active users only
    await user.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does NOT show deactivate button for current user (self-protection)', () => {
    render(
      <UserTable users={sampleUsers} loading={false} currentUsername="andreas" onEdit={vi.fn()} onDeactivate={vi.fn()} />,
    );
    // andreas is current user — no deactivate button for that row.
    // But other active users (zzdree) still get one.
    const deactivateButtons = screen.getAllByTitle(/Nonaktifkan/i);
    expect(deactivateButtons.length).toBe(1); // only zzdree
  });

  it('does NOT show deactivate or edit for inactive users', () => {
    render(
      <UserTable users={[sampleUsers[2]]} loading={false} currentUsername={null} onEdit={vi.fn()} onDeactivate={vi.fn()} />,
    );
    expect(screen.queryByTitle(/Edit role \/ password/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Nonaktifkan/i)).not.toBeInTheDocument();
  });
});