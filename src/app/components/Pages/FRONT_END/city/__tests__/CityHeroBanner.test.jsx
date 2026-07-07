import { render } from '@testing-library/react';

jest.mock('@/app/components/BreadCrumb', () => ({
  __esModule: true,
  default: ({ className = '' }) => <nav className={className}>Breadcrumb</nav>,
}));

jest.mock('@/app/components/sliders/GallerySlider', () => ({
  __esModule: true,
  default: () => <div data-testid="gallery-slider" />,
}));

jest.mock('../../../../../../../public/assets/Icons/Icons', () => ({
  Vector2: (props) => <svg data-testid="vector-2" {...props} />,
  VectorArrow: (props) => <svg data-testid="vector-arrow" {...props} />,
}));

import CityHeroBanner from '../CityHeroBanner';

describe('CityHeroBanner', () => {
  it('uses theme-aware hero surfaces instead of a fixed light inline background', () => {
    const city = {
      name: 'Dubai',
      description: 'Explore desert tours, skyline views, and cultural stops.',
      media_gallery: [{ url: '/dubai.jpg', alt_text: 'Dubai skyline' }],
    };

    const { container, getByTestId } = render(<CityHeroBanner city={city} />);

    const hero = container.querySelector('section');
    const copyPanel = container.querySelector('nav')?.parentElement;
    const galleryPanel = getByTestId('gallery-slider').parentElement;

    expect(hero).toHaveClass('bg-[linear-gradient(-165deg,#f8faf9,#f2f7f5)]');
    expect(hero).toHaveClass('dark:bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(145deg,#050505_0%,#111111_48%,#000000_100%)]');
    expect(hero).not.toHaveAttribute('style');
    expect(copyPanel).toHaveClass('dark:bg-background/45', 'dark:backdrop-blur-md');
    expect(galleryPanel).toHaveClass('dark:bg-card/60', 'dark:ring-white/10');
  });
});
