import { fireEvent, render } from '@testing-library/react';
import path from 'path';
import { getTransferFeaturedReviews } from '@/lib/services/reviews';

const srcPath = (...segments) => path.join(process.cwd(), 'src', ...segments);
const mockUseSWR = jest.fn();
const mockComponent = (testId) =>
  function ComponentMock() {
    return <div data-testid={testId} />;
  };

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args) => mockUseSWR(...args),
}));

jest.doMock(srcPath('app/components/Pages/FRONT_END/transfer/TransferSearchForm.jsx'), () => ({
  __esModule: true,
  default: function TransferSearchFormMock({ onSubmitted }) {
    return (
      <button type="button" data-testid="transfer-search-form" onClick={() => onSubmitted?.({ pickupAt: '2026-05-15', adults: 1 })}>
        Search transfers
      </button>
    );
  },
}));

jest.doMock(srcPath('app/components/Pages/FRONT_END/transfer/TransferResultsDropdown.jsx'), () => ({
  __esModule: true,
  default: mockComponent('transfer-results-dropdown'),
}));

jest.doMock(srcPath('app/components/sliders/ReviewSlider.jsx'), () => ({
  __esModule: true,
  default: function ReviewSliderMock({ reviews = [] }) {
    return <div data-testid="review-slider">{reviews.map((review) => review.id).join(',')}</div>;
  },
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Autoplay: {},
  Navigation: {},
}));

jest.doMock(srcPath('app/components/Faq.jsx'), () => ({
  __esModule: true,
  default: function FaqMock({ headingClassName }) {
    return <div data-testid="faq-accordion" data-heading-class-name={headingClassName} />;
  },
}));

jest.mock(
  '@/app/Data/ShopData',
  () => ({
    faqItems: [],
  }),
  { virtual: true },
);

jest.doMock(
  srcPath('lib/store/useMiniCartStore.js'),
  () => ({
    __esModule: true,
    default: (selector) =>
      selector({
        addItem: jest.fn(),
        setMiniCartOpen: jest.fn(),
      }),
  }),
  { virtual: true },
);

describe('TransfersPage', () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
    mockUseSWR.mockReturnValue({ data: [] });
  });

  it('renders the shared animated globe in the desktop background slot', () => {
    const TransfersPage = require('../page').default;
    const { container, getByText, getByTestId } = render(<TransfersPage />);

    expect(getByText('Book Your Taxi')).toBeInTheDocument();
    expect(getByTestId('transfer-search-form')).toBeInTheDocument();

    const hero = container.querySelector('section');
    const background = container.querySelector('[data-transfers-globe-background]');
    const stage = container.querySelector('[data-animated-globe]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');

    expect(hero).toHaveClass('relative', 'z-50', 'min-h-[360px]', 'px-4', 'py-8', 'sm:min-h-[420px]', 'sm:p-6', 'flex', 'justify-center', 'items-center', 'bg-surface-tint');
    expect(hero.firstElementChild).toHaveClass('gap-3', 'sm:gap-2');
    expect(hero).not.toHaveClass('sm:min-h-[520px]');
    expect(hero).not.toHaveClass('pt-10', 'sm:pt-16');
    expect(background).toHaveClass('hidden', '2xl:block', 'absolute', 'inset-0', 'overflow-hidden', 'pointer-events-none');
    expect(stage).toBeInTheDocument();
    expect(stage).toHaveClass('bg-transparent');
    expect(stage).toHaveAttribute('data-animated-globe-activation-query', '(min-width: 1536px)');
    expect(shell).toHaveClass('bottom-[-180px]', 'right-[-120px]', 'z-[3]', 'size-[760px]', 'translate-x-0', 'translate-y-[40%]', '2xl:size-[880px]');
    expect(container.querySelector('[data-personalised-cobe-globe]')).toBeInTheDocument();
    expect(container.querySelector('[data-personalised-sparkles]')).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/Group5.png"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-transfer-results-slot]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="transfer-results-dropdown"]')).not.toBeInTheDocument();
  });

  it('renders the results dropdown slot after transfer search submits', () => {
    const TransfersPage = require('../page').default;
    const { container, getByTestId } = render(<TransfersPage />);

    fireEvent.click(getByTestId('transfer-search-form'));

    expect(container.querySelector('[data-transfer-results-slot]')).toHaveClass(
      'absolute',
      'inset-x-0',
      'top-full',
      'z-[80]',
      'mt-3',
      'w-full',
      'md:left-1/2',
      'md:right-auto',
      'md:mt-4',
      'md:w-[735px]',
      'md:-translate-x-1/2',
    );
    expect(getByTestId('transfer-results-dropdown')).toBeInTheDocument();
  });

  it('hides the complete featured review block when there are no transfer reviews', () => {
    const TransfersPage = require('../page').default;
    const { container, queryByRole, queryByTestId, getByTestId } = render(<TransfersPage />);
    const faqSection = getByTestId('faq-accordion').closest('section');

    expect(queryByRole('heading', { name: 'Featured Reviews' })).not.toBeInTheDocument();
    expect(queryByTestId('review-slider')).not.toBeInTheDocument();
    expect(getByTestId('faq-accordion')).toHaveAttribute('data-heading-class-name', 'py-6 text-2xl font-semibold text-[var(--weelp-home-ink)] sm:text-3xl');
    expect(faqSection).toHaveClass('container-page', 'pb-10', 'md:pb-16', 'lg:pb-24');
    expect([...faqSection.classList]).not.toEqual(expect.arrayContaining([expect.stringMatching(/^(-?mt-)|:-?mt-/)]));
    expect(faqSection.parentElement).toBe(container);
    expect(mockUseSWR).toHaveBeenCalledWith('transfer-featured-reviews', getTransferFeaturedReviews, {
      revalidateOnFocus: false,
    });
  });

  it('shows the heading and passes populated transfer reviews to the slider', () => {
    mockUseSWR.mockReturnValue({
      data: [{ id: 17, review_text: 'Easy airport pickup.' }],
    });
    const TransfersPage = require('../page').default;
    const { container, getByRole, getByTestId } = render(<TransfersPage />);
    const reviewHeading = getByRole('heading', { name: 'Featured Reviews' });
    const reviewSection = reviewHeading.closest('section');
    const faqSection = getByTestId('faq-accordion').closest('section');

    expect(reviewHeading).toHaveClass('text-2xl', 'font-semibold', 'sm:text-3xl');
    expect(getByTestId('review-slider')).toHaveTextContent('17');
    expect(reviewSection).toHaveClass('container-page', 'productSlider', 'pb-10', 'md:pb-16', 'lg:pb-24');
    expect(reviewSection).toHaveClass('relative');
    expect(reviewSection).not.toHaveClass('space-y-8');
    expect(faqSection).toHaveClass('container-page', 'pb-10', 'md:pb-16', 'lg:pb-24');
    expect([...faqSection.classList]).not.toEqual(expect.arrayContaining([expect.stringMatching(/^(-?mt-)|:-?mt-/)]));
    expect(reviewSection.parentElement).toBe(container);
    expect(faqSection.parentElement).toBe(container);
    expect(reviewSection.nextElementSibling).toBe(faqSection);
  });
});
