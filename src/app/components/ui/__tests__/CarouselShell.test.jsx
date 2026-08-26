import { render, screen } from '@testing-library/react';

import CarouselShell from '../CarouselShell';

let latestSwiperProps;

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className, ...props }) => {
    latestSwiperProps = props;
    return <div className={`swiper ${className || ''}`}>{children}</div>;
  },
  SwiperSlide: ({ children, className, style }) => (
    <div className={`swiper-slide ${className || ''}`} style={style}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
}));

beforeEach(() => {
  latestSwiperProps = undefined;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000, bottom: 2400 });
});

afterEach(() => jest.restoreAllMocks());

test('carousel reveals as one unit without per-card reveal wrappers', () => {
  render(<CarouselShell items={[{ id: 'a', title: 'A' }]} renderSlide={(item) => <article>{item.title}</article>} />);

  const root = screen.getByText('A').closest('.carousel-shell-wrapper');
  const swiper = root.querySelector('.swiper');
  const slide = root.querySelector('.swiper-slide');

  expect(root).toHaveAttribute('data-reveal-variant', 'lift');
  expect(root).not.toHaveClass('weelp-card-stagger');
  expect(root).not.toHaveAttribute('data-reveal-cards');
  expect(swiper.style.getPropertyValue('--weelp-reveal-index')).toBe('');
  expect(slide.style.getPropertyValue('--weelp-reveal-index')).toBe('');
  expect(root.querySelector('.weelp-card-reveal-item')).toBeNull();
});

test('accepts an explicit base slide count without changing the default', () => {
  const { rerender } = render(<CarouselShell items={[{ id: 'a', title: 'A' }]} renderSlide={(item) => <article>{item.title}</article>} />);
  expect(latestSwiperProps.slidesPerView).toBe(1.08);

  rerender(<CarouselShell items={[{ id: 'a', title: 'A' }]} slidesPerView={1} renderSlide={(item) => <article>{item.title}</article>} />);
  expect(latestSwiperProps.slidesPerView).toBe(1);
});

test('passes external navigation selectors to Swiper before initialization', () => {
  render(<CarouselShell items={[{ id: 'a', title: 'A' }]} navigationPrefix="top-activities" renderSlide={(item) => <article>{item.title}</article>} />);

  expect(latestSwiperProps.navigation).toEqual({
    prevEl: '.top-activities-prev',
    nextEl: '.top-activities-next',
  });

  const swiper = { params: { navigation: null } };
  latestSwiperProps.onBeforeInit(swiper);

  expect(swiper.params.navigation).toEqual({
    prevEl: '.top-activities-prev',
    nextEl: '.top-activities-next',
  });
});

test('emits a stagger-right entrance with capped slide delay indexes', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({ id: index + 1, title: `Card ${index + 1}` }));
  render(<CarouselShell items={items} entrance="stagger-right" observeReveal={false} renderSlide={(item) => <article>{item.title}</article>} />);

  const root = screen.getByText('Card 1').closest('.carousel-shell-wrapper');
  const slides = root.querySelectorAll('.swiper-slide');

  expect(root).toHaveAttribute('data-carousel-entrance', 'stagger-right');
  expect(root).not.toHaveAttribute('data-reveal');
  expect(slides[0].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('0');
  expect(slides[4].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
  expect(slides[6].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
});

test('preserves Swiper configuration while indexing an editorial-right entrance', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({ id: index + 1, title: `Story ${index + 1}` }));
  const breakpoints = {
    640: { slidesPerView: 2, spaceBetween: 15 },
    1024: { slidesPerView: 4, spaceBetween: 20 },
  };

  render(
    <CarouselShell
      items={items}
      entrance="editorial-right"
      observeReveal={false}
      navigationPrefix="guide-blog"
      breakpoints={breakpoints}
      showMobilePagination
      renderSlide={(item) => <article>{item.title}</article>}
    />,
  );

  const root = screen.getByText('Story 1').closest('.carousel-shell-wrapper');
  const slides = root.querySelectorAll(':scope > .swiper > .swiper-slide');

  expect(root).toHaveAttribute('data-carousel-entrance', 'editorial-right');
  expect(root).not.toHaveAttribute('data-reveal');
  expect(slides).toHaveLength(7);
  expect(slides[0].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('0');
  expect(slides[4].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
  expect(slides[6].style.getPropertyValue('--weelp-carousel-reveal-index')).toBe('4');
  expect(latestSwiperProps).toEqual(
    expect.objectContaining({
      slidesPerView: 1.08,
      spaceBetween: 18,
      breakpoints,
      navigation: {
        prevEl: '.guide-blog-prev',
        nextEl: '.guide-blog-next',
      },
      pagination: { clickable: true, dynamicBullets: true },
    }),
  );
});
