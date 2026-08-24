import { render, screen } from '@testing-library/react';

import BlogSection from '../BlogSection';

const mockCarouselShell = jest.fn(() => <div data-testid="carousel-shell" />);
const mockItemCard = jest.fn(() => null);

jest.mock('../CarouselShell', () => ({
  __esModule: true,
  default: (props, context) => mockCarouselShell(props, context),
}));

jest.mock('../item-card', () => ({
  __esModule: true,
  default: (props, context) => mockItemCard(props, context),
}));

jest.mock(
  '../Reveal',
  () =>
    function MockReveal({ as: Tag = 'div', children, className = '', initialHidden, ...props }) {
      return (
        <Tag data-testid="reveal" data-initial-hidden={initialHidden ? 'true' : undefined} className={className} {...props}>
          {children}
        </Tag>
      );
    },
);

const blog = {
  id: 17,
  slug: 'hidden-corners-of-paris',
  excerpt: 'Hidden corners of Paris',
  published_at: '2026-08-20',
  categories: [{ category_name: 'City guide' }],
  media_gallery: [{ is_featured: true, url: '/paris-guide.jpg' }],
};

const expectedBreakpoints = {
  450: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 15 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1440: { slidesPerView: 5, spaceBetween: 20 },
};

beforeEach(() => {
  mockCarouselShell.mockClear();
  mockItemCard.mockClear();
});

test('returns null when no blogs are supplied', () => {
  const { container } = render(<BlogSection blogs={[]} />);

  expect(container).toBeEmptyDOMElement();
  expect(mockCarouselShell).not.toHaveBeenCalled();
});

test('uses one root reveal and a plain body for the editorial-right entrance', () => {
  render(<BlogSection blogs={[blog]} navigationId="guide-blog" entrance="editorial-right" />);

  const section = screen.getByTestId('reveal');
  expect(section.tagName).toBe('SECTION');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section).toHaveAttribute('data-guide-section-entrance', 'editorial-right');
  expect(section.querySelector('[data-guide-section-header]')).toBeInTheDocument();
  expect(screen.getAllByTestId('reveal')).toHaveLength(1);
  expect(screen.getByTestId('carousel-shell').parentElement.tagName).toBe('DIV');
  expect(screen.getByTestId('carousel-shell').parentElement).not.toHaveAttribute('data-testid', 'reveal');

  expect(mockCarouselShell).toHaveBeenLastCalledWith(
    expect.objectContaining({
      entrance: 'editorial-right',
      observeReveal: false,
      navigationPrefix: 'guide-blog',
      breakpoints: expectedBreakpoints,
      slideClassName: '!h-auto',
      showMobilePagination: true,
    }),
    undefined,
  );

  const carouselProps = mockCarouselShell.mock.calls.at(-1)[0];
  const mappedCard = carouselProps.items[0];
  const renderedCard = carouselProps.renderSlide(mappedCard);

  expect(renderedCard.props).toEqual({
    href: '/blogs/hidden-corners-of-paris',
    image: '/paris-guide.jpg',
    title: 'Hidden corners of Paris',
    category: 'City guide',
    publishedAt: '2026-08-20',
    variant: 'compact',
  });
});

test('preserves the existing two reveals and carousel defaults without an entrance', () => {
  render(<BlogSection blogs={[blog]} navigationId="guide-blog" />);

  const reveals = screen.getAllByTestId('reveal');
  expect(reveals).toHaveLength(2);
  expect(reveals[0]).toHaveAttribute('data-initial-hidden', 'true');
  expect(reveals[1]).toHaveAttribute('data-initial-hidden', 'true');
  expect(document.querySelector('section')).not.toHaveAttribute('data-guide-section-entrance');

  const carouselProps = mockCarouselShell.mock.calls.at(-1)[0];
  expect(carouselProps.entrance).toBeUndefined();
  expect(carouselProps.observeReveal).toBeUndefined();
  expect(carouselProps).toEqual(
    expect.objectContaining({
      navigationPrefix: 'guide-blog',
      breakpoints: expectedBreakpoints,
      slideClassName: '!h-auto',
      showMobilePagination: true,
    }),
  );
});
