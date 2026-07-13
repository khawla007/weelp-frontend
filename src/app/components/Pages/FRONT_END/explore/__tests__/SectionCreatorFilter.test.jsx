import React from 'react';
import { render, screen } from '@testing-library/react';

import CreatorFilter from '../SectionCreatorFilter';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
}));

jest.mock('../CreatorItineraryCard', () => ({
  __esModule: true,
  default: () => <div>Creator itinerary</div>,
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ as: Component = 'div', children, ...props }) => <Component {...props}>{children}</Component>,
}));

jest.mock('@/app/components/ui/SectionHeader', () => ({
  __esModule: true,
  default: ({ title }) => <h2>{title}</h2>,
}));

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    disconnect() {}
  };
});

describe('CreatorFilter', () => {
  it('wraps discovery tabs and actions within narrow mobile viewports', () => {
    render(
      <CreatorFilter
        initialItineraries={[]}
        lastPage={1}
        activeTab="home"
        onTabChange={jest.fn()}
        onActionClick={jest.fn()}
        isLoggedIn={false}
        isCreator={false}
        applicationStatus={null}
        statusLoading={false}
      />,
    );

    const home = screen.getByRole('button', { name: 'Home' });
    expect(home.parentElement).toHaveClass('w-full', 'flex-wrap', 'justify-center', 'gap-2', 'sm:w-auto', 'sm:flex-nowrap');
    expect(home).toHaveClass('text-sm', 'sm:text-[18px]', 'px-3', 'sm:px-[21px]');
    expect(screen.getByRole('button', { name: 'Join as Creator' })).toHaveClass('text-sm', 'sm:text-[18px]', 'px-3', 'sm:px-5');
  });
});
