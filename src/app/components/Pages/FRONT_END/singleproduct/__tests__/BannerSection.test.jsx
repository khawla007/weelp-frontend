import { render, screen } from '@testing-library/react';

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

jest.mock('@/app/components/Wishlist/WishlistButton', () => ({
  __esModule: true,
  default: ({ item, variant }) => (
    <button type="button" data-testid="detail-wishlist" data-variant={variant} data-item={JSON.stringify(item)}>
      Save to Wishlist
    </button>
  ),
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

  it('matches the City page mobile hero top spacing', () => {
    const { container } = render(<BannerSection activityName="Scuba Diving Tour" />);

    const headerStack = container.querySelector('section .max-w-pen > div');

    expect(headerStack).toHaveClass('pt-6', 'md:pt-[70px]');
    expect(headerStack).not.toHaveClass('pt-[70px]');
  });

  it('passes the detail item to the shared label wishlist control', () => {
    render(<BannerSection activityName="Scuba Diving Tour" itemId={42} itemType="activity" slug="scuba-diving-tour" citySlug="dubai" cityName="Dubai" price={120} currency="USD" />);

    const control = screen.getByTestId('detail-wishlist');
    expect(control).not.toHaveAttribute('data-variant');
    expect(JSON.parse(control.getAttribute('data-item'))).toEqual({
      id: 42,
      type: 'activity',
      title: 'Scuba Diving Tour',
      slug: 'scuba-diving-tour',
      citySlug: 'dubai',
      cityName: 'Dubai',
      price: 120,
      currency: 'USD',
    });
  });
});
