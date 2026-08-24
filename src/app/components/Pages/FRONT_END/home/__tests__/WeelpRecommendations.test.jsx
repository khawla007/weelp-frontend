import { render, screen } from '@testing-library/react';

const getFeaturedItinerariesMock = jest.fn();
const revealMock = jest.fn(({ as: Component = 'div', children, className = '', initialHidden, variant, stagger, ...props }) => (
  <Component data-testid="reveal" data-initial-hidden={initialHidden ? 'true' : undefined} data-reveal-variant={variant} data-reveal-stagger={stagger} className={className} {...props}>
    {children}
  </Component>
));
const sectionFallbackMock = jest.fn(({ eyebrow, message, variant, pivotHref, pivotLabel }) => (
  <section data-testid="section-fallback" data-eyebrow={eyebrow} data-variant={variant} data-pivot-href={pivotHref} data-pivot-label={pivotLabel}>
    {message}
  </section>
));

jest.mock('@/lib/services/itineraries', () => ({
  getFeaturedItineraries: (...args) => getFeaturedItinerariesMock(...args),
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => revealMock(props),
}));

jest.mock('@/app/components/ui/SectionFallback', () => ({
  __esModule: true,
  default: (props) => sectionFallbackMock(props),
}));

import WeelpRecommendations from '../WeelpRecommendations';

const makeItineraries = (count) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Recommendation ${index + 1}`,
    slug: `recommendation-${index + 1}`,
    ...(index === 1 ? {} : { city_slug: index === 0 ? 'dubai' : `city-${index + 1}` }),
  }));

describe('WeelpRecommendations', () => {
  beforeEach(() => {
    getFeaturedItinerariesMock.mockReset();
    revealMock.mockClear();
    sectionFallbackMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses one reveal and capped motion indexes for the rule-led cascade', async () => {
    getFeaturedItinerariesMock.mockResolvedValue({ success: true, data: makeItineraries(10) });

    render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));

    const section = screen.getByRole('heading', { name: 'Weelp Recommendations' }).closest('section');
    const grid = section.querySelector('[data-recommendations-grid]');
    const links = screen.getAllByRole('link');

    expect(getFeaturedItinerariesMock).toHaveBeenCalledTimes(1);
    expect(getFeaturedItinerariesMock).toHaveBeenCalledWith();
    expect(screen.getAllByTestId('reveal')).toHaveLength(1);
    expect(section).toHaveAttribute('data-recommendations-section-entrance', 'rule-led-cascade');
    expect(section).toHaveAttribute('data-initial-hidden', 'true');
    expect(section).toHaveClass('bg-surface-tint', 'py-10', 'md:py-16', 'lg:py-24');
    expect(section).not.toHaveClass('mb-10', 'md:mb-16', 'lg:mb-24');
    expect(section.querySelector('[data-recommendations-heading]')).toBeInTheDocument();
    expect(section.querySelector('[data-recommendations-rule]')).toBeInTheDocument();
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-4', 'md:grid-cols-6', 'lg:grid-cols-8');
    expect(links).toHaveLength(10);
    expect(links.map((link) => link.style.getPropertyValue('--weelp-recommendations-index'))).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '7', '7']);
    expect(links[0]).toHaveAttribute('href', '/cities/dubai/itineraries/recommendation-1');
    expect(links[1]).toHaveAttribute('href', '/cities/itineraries/recommendation-2');
    expect(links[0]).toHaveClass('bg-gradient-to-r', 'bg-[length:0%_1px]', 'transition-[color,background-size]', 'hover:bg-[length:100%_1px]', 'motion-reduce:transition-none');
    expect(links[0]).toHaveStyle({
      fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
      fontWeight: 500,
      letterSpacing: '-0.38px',
      lineHeight: 2.06,
    });
    links.forEach((link) => expect(link.parentElement).toBe(grid));
  });

  it('limits the populated recommendation list to 32 links', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    getFeaturedItinerariesMock.mockResolvedValue({ success: true, data: makeItineraries(33) });

    render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));

    expect(screen.getAllByRole('link')).toHaveLength(32);
    expect(getFeaturedItinerariesMock).toHaveBeenCalledTimes(1);
    expect(getFeaturedItinerariesMock).toHaveBeenCalledWith();
  });

  it('preserves the existing three-reveal structure without an entrance', async () => {
    getFeaturedItinerariesMock.mockResolvedValue({ success: true, data: makeItineraries(2) });

    render(await WeelpRecommendations());

    const section = screen.getByRole('heading', { name: 'Weelp Recommendations' }).closest('section');
    const reveals = screen.getAllByTestId('reveal');
    const links = screen.getAllByRole('link');

    expect(getFeaturedItinerariesMock).toHaveBeenCalledTimes(1);
    expect(getFeaturedItinerariesMock).toHaveBeenCalledWith();
    expect(reveals).toHaveLength(3);
    expect(section).not.toHaveAttribute('data-recommendations-section-entrance');
    expect(reveals[1]).toHaveAttribute('data-reveal-variant', 'lift');
    expect(reveals[2]).toHaveAttribute('data-reveal-variant', 'lift');
    expect(reveals[2]).toHaveAttribute('data-reveal-stagger', '45');
    expect(section.querySelector('[data-recommendations-heading]')).not.toBeInTheDocument();
    expect(section.querySelector('[data-recommendations-rule]')).not.toBeInTheDocument();
    expect(section.querySelector('[data-recommendations-grid]')).not.toBeInTheDocument();
    links.forEach((link) => {
      expect(link).not.toHaveAttribute('data-recommendations-link');
      expect(link.style.getPropertyValue('--weelp-recommendations-index')).toBe('');
    });
  });

  it.each([
    {
      name: 'empty',
      response: { success: true, data: [] },
      expected: {
        eyebrow: 'Weelp recommends',
        message: 'Our editors are between picks for you. Browse the catalog and save the ones you love for next time.',
        variant: 'empty',
        pivotHref: '/cities',
        pivotLabel: 'Browse all cities',
      },
    },
    {
      name: 'error',
      response: { success: false, data: [] },
      expected: {
        eyebrow: 'Weelp recommends',
        message: "We couldn't pull this week's picks just now. Refresh, or browse the full catalog.",
        variant: 'error',
        pivotHref: '/cities',
        pivotLabel: 'Browse all cities',
      },
    },
  ])('preserves the $name fallback without an entrance wrapper', async ({ response, expected }) => {
    getFeaturedItinerariesMock.mockResolvedValue(response);

    const { container } = render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));

    expect(getFeaturedItinerariesMock).toHaveBeenCalledTimes(1);
    expect(getFeaturedItinerariesMock).toHaveBeenCalledWith();
    expect(sectionFallbackMock).toHaveBeenLastCalledWith(expected);
    expect(screen.getByTestId('section-fallback')).toHaveTextContent(expected.message);
    expect(container.querySelector('[data-recommendations-section-entrance]')).not.toBeInTheDocument();
  });
});
