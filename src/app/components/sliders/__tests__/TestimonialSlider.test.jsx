import { render, screen } from '@testing-library/react';

import { TestmonialSlider } from '../TestimonialSlider';

let latestSwiperProps;
const mockReveal = jest.fn(({ children, className = '' }) => (
  <div className={className} data-testid="testimonial-slider-reveal">
    {children}
  </div>
));

jest.mock('swiper/react', () => ({
  Swiper: ({ children, className, ...props }) => {
    latestSwiperProps = props;
    return <div className={`swiper ${className || ''}`}>{children}</div>;
  },
  SwiperSlide: ({ children, style }) => (
    <div className="swiper-slide" style={style}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({ Autoplay: {} }));
jest.mock('@/app/components/Testimonial', () => ({
  __esModule: true,
  default: ({ username }) => <article>{username}</article>,
}));
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => mockReveal(props),
}));

const reviews = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  user: { name: `Traveler ${index + 1}` },
}));

const setReducedMotion = (matches) => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
};

beforeEach(() => {
  latestSwiperProps = undefined;
  mockReveal.mockClear();
  setReducedMotion(false);
});

test('preserves the existing Reveal wrapper and autoplay configuration by default', () => {
  render(<TestmonialSlider reviews={reviews} />);

  expect(mockReveal).toHaveBeenCalledTimes(1);
  expect(mockReveal.mock.calls[0][0]).toEqual(expect.objectContaining({ initialHidden: true, variant: 'lift' }));
  expect(latestSwiperProps.speed).toBe(8000);
  expect(latestSwiperProps.autoplay).toEqual(expect.objectContaining({ delay: 0, disableOnInteraction: true, pauseOnMouseEnter: true }));
});

test('uses a plain marked wrapper and caps stagger-up indexes at three', () => {
  render(<TestmonialSlider reviews={reviews} entrance="stagger-up" observeReveal={false} />);

  const root = screen.getByText('Traveler 1').closest('.testimonial-slider');
  const slides = root.querySelectorAll('.swiper-slide');
  expect(mockReveal).not.toHaveBeenCalled();
  expect(root).toHaveAttribute('data-testimonial-entrance', 'stagger-up');
  expect(root).not.toHaveAttribute('data-reveal');
  expect(slides[0].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('0');
  expect(slides[3].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('3');
  expect(slides[5].style.getPropertyValue('--weelp-testimonial-reveal-index')).toBe('3');
  expect(latestSwiperProps.speed).toBe(8000);
  expect(latestSwiperProps.autoplay).toEqual(expect.objectContaining({ delay: 0, disableOnInteraction: true, pauseOnMouseEnter: true }));
  expect(latestSwiperProps.loop).toBe(true);
});

test('retains the existing reduced-motion autoplay behavior', () => {
  setReducedMotion(true);
  render(<TestmonialSlider reviews={reviews} entrance="stagger-up" observeReveal={false} />);

  expect(latestSwiperProps.autoplay).toBe(false);
  expect(latestSwiperProps.speed).toBe(0);
});
