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
    expect(card).toHaveClass('rounded-[24px]', 'lg:aspect-[3/4]', 'lg:min-h-0');
    expect(card).not.toHaveClass('group');
    expect(link).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
    expect(link).toHaveClass('group', 'motion-reduce:transition-none');
    expect(image).toHaveAttribute('src', '/desert-safari.jpg');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('data-placeholder', 'blur');
    expect(image).toHaveAttribute('data-blur-data-url');
    expect(image).toHaveAttribute('data-sizes', expect.stringContaining('(max-width: 640px)'));
    expect(image).toHaveClass('object-cover', 'motion-reduce:group-hover:scale-100');
    // dark-mode-exempt: assertion locks the required theme-independent discount foreground
    expect(screen.getByText('-40% OFF')).toHaveClass('text-zinc-950');
    expect(screen.getByText('-40% OFF')).not.toHaveClass('text-weelp-ink');
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

  it('renders the two-tone focus treatment above all linked content without intercepting input', () => {
    render(<GoldActivityCard item={mappedItem} wishlistItem={rawActivity} />);

    const link = screen.getByRole('link', { name: /explore desert safari adventure/i });
    const focusOverlay = screen.getByTestId('home-gold-activity-focus');

    expect(link).not.toHaveClass('focus-visible:shadow-[inset_0_0_0_2px_oklch(0.98_0.01_80),inset_0_0_0_4px_oklch(0.2_0.03_155)]');
    expect(link.lastElementChild).toBe(focusOverlay);
    expect(focusOverlay).toHaveAttribute('aria-hidden', 'true');
    expect(focusOverlay).toHaveClass(
      'absolute',
      'inset-0',
      'z-30',
      'pointer-events-none',
      'rounded-[24px]',
      'opacity-0',
      'shadow-[inset_0_0_0_2px_oklch(0.98_0.01_80),inset_0_0_0_4px_oklch(0.2_0.03_155)]',
      'group-focus-visible:opacity-100',
    );
  });

  it('keeps the translucent information panel and its small text at reliable high contrast', () => {
    render(<GoldActivityCard item={mappedItem} wishlistItem={rawActivity} />);

    const panel = screen.getByRole('heading', { name: 'Desert Safari Adventure' }).parentElement;

    expect(panel).toHaveClass('bg-[oklch(0.2_0.035_50/0.94)]', 'dark:bg-[oklch(0.12_0.035_155/0.94)]');
    expect(screen.getByText('(124)')).toHaveClass('text-[oklch(0.94_0.012_80)]');
    expect(screen.getByText('Desert Safari & Tour')).toHaveClass('text-[oklch(0.94_0.012_80)]');
    expect(screen.getByText('From')).toHaveClass('text-[oklch(0.94_0.012_80)]');
    expect(screen.getByText('$216.00')).toHaveClass('text-[oklch(0.94_0.012_80)]');
    expect(screen.getByText('per person')).toHaveClass('text-[oklch(0.94_0.012_80)]');
  });

  it('omits empty rating details and their separator while retaining the Activity fallback', () => {
    render(<GoldActivityCard item={{ ...mappedItem, category: '', rating: null, reviewCount: null, originalPrice: null }} wishlistItem={rawActivity} />);

    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(screen.queryByText('(124)')).not.toBeInTheDocument();
    expect(screen.queryByText('·')).not.toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeVisible();
    expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
  });

  it('omits the entire pricing cluster when the activity has no current price', () => {
    render(<GoldActivityCard item={{ ...mappedItem, price: '', originalPrice: '$216.00' }} wishlistItem={rawActivity} />);

    expect(screen.queryByText('From')).not.toBeInTheDocument();
    expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
    expect(screen.queryByText('per person')).not.toBeInTheDocument();
  });

  it('uses the Top Activities discount fallback when the mapped discount is absent', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null }} wishlistItem={rawActivity} />);

    expect(screen.getByText('-40% OFF')).toBeVisible();
  });

  it('normalizes an existing leading hyphen without duplicating it', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: '-40% OFF' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('-40% OFF')).toBeVisible();
    expect(screen.queryByText('--40% OFF')).not.toBeInTheDocument();
  });

  it('derives a struck original price from the 40% fallback when the current currency price is parseable', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null, originalPrice: null, price: '$130.00' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('$216.67')).toHaveClass('line-through');
  });

  it('does not invent an original price when the current price is not parseable currency', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null, originalPrice: null, price: 'Contact us' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('Contact us')).toBeVisible();
    expect(screen.queryByText('$216.67')).not.toBeInTheDocument();
  });
});
