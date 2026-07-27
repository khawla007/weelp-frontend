import { render } from '@testing-library/react';
import path from 'path';

const srcPath = (...segments) => path.join(process.cwd(), 'src', ...segments);

jest.doMock(srcPath('app/components/Pages/FRONT_END/shared/ActivityItinerarySearch.jsx'), () => ({
  __esModule: true,
  CompactActivityItinerarySearch: function CompactActivityItinerarySearchMock() {
    return <div data-testid="compact-discovery-search" />;
  },
}));

describe('BannerSection', () => {
  it('renders the shared animated globe in the desktop background slot without changing hero height', () => {
    const BannerSection = require('../BannerSection').default;
    const { container, getByText, getByTestId } = render(<BannerSection />);

    expect(getByText('Plan your Holiday.')).toBeInTheDocument();
    expect(getByTestId('compact-discovery-search')).toBeInTheDocument();

    const hero = container.querySelector('section');
    const background = container.querySelector('[data-holiday-globe-background]');
    const stage = container.querySelector('[data-animated-globe]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');
    const formSlot = getByTestId('compact-discovery-search').parentElement;

    expect(hero).toHaveClass('relative', 'min-h-[320px]', 'sm:min-h-[420px]', 'h-full', 'flex', 'justify-center', 'items-center', 'bg-surface-tint', 'p-6');
    expect(hero).toHaveClass('mb-10', 'sm:mb-16', 'lg:mb-24');
    expect(hero).not.toHaveClass('sm:min-h-[520px]');
    expect(formSlot).toHaveClass('mt-2', 'w-full', '[&_.bannerForm]:pt-0', '[&_.bannerForm]:sm:pt-0');
    expect(background).toHaveClass('hidden', '2xl:block', 'absolute', 'inset-0', 'overflow-hidden', 'pointer-events-none');
    expect(background).toHaveAttribute('aria-hidden', 'true');
    expect(stage).toBeInTheDocument();
    expect(stage).toHaveClass('bg-transparent');
    expect(stage).toHaveAttribute('data-animated-globe-activation-query', '(min-width: 1536px)');
    expect(shell).toHaveClass('bottom-[-180px]', 'right-[-120px]', 'z-[3]', 'size-[760px]', 'translate-x-0', 'translate-y-[40%]', '2xl:size-[880px]');
    expect(container.querySelector('[data-personalised-cobe-globe]')).toBeInTheDocument();
    expect(container.querySelector('[data-personalised-sparkles]')).not.toBeInTheDocument();
    expect(container.querySelector('.personalised-globe-vignette')).not.toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/Group5.png"]')).not.toBeInTheDocument();
  });
});
