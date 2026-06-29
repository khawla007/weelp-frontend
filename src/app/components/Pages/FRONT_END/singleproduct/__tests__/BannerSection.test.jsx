import { render } from '@testing-library/react';

jest.mock('@/app/components/BreadCrumb', () => ({
  __esModule: true,
  default: ({ className = '' }) => <nav className={className}>Breadcrumb</nav>,
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, className = '' }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@/app/components/sliders/GallerySlider', () => ({
  __esModule: true,
  default: () => <div data-testid="gallery-slider" />,
}));

import BannerSection from '../BannerSection';

describe('BannerSection', () => {
  it('paints the top single-product area with the theme background token', () => {
    const { container } = render(<BannerSection activityName="Scuba Diving Tour" />);

    const section = container.querySelector('section');
    const inner = section?.firstElementChild;

    expect(section).toHaveClass('bg-background');
    expect(inner).toHaveClass('bg-background');
  });
});
