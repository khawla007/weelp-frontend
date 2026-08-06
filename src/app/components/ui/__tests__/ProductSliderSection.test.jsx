import { render, screen } from '@testing-library/react';

import ProductSliderSection from '../ProductSliderSection';

jest.mock(
  '../CarouselShell',
  () =>
    function MockCarouselShell() {
      return <div data-testid="carousel-shell" />;
    },
);

jest.mock(
  '../item-card',
  () =>
    function MockItemCard({ title }) {
      return <article>{title}</article>;
    },
);

jest.mock(
  '../Reveal',
  () =>
    function MockReveal({ children, className = '' }) {
      return <div className={className}>{children}</div>;
    },
);

const items = [
  {
    id: 1,
    title: 'Dubai desert safari',
    href: '/cities/dubai/activities/desert-safari',
    image: '/placeholder.jpg',
  },
];

test('renders product carousel navigation on mobile-sized layouts', () => {
  const { container } = render(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" />);

  expect(screen.getByRole('button', { name: 'Previous Top activities item' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next Top activities item' })).toBeInTheDocument();
  expect(container.querySelector('.top-activities-next')?.parentElement).not.toHaveClass('hidden');
});

test('marks the supported header CTA as a button-shaped link', () => {
  render(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" headerAction="cta" ctaHref="/cities" ctaLabel="Explore cities" />);

  expect(screen.getByRole('link', { name: 'Explore cities' })).toHaveAttribute('data-weelp-button-link');
});
