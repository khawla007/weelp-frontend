import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { AuthPageClient } from '../AuthPageClient';

const mockReplace = jest.fn();
let registerFormProps;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

jest.mock('../LoginForm', () => ({
  LoginForm: () => <div>Login form</div>,
}));

jest.mock('../RegisterForm', () => ({
  RegisterForm: (props) => {
    registerFormProps = props;
    return <div data-testid="register-form">Register form</div>;
  },
}));

describe('AuthPageClient mobile controls', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    registerFormProps = undefined;
  });

  it('keeps both auth tabs at least 44px tall', () => {
    render(<AuthPageClient />);

    expect(screen.getByRole('button', { name: /log in/i })).toHaveClass('min-h-11');
    expect(screen.getByRole('button', { name: /sign up/i })).toHaveClass('min-h-11');
  });

  it('preserves a sanitized return URL when switching to signup', () => {
    render(<AuthPageClient returnUrl="/booking?step=details" />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockReplace).toHaveBeenCalledWith('/user/login?tab=signup&return=%2Fbooking%3Fstep%3Ddetails', { scroll: false });
    expect(registerFormProps).toEqual(expect.objectContaining({ customUrl: '/booking?step=details' }));
  });

  it('does not preserve a backslash-based external return target', () => {
    render(<AuthPageClient returnUrl="/\\example.com/phishing" />);

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockReplace).toHaveBeenCalledWith('/user/login?tab=signup', {
      scroll: false,
    });
    expect(registerFormProps?.customUrl).toBeNull();
  });
});
