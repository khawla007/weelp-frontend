import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AboutTeam from '../AboutTeam';

let swiperApi;
let mediaQueryList;

jest.mock('next/image', () => {
  const MockImage = ({ alt = '', fill: _fill, priority: _priority, sizes, ...props }) => <img alt={alt} data-sizes={sizes} {...props} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/react', () => {
  const React = jest.requireActual('react');
  const MockSwiper = ({ children, onSwiper, ...props }) => {
    React.useEffect(() => onSwiper?.(swiperApi), [onSwiper]);
    return (
      <div data-testid="team-swiper" data-config={JSON.stringify(props)}>
        {children}
      </div>
    );
  };
  MockSwiper.displayName = 'MockSwiper';

  const MockSwiperSlide = ({ children }) => <div data-testid="team-slide">{children}</div>;
  MockSwiperSlide.displayName = 'MockSwiperSlide';

  return { Swiper: MockSwiper, SwiperSlide: MockSwiperSlide };
});

jest.mock('@/app/components/ui/Reveal', () => {
  const MockReveal = ({ as: Tag = 'div', children, variant: _variant, ...props }) => <Tag {...props}>{children}</Tag>;
  MockReveal.displayName = 'MockReveal';
  return MockReveal;
});

const createMediaQueryList = (matches = false) => ({
  matches,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

beforeEach(() => {
  swiperApi = { slidePrev: jest.fn(), slideNext: jest.fn() };
  mediaQueryList = createMediaQueryList(false);
  window.matchMedia = jest.fn(() => mediaQueryList);
});

afterEach(() => {
  delete window.matchMedia;
});

test('renders all six approved travel team members with local portraits', () => {
  const { container } = render(<AboutTeam />);

  expect(screen.getAllByTestId('about-team-card')).toHaveLength(6);
  expect(screen.getAllByTestId('team-slide')).toHaveLength(6);
  expect(screen.getByText('Martin Alexander')).toBeInTheDocument();
  expect(screen.getByText('Founder & CEO')).toBeInTheDocument();
  expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  expect(screen.getByText('Head of Guest Experience')).toBeInTheDocument();
  expect(screen.getByText('Mike Anderson')).toBeInTheDocument();
  expect(screen.getByText('Travel Operations Manager')).toBeInTheDocument();
  expect(screen.getByText('Emily Carter')).toBeInTheDocument();
  expect(screen.getByText('Destination Partnerships Manager')).toBeInTheDocument();
  expect(screen.getByText('David Thompson')).toBeInTheDocument();
  expect(screen.getByText('Experience Design Director')).toBeInTheDocument();
  expect(screen.getByText('Jessica Williams')).toBeInTheDocument();
  expect(screen.getByText('Booking & Finance Manager')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Meet Our Amazing Team Members' })).toBeInTheDocument();
  expect(screen.getByText('A dedicated group of travel specialists committed to creating meaningful journeys through local insight, thoughtful planning, and genuine care.')).toBeInTheDocument();

  const images = [...container.querySelectorAll('[data-about-section="team"] img')];
  const sources = images.map((image) => image.getAttribute('src'));
  expect(sources).toHaveLength(6);
  expect(sources).toEqual([
    '/assets/images/about/team/martin-alexander.webp',
    '/assets/images/about/team/sarah-johnson.webp',
    '/assets/images/about/team/mike-anderson.webp',
    '/assets/images/about/team/emily-carter.webp',
    '/assets/images/about/team/david-thompson.webp',
    '/assets/images/about/team/jessica-williams.webp',
  ]);
  expect(images[0]).toHaveAttribute('alt', 'Martin Alexander, Founder & CEO');
  expect(images[0]).toHaveAttribute('data-sizes', '(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 48px), (max-width: 991px) 48vw, (max-width: 1479px) 31vw, 440px');
});

test('configures the reference carousel without visible controls or automatic movement', () => {
  render(<AboutTeam />);
  const swiperProps = JSON.parse(screen.getByTestId('team-swiper').dataset.config);

  expect(screen.getByRole('region', { name: 'Weelp team members' })).toHaveAttribute('tabindex', '0');
  expect(swiperProps).toEqual(
    expect.objectContaining({
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 600,
      grabCursor: true,
      watchOverflow: true,
      loop: false,
      rewind: false,
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 30 },
        992: { slidesPerView: 3, spaceBetween: 30 },
        1200: { slidesPerView: 3, spaceBetween: 45 },
        1400: { slidesPerView: 3, spaceBetween: 49 },
      },
    }),
  );
  expect(swiperProps).not.toHaveProperty('autoplay');
  expect(swiperProps).not.toHaveProperty('navigation');
  expect(swiperProps).not.toHaveProperty('pagination');
  expect(swiperProps).not.toHaveProperty('scrollbar');
});

test('scopes arrow-key navigation to the focused carousel region', () => {
  render(<AboutTeam />);
  const region = screen.getByRole('region', { name: 'Weelp team members' });

  expect(fireEvent.keyDown(region, { key: 'ArrowLeft' })).toBe(false);
  expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(false);
  expect(fireEvent.keyDown(region, { key: 'Enter' })).toBe(true);

  expect(swiperApi.slidePrev).toHaveBeenCalledTimes(1);
  expect(swiperApi.slideNext).toHaveBeenCalledTimes(1);

  const button = document.createElement('button');
  region.append(button);
  expect(fireEvent.keyDown(button, { key: 'ArrowRight' })).toBe(true);
  expect(swiperApi.slideNext).toHaveBeenCalledTimes(1);
});

test('does not fail when a Swiper instance omits navigation methods', () => {
  swiperApi = {};
  render(<AboutTeam />);
  const region = screen.getByRole('region', { name: 'Weelp team members' });

  expect(() => fireEvent.keyDown(region, { key: 'ArrowLeft' })).not.toThrow();
  expect(() => fireEvent.keyDown(region, { key: 'ArrowRight' })).not.toThrow();
});

test('synchronizes reduced motion and removes its listener on cleanup', async () => {
  mediaQueryList = createMediaQueryList(true);
  window.matchMedia = jest.fn(() => mediaQueryList);

  const { unmount } = render(<AboutTeam />);
  await waitFor(() => expect(JSON.parse(screen.getByTestId('team-swiper').dataset.config).speed).toBe(0));

  expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  const handleChange = mediaQueryList.addEventListener.mock.calls[0][1];
  mediaQueryList.matches = false;
  act(() => handleChange());
  await waitFor(() => expect(JSON.parse(screen.getByTestId('team-swiper').dataset.config).speed).toBe(600));

  unmount();
  expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', handleChange);
});
