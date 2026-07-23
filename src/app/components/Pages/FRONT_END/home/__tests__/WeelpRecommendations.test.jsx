import { render, screen } from '@testing-library/react';

const getFeaturedItinerariesMock = jest.fn();

jest.mock('@/lib/services/itineraries', () => ({
  getFeaturedItineraries: (...args) => getFeaturedItinerariesMock(...args),
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ as: Component = 'div', children, className = '' }) => <Component className={className}>{children}</Component>,
}));

import WeelpRecommendations from '../WeelpRecommendations';

describe('WeelpRecommendations', () => {
  it('keeps responsive internal padding while the footer owns the outer spacing', async () => {
    getFeaturedItinerariesMock.mockResolvedValue({
      success: true,
      data: [{ name: 'Desert itinerary', slug: 'desert-itinerary', city_slug: 'dubai' }],
    });

    render(await WeelpRecommendations());

    const section = screen.getByRole('heading', { name: 'Weelp Recommendations' }).closest('section');

    expect(section).toHaveClass('bg-surface-tint', 'py-10', 'md:py-16', 'lg:py-24');
    expect(section).not.toHaveClass('mb-10');
    expect(section).not.toHaveClass('md:mb-16');
    expect(section).not.toHaveClass('lg:mb-24');
  });
});
