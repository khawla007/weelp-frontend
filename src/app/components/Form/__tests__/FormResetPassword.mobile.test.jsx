import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import { FormResetPassword } from '../FormResetPassword';

const mockPush = jest.fn();
let mockSearchParamToken = 'redacted-test-token';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: () => mockSearchParamToken }),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, ...props }) => (
    <a data-navigation-link="true" {...props}>
      {children}
    </a>
  ),
}));

describe('FormResetPassword mobile auth semantics', () => {
  beforeEach(() => {
    mockSearchParamToken = 'redacted-test-token';
    mockPush.mockReset();
    axios.post.mockReset();
  });

  it('contains password inputs and provides password-manager autocomplete hints', () => {
    render(<FormResetPassword />);

    const password = screen.getByPlaceholderText(/^new password$/i);
    const confirmation = screen.getByPlaceholderText(/confirm new password/i);

    expect(password).toHaveAccessibleName('New password');
    expect(confirmation).toHaveAccessibleName('Confirm new password');
    expect(password).toHaveClass('min-w-0');
    expect(confirmation).toHaveClass('min-w-0');
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmation).toHaveAttribute('autocomplete', 'new-password');
  });

  it('provides a semantic 44px password visibility control', () => {
    render(<FormResetPassword />);

    const password = screen.getByPlaceholderText(/^new password$/i);
    const toggle = screen.getByRole('button', { name: /^show password$/i });

    expect(toggle).toHaveClass('size-11');
    expect(password).toHaveAttribute('type', 'password');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /^hide password$/i })).toBe(toggle);
    expect(password).toHaveAttribute('type', 'text');
  });

  it('shows persistent recovery actions instead of redirecting when the token is missing', () => {
    mockSearchParamToken = null;

    render(<FormResetPassword />);

    expect(screen.getByRole('alert')).toHaveTextContent(/reset link is missing or invalid/i);
    expect(screen.getByRole('link', { name: /request a new reset link/i })).toHaveAttribute('href', '/user/forgot-password');
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/user/login');
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps an invalid-token API explanation and recovery action on the page', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Invalid or link expired.' },
      },
    });

    render(<FormResetPassword />);

    fireEvent.change(screen.getByPlaceholderText(/^new password$/i), {
      target: { value: 'Password1@' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), {
      target: { value: 'Password1@' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid or link expired/i);
    expect(screen.getByRole('link', { name: /request a new reset link/i })).toHaveAttribute('href', '/user/forgot-password');
  });

  it('rejects password special characters that the backend does not accept', () => {
    render(<FormResetPassword />);

    fireEvent.change(screen.getByPlaceholderText(/^new password$/i), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), {
      target: { value: 'Password1!' },
    });

    expect(screen.getByText(/one special character/i).parentElement).toHaveClass('text-muted-foreground');
    expect(screen.getByText(/please meet all password requirements/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('provides an independent semantic confirmation-password control', () => {
    render(<FormResetPassword />);

    const confirmation = screen.getByPlaceholderText(/confirm new password/i);
    const toggle = screen.getByRole('button', { name: /show password confirmation/i });

    expect(toggle).toHaveClass('size-11');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: /hide password confirmation/i })).toBe(toggle);
    expect(confirmation).toHaveAttribute('type', 'text');
  });

  it('keeps the inline login action mobile-sized', () => {
    render(<FormResetPassword />);

    const loginLink = screen.getByRole('link', { name: /^login$/i });

    expect(loginLink).toHaveAttribute('data-navigation-link', 'true');
    expect(loginLink).toHaveClass('min-h-11', 'inline-flex', 'items-center');
  });
});
