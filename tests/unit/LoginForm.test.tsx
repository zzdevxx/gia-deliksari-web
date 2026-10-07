import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/super/LoginForm';

describe('LoginForm', () => {
  // Tests query inputs by their placeholder text since the components use
  // <label> wrappers without htmlFor (visual-only labels). Real users get
  // accessible-name from autocomplete attributes; tests use placeholder which
  // is more reliable across both implementations.
  const USERNAME_PLACEHOLDER = 'namapengurus';
  const PASSWORD_PLACEHOLDER = '••••';

  it('renders username + password fields and submit button', () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.getByPlaceholderText(USERNAME_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(PASSWORD_PLACEHOLDER).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Masuk Superuser Portal/i })).toBeInTheDocument();
  });

  it('does not display any default credentials hint', () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.queryByText(/Default superuser/i)).not.toBeInTheDocument();
  });

  it('submits username + password to onLogin callback', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'tester');
    await user.type(screen.getAllByPlaceholderText(PASSWORD_PLACEHOLDER)[0], '9999');
    await user.click(screen.getByRole('button', { name: /Masuk Superuser Portal/i }));

    expect(onLogin).toHaveBeenCalledWith('tester', '9999');
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('displays error message from onLogin rejection', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Username atau password salah'));
    const user = userEvent.setup();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'bad');
    await user.type(screen.getAllByPlaceholderText(PASSWORD_PLACEHOLDER)[0], '0000');
    await user.click(screen.getByRole('button', { name: /Masuk Superuser Portal/i }));

    expect(await screen.findByText(/Username atau password salah/i)).toBeInTheDocument();
  });

  it('disables submit button while in-flight', async () => {
    let resolveLogin!: () => void;
    const onLogin = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveLogin = resolve; }),
    );
    const user = userEvent.setup();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByPlaceholderText(USERNAME_PLACEHOLDER), 'tester');
    await user.type(screen.getAllByPlaceholderText(PASSWORD_PLACEHOLDER)[0], '9999');
    await user.click(screen.getByRole('button', { name: /Masuk Superuser Portal/i }));

    expect(await screen.findByRole('button', { name: /Memproses/i })).toBeDisabled();

    resolveLogin();
  });
});