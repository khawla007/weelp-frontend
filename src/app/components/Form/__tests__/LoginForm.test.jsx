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
});
