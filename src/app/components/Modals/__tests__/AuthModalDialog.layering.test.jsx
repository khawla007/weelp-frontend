import React from 'react';
import { render, screen } from '@testing-library/react';

import AuthModalDialog from '../AuthModalDialog';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({
    isOpen: true,
    redirectTo: null,
    referrer: null,
    onSuccess: null,
    closeAuthModal: jest.fn(),
  }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({
    setMiniCartOpen: jest.fn(),
  }),
}));

jest.mock('../../Form/AuthModal', () => ({
  __esModule: true,
  AuthModal: () => <div>Login form</div>,
}));

describe('AuthModalDialog layering', () => {
  it('renders above the mini-cart sheet overlay and content layers', () => {
    render(<AuthModalDialog />);

    const dialog = screen.getByRole('dialog', { name: /authentication/i });
    const overlay = document.querySelector('.fixed.inset-0');

    expect(overlay).toHaveClass('z-[100020]', 'dark:bg-background/80');
    expect(dialog).toHaveClass('z-[100021]');
  });
});
