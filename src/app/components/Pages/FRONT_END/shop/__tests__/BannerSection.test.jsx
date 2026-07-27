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
});
