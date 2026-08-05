import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { AuthModal } from '../AuthModal';

let registerFormProps;

jest.mock('../LoginForm', () => ({
  LoginForm: () => <div data-testid="auth-modal-form">Login form</div>,
}));

jest.mock('../RegisterForm', () => ({
  RegisterForm: (props) => {
    registerFormProps = props;
    return <div data-testid="auth-modal-form">Register form</div>;
  },
}));

describe('AuthModal mobile containment', () => {
  beforeEach(() => {
    registerFormProps = undefined;
  });

  it('constrains the panel to the viewport and allows vertical scrolling', () => {
    render(<AuthModal onCloseDialog={jest.fn()} />);

    const panel = screen.getByRole('button', { name: /close/i }).parentElement;
    expect(panel).toHaveClass('max-w-full', 'min-w-0', 'max-h-[calc(100dvh-2rem)]', 'overflow-y-auto');
  });

  it('keeps its close control inside the panel with a 44px target', () => {
    render(<AuthModal onCloseDialog={jest.fn()} />);

    const close = screen.getByRole('button', { name: /close/i });
    expect(close).toHaveClass('right-2', 'top-2', 'size-11');
    expect(close).not.toHaveClass('-right-3', '-top-3');
  });

  it('uses compact mobile padding around the form', () => {
    render(<AuthModal onCloseDialog={jest.fn()} />);

    expect(screen.getByTestId('auth-modal-form').parentElement).toHaveClass('px-4', 'sm:px-8');
  });

  it('preserves the return target and provides accessible auth-mode switches', () => {
    render(<AuthModal onCloseDialog={jest.fn()} customUrl="/booking?step=details" />);

    const signUpSwitch = screen.getByRole('button', { name: /sign up/i });
    expect(signUpSwitch).toHaveAttribute('type', 'button');
    expect(signUpSwitch).toHaveClass('min-h-11', 'inline-flex', 'items-center');
    expect(signUpSwitch).toHaveClass('weelp-auth-mode-switch', 'border-0', 'bg-transparent');

    fireEvent.click(signUpSwitch);

    expect(registerFormProps).toEqual(expect.objectContaining({ customUrl: '/booking?step=details' }));

    const loginSwitch = screen.getByRole('button', { name: /back to login/i });
    expect(loginSwitch).toHaveAttribute('type', 'button');
    expect(loginSwitch).toHaveClass('min-h-11', 'inline-flex', 'items-center');
    expect(loginSwitch).toHaveClass('weelp-auth-mode-switch', 'border-0', 'bg-transparent');
  });
});
