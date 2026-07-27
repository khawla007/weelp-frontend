import { render } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/app/components/Form/Form', () => ({
  __esModule: true,
  default: () => <div data-testid="booking-form" />,
}));

describe('Search BannerSection', () => {
  it('keeps the animated search panel stacking context above the results heading', () => {
    useSearchParams.mockReturnValue(new URLSearchParams('location=dubai'));

    const BannerSection = require('../BannerSection').default;
    const { container, getByText } = render(<BannerSection />);
    const searchPanel = container.querySelector('.shop_banner');

    expect(getByText(/You Searched for/)).toBeInTheDocument();
    expect(searchPanel).toHaveClass('relative', 'z-10');
  });
});
