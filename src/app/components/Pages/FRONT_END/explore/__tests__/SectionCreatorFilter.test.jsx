import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import CreatorFilter from '../SectionCreatorFilter';
import { getExploreItineraries } from '@/lib/services/creatorItineraries';

let intersectionCallback;

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
}));

jest.mock('../CreatorItineraryCard', () => ({
  __esModule: true,
  default: ({ itinerary }) => <div>{itinerary.name}</div>,
}));

jest.mock('@/lib/services/creatorItineraries', () => ({
  getExploreItineraries: jest.fn(),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ as: Component = 'div', children, initialHidden, stagger, variant, delay, ...props }) => <Component {...props}>{children}</Component>,
}));

jest.mock('@/app/components/ui/SectionHeader', () => ({
  __esModule: true,
  default: ({ title }) => <h2>{title}</h2>,
}));

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      intersectionCallback = callback;
    }
    observe() {}
    disconnect() {}
  };
});

describe('CreatorFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wraps discovery tabs and actions without a separator within narrow mobile viewports', () => {
    const { container } = render(
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
    const trending = screen.getByRole('button', { name: 'Trending' });
    expect(home.parentElement).toHaveClass('w-full', 'flex-wrap', 'justify-center', 'gap-2', 'sm:w-auto', 'sm:flex-nowrap');
    expect(home).toHaveClass('text-sm', 'sm:text-[18px]', 'px-3', 'sm:px-[21px]');
    expect(trending).toHaveClass('px-3', 'sm:px-[21px]');
    expect(trending).toHaveStyle({ borderRadius: '8.5px' });
    expect(screen.getByRole('button', { name: 'Join as Creator' })).toHaveClass('text-sm', 'sm:text-[18px]', 'px-3', 'sm:px-5');
    expect(container.querySelector('.w-px.h-6')).not.toBeInTheDocument();
  });

  it('renders populated creator itineraries from initial server data', () => {
    const { container } = render(
      <CreatorFilter
        initialItineraries={[
          { id: 1, name: 'Creator Dubai weekend', slug: 'creator-dubai-weekend' },
          { id: 2, name: 'Creator Paris food map', slug: 'creator-paris-food-map' },
        ]}
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

    expect(screen.getByText('Creator Dubai weekend')).toBeInTheDocument();
    expect(screen.getByText('Creator Paris food map')).toBeInTheDocument();
    expect(container.querySelector('section')).toHaveClass('container-page');
    expect(container.querySelector('ul')).toHaveClass('grid-cols-1', 'gap-5', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-5', 'xl:gap-6');
  });

  it('shows a retryable failure state when a controlled explore API fixture fails', async () => {
    getExploreItineraries.mockResolvedValueOnce({
      success: false,
      data: [],
      current_page: 1,
      last_page: 1,
      message: 'Controlled creator explore failure',
    });

    render(
      <CreatorFilter
        initialItineraries={[{ id: 1, name: 'Creator Dubai weekend', slug: 'creator-dubai-weekend' }]}
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

    fireEvent.click(screen.getByRole('button', { name: /Oldest First/i }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByTestId('creator-itineraries-error')).toHaveTextContent('We could not load creator itineraries.');
    expect(screen.queryByText('No itineraries yet')).not.toBeInTheDocument();
  });

  it('retries an initial server-side failure without waiting for a filter change', async () => {
    getExploreItineraries.mockResolvedValueOnce({
      success: true,
      data: [{ id: 3, name: 'Recovered creator itinerary', slug: 'recovered-creator-itinerary' }],
      current_page: 1,
      last_page: 1,
    });

    render(
      <CreatorFilter
        initialItineraries={[]}
        lastPage={1}
        initialError
        activeTab="home"
        onTabChange={jest.fn()}
        onActionClick={jest.fn()}
        isLoggedIn={false}
        isCreator={false}
        applicationStatus={null}
        statusLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('Recovered creator itinerary')).toBeInTheDocument();
    expect(screen.queryByTestId('creator-itineraries-error')).not.toBeInTheDocument();
  });

  it('does not auto-loop load-more requests after a pagination failure', async () => {
    getExploreItineraries.mockResolvedValue({
      success: false,
      data: [],
      current_page: 2,
      last_page: 2,
      message: 'Controlled load more failure',
    });

    render(
      <CreatorFilter
        initialItineraries={[{ id: 1, name: 'Creator Dubai weekend', slug: 'creator-dubai-weekend' }]}
        lastPage={2}
        activeTab="home"
        onTabChange={jest.fn()}
        onActionClick={jest.fn()}
        isLoggedIn={false}
        isCreator={false}
        applicationStatus={null}
        statusLoading={false}
      />,
    );

    await act(async () => {
      intersectionCallback([{ isIntersecting: true }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      intersectionCallback([{ isIntersecting: true }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getExploreItineraries).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Try loading more again' })).toBeInTheDocument();
    expect(screen.getByText('Creator Dubai weekend')).toBeInTheDocument();
  });
});
