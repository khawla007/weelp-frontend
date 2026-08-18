import { render, screen } from '@testing-library/react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, blurDataURL, fill, placeholder, sizes, ...props }) => (
    <img alt={alt} data-blur-data-url={blurDataURL} data-fill={fill ? 'true' : 'false'} data-placeholder={placeholder} data-sizes={sizes} {...props} />
  ),
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('../GoldActivityWishlistButton', () => ({
  __esModule: true,
  default: () => <button aria-label="Save Desert Safari Adventure to wishlist" type="button" />,
}));

import GoldActivityCard from '../GoldActivityCard';

const mappedItem = {
  href: '/cities/dubai/activities/desert-safari',
  image: '/desert-safari.jpg',
  title: 'Desert Safari Adventure',
  category: 'Desert Safari & Tour',
  price: '$130.00',
  originalPrice: '$216.00',
  rating: '5.0',
  reviewCount: '124',
  discount: '40% OFF',
};

const rawActivity = {
  id: 42,
  item_type: 'activity',
  name: 'Desert Safari Adventure',
};

describe('GoldActivityCard', () => {
  it('renders the complete reference-shaped card as one city-aware detail link with a sibling wishlist control', () => {
    render(<GoldActivityCard item={mappedItem} wishlistItem={rawActivity} />);

    const card = screen.getByTestId('home-gold-activity-card');
    const link = screen.getByRole('link', { name: /explore desert safari adventure/i });
    const image = screen.getByRole('img', { name: 'Desert Safari Adventure' });
    const wishlist = screen.getByRole('button', { name: /wishlist/i });

    expect(card.tagName).toBe('ARTICLE');
    expect(card).toHaveClass('rounded-[24px]');
    expect(link).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
    expect(link).toHaveClass('focus-visible:ring-2', 'motion-reduce:transition-none');
    expect(image).toHaveAttribute('src', '/desert-safari.jpg');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('data-placeholder', 'blur');
    expect(image).toHaveAttribute('data-blur-data-url');
    expect(image).toHaveAttribute('data-sizes', expect.stringContaining('(max-width: 640px)'));
    expect(image).toHaveClass('object-cover', 'motion-reduce:group-hover:scale-100');
    expect(screen.getByText('40% OFF')).toBeVisible();
    expect(screen.getByText('★')).toBeVisible();
    expect(screen.getByText('5.0')).toBeVisible();
    expect(screen.getByText('(124)')).toBeVisible();
    expect(screen.getByText('·')).toBeVisible();
    expect(screen.getByText('Desert Safari & Tour')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Desert Safari Adventure' })).toBeVisible();
    expect(screen.getByText('From')).toBeVisible();
    expect(screen.getByText('$130.00')).toBeVisible();
    expect(screen.getByText('$216.00')).toHaveClass('line-through');
    expect(screen.getByText('per person')).toBeVisible();
    expect(screen.getByText('Explore')).toBeVisible();
    expect(wishlist.closest('a')).toBeNull();
  });

  it('omits empty rating details and their separator while retaining the Activity fallback', () => {
    render(<GoldActivityCard item={{ ...mappedItem, category: '', rating: null, reviewCount: null, originalPrice: null }} wishlistItem={rawActivity} />);

    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(screen.queryByText('(124)')).not.toBeInTheDocument();
    expect(screen.queryByText('·')).not.toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeVisible();
    expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
  });
});
