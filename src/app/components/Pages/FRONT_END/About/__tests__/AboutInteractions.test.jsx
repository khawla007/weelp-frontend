import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AboutFAQ from '../AboutFAQ';
import AboutImage from '../AboutImage';
import AboutTestimonials from '../AboutTestimonials';

jest.mock('next/image', () => {
  const MockImage = ({ alt = '', fill: _fill, priority: _priority, sizes: _sizes, ...props }) => <img alt={alt} {...props} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('swiper/css', () => ({}));
jest.mock('swiper/modules', () => ({ Navigation: {} }));
jest.mock('swiper/react', () => {
  const MockSwiperSlide = ({ children }) => <div>{children}</div>;
  MockSwiperSlide.displayName = 'MockSwiperSlide';

  const MockSwiper = ({ children, onSwiper, onSlideChange, onReachBeginning, onReachEnd, speed }) => {
    const slides = React.Children.toArray(children);
    const [index, setIndex] = React.useState(0);

    const api = React.useMemo(
      () => ({
        activeIndex: index,
        isBeginning: index === 0,
        isEnd: index === slides.length - 1,
        slidePrev: () => setIndex((value) => Math.max(0, value - 1)),
        slideNext: () => setIndex((value) => Math.min(slides.length - 1, value + 1)),
      }),
      [index, slides.length],
    );

    React.useEffect(() => onSwiper?.(api), [api, onSwiper]);
    React.useEffect(() => {
      onSlideChange?.(api);
      if (api.isBeginning) onReachBeginning?.(api);
      if (api.isEnd) onReachEnd?.(api);
    }, [api, onReachBeginning, onReachEnd, onSlideChange]);

    return (
      <div data-testid="testimonial-swiper" data-speed={speed}>
        {slides[index]}
      </div>
    );
  };
  MockSwiper.displayName = 'MockSwiper';

  return { Swiper: MockSwiper, SwiperSlide: MockSwiperSlide };
});

beforeEach(() => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
});

test('testimonial navigation keeps traveler media and review content synchronized', async () => {
  render(<AboutTestimonials />);

  expect(screen.getByRole('img', { name: /stephanie jonathon on kenya safari/i })).toBeInTheDocument();
  expect(screen.getByText('Stephanie Jonathon')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));

  expect(await screen.findByRole('img', { name: /daniel carter on paris city tour/i })).toBeInTheDocument();
  expect(screen.getByText('Daniel Carter')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
  expect(await screen.findByText('Marvin Grant')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /next testimonial/i })).toBeDisabled();
});

test('testimonial carousel announces slide changes and disables motion when requested', async () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });

  render(<AboutTestimonials />);

  expect(screen.getByRole('region', { name: /traveler testimonials/i })).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByTestId('testimonial-swiper')).toHaveAttribute('data-speed', '0');
});

test('testimonial ratings use the shared yellow stars with visible spacing', () => {
  render(<AboutTestimonials />);

  const summaryStars = screen.getByLabelText('4.9 out of 5 stars');
  const reviewStars = screen.getByLabelText('5 out of 5 stars');

  expect(summaryStars).toHaveClass('gap-1', 'text-yellow-400');
  expect(reviewStars).toHaveClass('gap-1', 'text-yellow-400');
});

test('FAQ keeps one item open at a time', async () => {
  render(<AboutFAQ />);

  const first = screen.getByRole('button', { name: /which destinations does weelp cover/i });
  const second = screen.getByRole('button', { name: /how does booking work/i });
  expect(first).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(second);

  expect(first).toHaveAttribute('aria-expanded', 'false');
  expect(second).toHaveAttribute('aria-expanded', 'true');
});

test('failed About images retain an accessible stable fallback', async () => {
  render(
    <div className="relative h-40 w-40">
      <AboutImage src="/missing.jpg" alt="Missing destination" fallbackLabel="Destination unavailable" fill sizes="160px" />
    </div>,
  );

  fireEvent.error(screen.getByRole('img', { name: 'Missing destination' }));

  await waitFor(() => expect(screen.getByTestId('about-image-fallback')).toHaveAccessibleName('Missing destination'));
  expect(screen.getByText('Destination unavailable')).toBeInTheDocument();
});
