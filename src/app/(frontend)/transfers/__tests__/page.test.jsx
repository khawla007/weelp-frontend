import { render } from '@testing-library/react';
import path from 'path';

const srcPath = (...segments) => path.join(process.cwd(), 'src', ...segments);
const mockComponent = (testId) =>
  function ComponentMock() {
    return <div data-testid={testId} />;
  };

jest.doMock(srcPath('app/components/Pages/FRONT_END/transfer/TransferSearchForm.jsx'), () => ({
  __esModule: true,
  default: mockComponent('transfer-search-form'),
}));

jest.doMock(srcPath('app/components/Pages/FRONT_END/transfer/TransferResultsDropdown.jsx'), () => ({
  __esModule: true,
  default: mockComponent('transfer-results-dropdown'),
}));

jest.doMock(srcPath('app/components/sliders/ReviewSlider.jsx'), () => ({
  __esModule: true,
  default: mockComponent('review-slider'),
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
  default: mockComponent('faq-accordion'),
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
  it('renders the shared animated globe in the desktop background slot', () => {
    const TransfersPage = require('../page').default;
    const { container, getByText, getByTestId } = render(<TransfersPage />);

    expect(getByText('Book Your Taxi')).toBeInTheDocument();
    expect(getByTestId('transfer-search-form')).toBeInTheDocument();

    const hero = container.querySelector('section');
    const background = container.querySelector('[data-transfers-globe-background]');
    const stage = container.querySelector('[data-animated-globe]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');

    expect(hero).toHaveClass('relative', 'z-50', 'min-h-[320px]', 'sm:min-h-[420px]', 'flex', 'justify-center', 'items-center', 'bg-[#f8faf9]', 'p-6');
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
  });
});
