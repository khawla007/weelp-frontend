import React from 'react';
import { render, screen } from '@testing-library/react';

import SubmenuAccount from '../SubmenuAccount';

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
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('@/lib/store/useAuthModalStore', () => () => ({
  openAuthModal: jest.fn(),
}));

describe('SubmenuAccount', () => {
  it('keeps unauthenticated account actions visually consistent with the login link', () => {
    render(<SubmenuAccount showSubmenu setShowSubmenu={jest.fn()} />);

    for (const name of ['Dashboard', 'Wishlist']) {
      expect(screen.getByRole('button', { name })).toHaveClass('weelp-header-nav-item', 'border-0', 'bg-transparent');
    }
  });
});
