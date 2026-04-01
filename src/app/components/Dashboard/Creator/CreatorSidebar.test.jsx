import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import CreatorSidebar from './CreatorSidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

describe('CreatorSidebar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard/creator/overview');
  });

  it('renders sidebar with navigation links', () => {
    render(<CreatorSidebar />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('My Posts')).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    usePathname.mockReturnValue('/dashboard/creator/posts');
    render(<CreatorSidebar />);

    const postsLink = screen.getByText('My Posts').closest('a');
    expect(postsLink).toHaveClass('bg-secondaryDark', 'text-white');
  });

  it('shows Analytics link', () => {
    render(<CreatorSidebar />);

    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<CreatorSidebar />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
