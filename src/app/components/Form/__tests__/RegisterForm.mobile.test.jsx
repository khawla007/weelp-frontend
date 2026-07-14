import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import { RegisterForm } from '../RegisterForm';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/lib/store/useAuthModalStore', () => {
  const store = () => ({
    redirectTo: null,
    closeAuthModal: jest.fn(),
  });
  store.getState = () => ({ onSuccess: null });
  return {
    __esModule: true,
    default: store,
  };
});

describe('RegisterForm mobile auth semantics', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.get.mockResolvedValue({ data: { available: true } });
  });

  it('contains the narrow form and exposes independent semantic password controls', () => {
    const { container } = render(<RegisterForm showCloseButton={false} />);

    const password = screen.getByPlaceholderText(/^password$/i);
    const confirmation = screen.getByPlaceholderText(/confirm password/i);

    expect(screen.getByPlaceholderText(/full name/i)).toHaveAccessibleName('Full name');
    expect(screen.getByPlaceholderText(/username/i)).toHaveAccessibleName('Username');
    expect(screen.getByPlaceholderText(/email id/i)).toHaveAccessibleName('Email address');
    expect(password).toHaveAccessibleName('Password');
    expect(confirmation).toHaveAccessibleName('Confirm password');
    expect(password).toHaveClass('min-w-0');
    expect(confirmation).toHaveClass('min-w-0');
    expect(container.querySelector('fieldset')).toHaveClass('min-w-0', 'w-full');
    expect(screen.getByRole('button', { name: /show password$/i })).toHaveClass('size-11');
    expect(screen.getByRole('button', { name: /show password confirmation/i })).toHaveClass('size-11');
  });

  it('rejects special characters that the backend password rule does not accept', async () => {
    render(<RegisterForm showCloseButton={false} />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Mobile Audit' },
    });
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'mobile_audit' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email id/i), {
      target: { value: 'mobile-audit@example.test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'Password1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/must contain at least one special character/i)).toHaveAttribute('role', 'alert');
    await waitFor(() => expect(axios.post).not.toHaveBeenCalled());
  });

  it('keeps OTP resend and back controls mobile-sized', async () => {
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { resend_cooldown: 30 },
    });

    render(<RegisterForm showCloseButton={false} />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Mobile Tester' },
    });
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'mobile_tester' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email id/i), {
      target: { value: 'mobile-tester@example.test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'Password1@' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'Password1@' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend in/i })).toHaveClass('min-h-11', 'inline-flex', 'items-center');
    expect(screen.getByRole('button', { name: /back to registration/i })).toHaveClass('min-h-11', 'inline-flex', 'items-center');
  });
});
