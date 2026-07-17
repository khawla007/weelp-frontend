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
