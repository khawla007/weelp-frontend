import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormForgotPassword } from '../FormForgotPassword';

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

describe('FormForgotPassword mobile auth semantics', () => {
  it('supports email autofill and associates its validation error', async () => {
    render(<FormForgotPassword />);

    const email = screen.getByPlaceholderText(/email id/i);
    expect(email).toHaveAccessibleName('Email address');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(email).toHaveClass('min-w-0');

    fireEvent.change(email, { target: { value: 'invalid@example' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    const error = await screen.findByText(/invalid email address/i);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', error.id);
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('uses the internal navigation link for returning to login', () => {
    render(<FormForgotPassword />);

    const loginLink = screen.getByRole('link', { name: /login/i });

    expect(loginLink).toHaveAttribute('data-navigation-link', 'true');
    expect(loginLink).toHaveClass('min-h-11', 'inline-flex', 'items-center');
  });
});
