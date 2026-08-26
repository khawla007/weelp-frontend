import { render, screen } from '@testing-library/react';

import BrowseDestinationsSection from '../BrowseDestinationsSection';

const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);

jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));

const mockCityCard = jest.fn(({ city }) => <article>{city.name}</article>);

jest.mock('@/app/components/CityCard', () => ({
  __esModule: true,
  default: (props) => mockCityCard(props),
}));

const mockReveal = jest.fn(({ children, className = '', as: Component = 'div', initialHidden, ...props }) => (
  <Component className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
    {children}
  </Component>
));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));

const cities = [
  {
    id: 1,
    name: 'Dubai',
    slug: 'dubai',
    featured_image: '/assets/Card.webp',
    blogs_count: 2,
  },
];

beforeEach(() => {
  mockCarouselShell.mockClear();
  mockCityCard.mockClear();
  mockReveal.mockClear();
});

test('uses the same responsive navigation button size as product sliders', () => {
  const { container } = render(<BrowseDestinationsSection cities={cities} />);

  expect(screen.getByRole('button', { name: 'Previous destination' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next destination' })).toBeInTheDocument();
  expect(container.querySelector('.browse-destinations-next')).toHaveClass('size-10', 'sm:size-11');
});

test('matches the product carousel responsive card count and spacing', () => {
  render(<BrowseDestinationsSection cities={cities} />);

  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(
    expect.objectContaining({
      slidesPerView: 1,
      breakpoints: {
        450: { slidesPerView: 1, spaceBetween: 18 },
        640: { slidesPerView: 2, spaceBetween: 18 },
        768: { slidesPerView: 2, spaceBetween: 18 },
        1024: { slidesPerView: 3, spaceBetween: 18 },
        1440: { slidesPerView: 4, spaceBetween: 18 },
      },
    }),
  );
});

test('forwards city data and subtitle mode without a theme-text override', () => {
  render(<BrowseDestinationsSection cities={cities} subtitleMode="price" />);

  const carouselProps = mockCarouselShell.mock.calls.at(-1)[0];
  const mappedCity = carouselProps.items[0];
  render(carouselProps.renderSlide(mappedCity));

  expect(mappedCity.blogsCount).toBe(2);
  expect(mockCityCard).toHaveBeenCalledWith(expect.objectContaining({ city: mappedCity, subtitleMode: 'price' }));
  expect(mockCityCard.mock.calls.at(-1)[0]).not.toHaveProperty('textTone');
});

test('preserves the existing reveal structure when no carousel entrance is requested', () => {
  const { container } = render(<BrowseDestinationsSection cities={cities} />);

  expect(mockReveal).toHaveBeenCalledTimes(2);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(mockReveal.mock.calls[1][0]).toEqual(expect.objectContaining({ variant: 'lift' }));
  expect(container.querySelector('[data-carousel-section-entrance]')).not.toBeInTheDocument();
  expect(container.querySelector('[data-carousel-section-header]')).not.toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0].entrance).toBeUndefined();
  expect(mockCarouselShell.mock.calls.at(-1)[0].observeReveal).toBeUndefined();
});

test('uses one section reveal to coordinate the staggered destination header and carousel', () => {
  render(<BrowseDestinationsSection cities={cities} carouselEntrance="stagger-right" />);

  const section = screen.getByRole('region', { name: 'Top Destinations' });
  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ as: 'section', initialHidden: true }));
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-right', observeReveal: false }));
});
