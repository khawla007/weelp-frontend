import React from 'react';
import { render, screen } from '@testing-library/react';

import Footer from '../footer';

jest.mock('@/hooks/useIsClient', () => ({
  __esModule: true,
  useIsClient: () => true,
}));

describe('Footer', () => {
  it('gives column and legal links a minimum 44px touch target', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: "What's New" })).toHaveClass('min-h-11');
    expect(screen.getByRole('link', { name: 'Legal Notice' })).toHaveClass('min-h-11');
  });

  it('gives social links 44px square touch targets', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveClass('h-11', 'w-11');
    expect(screen.getByRole('link', { name: 'X / Twitter' })).toHaveClass('h-11', 'w-11');
    expect(screen.getByRole('link', { name: 'TikTok' })).toHaveClass('h-11', 'w-11');
  });
});
