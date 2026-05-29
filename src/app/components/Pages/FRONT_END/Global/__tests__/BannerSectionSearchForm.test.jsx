import { render } from '@testing-library/react';
import path from 'path';
import { usePathname } from 'next/navigation';

const srcPath = (...segments) => path.join(process.cwd(), 'src', ...segments);

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.doMock(srcPath('app/components/Form/SearchForm.jsx'), () => ({
  __esModule: true,
  SearchFormBlogs: () => <div data-testid="search-form-blogs" />,
  SearchFormCreator: () => <div data-testid="search-form-creator" />,
}));

describe('BannerSectionSearchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the shared animated globe for the explore creators hero', () => {
    usePathname.mockReturnValue('/explore-creators');
    const BannerSectionSearchForm = require('../BannerSectionSearchForm').default;

    const { container, getByText, getByTestId } = render(
      <BannerSectionSearchForm title="Explore Creators" description="Discover travel experiences shared by creators. Find inspiration and book your next adventure." />,
    );

    expect(getByText('Explore Creators')).toBeInTheDocument();
    expect(getByTestId('search-form-creator')).toBeInTheDocument();
    expect(getByTestId('search-form-creator').parentElement).toHaveClass('mt-2', 'w-full');
    expect(getByTestId('search-form-creator').parentElement).not.toHaveClass('mt-6');

    const hero = container.querySelector('section');
    const background = container.querySelector('[data-banner-globe-background]');
    const stage = container.querySelector('[data-animated-globe]');
    const shell = container.querySelector('[data-personalised-cobe-shell]');

    expect(hero).toHaveClass('relative', 'min-h-[320px]', 'sm:min-h-[420px]', 'h-full', 'flex', 'justify-center', 'items-center', 'bg-[#f8faf9]', 'p-6');
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

  it('renders the shared animated globe and a hero-rise entrance for the blogs hero', () => {
    usePathname.mockReturnValue('/blogs');
    const BannerSectionSearchForm = require('../BannerSectionSearchForm').default;

    const { container, getByTestId } = render(<BannerSectionSearchForm title="Explore Blogs" description="Travel stories and guides." />);

    expect(getByTestId('search-form-blogs')).toBeInTheDocument();
    expect(getByTestId('search-form-blogs').parentElement).toHaveClass('mt-6', 'w-full');
    // blogs hero now shows the globe (same treatment as tours/holiday/explore-creators)
    expect(container.querySelector('[data-banner-globe-background]')).toBeInTheDocument();
    expect(container.querySelector('[data-animated-globe]')).toBeInTheDocument();
    // CSS-at-paint entrance, and the blogs-only decorative corner image is kept
    expect(container.querySelector('section')).toHaveClass('weelp-hero-rise');
    expect(container.querySelector('img[src="/assets/Group5.png"]')).toHaveClass('hidden', '2xl:block', 'absolute', '-top-8', 'right-0', 'scale-90', 'pointer-events-none');
  });
});
