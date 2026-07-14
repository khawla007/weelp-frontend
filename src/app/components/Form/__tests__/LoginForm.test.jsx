import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const signInMock = jest.fn();
const toastMock = jest.fn();
const pushMock = jest.fn();
const closeAuthModalMock = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: (...args) => signInMock(...args),
  useSession: () => ({ data: null, update: jest.fn() }),
  getSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

jest.mock('@/lib/store/useAuthModalStore', () => {
  const store = () => ({
    redirectTo: null,
    closeAuthModal: closeAuthModalMock,
  });
  store.getState = () => ({ onSuccess: null });
  return {
    __esModule: true,
    default: store,
  };
});

import { getSafeAuthReturnUrl } from '@/lib/auth/authRedirect';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    signInMock.mockReset();
    toastMock.mockReset();
    pushMock.mockReset();
    closeAuthModalMock.mockReset();
  });

  it('shows the rate limit message instead of invalid credentials when Auth.js returns rate_limited', async () => {
    signInMock.mockResolvedValue({
      error: 'CredentialsSignin',
      code: 'rate_limited',
      ok: false,
      status: 200,
      url: null,
    });

    render(<LoginForm showCloseButton={false} />);

    fireEvent.change(screen.getByPlaceholderText(/email id/i), {
      target: { value: 'atul@fanaticcoders.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Atul@1990' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Too many login attempts',
        description: 'The login rate limit is active. Please wait a minute and try again.',
      });
    });

    expect(toastMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Email or Password Incorrect',
      }),
    );
  });

  it('shows the account locked message instead of invalid credentials when Auth.js returns account_locked', async () => {
    signInMock.mockResolvedValue({
      error: 'CredentialsSignin',
      code: 'account_locked',
      ok: false,
      status: 200,
      url: null,
    });

    render(<LoginForm showCloseButton={false} />);

    fireEvent.change(screen.getByPlaceholderText(/email id/i), {
      target: { value: 'atul@fanaticcoders.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'Atul@1990' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Account temporarily locked',
        description: 'Please try again later or reset your password.',
      });
    });

    expect(toastMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Email or Password Incorrect',
      }),
    );
  });

  it('uses password-manager-friendly autocomplete values', () => {
    render(<LoginForm showCloseButton={false} />);

    expect(screen.getByPlaceholderText(/email id/i)).toHaveAccessibleName('Email address');
    expect(screen.getByPlaceholderText(/email id/i)).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByPlaceholderText(/password/i)).toHaveAccessibleName('Password');
    expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute('autocomplete', 'current-password');
  });

  it('provides a semantic 44px password visibility control', () => {
    render(<LoginForm showCloseButton={false} />);

    const password = screen.getByPlaceholderText(/password/i);
    const toggle = screen.getByRole('button', { name: /show password/i });

    expect(toggle).toHaveClass('size-11');
    expect(password).toHaveAttribute('type', 'password');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /hide password/i })).toBe(toggle);
    expect(password).toHaveAttribute('type', 'text');
  });

  it('associates validation errors with invalid fields', async () => {
    render(<LoginForm showCloseButton={false} />);

    const email = screen.getByPlaceholderText(/email id/i);
    const password = screen.getByPlaceholderText(/password/i);

    fireEvent.change(email, { target: { value: 'invalid@example' } });
    fireEvent.change(password, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    const emailError = await screen.findByText(/invalid email address/i);
    const passwordError = await screen.findByText(/at least 6 characters/i);

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', emailError.id);
    expect(emailError).toHaveAttribute('role', 'alert');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAttribute('aria-describedby', passwordError.id);
    expect(passwordError).toHaveAttribute('role', 'alert');
  });

  it('does not log authentication failures to the console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    signInMock.mockRejectedValue(new Error('Authentication service unavailable'));

    render(<LoginForm showCloseButton={false} />);

    fireEvent.change(screen.getByPlaceholderText(/email id/i), {
      target: { value: 'mobile-audit@example.test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'ExamplePassword1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(signInMock).toHaveBeenCalledTimes(1));
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('accepts only same-origin relative return URLs', () => {
    expect(getSafeAuthReturnUrl('/booking?step=details')).toBe('/booking?step=details');
    expect(getSafeAuthReturnUrl('https://example.com/phishing')).toBeNull();
    expect(getSafeAuthReturnUrl('//example.com/phishing')).toBeNull();
    expect(getSafeAuthReturnUrl('/\\example.com/phishing')).toBeNull();
    expect(getSafeAuthReturnUrl('javascript:alert(1)')).toBeNull();
  });

  it('keeps the forgot-password navigation target touch sized', () => {
    render(<LoginForm showCloseButton={false} />);

    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveClass('inline-flex', 'min-h-11', 'items-center');
  });
});
