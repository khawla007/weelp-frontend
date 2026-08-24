import { render, screen } from '@testing-library/react';

import ProductSliderSection from '../ProductSliderSection';

const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);

jest.mock('../CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));

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
    function MockReveal({ as: Tag = 'div', children, className = '', initialHidden, ...props }) {
      return (
        <Tag className={className} data-initial-hidden={initialHidden ? 'true' : undefined} {...props}>
          {children}
        </Tag>
      );
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

beforeEach(() => mockCarouselShell.mockClear());

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

test('uses one section reveal to coordinate the staggered header and carousel', () => {
  const { rerender } = render(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" />);
  expect(mockCarouselShell.mock.calls.at(-1)[0].observeReveal).toBeUndefined();

  rerender(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" carouselEntrance="stagger-right" />);

  const section = screen.getByRole('region', { name: 'Top activities' });
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(mockCarouselShell.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ entrance: 'stagger-right', observeReveal: false }));
});
