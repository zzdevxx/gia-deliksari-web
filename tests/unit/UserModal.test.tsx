import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserModal, { type UserFormData } from '@/components/super/UserModal';

const baseForm: UserFormData = {
  username: '',
  password: '',
  roles: ['admin'],
  display_name: '',
};

describe('UserModal (create)', () => {
  it('renders with default "Tambah User Baru" header when no editingId', () => {
    render(<UserModal initial={baseForm} editingId={null} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /Tambah User Baru/i })).toBeInTheDocument();
  });

  it('username input is editable when creating', () => {
    render(<UserModal initial={baseForm} editingId={null} onSave={vi.fn()} onClose={vi.fn()} />);
    const usernameInputs = screen.getAllByPlaceholderText(/contoh: noel/i);
    expect(usernameInputs.length).toBeGreaterThan(0);
    expect(usernameInputs[0]).not.toBeDisabled();
  });

  it('submit button is disabled when 0 roles selected', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <UserModal
        initial={{ ...baseForm, roles: [] }}
        editingId={null}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const usernameInput = screen.getAllByPlaceholderText(/contoh: noel/i)[0];
    const passwordInput = screen.getAllByPlaceholderText(/••••/i)[0];
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, '1234');
    const submitBtn = screen.getByRole('button', { name: /Buat User/i });
    expect(submitBtn).toBeDisabled();
  });

  it('toggles roles via checkboxes', async () => {
    const user = userEvent.setup();
    render(<UserModal initial={baseForm} editingId={null} onSave={vi.fn()} onClose={vi.fn()} />);

    // Initially: admin checked
    const adminCheckbox = screen.getByRole('checkbox', { name: /Admin/i });
    expect(adminCheckbox).toBeChecked();

    // Add super role
    const superCheckbox = screen.getByRole('checkbox', { name: /Superuser/i });
    await user.click(superCheckbox);
    expect(superCheckbox).toBeChecked();

    // Remove admin
    await user.click(adminCheckbox);
    expect(adminCheckbox).not.toBeChecked();
  });
});

describe('UserModal (edit)', () => {
  it('renders "Edit User" header when editingId is set', () => {
    render(
      <UserModal
        initial={{ username: 'existing', password: '', roles: ['admin'], display_name: 'Existing User' }}
        editingId="u1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: /Edit User/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan Perubahan/i })).toBeInTheDocument();
  });

  it('username input is disabled when editing (cannot rename)', () => {
    render(
      <UserModal
        initial={{ username: 'existing', password: '', roles: ['admin'], display_name: '' }}
        editingId="u1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const usernameInput = screen.getAllByPlaceholderText(/contoh: noel/i)[0];
    expect(usernameInput).toBeDisabled();
  });

  it('password field is optional when editing', () => {
    render(
      <UserModal
        initial={{ username: 'existing', password: '', roles: ['admin'], display_name: '' }}
        editingId="u1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const passwordInput = screen.getByPlaceholderText(/••••/i);
    expect(passwordInput).not.toBeRequired();
  });

  it('calls onClose when cancel button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserModal initial={baseForm} editingId={null} onSave={vi.fn()} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /Batal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});