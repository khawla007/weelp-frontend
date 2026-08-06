import React from 'react';
import { render, screen } from '@testing-library/react';

import SubmenuAccount from '../SubmenuAccount';

let mockSessionState = { data: null, status: 'unauthenticated' };

jest.mock('next/link', () => {
  const LinkMock = ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'LinkMock';
  return LinkMock;
});

jest.mock('next-auth/react', () => ({
  useSession: () => mockSessionState,
}));

jest.mock('@/lib/store/useAuthModalStore', () => () => ({
  openAuthModal: jest.fn(),
}));

describe('SubmenuAccount', () => {
  beforeEach(() => {
    mockSessionState = { data: null, status: 'unauthenticated' };
  });

  it('uses the dashboard dropdown hover treatment for logged-out account actions', () => {
    render(<SubmenuAccount showSubmenu setShowSubmenu={jest.fn()} />);

    for (const item of [screen.getByRole('link', { name: /signup \/ login/i }), screen.getByRole('button', { name: 'Dashboard' }), screen.getByRole('button', { name: 'Wishlist' })]) {
      expect(item).toHaveClass('w-full', 'px-8', 'py-4', 'text-foreground', 'hover:bg-accent', 'focus:bg-accent', 'hover:text-foreground/70', 'focus:text-foreground/70');
      expect(item.className).not.toMatch(/hover:bg-destructive/);
      expect(item.className).not.toMatch(/focus:bg-destructive/);
      expect(item.closest('li')).toHaveClass('border-b', 'border-border', 'hover:bg-accent', 'focus-within:bg-accent');
      expect(item.closest('li')).not.toHaveClass('p-4', 'px-8');
    }

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('weelp-header-nav-item', 'border-0', 'bg-transparent');
    expect(screen.getByRole('button', { name: 'Wishlist' })).toHaveClass('weelp-header-nav-item', 'border-0', 'bg-transparent');
  });

  it('uses the dashboard dropdown hover treatment for logged-in sign out', () => {
    mockSessionState = {
      status: 'authenticated',
      data: {
        user: {
          name: 'Khawla Admin',
          role: 'super_admin',
        },
      },
    };

    render(<SubmenuAccount showSubmenu setShowSubmenu={jest.fn()} />);

    const signOut = screen.getByRole('button', { name: /sign out/i });
    expect(signOut).toHaveClass('w-full', 'px-8', 'py-4', 'text-foreground', 'hover:bg-accent', 'focus:bg-accent', 'hover:text-foreground/70', 'focus:text-foreground/70');
    expect(signOut).toHaveClass('weelp-header-nav-item', 'border-0', 'bg-transparent');
    expect(signOut.className).not.toMatch(/hover:bg-destructive/);
    expect(signOut.className).not.toMatch(/focus:bg-destructive/);
    expect(signOut.closest('li')).toHaveClass('border-b', 'border-border', 'hover:bg-accent', 'focus-within:bg-accent');
    expect(signOut.closest('li')).not.toHaveClass('p-4', 'px-8');
  });
});
