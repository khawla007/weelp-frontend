import { render, screen } from '@testing-library/react';

import BrowseDestinationsSection from '../BrowseDestinationsSection';

jest.mock(
  '@/app/components/ui/CarouselShell',
  () =>
    function MockCarouselShell() {
      return <div data-testid="carousel-shell" />;
    },
);

jest.mock(
  '@/app/components/CityCard',
  () =>
    function MockCityCard({ city }) {
      return <article>{city.name}</article>;
    },
);

jest.mock(
  '@/app/components/ui/Reveal',
  () =>
    function MockReveal({ children, className = '', as: Component = 'div' }) {
      return <Component className={className}>{children}</Component>;
    },
);

const cities = [
  {
    id: 1,
    name: 'Dubai',
    slug: 'dubai',
    featured_image: '/assets/Card.webp',
  },
];

test('uses the same responsive navigation button size as product sliders', () => {
  const { container } = render(<BrowseDestinationsSection cities={cities} />);

  expect(screen.getByRole('button', { name: 'Previous destination' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next destination' })).toBeInTheDocument();
  expect(container.querySelector('.browse-destinations-next')).toHaveClass('size-10', 'sm:size-11');
});
