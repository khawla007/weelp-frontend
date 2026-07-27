import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/app/components/Pages/FRONT_END/shared/ActivityItinerarySearch', () => ({
  ResultsActivityItinerarySearch: ({ initialQuery }) => <div data-testid="results-discovery-search" data-initial-query={initialQuery} />,
}));

describe('Search BannerSection', () => {
  it('keeps the animated search panel stacking context above the results heading', () => {
    useSearchParams.mockReturnValue(new URLSearchParams('location=dubai'));

    const BannerSection = require('../BannerSection').default;
    const { container, getByText } = render(<BannerSection />);
    const searchPanel = container.querySelector('.shop_banner');

    expect(getByText(/You Searched for/)).toBeInTheDocument();
    expect(searchPanel).toHaveClass('relative', 'z-10');
    expect(screen.getByTestId('results-discovery-search')).toHaveAttribute('data-initial-query', 'location=dubai');
  });

  it('uses responsive banner spacing and centers the search panel on the canonical page rail', () => {
    useSearchParams.mockReturnValue(new URLSearchParams());

    const BannerSection = require('../BannerSection').default;
    const { container } = render(<BannerSection />);
    const searchPanel = container.querySelector('.shop_banner');
    const searchPanelRail = screen.getByTestId('search-panel-rail');

    expect(searchPanel).toHaveClass('py-6', 'sm:py-10');
    expect(searchPanelRail).toHaveClass('container-page', 'flex', 'justify-center');
    expect(searchPanelRail).toContainElement(screen.getByTestId('results-discovery-search'));
  });
});
