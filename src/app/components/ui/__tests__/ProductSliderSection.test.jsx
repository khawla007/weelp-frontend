import { render, screen } from '@testing-library/react';

import ProductSliderSection from '../ProductSliderSection';

const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);
const mockItemCard = jest.fn(({ title }) => <article>{title}</article>);

jest.mock('../CarouselShell', () => ({
  __esModule: true,
  default: (props) => mockCarouselShell(props),
}));

jest.mock('../item-card', () => ({
  __esModule: true,
  default: (props) => mockItemCard(props),
}));

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

beforeEach(() => {
  mockCarouselShell.mockClear();
  mockItemCard.mockClear();
});

test('renders product carousel navigation on mobile-sized layouts', () => {
  const { container } = render(<ProductSliderSection items={items} title="Top activities" navigationId="top-activities" />);

  expect(screen.getByRole('button', { name: 'Previous Top activities item' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next Top activities item' })).toBeInTheDocument();
  expect(container.querySelector('.top-activities-next')?.parentElement).not.toHaveClass('hidden');
  expect(mockCarouselShell.mock.calls.at(-1)[0].breakpoints).toEqual({
    450: { slidesPerView: 1, spaceBetween: 18 },
    640: { slidesPerView: 2, spaceBetween: 18 },
    768: { slidesPerView: 2, spaceBetween: 18 },
    1024: { slidesPerView: 3, spaceBetween: 18 },
    1440: { slidesPerView: 4, spaceBetween: 18 },
  });
  expect(mockCarouselShell.mock.calls.at(-1)[0].slidesPerView).toBe(1);
});

test('forwards the complete mapped product contract to the shared card', () => {
  const product = {
    ...items[0],
    hasValidIdentity: true,
    hasRealTitle: true,
    hasRealImage: true,
    priceValue: 130,
    priceCurrency: 'USD',
    ratingValue: 4.8,
    reviewCountValue: 210,
    attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
    wishlistItem: { item_type: 'activity', item_id: 1 },
  };
  render(<ProductSliderSection items={[product]} title="Top activities" navigationId="top-activities" />);

  const slide = mockCarouselShell.mock.calls.at(-1)[0].renderSlide(product);
  render(slide);

  expect(mockItemCard).toHaveBeenCalledWith(expect.objectContaining({ ...product, variant: 'full' }));
});

test('forwards an editorial variant without changing product carousel geometry', () => {
  const blogItem = { id: 2, title: 'A Paris guide', href: '/blogs/paris', image: '/paris.jpg', category: 'City guide' };
  render(<ProductSliderSection items={[blogItem]} title="Your Guide" navigationId="guide-blog" itemVariant="editorial" />);

  const carouselProps = mockCarouselShell.mock.calls.at(-1)[0];
  expect(carouselProps.breakpoints).toEqual({
    450: { slidesPerView: 1, spaceBetween: 18 },
    640: { slidesPerView: 2, spaceBetween: 18 },
    768: { slidesPerView: 2, spaceBetween: 18 },
    1024: { slidesPerView: 3, spaceBetween: 18 },
    1440: { slidesPerView: 4, spaceBetween: 18 },
  });
  expect(carouselProps.renderSlide(blogItem).props).toEqual({ ...blogItem, variant: 'editorial' });
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
