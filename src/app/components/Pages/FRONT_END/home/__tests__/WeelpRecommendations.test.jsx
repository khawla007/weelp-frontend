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
  it('lets the footer own the spacing after the final tinted section', async () => {
    getFeaturedItinerariesMock.mockResolvedValue({
      success: true,
      data: [{ name: 'Desert itinerary', slug: 'desert-itinerary', city_slug: 'dubai' }],
    });

    render(await WeelpRecommendations());

    const section = screen.getByRole('heading', { name: 'Weelp Recommendations' }).closest('section');

    expect(section).toHaveClass('bg-surface-tint', 'pt-12', 'md:pt-16', 'lg:pt-24');
    expect(section).not.toHaveClass('pb-12');
    expect(section).not.toHaveClass('md:pb-16');
    expect(section).not.toHaveClass('lg:pb-24');
  });
});
