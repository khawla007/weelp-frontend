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

test('always uses the shared stagger-right carousel entrance', () => {
  render(<BlogSection blogs={[blog]} navigationId="guide-blog" />);

  const section = screen.getByRole('region', { name: 'Your Guide' });
  expect(section.tagName).toBe('SECTION');
  expect(section).toHaveAttribute('data-initial-hidden', 'true');
  expect(section).toHaveAttribute('data-carousel-section-entrance', 'stagger-right');
  expect(section.querySelector('[data-carousel-section-header]')).toBeInTheDocument();
  expect(screen.getAllByTestId('reveal')).toHaveLength(1);

  expect(mockCarouselShell).toHaveBeenLastCalledWith(
    expect.objectContaining({
      entrance: 'stagger-right',
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
