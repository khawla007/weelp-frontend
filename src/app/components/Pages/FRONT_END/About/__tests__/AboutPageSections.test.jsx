import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/(frontend)/about-us/page';

jest.mock('next/image', () => {
  const MockImage = ({ alt = '', fill: _fill, priority: _priority, sizes: _sizes, ...props }) => <img alt={alt} {...props} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('swiper/modules', () => ({ Navigation: {} }));
jest.mock('swiper/css', () => ({}));
jest.mock('swiper/react', () => {
  const MockSwiper = ({ children, onSwiper }) => {
    onSwiper?.({ slidePrev: jest.fn(), slideNext: jest.fn(), isBeginning: true, isEnd: false });
    return <div data-testid="swiper">{children}</div>;
  };
  MockSwiper.displayName = 'MockSwiper';
  const MockSwiperSlide = ({ children }) => <div>{children}</div>;
  MockSwiperSlide.displayName = 'MockSwiperSlide';
  return { Swiper: MockSwiper, SwiperSlide: MockSwiperSlide };
});

jest.mock('@/app/components/ui/Reveal', () => {
  const MockReveal = ({ as: Tag = 'div', children, variant, stagger: _stagger, initialHidden: _initialHidden, ...props }) => (
    <Tag data-reveal-variant={variant} {...props}>
      {children}
    </Tag>
  );
  MockReveal.displayName = 'MockReveal';
  return MockReveal;
});

describe('About page reference composition', () => {
  test('renders the approved eight sections in order', () => {
    const { container } = render(<AboutPage />);
    const sections = [...container.querySelectorAll('[data-about-section]')].map((node) => node.dataset.aboutSection);

    expect(sections).toEqual(['hero', 'story', 'statement', 'process', 'team', 'testimonials', 'cta', 'faq']);
    expect(container.firstElementChild).toHaveClass('overflow-x-clip');
  });

  test('uses a navigable Home breadcrumb and preserves the Weelp hero copy', () => {
    const { container } = render(<AboutPage />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { level: 1, name: /shaping journeys through experience and care/i })).toBeInTheDocument();
    expect(container.querySelector('[data-about-section="hero"] img')).toHaveAttribute('loading', 'eager');
  });

  test('renders the measured two-row story overlap and descriptive metric panel', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('about-story-top')).toBeInTheDocument();
    expect(screen.getByTestId('about-story-bottom')).toBeInTheDocument();
    expect(screen.getAllByText('Our Story')).toHaveLength(1);
    expect(screen.getByTestId('about-story-stats')).toHaveClass('storyStatsOverlap');
    expect(screen.getByText(/curated destinations across/i)).toBeInTheDocument();
    expect(screen.getByText(/local partners helping/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact our team/i })).toHaveAttribute('href', '/contact-us');
  });

  test('uses flush full-width process, CTA, and interlocked FAQ bands', () => {
    const { container } = render(<AboutPage />);

    expect(container.querySelector('[data-about-section="process"] [data-testid="about-process-split"]')).toHaveClass('fullBleedSplit');
    expect(container.querySelector('[data-about-section="cta"]')).toHaveClass('fullBleedBand');
    expect(container.querySelector('[data-about-section="faq"]')).toHaveClass('fullBleedBand');
    expect(screen.getByTestId('about-faq-heading-row')).toBeInTheDocument();
    expect(screen.getByTestId('about-faq-content-row')).toBeInTheDocument();
    expect(screen.getByTestId('about-faq-overlap-image')).toBeInTheDocument();
  });

  test('renders the separate masonry header, three columns, and four values', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('about-masonry-header')).toBeInTheDocument();
    expect(screen.getAllByTestId('about-masonry-column')).toHaveLength(3);
    expect(screen.getAllByTestId('about-value-card')).toHaveLength(4);
    expect(screen.getAllByRole('link', { name: /get in touch/i })).toEqual(expect.arrayContaining([expect.objectContaining({ href: expect.stringContaining('/contact-us') })]));
  });

  test('matches the reference three-person team composition', () => {
    render(<AboutPage />);

    expect(screen.getAllByTestId('about-team-card')).toHaveLength(3);
    expect(screen.getByTestId('about-team-grid')).toHaveAttribute('data-team-layout', 'reference-compact');
  });

  test('exposes one testimonial control pair even when every slide is mounted', () => {
    render(<AboutPage />);

    expect(screen.getAllByRole('button', { name: /previous testimonial/i })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /next testimonial/i })).toHaveLength(1);
  });

  test('keeps the Weelp CTA route and FAQ content', () => {
    const { container } = render(<AboutPage />);

    expect(screen.getByRole('link', { name: /start planning/i })).toHaveAttribute('href', '/activities');
    expect(screen.getByRole('button', { name: /which destinations does weelp cover/i })).toHaveAttribute('aria-expanded', 'true');
    const faq = container.querySelector('[data-about-section="faq"]');
    expect(
      faq.querySelector('[data-testid="about-faq-overlap-image"]').compareDocumentPosition(faq.querySelector('[data-testid="about-faq-content"]')) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
